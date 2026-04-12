"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_STADIUM_ID, findStadiumById, STADIUMS_INDIA, type Stadium } from "../lib/stadiums";

type StadiumContextValue = {
  stadiumId: string;
  stadium: Stadium;
  stadiums: Stadium[];
  setStadiumId: (id: string) => void;
};

const StadiumContext = createContext<StadiumContextValue | null>(null);
const STORAGE_KEY = "stadiumiq_stadium_id";

export function StadiumProvider({ children }: { children: React.ReactNode }) {
  const [stadiumId, setStadiumIdState] = useState<string>(DEFAULT_STADIUM_ID);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStadiumIdState(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, stadiumId);
    } catch {
      // ignore
    }
  }, [stadiumId]);

  const stadium = useMemo(() => findStadiumById(stadiumId) ?? findStadiumById(DEFAULT_STADIUM_ID) ?? STADIUMS_INDIA[0], [stadiumId]);

  const value = useMemo<StadiumContextValue>(
    () => ({
      stadiumId,
      stadium,
      stadiums: STADIUMS_INDIA,
      setStadiumId: setStadiumIdState,
    }),
    [stadiumId, stadium],
  );

  return <StadiumContext.Provider value={value}>{children}</StadiumContext.Provider>;
}

export function useStadium() {
  const ctx = useContext(StadiumContext);
  if (!ctx) throw new Error("useStadium must be used within <StadiumProvider />");
  return ctx;
}

