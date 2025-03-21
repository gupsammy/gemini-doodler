"use client";

import React from "react";
import {
  Brush,
  Eraser,
  Square,
  Circle,
  Trash2,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Minus,
  ImagePlus,
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
    id: "line",
    name: "Line",
    icon: "line",
    cursor: "crosshair",
    settings: {
      lineWidth: 2,
      strokeStyle: "#000000",
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
    id: "ellipse",
    name: "Ellipse",
    icon: "circle",
    cursor: "crosshair",
    settings: {
      lineWidth: 2,
      strokeStyle: "#000000",
      fillStyle: "transparent",
    },
  },
  {
    id: "image",
    name: "Import Image",
    icon: "imagePlus",
    cursor: "pointer",
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
  line: <Minus />,
  square: <Square />,
  circle: <Circle />,
  imagePlus: <ImagePlus />,
  trash2: <Trash2 />,
  rotateCcw: <RotateCcw />,
  rotateCw: <RotateCw />,
  refreshCw: <RefreshCw />,
};

// Group tools for the toolbar layout
const toolGroups = [
  ["brush", "eraser", "line", "rectangle", "ellipse", "image"],
  ["clear"],
];

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
    } else if (tool.id === "image") {
      // Handle image upload
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.querySelector(
                "canvas"
              ) as HTMLCanvasElement;
              if (!canvas) return;

              const ctx = canvas.getContext("2d");
              if (!ctx) return;

              // Draw the image at center of canvas
              const x = (canvas.width - img.width) / 2;
              const y = (canvas.height - img.height) / 2;
              ctx.drawImage(img, x, y);

              // Update canvas state
              updateCanvasState({
                imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
              });
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(target.files[0]);
        }
      };
      input.click();
    } else {
      setCurrentTool(tool);
    }
  };

  // Find tool by ID
  const findToolById = (id: string): Tool | undefined => {
    return tools.find((tool) => tool.id === id);
  };

  return (
    <div className="fixed top-4 sm:top-4 md:top-6 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg z-10">
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-1.5 sm:p-2">
        {toolGroups.map((group, groupIndex) => (
          <React.Fragment key={`group-${groupIndex}`}>
            {groupIndex > 0 && (
              <div className="h-8 border-r border-border mx-0.5 sm:mx-1"></div>
            )}
            <div className="flex items-center gap-1 sm:gap-2">
              {group.map((toolId) => {
                const tool = findToolById(toolId);
                if (!tool) return null;

                // Handle special case for controls that aren't tools
                if (toolId === "rotateCcw") {
                  return (
                    <button
                      key={toolId}
                      className={cn(
                        "p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
                        !canUndo() && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={undo}
                      disabled={!canUndo()}
                      title="Undo"
                      aria-label="Undo"
                    >
                      <div className="flex justify-center items-center">
                        {toolIcons.rotateCcw}
                      </div>
                      <span className="absolute top-full mt-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 hidden sm:block">
                        Undo
                      </span>
                    </button>
                  );
                }

                if (toolId === "rotateCw") {
                  return (
                    <button
                      key={toolId}
                      className={cn(
                        "p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
                        !canRedo() && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={redo}
                      disabled={!canRedo()}
                      title="Redo"
                      aria-label="Redo"
                    >
                      <div className="flex justify-center items-center">
                        {toolIcons.rotateCw}
                      </div>
                      <span className="absolute top-full mt-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 hidden sm:block">
                        Redo
                      </span>
                    </button>
                  );
                }

                if (toolId === "refreshCw") {
                  return (
                    <button
                      key={toolId}
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group"
                      onClick={reset}
                      title="Reset Canvas"
                      aria-label="Reset Canvas"
                    >
                      <div className="flex justify-center items-center">
                        {toolIcons.refreshCw}
                      </div>
                      <span className="absolute top-full mt-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 hidden sm:block">
                        Reset
                      </span>
                    </button>
                  );
                }

                // Regular tool buttons
                return (
                  <button
                    key={tool.id}
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
                      state.currentTool.id === tool.id &&
                        "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleToolClick(tool)}
                    title={tool.name}
                    aria-label={tool.name}
                  >
                    <div className="flex justify-center items-center">
                      {toolIcons[tool.icon]}
                    </div>
                    <span className="absolute top-full mt-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 hidden sm:block">
                      {tool.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
