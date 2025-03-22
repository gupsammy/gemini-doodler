interface Point {
  x: number;
  y: number;
}

interface ToolSettings {
  lineWidth?: number;
  strokeStyle?: string;
  fillStyle?: string;
}

export const shapeTool = {
  line: {
    draw: (
      ctx: CanvasRenderingContext2D,
      startPosition: Point,
      currentPosition: Point,
      toolSettings: ToolSettings
    ) => {
      ctx.lineWidth = toolSettings.lineWidth || 1;
      ctx.strokeStyle = toolSettings.strokeStyle || "#000000";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(startPosition.x, startPosition.y);
      ctx.lineTo(currentPosition.x, currentPosition.y);
      ctx.stroke();
    },
  },

  rectangle: {
    draw: (
      ctx: CanvasRenderingContext2D,
      startPosition: Point,
      currentPosition: Point,
      toolSettings: ToolSettings
    ) => {
      ctx.lineWidth = toolSettings.lineWidth || 1;
      ctx.strokeStyle = toolSettings.strokeStyle || "#000000";
      ctx.fillStyle = toolSettings.fillStyle || "transparent";

      const width = currentPosition.x - startPosition.x;
      const height = currentPosition.y - startPosition.y;

      ctx.beginPath();
      ctx.rect(startPosition.x, startPosition.y, width, height);
      ctx.stroke();
      if (toolSettings.fillStyle !== "transparent") {
        ctx.fill();
      }
    },
  },

  ellipse: {
    draw: (
      ctx: CanvasRenderingContext2D,
      startPosition: Point,
      currentPosition: Point,
      toolSettings: ToolSettings
    ) => {
      ctx.lineWidth = toolSettings.lineWidth || 1;
      ctx.strokeStyle = toolSettings.strokeStyle || "#000000";
      ctx.fillStyle = toolSettings.fillStyle || "transparent";

      const width = currentPosition.x - startPosition.x;
      const height = currentPosition.y - startPosition.y;
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
      if (toolSettings.fillStyle !== "transparent") {
        ctx.fill();
      }
    },
  },
};
