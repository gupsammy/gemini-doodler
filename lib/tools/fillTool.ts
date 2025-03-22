import { floodFill } from "../canvas-utils";

interface Point {
  x: number;
  y: number;
}

interface ToolSettings {
  strokeStyle?: string;
}

export const fillTool = {
  fill: (
    ctx: CanvasRenderingContext2D,
    position: Point,
    toolSettings: ToolSettings
  ) => {
    const fillColor = toolSettings.strokeStyle || "#000000";
    floodFill(ctx, Math.round(position.x), Math.round(position.y), fillColor);
  },
};
