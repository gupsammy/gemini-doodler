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
      <main className="h-screen w-screen overflow-hidden relative bg-background">
        {/* Full-screen canvas */}
        <Canvas />

        {/* Floating logo */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10">
          <Wand2 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">Gemini Doodler</h1>
        </div>

        {/* All our UI components are self-positioned with fixed/absolute positioning */}
        <ToolBar />
        <HistorySidebar />
        <PromptInput />
      </main>
    </DoodlerProvider>
  );
}
