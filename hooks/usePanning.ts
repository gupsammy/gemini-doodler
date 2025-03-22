import { useState } from "react";
import { useDoodler } from "@/lib/doodler-context";
import { getMousePosition } from "@/lib/canvas-utils";

interface UsePanningProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const usePanning = ({ canvasRef }: UsePanningProps) => {
  const { state, updateCanvasState } = useDoodler();
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });

  const handlePanStart = (event: React.MouseEvent | React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const position = getMousePosition(canvas, event);
    setIsPanning(true);
    setLastPanPosition(position);
    canvas.style.cursor = "grabbing";
  };

  const handlePanMove = (event: React.MouseEvent | React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas || !isPanning) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const position = getMousePosition(canvas, event);

    // Calculate delta movement
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
  };

  const handlePanEnd = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsPanning(false);
    canvas.style.cursor = "grab";
  };

  return {
    isPanning,
    setIsPanning,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
};
