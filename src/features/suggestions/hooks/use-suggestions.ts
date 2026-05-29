"use client";

import { useEffect, useState } from "react";

import { getSuggestions } from "../storage/suggestions.storage";

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const localSuggestions = await getSuggestions();

      setSuggestions(localSuggestions.map((item) => item.name));
    }

    load();
  }, []);

  return {
    suggestions,
  };
}
