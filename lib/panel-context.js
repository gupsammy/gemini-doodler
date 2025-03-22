"use client";

import { createContext } from "react";

// Create a context to manage panel state
export const PanelContext = createContext({
  activePanel: null,
  setActivePanel: () => {},
});
