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
    panOffset: { x: 0, y: 0 },
    scale: 1,
  },
  history: [],
  currentHistoryIndex: -1,
  isPrompting: false,
  textInputActive: false,
  textInputPosition: undefined,
  textInputValue: "",
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
  setTextInputActive: (
    active: boolean,
    position?: { x: number; y: number }
  ) => void;
  setTextInputValue: (value: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
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
  setTextInputActive: () => {},
  setTextInputValue: () => {},
  undo: () => {},
  redo: () => {},
  reset: () => {},
  canUndo: () => false,
  canRedo: () => false,
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
            currentHistoryIndex: items.length - 1,
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
    setState((prev) => {
      // Preserve the user's color setting when switching tools
      const preservedSettings = { strokeStyle: prev.toolSettings.strokeStyle };

      return {
        ...prev,
        currentTool: tool,
        toolSettings: {
          ...prev.toolSettings,
          ...tool.settings,
          // Only preserve the color when the tool can use color
          ...(["brush", "line", "rectangle", "ellipse", "fill"].includes(
            tool.id
          )
            ? preservedSettings
            : {}),
        },
      };
    });
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
      setState((prev) => {
        // If we've done an action after undoing, we need to remove future history items
        const newHistory =
          prev.currentHistoryIndex < prev.history.length - 1
            ? prev.history.slice(0, prev.currentHistoryIndex + 1)
            : prev.history;

        return {
          ...prev,
          history: [...newHistory, newItem],
          currentHistoryIndex: newHistory.length,
        };
      });
    } catch (error) {
      console.error("Error saving history item:", error);
    }
  };

  // Delete history item
  const deleteHistoryItem = async (id: string) => {
    try {
      await deleteHistoryItemDB(id);

      // Update state
      setState((prev) => {
        const index = prev.history.findIndex((item) => item.id === id);
        const newHistory = prev.history.filter((item) => item.id !== id);

        // Adjust currentHistoryIndex if needed
        let newIndex = prev.currentHistoryIndex;
        if (index <= prev.currentHistoryIndex) {
          // If we're deleting at or before current index, adjust index down
          newIndex = Math.max(-1, prev.currentHistoryIndex - 1);
        }

        return {
          ...prev,
          history: newHistory,
          currentHistoryIndex: newIndex,
        };
      });
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
        currentHistoryIndex: -1,
      }));
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  // Go to history item
  const goToHistoryItem = (id: string) => {
    const historyItem = state.history.find((item) => item.id === id);
    if (!historyItem) return;

    const historyIndex = state.history.findIndex((item) => item.id === id);

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

      // Update the history index
      setState((prev) => ({
        ...prev,
        currentHistoryIndex: historyIndex,
      }));
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

  // Set text input active
  const setTextInputActive = (
    active: boolean,
    position?: { x: number; y: number }
  ) => {
    setState((prev) => ({
      ...prev,
      textInputActive: active,
      textInputPosition: position || prev.textInputPosition,
    }));
  };

  // Set text input value
  const setTextInputValue = (value: string) => {
    setState((prev) => ({
      ...prev,
      textInputValue: value,
    }));
  };

  // Undo function
  const undo = () => {
    setState((prev) => {
      if (prev.currentHistoryIndex <= 0) return prev; // Can't undo if at the beginning

      const newIndex = prev.currentHistoryIndex - 1;
      const historyItem = prev.history[newIndex];

      // Load image from history
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = prev.canvasState.width;
        canvas.height = prev.canvasState.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        setState((current) => ({
          ...current,
          canvasState: {
            ...current.canvasState,
            imageData,
          },
        }));
      };
      img.src = historyItem.imageData;

      return {
        ...prev,
        currentHistoryIndex: newIndex,
      };
    });
  };

  // Redo function
  const redo = () => {
    setState((prev) => {
      if (prev.currentHistoryIndex >= prev.history.length - 1) return prev; // Can't redo if at the end

      const newIndex = prev.currentHistoryIndex + 1;
      const historyItem = prev.history[newIndex];

      // Load image from history
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = prev.canvasState.width;
        canvas.height = prev.canvasState.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        setState((current) => ({
          ...current,
          canvasState: {
            ...current.canvasState,
            imageData,
          },
        }));
      };
      img.src = historyItem.imageData;

      return {
        ...prev,
        currentHistoryIndex: newIndex,
      };
    });
  };

  // Reset function (go back to initial canvas)
  const reset = () => {
    setState((prev) => {
      if (prev.history.length === 0) return prev;

      const historyItem = prev.history[0];

      // Load first image from history
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = prev.canvasState.width;
        canvas.height = prev.canvasState.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        setState((current) => ({
          ...current,
          canvasState: {
            ...current.canvasState,
            imageData,
          },
        }));
      };
      img.src = historyItem.imageData;

      return {
        ...prev,
        currentHistoryIndex: 0,
      };
    });
  };

  // Helper functions to check if undo/redo is possible
  const canUndo = () => {
    return state.currentHistoryIndex > 0;
  };

  const canRedo = () => {
    return state.currentHistoryIndex < state.history.length - 1;
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
        setTextInputActive,
        setTextInputValue,
        undo,
        redo,
        reset,
        canUndo,
        canRedo,
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
