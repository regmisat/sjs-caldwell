"use client";

import { createContext, useContext } from "react";

const SiteModeContext = createContext(true);

export function SiteModeProvider({
  isFullSite,
  children,
}: {
  isFullSite: boolean;
  children: React.ReactNode;
}) {
  return (
    <SiteModeContext.Provider value={isFullSite}>
      {children}
    </SiteModeContext.Provider>
  );
}

export function useFullSite() {
  return useContext(SiteModeContext);
}
