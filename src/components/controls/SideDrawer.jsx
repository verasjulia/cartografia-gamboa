import { useEffect, useState } from "react";
import BarHeader from "./BarHeader";

const CLOSED = "closed";
const QUARTER = "quarter";
const FULL = "full"; // expanded (see $drawer-expanded-width)
const TAB_LABEL = {
  [QUARTER]: "Open panel",
  [FULL]: "Expand panel",
  [CLOSED]: "Close panel",
};

// Tab cycles: closed -> quarter -> expanded -> closed. While the other drawer
// is expanded (`canExpand` false), it only toggles: closed <-> quarter.
function nextMode(mode, canExpand) {
  if (mode === CLOSED) return QUARTER;
  if (mode === QUARTER && canExpand) return FULL;
  return CLOSED;
}

/**
 * Barra sociograma: drawer docked on the left edge, mirroring the barra
 * multimídia on the right. Collapsed by default; its tab opens it to a
 * quarter of the screen, then expands it, then collapses it.
 *
 * Whenever `contentKey` changes (another event is selected or the event is
 * closed), the drawer opens at a quarter width if `hasContent`, and closes
 * otherwise. Content is passed as children; `emptyMessage` is shown instead
 * when `isEmpty` (no event selected). The header's X only collapses it.
 */
const SideDrawer = ({
  title,
  hasContent,
  contentKey,
  isEmpty,
  emptyMessage,
  children,
  canExpand = true,
  onExpandedChange,
}) => {
  const [mode, setMode] = useState(CLOSED);
  const isExpanded = mode === FULL;
  const next = nextMode(mode, canExpand);

  useEffect(() => {
    onExpandedChange?.(isExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  useEffect(() => {
    setMode(hasContent ? QUARTER : CLOSED);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);

  return (
    <div
      className={`side-drawer ${mode !== CLOSED ? "open" : ""} ${
        isExpanded ? "expanded" : ""
      }`}
    >
      <button
        className="side-drawer-tab"
        onClick={() => setMode(next)}
        aria-label={TAB_LABEL[next]}
      >
        <i className="material-icons">
          {next === CLOSED ? "chevron_left" : "chevron_right"}
        </i>
      </button>
      <BarHeader
        title={title}
        onClose={() => setMode(CLOSED)}
        closeSide="right"
      />
      <div className="side-drawer-content scrollbar-black">
        {isEmpty ? <p>{emptyMessage}</p> : children}
      </div>
    </div>
  );
};

export default SideDrawer;
