"use client";

import { createContext } from "react";

// Create a context to manage panel state
export const PanelContext = createContext<{
  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;
}>({ activePanel: null, setActivePanel: () => {} });
