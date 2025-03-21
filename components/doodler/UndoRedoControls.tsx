"use client";

import React from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { useDoodler } from "@/lib/doodler-context";
import { cn } from "@/lib/utils";

export function UndoRedoControls() {
  const { undo, redo, canUndo, canRedo } = useDoodler();

  return (
    <div className="fixed bottom-4 left-4 flex gap-2 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg p-2 z-10">
      <button
        className={cn(
          "p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
          !canUndo() && "opacity-50 cursor-not-allowed"
        )}
        onClick={undo}
        disabled={!canUndo()}
        title="Undo"
      >
        <div className="flex justify-center items-center">
          <RotateCcw className="w-5 h-5" />
        </div>
        <span className="absolute bottom-full mb-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
          Undo
        </span>
      </button>

      <button
        className={cn(
          "p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative group",
          !canRedo() && "opacity-50 cursor-not-allowed"
        )}
        onClick={redo}
        disabled={!canRedo()}
        title="Redo"
      >
        <div className="flex justify-center items-center">
          <RotateCw className="w-5 h-5" />
        </div>
        <span className="absolute bottom-full mb-2 py-1 px-2 bg-background border border-border rounded-md shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
          Redo
        </span>
      </button>
    </div>
  );
}
