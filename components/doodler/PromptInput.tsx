"use client";

import { useState } from "react";
import { useDoodler } from "@/lib/doodler-context";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PromptInput() {
  const { state, updateCanvasState, addHistoryItem, setIsPrompting } =
    useDoodler();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setIsPrompting(true);

      // Get current canvas data
      const canvas = document.createElement("canvas");
      canvas.width = state.canvasState.width;
      canvas.height = state.canvasState.height;
      const ctx = canvas.getContext("2d");

      if (!ctx || !state.canvasState.imageData) {
        throw new Error("Canvas context not available");
      }

      // Draw current image on temporary canvas
      ctx.putImageData(state.canvasState.imageData, 0, 0);
      const imageData = canvas.toDataURL("image/png");

      // Send to API
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          image: imageData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();

      if (data.image) {
        // Load generated image
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = state.canvasState.width;
          canvas.height = state.canvasState.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Update canvas state with new image
            updateCanvasState({
              imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
            });

            // Add to history
            addHistoryItem({
              imageData: data.image,
              prompt,
              type: "ai-generated",
            });

            // Clear prompt
            setPrompt("");
          }
        };
        img.src = data.image;
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
      setIsPrompting(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-md"
      >
        <Input
          type="text"
          placeholder="Describe your changes (e.g., 'Add a blue sky background')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={!prompt.trim() || isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Processing
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Generate
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
