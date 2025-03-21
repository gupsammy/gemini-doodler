"use client";

import { useRef, useEffect, useState } from "react";
import { useDoodler } from "@/lib/doodler-context";

export function Canvas() {
  const { state, updateCanvasState, addHistoryItem } = useDoodler();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const initialRenderRef = useRef(true);

  // Setup canvas and adjust to window size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Function to resize canvas to fill screen
    const resizeCanvas = () => {
      // Set canvas to fill window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // If we have existing image data, scale it to fit new dimensions
      if (state.canvasState.imageData) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = state.canvasState.width;
        tempCanvas.height = state.canvasState.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.putImageData(state.canvasState.imageData, 0, 0);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

          // Update canvas state with new dimensions and image data
          updateCanvasState({
            width: canvas.width,
            height: canvas.height,
            imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
          });
        }
      } else {
        // Initialize with white background if no image data
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Store initial state
        updateCanvasState({
          width: canvas.width,
          height: canvas.height,
          imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        });

        // Only add to history if this is not the initial render on page load
        if (!initialRenderRef.current) {
          const imageData = canvas.toDataURL("image/png");
          addHistoryItem({
            imageData,
            type: "user-edit",
          });
        }

        // Set the initial render flag to false after first render
        initialRenderRef.current = false;
      }
    };

    // Initial resize
    resizeCanvas();

    // Add resize event listener
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
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
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: state.currentTool.cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
