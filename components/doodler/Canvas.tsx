"use client";

import { useRef, useEffect, useState } from "react";
import { useDoodler } from "@/lib/doodler-context";

export function Canvas() {
  const {
    state,
    updateCanvasState,
    addHistoryItem,
    setTextInputActive,
    setTextInputValue,
  } = useDoodler();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const initialRenderRef = useRef(true);
  const [hasMovedSinceDown, setHasMovedSinceDown] = useState(false);

  // Setup canvas and adjust to window size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Function to resize canvas to fill screen
    const resizeCanvas = () => {
      // Set canvas to fill window (adjusted for the scaling factor)
      const scaleFactor = 1.25; // 1/0.8 = 1.25
      canvas.width = window.innerWidth * scaleFactor;
      canvas.height = window.innerHeight * scaleFactor;

      // Initialize panOffset if it doesn't exist
      if (!state.canvasState.panOffset) {
        updateCanvasState({
          panOffset: { x: 0, y: 0 },
          scale: 1,
        });
      }

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

          // Apply pan offset when rendering
          const offsetX = state.canvasState.panOffset?.x || 0;
          const offsetY = state.canvasState.panOffset?.y || 0;
          ctx.save();
          ctx.translate(offsetX, offsetY);
          ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
          ctx.restore();

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

  // Text input handling
  useEffect(() => {
    const textInput = textInputRef.current;
    if (!textInput) return;

    if (state.textInputActive && state.textInputPosition) {
      // Position the text input at the click location
      textInput.style.left = `${state.textInputPosition.x}px`;
      textInput.style.top = `${state.textInputPosition.y}px`;
      textInput.style.display = "block";
      textInput.focus();

      // Set the value from state if exists
      if (state.textInputValue) {
        textInput.value = state.textInputValue;
      }
    } else {
      textInput.style.display = "none";
    }
  }, [state.textInputActive, state.textInputPosition, state.textInputValue]);

  // Get mouse position relative to canvas
  const getMousePosition = (
    canvas: HTMLCanvasElement,
    event: React.MouseEvent
  ) => {
    const rect = canvas.getBoundingClientRect();
    // Apply the inverse scale factor (1/0.8 = 1.25) to get correct position
    // The scaling wrapper scales to 0.8, so we need to multiply by 1.25 to get actual position
    const scaleAdjustment = 1.25;
    return {
      x: (event.clientX - rect.left) * scaleAdjustment,
      y: (event.clientY - rect.top) * scaleAdjustment,
    };
  };

  // Handle mouse down
  const handleMouseDown = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const position = getMousePosition(canvas, event);
    setStartPosition(position);
    // Reset move tracking state
    setHasMovedSinceDown(false);

    // Different behavior based on current tool
    if (state.currentTool.id === "hand") {
      setIsPanning(true);
      setLastPanPosition(position);
      canvas.style.cursor = "grabbing";
    } else if (state.currentTool.id === "text") {
      // When using text tool, we don't start drawing, we create a text input
      const offsetX = state.canvasState.panOffset?.x || 0;
      const offsetY = state.canvasState.panOffset?.y || 0;

      // Adjust position for pan offset
      setTextInputActive(true, {
        x: position.x - offsetX,
        y: position.y - offsetY,
      });
      setTextInputValue("");
    } else {
      setIsDrawing(true);

      // Apply tool settings
      ctx.lineWidth = state.toolSettings.lineWidth || 1;
      ctx.strokeStyle = state.toolSettings.strokeStyle || "#000000";
      ctx.fillStyle = state.toolSettings.fillStyle || "transparent";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Different drawing behavior based on tool
      if (["brush", "eraser"].includes(state.currentTool.id)) {
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
      }
    }
  };

  // Handle mouse move
  const handleMouseMove = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const position = getMousePosition(canvas, event);

    if (isPanning && state.currentTool.id === "hand") {
      // Panning logic
      const dx = position.x - lastPanPosition.x;
      const dy = position.y - lastPanPosition.y;

      // Update the last pan position
      setLastPanPosition(position);

      // Update canvas state with new pan offset
      const currentOffset = state.canvasState.panOffset || { x: 0, y: 0 };
      updateCanvasState({
        panOffset: {
          x: currentOffset.x + dx,
          y: currentOffset.y + dy,
        },
      });

      // Redraw canvas with new pan offset
      if (state.canvasState.imageData) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(currentOffset.x + dx, currentOffset.y + dy);
        ctx.putImageData(state.canvasState.imageData, 0, 0);
        ctx.restore();
      }
    } else if (isDrawing) {
      // Track that drawing actually occurred
      if (position.x !== startPosition.x || position.y !== startPosition.y) {
        setHasMovedSinceDown(true);
      }

      if (["brush", "eraser"].includes(state.currentTool.id)) {
        // Continuous drawing
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
      } else if (state.currentTool.id === "line") {
        // Preview line (redraw from stored image)
        if (state.canvasState.imageData) {
          ctx.putImageData(state.canvasState.imageData, 0, 0);
        }

        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);
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
      } else if (state.currentTool.id === "ellipse") {
        // Preview ellipse (redraw from stored image)
        if (state.canvasState.imageData) {
          ctx.putImageData(state.canvasState.imageData, 0, 0);
        }

        const width = position.x - startPosition.x;
        const height = position.y - startPosition.y;
        const centerX = startPosition.x + width / 2;
        const centerY = startPosition.y + height / 2;

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        if (state.toolSettings.fillStyle !== "transparent") {
          ctx.fill();
        }
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isPanning) {
      setIsPanning(false);
      canvas.style.cursor = "grab"; // Change cursor back to grab after panning
    }

    if (isDrawing) {
      setIsDrawing(false);

      // Only add to history if actual drawing occurred
      if (hasMovedSinceDown) {
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
      }
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (isDrawing || isPanning) {
      handleMouseUp();
    }
  };

  // Handle text input
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Store the current text in state
    setTextInputValue(e.target.value);
  };

  // Handle text input blur (complete text entry)
  const handleTextInputBlur = () => {
    const canvas = canvasRef.current;
    const textInput = textInputRef.current;
    if (!canvas || !textInput || !state.textInputPosition) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only draw if there's text
    if (textInput.value.trim() !== "") {
      // Set font properties
      const fontSize = state.toolSettings.fontSize || 16;
      const fontFamily = state.toolSettings.fontFamily || "Arial";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = state.toolSettings.strokeStyle || "#000000";

      // Draw text at position, handle multiline
      const lines = textInput.value.split("\n");
      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          state.textInputPosition.x,
          state.textInputPosition.y + index * (fontSize * 1.2)
        );
      });

      // Update canvas state
      updateCanvasState({
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
      });
      setTextInputActive(false);

      // Add to history
      const imageData = canvas.toDataURL("image/png");
      addHistoryItem({
        imageData,
        type: "user-edit",
      });
    } else {
      // Just hide the input if no text
      setTextInputActive(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: state.currentTool.cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      <textarea
        ref={textInputRef}
        className="absolute bg-transparent border border-primary p-1 outline-none resize-none"
        style={{
          display: "none",
          minWidth: "100px",
          minHeight: "1.5rem",
          fontSize: `${state.toolSettings.fontSize || 16}px`,
          fontFamily: state.toolSettings.fontFamily || "Arial",
          color: state.toolSettings.strokeStyle || "#000000",
        }}
        onChange={handleTextInputChange}
        onBlur={handleTextInputBlur}
      />
    </div>
  );
}
