"use client";

import React, { useState, useEffect, useContext } from "react";
import { CirclePicker } from "react-color";
import { Slider } from "@/components/ui/slider";
import { useDoodler } from "@/lib/doodler-context";
import { Settings } from "lucide-react";
import { PanelContext } from "@/lib/panel-context";

export function ToolSettings() {
  const { state, updateToolSettings } = useDoodler();
  const [isMobile, setIsMobile] = useState(false);
  const { activePanel, setActivePanel } = useContext(PanelContext);
  const isExpanded = activePanel === "toolSettings";

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

  // Only show tool settings for tools that have adjustable settings
  const hasSettings =
    state.currentTool.id !== "hand" &&
    state.currentTool.id !== "image" &&
    state.currentTool.id !== "clear";

  if (!hasSettings) return null;

  // Determine which settings are relevant for the current tool
  const showStrokeColor = [
    "brush",
    "line",
    "rectangle",
    "ellipse",
    "fill",
    "text",
  ].includes(state.currentTool.id);
  const showStrokeWidth = [
    "brush",
    "eraser",
    "line",
    "rectangle",
    "ellipse",
  ].includes(state.currentTool.id);
  const showFillColor = ["rectangle", "ellipse"].includes(state.currentTool.id);

  // Define common colors for color picker
  const commonColors = [
    "#000000",
    "#333333",
    "#4D4D4D",
    "#808080",
    "#cccccc",
    "#ffffff",
    "#980000",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
  ];

  // Handle color change
  const handleColorChange = (
    color: { hex: string },
    type: "stroke" | "fill"
  ) => {
    if (type === "stroke") {
      updateToolSettings({ strokeStyle: color.hex });
    } else {
      updateToolSettings({ fillStyle: color.hex });
    }
  };

  // Handle stroke width change
  const handleLineWidthChange = (value: number[]) => {
    updateToolSettings({ lineWidth: value[0] });
  };

  // Desktop layout - vertical orientation along left side
  if (!isMobile) {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3 z-10">
        <div className="flex flex-col gap-3">
          {/* Line Width Slider */}
          {showStrokeWidth && (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium flex justify-between">
                <span>Size</span>
                <span>{state.toolSettings.lineWidth || 1}px</span>
              </div>
              <Slider
                defaultValue={[state.toolSettings.lineWidth || 1]}
                max={50}
                min={1}
                step={1}
                onValueChange={handleLineWidthChange}
                className="mt-1"
              />
            </div>
          )}

          {/* Stroke Color */}
          {showStrokeColor && (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium mb-1">
                {state.currentTool.id === "fill"
                  ? "Fill Color"
                  : "Stroke Color"}
              </div>
              <CirclePicker
                colors={commonColors}
                color={state.toolSettings.strokeStyle}
                onChange={(color) => handleColorChange(color, "stroke")}
                width="170px"
                circleSize={16}
                circleSpacing={8}
              />
            </div>
          )}

          {/* Fill Color for shapes */}
          {showFillColor && (
            <div className="flex flex-col gap-1 mt-2">
              <div className="text-xs font-medium mb-1">Fill Color</div>
              <div className="flex flex-col gap-2">
                {/* Transparent option */}
                <div
                  className="flex items-center gap-2 cursor-pointer p-1 hover:bg-accent rounded"
                  onClick={() =>
                    updateToolSettings({ fillStyle: "transparent" })
                  }
                >
                  <div
                    className="w-5 h-5 rounded border border-border flex items-center justify-center"
                    title="Transparent (No Fill)"
                  >
                    <div className="w-3 h-0 border-t border-dashed border-foreground/60" />
                  </div>
                  <span className="text-xs">No Fill</span>
                </div>

                <CirclePicker
                  colors={commonColors}
                  color={
                    state.toolSettings.fillStyle === "transparent"
                      ? "#ffffff"
                      : state.toolSettings.fillStyle
                  }
                  onChange={(color) => handleColorChange(color, "fill")}
                  width="170px"
                  circleSize={16}
                  circleSpacing={8}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For mobile layout - add collapsed/expanded states
  if (isMobile) {
    if (!isExpanded) {
      return (
        <button
          className="fixed top-28 right-4 z-20 p-2 bg-background/90 backdrop-blur-sm rounded-lg border border-border shadow-lg"
          onClick={() => setActivePanel("toolSettings")}
          aria-label="Open tool settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      );
    } else {
      return (
        <div className="fixed top-20 right-4 z-25 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3 flex flex-col gap-3">
          {/* Close button */}
          <button
            className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-accent/50"
            onClick={() => setActivePanel(null)}
            aria-label="Close settings"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="mt-4">
            {/* Line Width Slider */}
            {showStrokeWidth && (
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium flex justify-between">
                  <span>Size</span>
                  <span>{state.toolSettings.lineWidth || 1}px</span>
                </div>
                <Slider
                  defaultValue={[state.toolSettings.lineWidth || 1]}
                  max={50}
                  min={1}
                  step={1}
                  onValueChange={handleLineWidthChange}
                  className="mt-1"
                />
              </div>
            )}

            {/* Stroke Color */}
            {showStrokeColor && (
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium mb-1">
                  {state.currentTool.id === "fill"
                    ? "Fill Color"
                    : "Stroke Color"}
                </div>
                <CirclePicker
                  colors={commonColors}
                  color={state.toolSettings.strokeStyle}
                  onChange={(color) => handleColorChange(color, "stroke")}
                  width="150px"
                  circleSize={18}
                  circleSpacing={8}
                />
              </div>
            )}

            {/* Fill Color for shapes */}
            {showFillColor && (
              <div className="flex flex-col gap-1 mt-2">
                <div className="text-xs font-medium mb-1">Fill Color</div>
                <div className="flex flex-col gap-2">
                  {/* Transparent option */}
                  <div
                    className="flex items-center gap-2 cursor-pointer p-1 hover:bg-accent rounded"
                    onClick={() =>
                      updateToolSettings({ fillStyle: "transparent" })
                    }
                  >
                    <div
                      className="w-5 h-5 rounded border border-border flex items-center justify-center"
                      title="Transparent (No Fill)"
                    >
                      <div className="w-3 h-0 border-t border-dashed border-foreground/60" />
                    </div>
                    <span className="text-xs">No Fill</span>
                  </div>

                  <CirclePicker
                    colors={commonColors}
                    color={
                      state.toolSettings.fillStyle === "transparent"
                        ? "#ffffff"
                        : state.toolSettings.fillStyle
                    }
                    onChange={(color) => handleColorChange(color, "fill")}
                    width="150px"
                    circleSize={18}
                    circleSpacing={8}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}
