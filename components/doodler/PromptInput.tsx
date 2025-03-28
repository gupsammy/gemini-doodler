"use client";

import React, { useState, useEffect, useRef } from "react";
import { Wand2 } from "lucide-react";
import { useDoodler } from "@/lib/doodler-context";
import { cn } from "@/lib/utils";
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";

export function PromptInput() {
  const { setIsPrompting, addHistoryItem } = useDoodler();
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [savedCanvasImage, setSavedCanvasImage] = useState<string | null>(null);
  const { isKeyboardVisible } = useKeyboardVisibility();
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Save canvas state when keyboard appears and restore when it disappears
  useEffect(() => {
    if (!isMobile) return;

    if (isKeyboardVisible && !savedCanvasImage) {
      // Save canvas when keyboard appears
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      if (canvas) {
        try {
          setSavedCanvasImage(canvas.toDataURL("image/png"));
        } catch (e) {
          console.error("Error saving canvas when keyboard appeared:", e);
        }
      }
    }
  }, [isMobile, isKeyboardVisible, savedCanvasImage]);

  // Focus the input when clicking on the container
  const handleContainerClick = () => {
    if (inputRef.current) {
      // On mobile, save the canvas state before focusing
      if (isMobile && !savedCanvasImage) {
        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        if (canvas) {
          try {
            // Save the canvas image data to our state
            setSavedCanvasImage(canvas.toDataURL("image/png"));
          } catch (e) {
            console.error("Error saving canvas before keyboard focus:", e);
          }
        }
      }
      inputRef.current.focus();
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  // Handle key down (Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Submit prompt to generate image
  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    // Set loading state
    setIsLoading(true);
    setIsPrompting(true);

    try {
      // Get the current canvas state as an image
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      if (!canvas) {
        throw new Error("Canvas not found");
      }

      // Use the saved canvas image if available (mobile keyboard case)
      let imageData;
      if (isMobile && savedCanvasImage) {
        imageData = savedCanvasImage;
      } else {
        // Create a temporary canvas for resizing
        const tempCanvas = document.createElement("canvas");
        const maxDimension = 1024;

        // Determine dimensions while maintaining aspect ratio
        let width = canvas.width;
        let height = canvas.height;
        const aspectRatio = width / height;

        if (width > height) {
          // Landscape orientation - width is the longer edge
          width = maxDimension;
          height = Math.round(maxDimension / aspectRatio);
        } else {
          // Portrait orientation - height is the longer edge
          height = maxDimension;
          width = Math.round(maxDimension * aspectRatio);
        }

        // Set dimensions on temp canvas
        tempCanvas.width = Math.round(width);
        tempCanvas.height = Math.round(height);

        // Draw the original canvas onto the temp canvas (resized)
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Get the resized image data
        imageData = tempCanvas.toDataURL("image/png");
      }

      // Send request to the Gemini API endpoint
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image: imageData,
          temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      // Update the canvas with the received image
      if (data.image) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            // Center and draw the image on the canvas
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate scaling and position to center the image
            const scale = Math.min(
              canvas.width / img.width,
              canvas.height / img.height
            );

            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (canvas.width - scaledWidth) / 2;
            const y = (canvas.height - scaledHeight) / 2;

            // Draw the image centered and scaled to fit the canvas
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          };
          img.src = data.image;
        }
      }

      // Add the generated image to history
      addHistoryItem({
        imageData: data.image || imageData,
        type: "ai-generated",
        prompt: prompt.trim(),
      });

      // Reset form
      setPrompt("");
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    } finally {
      setIsLoading(false);
      setIsPrompting(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10",
        isMobile ? "w-[calc(100%-2rem)]" : "w-[600px] max-w-[calc(100%-2rem)]"
      )}
      onClick={handleContainerClick}
    >
      <div className="flex flex-col items-start gap-2">
        {/* Creativity Slider - Left aligned */}
        <div className="flex items-center gap-2 w-1/3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-primary/20">
          <span className="text-sm font-medium text-black">ASD</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Existing Prompt Input */}
        <div className="relative flex items-center w-full">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe Edits (e.g., 'Add some hair')"
            className="w-full pl-4 pr-12 py-3 bg-background/90 backdrop-blur-sm border-2 border-primary/20 rounded-xl shadow-lg shadow-primary/10 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            disabled={isLoading}
          />
          <button
            className={cn(
              "absolute right-3 p-1 rounded-md",
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-accent transition-colors",
              !prompt.trim() && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            aria-label="Generate image from prompt"
          >
            {isLoading ? (
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <Wand2 className="w-6 h-6 text-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
