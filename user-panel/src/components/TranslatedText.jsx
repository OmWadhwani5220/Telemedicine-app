import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function TranslatedText({ children }) {
  const { language, translate } = useLanguage();

  const text =
    typeof children === "string"
      ? children
      : "";

  const [result, setResult] = useState(text);

  useEffect(() => {
    let active = true;

    console.log(
      "[Translation]",
      text,
      "Language:",
      language
    );

    if (language === "en") {
      setResult(text);
      return;
    }

    setResult("...");

    translate(text)
      .then((translated) => {
        if (active) {
          console.log(
            "[Translation Result]",
            text,
            "→",
            translated
          );

          setResult(translated);
        }
      })
      .catch((error) => {
        console.error(
          "[Translation Failed]",
          error
        );

        if (active) {
          setResult(text);
        }
      });

    return () => {
      active = false;
    };
  }, [text, language, translate]);

  return <>{result}</>;
}