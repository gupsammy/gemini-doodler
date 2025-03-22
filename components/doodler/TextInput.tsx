import { useRef, useEffect } from "react";
import { useDoodler } from "@/lib/doodler-context";

interface TextInputProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function TextInput({ canvasRef }: TextInputProps) {
  const {
    state,
    setTextInputActive,
    setTextInputValue,
    updateCanvasState,
    addHistoryItem,
  } = useDoodler();
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textInput = textInputRef.current;
    if (!textInput) return;

    if (state.textInputActive && state.textInputPosition) {
      // Position the text input at the click location
      textInput.style.left = `${state.textInputPosition.x}px`;
      textInput.style.top = `${state.textInputPosition.y}px`;
      textInput.style.display = "block";
      textInput.focus();

      // Set the value from state if exists
      if (state.textInputValue) {
        textInput.value = state.textInputValue;
      }
    } else {
      textInput.style.display = "none";
    }
  }, [state.textInputActive, state.textInputPosition, state.textInputValue]);

  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Store the current text in state
    setTextInputValue(e.target.value);
  };

  const handleTextInputBlur = () => {
    const canvas = canvasRef.current;
    const textInput = textInputRef.current;
    if (!canvas || !textInput || !state.textInputPosition) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only draw if there's text
    if (textInput.value.trim() !== "") {
      // Set font properties
      const fontSize = state.toolSettings.fontSize || 16;
      const fontFamily = state.toolSettings.fontFamily || "Arial";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = state.toolSettings.strokeStyle || "#000000";

      // Draw text at position, handle multiline
      const lines = textInput.value.split("\n");
      // Store textInputPosition in a local variable to satisfy TypeScript
      const textPosition = state.textInputPosition;
      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          textPosition.x,
          textPosition.y + index * (fontSize * 1.2)
        );
      });

      // Update canvas state
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      updateCanvasState({ imageData });

      // Add to history
      const dataUrl = canvas.toDataURL("image/png");
      addHistoryItem({
        imageData: dataUrl,
        type: "user-edit",
      });

      // Hide text input
      setTextInputActive(false);
    } else {
      // Just hide the input if no text
      setTextInputActive(false);
    }
  };

  return (
    <textarea
      ref={textInputRef}
      className="absolute z-20 px-2 py-1 outline-none min-w-[100px] min-h-[50px] bg-transparent border border-primary resize-none"
      style={{ display: "none" }}
      onChange={handleTextInputChange}
      onBlur={handleTextInputBlur}
    />
  );
}
