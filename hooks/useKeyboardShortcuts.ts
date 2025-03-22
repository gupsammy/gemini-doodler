import { useEffect } from "react";
import { useDoodler } from "@/lib/doodler-context";

interface UseKeyboardShortcutsProps {
  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
  isPanning: boolean;
  setIsPanning: (value: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const useKeyboardShortcuts = ({
  isDrawing,
  setIsDrawing,
  isPanning,
  setIsPanning,
  canvasRef,
}: UseKeyboardShortcutsProps) => {
  const { state, setTextInputActive } = useDoodler();

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
    canvasRef,
    setIsDrawing,
    setIsPanning,
  ]);
};
