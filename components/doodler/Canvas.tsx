"use client";

import { useRef } from "react";
import { useDoodler } from "@/lib/doodler-context";
import { useCanvasSetup } from "@/hooks/useCanvasSetup";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePanning } from "@/hooks/usePanning";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import { TextInput } from "./TextInput";

// Add type declaration for the window object
declare global {
  interface Window {
    resizeTriggeredRender?: boolean;
  }
}

export function Canvas() {
  const { state } = useDoodler();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize canvas and handle resizing
  useCanvasSetup({ canvasRef, containerRef });

  // Initialize panning functionality
  const {
    isPanning,
    setIsPanning,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  } = usePanning({ canvasRef });

  // Initialize canvas event handlers
  const {
    isDrawing,
    setIsDrawing,
    handleDrawingStart,
    handleDrawingMove,
    handleDrawingEnd,
  } = useCanvasEvents({
    canvasRef,
    isPanning,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  });

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    isDrawing,
    setIsDrawing,
    isPanning,
    setIsPanning,
    canvasRef,
  });

  // Handle touch events
  const handleTouchStart = (event: React.TouchEvent) => {
    // Prevent default but don't stop propagation
    event.preventDefault();
    if (event.touches[0]) {
      handleDrawingStart(event.touches[0]);
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    // Prevent default but don't stop propagation
    event.preventDefault();
    if (event.touches[0]) {
      handleDrawingMove(event.touches[0]);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full relative touch-none"
        onMouseDown={handleDrawingStart}
        onMouseMove={handleDrawingMove}
        onMouseUp={handleDrawingEnd}
        onMouseLeave={handleDrawingEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDrawingEnd}
        onTouchCancel={handleDrawingEnd}
        style={{
          cursor:
            state.currentTool.id === "hand"
              ? isPanning
                ? "grabbing"
                : "grab"
              : state.currentTool.cursor || "default",
        }}
      />
      <TextInput canvasRef={canvasRef} />
    </div>
  );
}
