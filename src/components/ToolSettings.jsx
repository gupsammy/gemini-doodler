const ToolSettings = ({ activePanel, togglePanel, onUndo, onRedo }) => {
  const isOpen = activePanel === "toolSettings";

  return (
    <div className={`tool-settings-container ${isOpen ? "open" : "collapsed"}`}>
      <button
        className="tool-settings-toggle"
        onClick={() => togglePanel("toolSettings")}
      >
        <SettingsIcon />
      </button>

      {/* Always visible undo/redo buttons */}
      <div className="undo-redo-container">
        <button onClick={onUndo} aria-label="Undo">
          <UndoIcon />
        </button>
        <button onClick={onRedo} aria-label="Redo">
          <RedoIcon />
        </button>
      </div>

      {isOpen && (
        <div className="tool-settings-content">
          {/* Tool settings options */}
        </div>
      )}
    </div>
  );
};
