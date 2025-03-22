import { useEffect, useRef } from "react";
import { useDoodler } from "@/lib/doodler-context";

interface UseCanvasSetupProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useCanvasSetup = ({
  canvasRef,
  containerRef,
}: UseCanvasSetupProps) => {
  const { state, updateCanvasState, addHistoryItem } = useDoodler();
  const initialRenderRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Function to resize canvas to fill screen
    const resizeCanvas = () => {
      // Save current canvas state if it exists before resizing
      let currentImageData = null;
      if (canvas && ctx) {
        try {
          currentImageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
        } catch (e) {
          console.error("Could not save canvas state:", e);
        }
      }

      // Get the viewport dimensions with some padding
      const padding = 32; // 16px padding on each side
      const viewportWidth = window.innerWidth - padding;
      const viewportHeight = window.innerHeight - padding;

      // Calculate dimensions while maintaining aspect ratio and max dimension of 1024
      const maxDimension = 1024;
      let canvasWidth, canvasHeight;

      // First, scale to fit viewport
      if (viewportWidth / viewportHeight > 1) {
        // Viewport is landscape
        canvasHeight = Math.min(viewportHeight, maxDimension);
        canvasWidth = Math.min(
          canvasHeight * (viewportWidth / viewportHeight),
          maxDimension
        );
      } else {
        // Viewport is portrait
        canvasWidth = Math.min(viewportWidth, maxDimension);
        canvasHeight = Math.min(
          canvasWidth * (viewportHeight / viewportWidth),
          maxDimension
        );
      }

      // Round dimensions to integers
      canvas.width = Math.round(canvasWidth);
      canvas.height = Math.round(canvasHeight);

      // Center the canvas in the viewport
      canvas.style.margin = "auto";
      canvas.style.position = "absolute";
      canvas.style.top = "50%";
      canvas.style.left = "50%";
      canvas.style.transform = "translate(-50%, -50%)";
      canvas.style.maxWidth = "calc(100% - 32px)"; // Account for padding
      canvas.style.maxHeight = "calc(100% - 32px)"; // Account for padding
      canvas.style.border = "1px solid rgba(0, 0, 0, 0.1)";
      canvas.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.05)";
      canvas.style.borderRadius = "4px";

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
          // Use the saved image data from before resize if available and if this is triggered by keyboard
          // This prevents canvas from being cleared when keyboard appears
          const sourceImageData =
            currentImageData || state.canvasState.imageData;
          tempCtx.putImageData(sourceImageData, 0, 0);
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
        // and if this is not a resize event
        if (!initialRenderRef.current && !window.resizeTriggeredRender) {
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
    const handleResize = () => {
      // Check if the resize is likely due to keyboard (only on mobile)
      const isMobile = window.innerWidth < 768;
      const isKeyboardResize =
        isMobile && window.innerHeight < window.outerHeight;

      // Set a flag on window to indicate this is a keyboard resize
      window.resizeTriggeredRender = !isKeyboardResize;

      // Only resize if it's not a keyboard event on mobile
      if (isMobile && isKeyboardResize) {
        // For keyboard events, don't trigger a full resize
        // Just preserve current state
        return;
      }

      resizeCanvas();

      // Reset the flag after a short delay, but only if it was set
      if (window.resizeTriggeredRender) {
        setTimeout(() => {
          window.resizeTriggeredRender = false;
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update canvas when imageData changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || !state.canvasState.imageData) return;

    ctx.putImageData(state.canvasState.imageData, 0, 0);
  }, [
    state.canvasState.imageData,
    state.canvasState.width,
    state.canvasState.height,
    state.canvasState.panOffset,
  ]);
};
