"use client";

import React, { useState, useEffect, useRef } from "react";
import { Wand2 } from "lucide-react";
import { useDoodler } from "@/lib/doodler-context";
import { cn } from "@/lib/utils";

export function PromptInput() {
  const { setIsPrompting, addHistoryItem } = useDoodler();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  // Focus the input when clicking on the container
  const handleContainerClick = () => {
    if (inputRef.current) {
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

      const imageData = canvas.toDataURL("image/png");

      // Send request to the Gemini API endpoint
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image: imageData,
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
            // Clear the canvas and draw the new image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe changes (e.g., 'Add a blue sky background')"
          className="w-full pl-4 pr-12 py-3 bg-background/90 backdrop-blur-sm border border-border rounded-xl shadow-lg outline-none focus:ring-2 focus:ring-primary"
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
            <Wand2 className="w-6 h-6 text-primary" />
          )}
        </button>
      </div>
    </div>
  );
}
