import React, { useState } from "react";
import Toolbar from "./Toolbar";
import History from "./History";
import ToolSettings from "./ToolSettings";
import Doodler from "./Doodler";

const App = () => {
  const [activePanel, setActivePanel] = useState(null); // 'toolbar', 'history', 'toolSettings' or null

  const togglePanel = (panelName) => {
    if (activePanel === panelName) {
      setActivePanel(null); // Close if already open
    } else {
      setActivePanel(panelName); // Open this panel, which closes others
    }
  };

  const handleUndo = () => {
    // Undo logic
  };

  const handleRedo = () => {
    // Redo logic
  };

  return (
    <div className="app-container">
      <Toolbar activePanel={activePanel} togglePanel={togglePanel} />

      <History activePanel={activePanel} togglePanel={togglePanel} />

      <ToolSettings
        activePanel={activePanel}
        togglePanel={togglePanel}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <div className="doodler-container">
        <Doodler />
      </div>
    </div>
  );
};

export default App;
