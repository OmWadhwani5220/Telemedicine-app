import express from "express";
import groq from "../services/groqService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      text,
      texts,
      sourceLanguage,
      targetLanguage,
    } = req.body;

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Target language is required",
      });
    }

    const isBatch = Array.isArray(texts);

    if (!isBatch && !text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    // No need to call Groq when both languages are the same.
    if (sourceLanguage === targetLanguage) {
      return isBatch
        ? res.json({ success: true, translations: texts })
        : res.json({ success: true, translation: text });
    }

    /* ================= BATCH MODE =================
       Translates many independent UI strings in a single
       Groq request instead of one request per string —
       this is what keeps the app under Groq's requests-
       per-minute limit when a whole page/language switches
       at once. */
    if (isBatch) {
      if (!texts.length) {
        return res.json({ success: true, translations: [] });
      }

      // A plain, unmistakable marker line between items. This is
      // far more reliable across scripts (Devanagari, Gurmukhi,
      // Perso-Arabic Sindhi, etc.) than asking the model to emit
      // valid JSON — quoting/escaping rules inside a JSON string
      // are exactly where weaker adherence shows up first, and a
      // dropped quote anywhere in the array breaks parsing for
      // every item after it, not just the broken one.
      const ITEM_MARKER = "\n<<<ITEM>>>\n";
      const joinedInput = texts.join(ITEM_MARKER);

      // Reasoning models (gpt-oss-120b) spend part of their output
      // budget "thinking" before writing the real answer. Left on
      // its default effort with no explicit token budget, a big
      // batch of UI strings can get silently cut off mid-response —
      // which looks exactly like "some strings never translate".
      // Keeping reasoning low and giving enough completion tokens
      // for the whole batch fixes that.
      const completion =
        await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          reasoning_effort: "low",
          include_reasoning: false,
          max_completion_tokens: Math.min(
            8000,
            300 + texts.length * 120
          ),

          messages: [
            {
              role: "system",
              content: `
You are a professional translation engine
for a healthcare and telemedicine application.

Your job is ONLY to translate.

Rules:
- Translate accurately.
- Do not explain the translation.
- Do not summarize.
- Do not add information.
- Do not remove information.
- Do not interpret medical information.
- Do not diagnose.
- Preserve names.
- Preserve numbers.
- Preserve dates.
- Preserve medical terminology.
- Preserve placeholders.
- Keep UI translations natural and concise.
- Keep every translated item on a single line — no internal
  line breaks, even if the source text is a full sentence.

You will receive several separate, unrelated UI strings from
the same screen, joined by this exact marker on its own line:
<<<ITEM>>>

Translate each item independently — they are not one paragraph,
so do not merge, reorder, split, or drop any of them.

Respond with the translated items joined by that exact same
marker, in the exact same order, and nothing else:
- No numbering.
- No explanation.
- No markdown code fences.
- No extra text before the first item or after the last item.
- The number of items in your response must exactly match the
  number of items you were given.
              `.trim(),
            },

            {
              role: "user",
              content: `
Source language:
${sourceLanguage}

Target language:
${targetLanguage}

Items:
${joinedInput}
              `.trim(),
            },
          ],

          temperature: 0.1,
        });

      let raw =
        completion.choices?.[0]?.message?.content?.trim() || "";

      // Strip markdown code fences if the model added them anyway.
      raw = raw
        .replace(/^```[a-z]*\n?/i, "")
        .replace(/```$/, "")
        .trim();

      let translations = raw
        .split(ITEM_MARKER)
        .map((item) => item.trim());

      // The model very occasionally uses a slightly different
      // marker format (extra/missing blank lines). Try a looser
      // split before giving up and falling back per-item.
      if (translations.length !== texts.length) {
        const loose = raw
          .split(/<<<\s*ITEM\s*>>>/i)
          .map((item) => item.trim());

        if (loose.length === texts.length) {
          translations = loose;
        }
      }

      // Defensive: make sure we always return exactly as many
      // translations as were requested, in order, falling back
      // to the original English string for any that are missing —
      // and telling the caller exactly which indices those were,
      // so it never caches a fallback as if it were a real
      // translation (that would permanently stick that string in
      // English for this language, even after this is fixed).
      const failedIndices = [];

      if (translations.length !== texts.length) {
        console.warn(
          `Batch translation count mismatch: expected ${texts.length}, got ${translations.length}`
        );

        translations = texts.map((original, i) => {
          const candidate = translations[i];
          if (candidate) return candidate;
          failedIndices.push(i);
          return original;
        });
      }

      return res.json({ success: true, translations, failedIndices });
    }

    /* ================= SINGLE-TEXT MODE ================= */
    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        reasoning_effort: "low",
        include_reasoning: false,
        max_completion_tokens: 600,

        messages: [
          {
            role: "system",
            content: `
You are a professional translation engine
for a healthcare and telemedicine application.

Your job is ONLY to translate.

Rules:
- Translate accurately.
- Return ONLY the translated text.
- Do not explain the translation.
- Do not summarize.
- Do not add information.
- Do not remove information.
- Do not interpret medical information.
- Do not diagnose.
- Preserve names.
- Preserve numbers.
- Preserve dates.
- Preserve medical terminology.
- Preserve placeholders.
- Keep UI translations natural and concise.
            `.trim(),
          },

          {
            role: "user",
            content: `
Translate the following text.

Source language:
${sourceLanguage}

Target language:
${targetLanguage}

Text:
${text}
            `.trim(),
          },
        ],

        temperature: 0.1,
      });

    const translation =
      completion.choices?.[0]?.message?.content?.trim();

    if (!translation) {
      return res.status(500).json({
        success: false,
        message: "Groq returned no translation",
      });
    }

    return res.json({
      success: true,
      translation,
    });

  } catch (error) {
    console.error(
      "Groq Translation Error:",
      error
    );

    // Surface rate-limit info distinctly so the frontend can
    // back off and retry instead of just failing silently.
    if (error?.status === 429) {
      let retryAfter = 3;
      try {
        const headerVal = error?.headers?.get?.("retry-after");
        if (headerVal) retryAfter = Number(headerVal) || 3;
      } catch {
        // ignore — fall back to default
      }

      return res.status(429).json({
        success: false,
        message: "Rate limit reached. Please try again shortly.",
        retryAfter,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Translation failed",
    });
  }
});

export default router;