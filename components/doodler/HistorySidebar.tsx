"use client";

import { useDoodler } from "@/lib/doodler-context";
import { DoodleHistoryItem } from "@/lib/doodler-types";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Wand2,
  Paintbrush,
  Trash2,
  TrashIcon,
  History,
  ChevronRight,
  ChevronLeft,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useContext } from "react";
import { PanelContext } from "@/lib/panel-context";
import Image from "next/image";

export function HistorySidebar() {
  const { state, goToHistoryItem, deleteHistoryItem, clearHistory } =
    useDoodler();
  const [isMobile, setIsMobile] = useState(false);
  const { activePanel, setActivePanel } = useContext(PanelContext);
  const isExpanded = activePanel === "history";
  const isInitialRenderRef = useRef(true);

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

  // This effect prevents the history sidebar from auto-expanding when new items are added
  useEffect(() => {
    // Skip the first render
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }

    // No auto-expansion logic here - do nothing when history changes
    // This effectively prevents the sidebar from expanding when drawing happens
  }, [state.history]);

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle delete item
  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteHistoryItem(id);
    }
  };

  // Handle download image
  const handleDownloadImage = (
    e: React.MouseEvent,
    item: DoodleHistoryItem
  ) => {
    e.stopPropagation(); // Prevent triggering the parent onClick

    // Create a download link
    const link = document.createElement("a");
    link.href = item.imageData;

    // Create filename based on timestamp and type
    const timestamp = new Date(item.timestamp)
      .toISOString()
      .replace(/[:.]/g, "-");
    const type = item.type === "ai-generated" ? "ai" : "user";
    const promptText = item.prompt
      ? `-${item.prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "-")}`
      : "";

    link.download = `doodle-${type}-${timestamp}${promptText}.png`;

    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle clear all history
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      clearHistory();
    }
  };

  // Always render the component, but conditionally render contents
  return (
    <>
      {/* Only show history UI if there are items */}
      {state.history.length > 0 && (
        <>
          {/* Collapsed state - just show a button */}
          {!isExpanded && (
            <button
              onClick={() => setActivePanel("history")}
              className={cn(
                "fixed bg-background/90 backdrop-blur-sm rounded-lg border border-border shadow-lg z-20 p-2 flex items-center gap-1 hover:bg-accent transition-colors",
                isMobile ? "top-16 right-4" : "top-4 right-4"
              )}
              aria-label="Open history"
            >
              <History className="w-4 h-4" />
              {!isMobile && (
                <span className="text-sm">
                  History ({state.history.length})
                </span>
              )}
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Expanded state - full sidebar */}
          {isExpanded && (
            <div
              className={cn(
                "fixed right-4 bg-background/90 backdrop-blur-sm rounded-xl border border-border shadow-lg z-25 flex flex-col",
                isMobile ? "top-20 bottom-20 w-56" : "top-4 bottom-4 w-64"
              )}
            >
              <div className="flex justify-between items-center p-3 border-b border-border">
                <h3 className="font-medium text-sm flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  History ({state.history.length})
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleClearAll}
                    title="Clear All History"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setActivePanel(null)}
                    title="Collapse sidebar"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {state.history
                  .slice()
                  .reverse()
                  .map((item: DoodleHistoryItem) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-lg overflow-hidden border border-border hover:border-primary cursor-pointer transition-all duration-200 group relative"
                      )}
                      onClick={() => goToHistoryItem(item.id)}
                      title={item.prompt || "User edit"}
                    >
                      <div className="relative">
                        <Image
                          src={item.imageData}
                          alt={item.prompt || "Canvas state"}
                          className="w-full h-auto object-contain"
                          width={500}
                          height={500}
                          unoptimized={item.imageData.startsWith("data:")}
                          priority={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                          <div className="flex items-center text-xs bg-background/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                            {item.type === "ai-generated" ? (
                              <Wand2 className="w-3 h-3 mr-1" />
                            ) : (
                              <Paintbrush className="w-3 h-3 mr-1" />
                            )}
                            <span>{formatTime(item.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1"
                              onClick={(e) => handleDeleteItem(e, item.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                              onClick={(e) => handleDownloadImage(e, item)}
                              title="Download image"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <div className="bg-primary/90 text-primary-foreground rounded-full p-1">
                              <ArrowLeft className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                      {item.prompt && (
                        <div className="text-xs p-1.5 truncate bg-muted/50">
                          {item.prompt}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
