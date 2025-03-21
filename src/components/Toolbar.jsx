const Toolbar = ({ activePanel, togglePanel }) => {
  const isOpen = activePanel === "toolbar";

  return (
    <div className={`toolbar ${isOpen ? "open" : "collapsed"}`}>
      <button className="toolbar-toggle" onClick={() => togglePanel("toolbar")}>
        <HamburgerIcon />
      </button>

      {isOpen && <div className="toolbar-content">{/* Toolbar items */}</div>}
    </div>
  );
};
