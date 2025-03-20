"use client";

import {
  Brush,
  Eraser,
  Square,
  Circle,
  Pipette,
  Trash2,
  RotateCcw,
  RotateCw,
  RefreshCw,
} from "lucide-react";
import { useDoodler } from "@/lib/doodler-context";
import { Tool } from "@/lib/doodler-types";
import { cn } from "@/lib/utils";

// Define available tools
const tools: Tool[] = [
  {
    id: "brush",
    name: "Brush",
    icon: "brush",
    cursor: "crosshair",
    settings: {
      lineWidth: 5,
      strokeStyle: "#000000",
    },
  },
  {
    id: "eraser",
    name: "Eraser",
    icon: "eraser",
    cursor: "crosshair",
    settings: {
      lineWidth: 20,
      strokeStyle: "#ffffff",
    },
  },
  {
    id: "rectangle",
    name: "Rectangle",
    icon: "square",
    cursor: "crosshair",
    settings: {
      lineWidth: 2,
      strokeStyle: "#000000",
      fillStyle: "transparent",
    },
  },
  {
    id: "circle",
    name: "Circle",
    icon: "circle",
    cursor: "crosshair",
    settings: {
      lineWidth: 2,
      strokeStyle: "#000000",
      fillStyle: "transparent",
    },
  },
  {
    id: "colorPicker",
    name: "Color Picker",
    icon: "pipette",
    cursor: "crosshair",
  },
  {
    id: "clear",
    name: "Clear Canvas",
    icon: "trash2",
    cursor: "default",
  },
];

// Map tool icons to Lucide components
const toolIcons: Record<string, React.ReactNode> = {
  brush: <Brush />,
  eraser: <Eraser />,
  square: <Square />,
  circle: <Circle />,
  pipette: <Pipette />,
  trash2: <Trash2 />,
  rotateCcw: <RotateCcw />,
  rotateCw: <RotateCw />,
  refreshCw: <RefreshCw />,
};

export function ToolBar() {
  const {
    state,
    setCurrentTool,
    updateCanvasState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useDoodler();

  const handleToolClick = (tool: Tool) => {
    if (tool.id === "clear") {
      // Special case for clear tool
      if (window.confirm("Are you sure you want to clear the canvas?")) {
        const canvas = document.createElement("canvas");
        canvas.width = state.canvasState.width;
        canvas.height = state.canvasState.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          updateCanvasState({
            imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
          });
        }
      }
    } else {
      setCurrentTool(tool);
    }
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg z-10">
      <div className="flex flex-col gap-2 p-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={cn(
              "p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
              state.currentTool.id === tool.id &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => handleToolClick(tool)}
            title={tool.name}
          >
            <div className="flex justify-center items-center">
              {toolIcons[tool.icon]}
            </div>
            <span className="absolute left-full ml-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
              {tool.name}
            </span>
          </button>
        ))}

        {/* Divider */}
        <div className="border-t border-border my-1"></div>

        {/* History Control Buttons */}
        <button
          className={cn(
            "p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
            !canUndo() && "opacity-50 cursor-not-allowed"
          )}
          onClick={undo}
          disabled={!canUndo()}
          title="Undo"
        >
          <div className="flex justify-center items-center">
            {toolIcons.rotateCcw}
          </div>
          <span className="absolute left-full ml-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
            Undo
          </span>
        </button>

        <button
          className={cn(
            "p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
            !canRedo() && "opacity-50 cursor-not-allowed"
          )}
          onClick={redo}
          disabled={!canRedo()}
          title="Redo"
        >
          <div className="flex justify-center items-center">
            {toolIcons.rotateCw}
          </div>
          <span className="absolute left-full ml-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
            Redo
          </span>
        </button>

        <button
          className="p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group"
          onClick={reset}
          title="Reset Canvas"
        >
          <div className="flex justify-center items-center">
            {toolIcons.refreshCw}
          </div>
          <span className="absolute left-full ml-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
            Reset
          </span>
        </button>
      </div>
    </div>
  );
}
