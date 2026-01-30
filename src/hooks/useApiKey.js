import { useState } from "react";

export function useApiKey() {
  const [apiKey, setApiKey] = useState(() => {
    // Check runtime env (window._env_), then build env, then local storage
    const runtimeEnvKey = window._env_ && window._env_.VITE_GEMINI_API_KEY;
    return (
      runtimeEnvKey ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      localStorage.getItem("gemini_api_key") ||
      ""
    );
  });

  const [model, setModel] = useState(() => {
    return localStorage.getItem("gemini_model") || "gemini-2.5-flash";
  });

  const saveApiKey = (key) => {
    setApiKey(key);
    // Only save to local storage if it differs from env or if manual override is desired
    localStorage.setItem("gemini_api_key", key);
  };

  const saveModel = (newModel) => {
    setModel(newModel);
    localStorage.setItem("gemini_model", newModel);
  };

  return { apiKey, saveApiKey, model, saveModel };
}
