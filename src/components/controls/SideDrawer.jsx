import { useEffect, useState } from "react";

const CLOSED = "closed";
const QUARTER = "quarter";
const FULL = "full"; // two thirds of the screen width (see sidedrawer.scss)
// Tab cycles: closed -> quarter width -> two thirds width -> closed
const NEXT_MODE = { [CLOSED]: QUARTER, [QUARTER]: FULL, [FULL]: CLOSED };
const TAB_LABEL = {
  [CLOSED]: "Open panel",
  [QUARTER]: "Expand panel",
  [FULL]: "Close panel",
};

/**
 * Drawer docked on the left edge, mirroring the event drawer on the right.
 * Collapsed by default; its tab opens it to a quarter of the screen, then to
 * two thirds of it, then collapses it. Content is passed as children.
 */
const SideDrawer = ({ children, isTabDisabled, onExpandedChange }) => {
  const [mode, setMode] = useState(CLOSED);
  const isExpanded = mode === FULL;

  useEffect(() => {
    onExpandedChange?.(isExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  return (
    <div
      className={`side-drawer ${mode !== CLOSED ? "open" : ""} ${
        isExpanded ? "expanded" : ""
      }`}
    >
      <button
        className="side-drawer-tab"
        onClick={() => setMode(NEXT_MODE[mode])}
        aria-label={TAB_LABEL[mode]}
        disabled={isTabDisabled}
      >
        <i className="material-icons">
          {isExpanded ? "chevron_left" : "chevron_right"}
        </i>
      </button>
      <div className="side-drawer-content scrollbar-black">{children}</div>
    </div>
  );
};

export default SideDrawer;
