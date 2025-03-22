"use client";

import React, { useState, useEffect } from "react";
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
  PaintBucket,
  Hand,
  Type,
  Menu,
  X,
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
    id: "fill",
    name: "Fill",
    icon: "paintBucket",
    cursor: "crosshair",
    settings: {
      strokeStyle: "#000000",
      fillStyle: "#000000",
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
    id: "text",
    name: "Text",
    icon: "type",
    cursor: "text",
    settings: {
      strokeStyle: "#000000",
      fontSize: 16,
      fontFamily: "Arial",
    },
  },
  {
    id: "hand",
    name: "Pan",
    icon: "hand",
    cursor: "grab",
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
  paintBucket: <PaintBucket />,
  hand: <Hand />,
  type: <Type />,
  menu: <Menu />,
  x: <X />,
};

// Group tools for the toolbar layout
const toolGroups = [
  [
    "brush",
    "eraser",
    "line",
    "fill",
    "rectangle",
    "ellipse",
    "type",
    "hand",
    "image",
  ],
  ["clear"],
];

export function ToolBar() {
  const { state, setCurrentTool, updateCanvasState, addHistoryItem } =
    useDoodler();

  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

              // Calculate dimensions to fit image properly while maintaining aspect ratio
              const canvasWidth = canvas.width;
              const canvasHeight = canvas.height;

              // Clear the canvas first
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvasWidth, canvasHeight);

              // Calculate scaling ratio to fit within canvas while maintaining aspect ratio
              const scaleRatio = Math.min(
                canvasWidth / img.width,
                canvasHeight / img.height
              );

              // Calculate new dimensions that maintain aspect ratio
              const newWidth = img.width * scaleRatio;
              const newHeight = img.height * scaleRatio;

              // Calculate centering positions
              const x = (canvasWidth - newWidth) / 2;
              const y = (canvasHeight - newHeight) / 2;

              // Draw the resized image at the center of canvas
              ctx.drawImage(img, x, y, newWidth, newHeight);

              // Update canvas state
              updateCanvasState({
                imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
              });

              // Add to history
              const imageData = canvas.toDataURL("image/png");
              addHistoryItem({
                imageData,
                type: "user-edit",
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
      // Close mobile menu after selecting a tool
      if (isMobile) {
        setMobileMenuOpen(false);
      }
    }
  };

  // Find tool by ID
  const findToolById = (id: string): Tool | undefined => {
    return tools.find((tool) => tool.id === id);
  };

  // Mobile toolbar (vertical layout)
  if (isMobile) {
    return (
      <>
        {/* Mobile toggle button */}
        <button
          className="fixed top-4 right-4 z-20 p-2 bg-background/90 backdrop-blur-sm rounded-lg border border-border shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? toolIcons.x : toolIcons.menu}
        </button>

        {/* Mobile toolbar */}
        {mobileMenuOpen && (
          <div className="fixed top-4 right-16 z-10 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3 max-h-[80vh] overflow-y-auto max-w-[180px]">
            {toolGroups.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`}>
                {groupIndex > 0 && (
                  <div className="border-t border-border my-2"></div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {group.map((toolId) => {
                    const tool = findToolById(toolId);
                    if (!tool) return null;

                    return (
                      <button
                        key={toolId}
                        className={cn(
                          "p-1.5 rounded-lg hover:bg-accent transition-colors duration-200 relative",
                          state.currentTool.id === toolId &&
                            "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleToolClick(tool)}
                        title={tool.name}
                        aria-label={tool.name}
                      >
                        <div className="flex justify-center items-center">
                          {toolIcons[tool.icon]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // Desktop toolbar (horizontal layout)
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

                return (
                  <button
                    key={toolId}
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
                      state.currentTool.id === toolId &&
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
