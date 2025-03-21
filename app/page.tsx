"use client";

import { DoodlerProvider } from "@/lib/doodler-context";
import { Canvas } from "@/components/doodler/Canvas";
import { ToolBar } from "@/components/doodler/ToolBar";
import { UndoRedoControls } from "@/components/doodler/UndoRedoControls";
import { PromptInput } from "@/components/doodler/PromptInput";
import { HistorySidebar } from "@/components/doodler/HistorySidebar";
import { ToolSettings } from "@/components/doodler/ToolSettings";

export default function Home() {
  return (
    <DoodlerProvider>
      <div className="w-screen h-screen overflow-hidden">
        <main className="w-full h-full overflow-hidden relative bg-background">
          {/* Full-screen canvas */}
          <Canvas />

          {/* Floating logo */}
          <div className="absolute top-4 left-4 flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-lg p-5 shadow-lg z-10">
            <svg
              width="29"
              height="29"
              viewBox="0 0 72 72"
              fill="black"
              className="text-black"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M37.008,3.5h-1.796C21.561,3.5,10.5,14.228,10.5,27.512v33.716c0,3.696,3.273,7.271,6.785,7.271h0.333
                  c3.79,0,5.882-3.785,5.882-7.271v-2.996c0-1.235,1.84-1.731,3.114-1.731h0.333c0.754,0,2.553,0.097,2.553,1.731v2.996
                  c0,3.401,2.619,7.271,6.443,7.271h0.333c3.697,0,6.224-3.798,6.224-7.271v-2.996c0-1.433,1.797-1.731,2.771-1.731h0.334
                  c1.399,0,1.895,0.36,1.895,1.731v2.996c0,3.629,3.495,7.271,7.102,7.271h0.334c3.73,0,6.564-3.877,6.564-7.271V27.512
                  C61.5,14.228,50.486,3.5,37.008,3.5z M57.5,61.229c0,1.549-1.34,3.271-2.564,3.271h-0.334c-1.384,0-3.102-1.87-3.102-3.271V58.23
                  c0-3.584-2.288-5.73-5.895-5.73h-0.334c-3.951,0-6.771,2.363-6.771,5.732v2.996c0,1.476-0.997,3.271-2.224,3.271h-0.333
                  c-1.21,0-2.443-1.721-2.443-3.271v-2.996c0-3.422-2.722-5.731-6.553-5.731h-0.333c-3.471,0-7.114,1.957-7.114,5.731v2.996
                  c0,1.338-0.685,3.271-1.882,3.271h-0.333c-1.297,0-2.785-1.809-2.785-3.271V27.512C14.5,16.433,23.766,7.5,35.212,7.5h1.796
                  C48.473,7.5,57.5,16.245,57.5,27.512V61.229z"
                />
                <path
                  d="M23.794,23.574c-3.221,0-5.84,2.62-5.84,5.84s2.619,5.84,5.84,5.84c3.22,0,5.84-2.62,5.84-5.84
                  S27.014,23.574,23.794,23.574z M23.794,33.254c-2.117,0-3.84-1.723-3.84-3.84c0-2.117,1.723-3.84,3.84-3.84s3.84,1.723,3.84,3.84
                  C27.634,31.531,25.911,33.254,23.794,33.254z"
                />
                <path
                  d="M38.529,23.574c-3.221,0-5.84,2.62-5.84,5.84s2.619,5.84,5.84,5.84c3.22,0,5.84-2.62,5.84-5.84
                  S41.749,23.574,38.529,23.574z M38.529,33.254c-2.117,0-3.84-1.723-3.84-3.84c0-2.117,1.723-3.84,3.84-3.84s3.84,1.723,3.84,3.84
                  C42.369,31.531,40.646,33.254,38.529,33.254z"
                />
              </g>
            </svg>
            <h1 className="text-xl font-bold">Doodler</h1>
          </div>

          {/* All our UI components are self-positioned with fixed/absolute positioning */}
          <ToolBar />
          <UndoRedoControls />
          <HistorySidebar />
          <PromptInput />
          <ToolSettings />
        </main>
      </div>
    </DoodlerProvider>
  );
}
