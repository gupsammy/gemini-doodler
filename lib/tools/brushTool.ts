interface Point {
  x: number;
  y: number;
}

interface ToolSettings {
  lineWidth?: number;
  strokeStyle?: string;
}

export const brushTool = {
  startDrawing: (
    ctx: CanvasRenderingContext2D,
    position: Point,
    toolSettings: ToolSettings
  ) => {
    ctx.lineWidth = toolSettings.lineWidth || 1;
    ctx.strokeStyle = toolSettings.strokeStyle || "#000000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
  },

  draw: (
    ctx: CanvasRenderingContext2D,
    lastPosition: Point,
    currentPosition: Point
  ) => {
    // If there's a significant gap between the last position and current position,
    // we need to restart the path to avoid jumps
    const distance = Math.sqrt(
      Math.pow(currentPosition.x - lastPosition.x, 2) +
        Math.pow(currentPosition.y - lastPosition.y, 2)
    );

    if (distance > 10) {
      // If distance is too large, start a new segment
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
    }

    ctx.lineTo(currentPosition.x, currentPosition.y);
    ctx.stroke();
  },
};

export const eraserTool = {
  ...brushTool, // Eraser uses same base functionality as brush
  startDrawing: (
    ctx: CanvasRenderingContext2D,
    position: Point,
    toolSettings: ToolSettings
  ) => {
    ctx.lineWidth = toolSettings.lineWidth || 1;
    ctx.strokeStyle = "#ffffff"; // Always white for eraser
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
  },
};
