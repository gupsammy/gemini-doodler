"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AppState,
  Tool,
  ToolSettings,
  CanvasState,
  DoodleHistoryItem,
} from "./doodler-types";
import {
  saveHistoryItem,
  getAllHistoryItems,
  clearHistory,
  deleteHistoryItem as deleteHistoryItemDB,
} from "./doodler-db";

// Default tool settings
const defaultToolSettings: ToolSettings = {
  lineWidth: 5,
  strokeStyle: "#000000",
  fillStyle: "#ffffff",
};

// Initial app state
const initialState: AppState = {
  currentTool: {
    id: "brush",
    name: "Brush",
    icon: "brush",
    cursor: "crosshair",
    settings: defaultToolSettings,
  },
  toolSettings: defaultToolSettings,
  canvasState: {
    width: 800,
    height: 600,
    imageData: null,
  },
  history: [],
  isPrompting: false,
};

// Create context
const DoodlerContext = createContext<{
  state: AppState;
  setCurrentTool: (tool: Tool) => void;
  updateToolSettings: (settings: Partial<ToolSettings>) => void;
  updateCanvasState: (state: Partial<CanvasState>) => void;
  addHistoryItem: (item: Omit<DoodleHistoryItem, "id" | "timestamp">) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  goToHistoryItem: (id: string) => void;
  setIsPrompting: (isPrompting: boolean) => void;
}>({
  state: initialState,
  setCurrentTool: () => {},
  updateToolSettings: () => {},
  updateCanvasState: () => {},
  addHistoryItem: () => {},
  deleteHistoryItem: () => {},
  clearHistory: () => {},
  goToHistoryItem: () => {},
  setIsPrompting: () => {},
});

// Provider component
export function DoodlerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // Load history from IndexedDB on initial mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const items = await getAllHistoryItems();
        if (items.length > 0) {
          setState((prev) => ({
            ...prev,
            history: items,
          }));
        }
      } catch (error) {
        console.error("Error loading history from IndexedDB:", error);
      }
    };

    loadHistory();
  }, []);

  // Set current tool
  const setCurrentTool = (tool: Tool) => {
    setState((prev) => ({
      ...prev,
      currentTool: tool,
      toolSettings: {
        ...prev.toolSettings,
        ...tool.settings,
      },
    }));
  };

  // Update tool settings
  const updateToolSettings = (settings: Partial<ToolSettings>) => {
    setState((prev) => ({
      ...prev,
      toolSettings: {
        ...prev.toolSettings,
        ...settings,
      },
    }));
  };

  // Update canvas state
  const updateCanvasState = (canvasState: Partial<CanvasState>) => {
    setState((prev) => ({
      ...prev,
      canvasState: {
        ...prev.canvasState,
        ...canvasState,
      },
    }));
  };

  // Add history item
  const addHistoryItem = async (
    item: Omit<DoodleHistoryItem, "id" | "timestamp">
  ) => {
    const newItem: DoodleHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    // Save to IndexedDB
    try {
      await saveHistoryItem(newItem);

      // Update state
      setState((prev) => ({
        ...prev,
        history: [...prev.history, newItem],
      }));
    } catch (error) {
      console.error("Error saving history item:", error);
    }
  };

  // Delete history item
  const deleteHistoryItem = async (id: string) => {
    try {
      await deleteHistoryItemDB(id);

      // Update state
      setState((prev) => ({
        ...prev,
        history: prev.history.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  };

  // Clear history
  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setState((prev) => ({
        ...prev,
        history: [],
      }));
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  // Go to history item
  const goToHistoryItem = (id: string) => {
    const historyItem = state.history.find((item) => item.id === id);
    if (!historyItem) return;

    // Load image from history
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = state.canvasState.width;
      canvas.height = state.canvasState.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      updateCanvasState({ imageData });
    };
    img.src = historyItem.imageData;
  };

  // Set is prompting
  const setIsPrompting = (isPrompting: boolean) => {
    setState((prev) => ({
      ...prev,
      isPrompting,
    }));
  };

  return (
    <DoodlerContext.Provider
      value={{
        state,
        setCurrentTool,
        updateToolSettings,
        updateCanvasState,
        addHistoryItem,
        deleteHistoryItem,
        clearHistory: handleClearHistory,
        goToHistoryItem,
        setIsPrompting,
      }}
    >
      {children}
    </DoodlerContext.Provider>
  );
}

// Hook for using the context
export function useDoodler() {
  const context = useContext(DoodlerContext);
  if (context === undefined) {
    throw new Error("useDoodler must be used within a DoodlerProvider");
  }
  return context;
}
