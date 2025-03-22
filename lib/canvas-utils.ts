// Canvas utility functions

/**
 * Get mouse position relative to canvas
 */
export const getMousePosition = (
  canvas: HTMLCanvasElement,
  event: React.MouseEvent | React.Touch
) => {
  const rect = canvas.getBoundingClientRect();

  // Calculate accurate mouse position on the canvas accounting for scaling
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

/**
 * Convert hex color to RGBA values
 */
export const hexToRgba = (hex: string): [number, number, number, number] => {
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

/**
 * Flood fill algorithm for the fill tool
 */
export const floodFill = (
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
