import { useState } from "react";
import { useDoodler } from "@/lib/doodler-context";
import { getMousePosition } from "@/lib/canvas-utils";
import { brushTool, eraserTool } from "@/lib/tools/brushTool";
import { shapeTool } from "@/lib/tools/shapeTool";
import { fillTool } from "@/lib/tools/fillTool";

interface UseCanvasEventsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isPanning: boolean;
  handlePanStart: (event: React.MouseEvent | React.Touch) => void;
  handlePanMove: (event: React.MouseEvent | React.Touch) => void;
  handlePanEnd: () => void;
}

export const useCanvasEvents = ({
  canvasRef,
  isPanning,
  handlePanStart,
  handlePanMove,
  handlePanEnd,
}: UseCanvasEventsProps) => {
  const {
    state,
    updateCanvasState,
    addHistoryItem,
    setTextInputActive,
    setTextInputValue,
  } = useDoodler();
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [lastDrawPosition, setLastDrawPosition] = useState({ x: 0, y: 0 });
  const [hasMovedSinceDown, setHasMovedSinceDown] = useState(false);

  const handleDrawingStart = (event: React.MouseEvent | React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const position = getMousePosition(canvas, event);
    setStartPosition(position);
    setLastDrawPosition(position);
    setHasMovedSinceDown(false);

    if (state.currentTool.id === "hand") {
      handlePanStart(event);
    } else if (state.currentTool.id === "text") {
      const offsetX = state.canvasState.panOffset?.x || 0;
      const offsetY = state.canvasState.panOffset?.y || 0;

      setTextInputActive(true, {
        x: position.x - offsetX,
        y: position.y - offsetY,
      });
      setTextInputValue("");
    } else if (state.currentTool.id === "fill") {
      fillTool.fill(ctx, position, state.toolSettings);

      updateCanvasState({
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
      });

      const imageData = canvas.toDataURL("image/png");
      addHistoryItem({
        imageData,
        type: "user-edit",
      });
    } else {
      setIsDrawing(true);

      if (["brush", "eraser"].includes(state.currentTool.id)) {
        const tool = state.currentTool.id === "brush" ? brushTool : eraserTool;
        tool.startDrawing(ctx, position, state.toolSettings);
      }
    }
  };

  const handleDrawingMove = (event: React.MouseEvent | React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const position = getMousePosition(canvas, event);

    if (isPanning && state.currentTool.id === "hand") {
      handlePanMove(event);
    } else if (isDrawing) {
      if (position.x !== startPosition.x || position.y !== startPosition.y) {
        setHasMovedSinceDown(true);
      }

      if (["brush", "eraser"].includes(state.currentTool.id)) {
        const tool = state.currentTool.id === "brush" ? brushTool : eraserTool;
        tool.draw(ctx, lastDrawPosition, position);
        setLastDrawPosition(position);
      } else if (state.currentTool.id === "line") {
        if (state.canvasState.imageData) {
          ctx.putImageData(state.canvasState.imageData, 0, 0);
        }
        shapeTool.line.draw(ctx, startPosition, position, state.toolSettings);
      } else if (state.currentTool.id === "rectangle") {
        if (state.canvasState.imageData) {
          ctx.putImageData(state.canvasState.imageData, 0, 0);
        }
        shapeTool.rectangle.draw(
          ctx,
          startPosition,
          position,
          state.toolSettings
        );
      } else if (state.currentTool.id === "ellipse") {
        if (state.canvasState.imageData) {
          ctx.putImageData(state.canvasState.imageData, 0, 0);
        }
        shapeTool.ellipse.draw(
          ctx,
          startPosition,
          position,
          state.toolSettings
        );
      }
    }
  };

  const handleDrawingEnd = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isPanning) {
      handlePanEnd();
    }

    if (isDrawing) {
      setIsDrawing(false);

      if (hasMovedSinceDown) {
        updateCanvasState({
          imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        });

        const imageData = canvas.toDataURL("image/png");
        addHistoryItem({
          imageData,
          type: "user-edit",
        });
      }
    }
  };

  return {
    isDrawing,
    setIsDrawing,
    handleDrawingStart,
    handleDrawingMove,
    handleDrawingEnd,
  };
};
