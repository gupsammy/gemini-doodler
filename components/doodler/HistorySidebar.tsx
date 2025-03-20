"use client";

import { useDoodler } from "@/lib/doodler-context";
import { DoodleHistoryItem } from "@/lib/doodler-types";
import { cn } from "@/lib/utils";
import { ArrowLeft, Wand2, Paintbrush } from "lucide-react";

export function HistorySidebar() {
  const { state, goToHistoryItem } = useDoodler();

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Only show history if there are items
  if (state.history.length === 0) {
    return null;
  }

  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 h-[80vh] w-56 bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-md overflow-hidden flex flex-col">
      <h3 className="font-medium text-sm mb-3">History</h3>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {state.history
          .slice()
          .reverse()
          .map((item: DoodleHistoryItem) => (
            <div
              key={item.id}
              className={cn(
                "rounded-md overflow-hidden border border-border hover:border-primary cursor-pointer transition-all duration-200 group"
              )}
              onClick={() => goToHistoryItem(item.id)}
              title={item.prompt || "User edit"}
            >
              <div className="relative">
                <img
                  src={item.imageData}
                  alt={item.prompt || "Canvas state"}
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                  <div className="flex items-center text-xs">
                    {item.type === "ai-generated" ? (
                      <Wand2 className="w-3 h-3 mr-1" />
                    ) : (
                      <Paintbrush className="w-3 h-3 mr-1" />
                    )}
                    <span>{formatTime(item.timestamp)}</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-primary" />
                </div>
              </div>
              {item.prompt && (
                <div className="text-xs p-1 truncate bg-muted/50">
                  {item.prompt}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
