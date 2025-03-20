// Tool-related types
export interface ToolSettings {
  lineWidth?: number;
  strokeStyle?: string;
  fillStyle?: string;
}

export interface Tool {
  id: string;
  name: string;
  icon: string; // We'll use Lucide React icons
  cursor: string;
  settings?: ToolSettings;
}

// Canvas state
export interface CanvasState {
  width: number;
  height: number;
  imageData: ImageData | null;
}

// History item for tracking changes
export interface DoodleHistoryItem {
  id: string;
  timestamp: number;
  imageData: string; // Base64 encoded image
  prompt?: string; // AI prompt if applicable
  type: "user-edit" | "ai-generated";
}

// Application context state
export interface AppState {
  currentTool: Tool;
  toolSettings: ToolSettings;
  canvasState: CanvasState;
  history: DoodleHistoryItem[];
  currentHistoryIndex: number;
  isPrompting: boolean;
}

// Gemini API request/response types
export interface GeminiGenerateRequest {
  prompt: string;
  image?: string; // Base64 encoded current canvas
  history?: DoodleHistoryItem[]; // Previous interactions for context
}

export interface GeminiGenerateResponse {
  image: string; // Base64 encoded generated image
  description?: string; // Optional AI description
}
