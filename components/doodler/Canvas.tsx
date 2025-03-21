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

  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Cancel drawing if in progress
        if (isDrawing) {
          // Reset drawing state
          setIsDrawing(false);

          // Restore the canvas from the last saved state
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext("2d");
          if (!ctx || !state.canvasState.imageData) return;

          // Restore the previous state
          ctx.putImageData(state.canvasState.imageData, 0, 0);
        }

        // Cancel text input if active
        if (state.textInputActive) {
          setTextInputActive(false);
        }

        // Cancel panning if in progress
        if (isPanning) {
          setIsPanning(false);

          const canvas = canvasRef.current;
          if (canvas) {
            canvas.style.cursor = "grab"; // Reset cursor
          }
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isDrawing,
    isPanning,
    state.canvasState.imageData,
    state.textInputActive,
    setTextInputActive,
  ]);

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

  // Flood fill algorithm for the fill tool
  const floodFill = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    fillColor: string
  ) => {
    // Get canvas dimensions
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Get the pixel data of the entire canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Get the index of the target pixel in the array
    const targetIdx = (y * width + x) * 4;

    // Get the color of the target pixel
    const targetColor = [
      data[targetIdx],
      data[targetIdx + 1],
      data[targetIdx + 2],
      data[targetIdx + 3],
    ];

    // Convert fill color string to RGBA values
    const fillColorRGBA = hexToRgba(fillColor);

    // If target color is the same as fill color, return
    if (
      targetColor[0] === fillColorRGBA[0] &&
      targetColor[1] === fillColorRGBA[1] &&
      targetColor[2] === fillColorRGBA[2] &&
      targetColor[3] === fillColorRGBA[3]
    ) {
      return;
    }

    // Define stack for flood fill (more efficient than recursion)
    const stack: [number, number][] = [[x, y]];
    const pixelsChecked = new Set<number>();

    // Loop until stack is empty
    while (stack.length > 0) {
      const [curX, curY] = stack.pop()!;
      const currentIdx = (curY * width + curX) * 4;

      // Skip if out of bounds or already checked
      if (
        curX < 0 ||
        curX >= width ||
        curY < 0 ||
        curY >= height ||
        pixelsChecked.has(currentIdx)
      ) {
        continue;
      }

      pixelsChecked.add(currentIdx);

      // Check if current pixel has the target color
      if (
        data[currentIdx] === targetColor[0] &&
        data[currentIdx + 1] === targetColor[1] &&
        data[currentIdx + 2] === targetColor[2] &&
        data[currentIdx + 3] === targetColor[3]
      ) {
        // Fill pixel with new color
        data[currentIdx] = fillColorRGBA[0];
        data[currentIdx + 1] = fillColorRGBA[1];
        data[currentIdx + 2] = fillColorRGBA[2];
        data[currentIdx + 3] = fillColorRGBA[3];

        // Add adjacent pixels to stack
        stack.push([curX + 1, curY]);
        stack.push([curX - 1, curY]);
        stack.push([curX, curY + 1]);
        stack.push([curX, curY - 1]);
      }
    }

    // Put the modified image data back to canvas
    ctx.putImageData(imageData, 0, 0);
  };

  // Helper function to convert hex color to RGBA values
  const hexToRgba = (hex: string): [number, number, number, number] => {
    // Default to black with full opacity
    if (!hex || hex === "transparent") {
      return [0, 0, 0, 0];
    }

    // Remove the # if present
    hex = hex.replace("#", "");

    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Return RGBA values
    return [r, g, b, 255]; // Full opacity
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
    } else if (state.currentTool.id === "fill") {
      // For fill tool, execute the flood fill algorithm
      ctx.fillStyle = state.toolSettings.strokeStyle || "#000000";

      // Apply flood fill
      floodFill(
        ctx,
        Math.round(position.x),
        Math.round(position.y),
        state.toolSettings.strokeStyle || "#000000"
      );

      // Update canvas state with new filled image
      updateCanvasState({
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
      });

      // Add to history
      const imageData = canvas.toDataURL("image/png");
      addHistoryItem({
        imageData,
        type: "user-edit",
      });
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
