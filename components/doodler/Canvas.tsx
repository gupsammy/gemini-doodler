"use client";

import { useRef, useEffect, useState } from "react";
import { useDoodler } from "@/lib/doodler-context";

export function Canvas() {
  const { state, updateCanvasState, addHistoryItem } = useDoodler();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  // Setup canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = state.canvasState.width;
    canvas.height = state.canvasState.height;

    // Initialize with white background if no image data
    if (!state.canvasState.imageData) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Store initial state
      updateCanvasState({
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
      });

      // Add to history
      const imageData = canvas.toDataURL("image/png");
      addHistoryItem({
        imageData,
        type: "user-edit",
      });
    }
  }, []);

  // Update canvas when imageData changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || !state.canvasState.imageData) return;

    ctx.putImageData(state.canvasState.imageData, 0, 0);
  }, [state.canvasState.imageData]);

  // Get mouse position relative to canvas
  const getMousePosition = (
    canvas: HTMLCanvasElement,
    event: React.MouseEvent
  ) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  // Handle mouse down
  const handleMouseDown = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const position = getMousePosition(canvas, event);
    setStartPosition(position);

    // Apply tool settings
    ctx.lineWidth = state.toolSettings.lineWidth || 1;
    ctx.strokeStyle = state.toolSettings.strokeStyle || "#000000";
    ctx.fillStyle = state.toolSettings.fillStyle || "transparent";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Start drawing for brush and eraser
    if (["brush", "eraser"].includes(state.currentTool.id)) {
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
    }
  };

  // Handle mouse move
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const position = getMousePosition(canvas, event);

    if (["brush", "eraser"].includes(state.currentTool.id)) {
      // Continuous drawing
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
    } else if (state.currentTool.id === "rectangle") {
      // Preview rectangle (redraw from stored image)
      if (state.canvasState.imageData) {
        ctx.putImageData(state.canvasState.imageData, 0, 0);
      }

      const width = position.x - startPosition.x;
      const height = position.y - startPosition.y;

      ctx.beginPath();
      ctx.rect(startPosition.x, startPosition.y, width, height);
      ctx.stroke();
      if (state.toolSettings.fillStyle !== "transparent") {
        ctx.fill();
      }
    } else if (state.currentTool.id === "circle") {
      // Preview circle (redraw from stored image)
      if (state.canvasState.imageData) {
        ctx.putImageData(state.canvasState.imageData, 0, 0);
      }

      const radius = Math.sqrt(
        Math.pow(position.x - startPosition.x, 2) +
          Math.pow(position.y - startPosition.y, 2)
      );

      ctx.beginPath();
      ctx.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      if (state.toolSettings.fillStyle !== "transparent") {
        ctx.fill();
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(false);

    // Store current image data
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

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp();
    }
  };

  return (
    <div className="relative flex justify-center items-center">
      <canvas
        ref={canvasRef}
        className="border border-border bg-white shadow-lg"
        style={{ cursor: state.currentTool.cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
