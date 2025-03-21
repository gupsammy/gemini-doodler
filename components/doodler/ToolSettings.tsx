"use client";

import React, { useState } from "react";
import { Paintbrush } from "lucide-react";
import { useDoodler } from "@/lib/doodler-context";
import { cn } from "@/lib/utils";

export function ToolSettings() {
  const { state, updateToolSettings } = useDoodler();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Handle brush size change
  const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    updateToolSettings({ lineWidth: size });
  };

  // Handle preset color selection
  const handlePresetColorSelect = (color: string) => {
    updateToolSettings({ strokeStyle: color });
    setColorPickerOpen(false);
  };

  // Preset colors
  const presetColors = [
    { value: "#000000" }, // Black
    { value: "#FFFFFF" }, // White
    { value: "#FF0000" }, // Red
    { value: "#00FF00" }, // Green
    { value: "#0000FF" }, // Blue
    { value: "#FFFF00" }, // Yellow
    { value: "#FF00FF" }, // Magenta
    { value: "#8B4513" }, // Brown
  ];

  // Current tool uses a brush size (pen, eraser)
  const usesLineWidth = [
    "brush",
    "eraser",
    "line",
    "rectangle",
    "ellipse",
  ].includes(state.currentTool.id);

  // Current tool uses a color (not eraser)
  const usesColor = ["brush", "line", "rectangle", "ellipse"].includes(
    state.currentTool.id
  );

  // Get the current color value
  const currentColor = state.toolSettings.strokeStyle || "#000000";

  // Get the current brush size
  const currentSize = state.toolSettings.lineWidth || 5;

  return (
    <div className="fixed left-4 sm:left-4 md:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg z-10 flex flex-col items-center p-3 gap-3">
      {/* Brush Size Slider */}
      {usesLineWidth && (
        <div className="flex flex-col items-center">
          <div className="mb-2">
            <Paintbrush
              size={Math.min(Math.max(currentSize, 16), 28)}
              className="text-foreground"
            />
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={currentSize}
            onChange={handleBrushSizeChange}
            className="h-20 appearance-none bg-transparent cursor-pointer w-1 mx-auto"
            style={{
              writingMode: "vertical-lr" /* Fixed WritingMode type */,
              WebkitAppearance: "slider-vertical" /* WebKit */,
              width: "6px",
              padding: "0 8px",
            }}
          />
          <span className="text-xs mt-1">{currentSize}px</span>
        </div>
      )}

      {/* Color Picker */}
      {usesColor && (
        <div className="flex flex-col items-center relative">
          <button
            className={cn(
              "w-8 h-8 rounded-full border border-border",
              colorPickerOpen && "ring-2 ring-primary"
            )}
            style={{ backgroundColor: currentColor }}
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            aria-label="Open color picker"
          />

          {colorPickerOpen && (
            <div className="absolute left-full ml-2 p-2.5 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg">
              {/* Preset Colors */}
              <div className="grid grid-cols-1 gap-1.5 w-10">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-6 h-6 rounded-full border border-border hover:ring-1 hover:ring-primary transition-all mx-auto",
                      currentColor === color.value && "ring-2 ring-primary"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handlePresetColorSelect(color.value)}
                    aria-label={`Select ${color.value} color`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
