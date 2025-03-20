"use client";

import { DoodlerProvider } from "@/lib/doodler-context";
import { Canvas } from "@/components/doodler/Canvas";
import { ToolBar } from "@/components/doodler/ToolBar";
import { PromptInput } from "@/components/doodler/PromptInput";
import { HistorySidebar } from "@/components/doodler/HistorySidebar";
import { Wand2 } from "lucide-react";

export default function Home() {
  return (
    <DoodlerProvider>
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 overflow-hidden relative">
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-primary" />
            Gemini Doodler
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Draw and enhance with AI
          </p>
        </header>

        {/* Main canvas area */}
        <div className="relative flex-1 flex items-center justify-center w-full">
          <Canvas />
          <ToolBar />
          <HistorySidebar />
        </div>

        {/* Prompt input at bottom */}
        <PromptInput />
      </main>
    </DoodlerProvider>
  );
}
