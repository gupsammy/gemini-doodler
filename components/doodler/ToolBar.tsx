"use client";

import { Brush, Eraser, Square, Circle, Pipette, Trash2 } from "lucide-react";
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
};

export function ToolBar() {
  const { state, setCurrentTool, updateCanvasState } = useDoodler();

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
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-border shadow-md">
      <div className="flex flex-col gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={cn(
              "p-2 rounded-md hover:bg-accent transition-colors duration-200",
              state.currentTool.id === tool.id &&
                "bg-accent text-accent-foreground"
            )}
            onClick={() => handleToolClick(tool)}
            title={tool.name}
          >
            {toolIcons[tool.icon]}
          </button>
        ))}
      </div>
    </div>
  );
}
