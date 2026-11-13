import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const LanguageContext = createContext(null);

const BACKEND = "http://localhost:5000";

export const LANGUAGES = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
  },

  pa: {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
  },

  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },

  mr: {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
  },

  sd: {
    code: "sd",
    name: "Sindhi",
    nativeName: "سنڌي",
  },
};

// How long to wait for more translate() calls to pile up before
// firing the batch request. Every <TranslatedText>/useTranslatedText
// call that happens within this window on a page gets combined into
// ONE Groq request instead of one request per string — this is what
// keeps the app under Groq's requests-per-minute limit.
const BATCH_WINDOW_MS = 30;
const MAX_RETRIES = 2;

export function LanguageProvider({ children }) {
  /* --------------------------------------------------
     SELECTED LANGUAGE
  -------------------------------------------------- */

  const [language, setLanguageState] = useState(() => {
    return (
      localStorage.getItem("userPanelLanguage") ||
      "en"
    );
  });

  // Kept in sync with `language` state so the batching logic below
  // (which lives outside React's render cycle, in refs/timeouts) can
  // always read the *current* language without needing to rebuild
  // its callbacks every time the language changes.
  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  /* --------------------------------------------------
     TRANSLATION CACHE
  -------------------------------------------------- */

  const [translationCache, setTranslationCache] =
    useState(() => {
      try {
        const saved = localStorage.getItem(
          "userPanelTranslationCache"
        );

        return saved ? JSON.parse(saved) : {};
      } catch (error) {
        console.error(
          "Translation cache error:",
          error
        );

        return {};
      }
    });

  /*
   * Keep a ref of the latest cache.
   *
   * This prevents translate() from being recreated
   * every time the cache changes.
   */
  const cacheRef = useRef(
    translationCache
  );

  useEffect(() => {
    cacheRef.current = translationCache;

    localStorage.setItem(
      "userPanelTranslationCache",
      JSON.stringify(translationCache)
    );
  }, [translationCache]);

  /* --------------------------------------------------
     TRANSLATION STATUS
  -------------------------------------------------- */

  const [translating, setTranslating] =
    useState(false);

  /* --------------------------------------------------
     SAVE LANGUAGE
  -------------------------------------------------- */

  useEffect(() => {
    localStorage.setItem(
      "userPanelLanguage",
      language
    );

    console.log(
      "🌐 Current language:",
      language
    );
  }, [language]);

  /* --------------------------------------------------
     CHANGE LANGUAGE
  -------------------------------------------------- */

  const setLanguage = useCallback(
    (newLanguage) => {
      if (!LANGUAGES[newLanguage]) {
        console.error(
          "Unsupported language:",
          newLanguage
        );

        return;
      }

      console.log(
        "🌐 Changing language:",
        languageRef.current,
        "→",
        newLanguage
      );

      setLanguageState(newLanguage);
    },
    []
  );

  /* --------------------------------------------------
     BATCH QUEUE (ENGLISH → SELECTED LANGUAGE)

     Every translate() call registers itself here instead
     of firing its own request. Whatever piles up within
     BATCH_WINDOW_MS goes out as a single Groq request.
  -------------------------------------------------- */

  // [{ cacheKey, cleanText, resolvers: [fn, ...] }]
  const queueRef = useRef([]);
  const timerRef = useRef(null);
  const inFlightCountRef = useRef(0);

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const flushQueue = useCallback(async () => {
    timerRef.current = null;

    if (!queueRef.current.length) return;

    const batch = queueRef.current;
    queueRef.current = [];

    const currentLanguage = languageRef.current;
    const targetLanguage = LANGUAGES[currentLanguage]?.name;

    // Language got reset to English (or something went wrong)
    // while this batch was queued — nothing to translate.
    if (currentLanguage === "en" || !targetLanguage) {
      batch.forEach((item) =>
        item.resolvers.forEach((resolve) => resolve(item.cleanText))
      );
      return;
    }

    inFlightCountRef.current += 1;
    setTranslating(true);

    const attempt = async (retryCount = 0) => {
      try {
        console.log(
          `🔵 Translating batch of ${batch.length} →`,
          targetLanguage
        );

        const response = await fetch(`${BACKEND}/api/groq`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            texts: batch.map((item) => item.cleanText),
            sourceLanguage: "English",
            targetLanguage,
          }),
        });

        // Rate limited — back off and retry the same batch a
        // couple of times before giving up on it.
        if (response.status === 429) {
          const data = await response.json().catch(() => ({}));
          const retryAfter = Number(data?.retryAfter) || 3;

          if (retryCount < MAX_RETRIES) {
            console.warn(
              `⏳ Rate limited — retrying batch in ${retryAfter}s`
            );
            await sleep(retryAfter * 1000);
            return attempt(retryCount + 1);
          }

          throw new Error("Rate limit exceeded, giving up on batch");
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Groq API HTTP Error:",
            response.status,
            errorText
          );
          throw new Error(`Translation API returned ${response.status}`);
        }

        const data = await response.json();

        if (!data?.success || !Array.isArray(data.translations)) {
          throw new Error(data?.message || "Groq returned no translations");
        }

        const updates = {};
        batch.forEach((item, i) => {
          const raw = data.translations[i];
          const translated =
            typeof raw === "string" && raw.trim()
              ? raw.trim()
              : item.cleanText;

          updates[item.cacheKey] = translated;
          item.resolvers.forEach((resolve) => resolve(translated));
        });

        cacheRef.current = { ...cacheRef.current, ...updates };
        setTranslationCache(cacheRef.current);

        console.log("✅ Batch translated:", batch.length, "strings");
      } catch (error) {
        console.error("❌ Batch translation failed:", error);

        // Never let a translation failure break the UI — fall
        // back to the original English text for this batch.
        batch.forEach((item) =>
          item.resolvers.forEach((resolve) => resolve(item.cleanText))
        );
      }
    };

    await attempt();

    inFlightCountRef.current -= 1;
    if (inFlightCountRef.current <= 0) {
      inFlightCountRef.current = 0;
      setTranslating(false);
    }
  }, []);

  /* --------------------------------------------------
     ENGLISH → SELECTED LANGUAGE

     Used for:
     - Sidebar
     - Dashboard
     - Settings
     - Buttons
     - Labels
     - UI text

     Queues onto the shared batch above and resolves once
     that batch comes back — callers don't need to know
     batching is happening at all.
  -------------------------------------------------- */

  const translate = useCallback(
    (text) => {
      return new Promise((resolve) => {
        if (!text || typeof text !== "string") {
          resolve(text);
          return;
        }

        const cleanText = text.trim();

        if (!cleanText) {
          resolve(text);
          return;
        }

        /*
         * English is the original/source language.
         */
        if (languageRef.current === "en") {
          resolve(text);
          return;
        }

        const cacheKey = `${languageRef.current}:${cleanText}`;

        /*
         * Check cache.
         */
        const cachedTranslation = cacheRef.current[cacheKey];

        if (cachedTranslation) {
          resolve(cachedTranslation);
          return;
        }

        // Piggyback onto an already-queued request for the
        // exact same string instead of asking Groq twice.
        let item = queueRef.current.find(
          (q) => q.cacheKey === cacheKey
        );

        if (!item) {
          item = { cacheKey, cleanText, resolvers: [] };
          queueRef.current.push(item);
        }

        item.resolvers.push(resolve);

        if (!timerRef.current) {
          timerRef.current = setTimeout(flushQueue, BATCH_WINDOW_MS);
        }
      });
    },
    [flushQueue]
  );

  /* --------------------------------------------------
     SELECTED LANGUAGE → ENGLISH
     
     Used BEFORE saving user-entered data
     into MongoDB.
     
     Example:
     
     Punjabi:
     "ਮੁੰਬਈ"
     
     ↓ Groq
     
     English:
     "Mumbai"

     This one is NOT batched — it's fired once, imperatively,
     at save/send time (not dozens of times per render), so it's
     in no danger of tripping the rate limit on its own. It does
     get a couple of retries on 429 since it's a save-critical
     path — better to wait a moment than lose what the patient typed.
  -------------------------------------------------- */

  const translateToEnglish = useCallback(
    async (text) => {
      if (!text || typeof text !== "string") {
        return text;
      }

      const cleanText = text.trim();

      if (!cleanText) {
        return text;
      }

      /*
       * English input doesn't need translation.
       */
      if (languageRef.current === "en") {
        return text;
      }

      const sourceLanguage = LANGUAGES[languageRef.current]?.name;

      if (!sourceLanguage) {
        throw new Error("Source language not found");
      }

      const attempt = async (retryCount = 0) => {
        console.log(
          "🔵 Translating user input:",
          sourceLanguage,
          "→ English"
        );

        const response = await fetch(`${BACKEND}/api/groq`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            text: cleanText,
            sourceLanguage,
            targetLanguage: "English",
          }),
        });

        if (response.status === 429) {
          const data = await response.json().catch(() => ({}));
          const retryAfter = Number(data?.retryAfter) || 3;

          if (retryCount < MAX_RETRIES) {
            console.warn(
              `⏳ Rate limited — retrying input translation in ${retryAfter}s`
            );
            await sleep(retryAfter * 1000);
            return attempt(retryCount + 1);
          }

          throw new Error("Rate limit exceeded");
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Input Translation HTTP Error:",
            response.status,
            errorText
          );
          throw new Error(`Translation API returned ${response.status}`);
        }

        const data = await response.json();

        if (!data?.success || !data.translation) {
          throw new Error(data?.message || "Translation failed");
        }

        const englishText = data.translation.trim();

        console.log("✅ English value:", englishText);

        return englishText;
      };

      try {
        return await attempt();
      } catch (error) {
        console.error("❌ Input Translation Error:", error);

        /*
         * DO NOT save untranslated
         * Punjabi to database.
         */
        throw error;
      }
    },
    []
  );

  /* --------------------------------------------------
     CONTEXT VALUE
  -------------------------------------------------- */

  const contextValue = {
    language,

    setLanguage,

    languages: LANGUAGES,

    translate,

    translateToEnglish,

    translating,
  };

  return (
    <LanguageContext.Provider
      value={contextValue}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/* --------------------------------------------------
   HOOK
-------------------------------------------------- */

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}

/* --------------------------------------------------
   HOOK: useTranslatedText
   
   Same job as <TranslatedText>, but returns a plain
   string instead of JSX. Use this for places that
   can't take a component as a child — placeholder=,
   title=, aria-label=, alt=, option text, etc.
-------------------------------------------------- */

export function useTranslatedText(text) {
  const { language, translate } = useLanguage();
  const [result, setResult] = useState(text);

  useEffect(() => {
    let active = true;

    if (!text || typeof text !== "string" || language === "en") {
      setResult(text);
      return;
    }

    translate(text).then((translated) => {
      if (active) setResult(translated);
    });

    return () => {
      active = false;
    };
  }, [text, language, translate]);

  return result;
}
