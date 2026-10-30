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
 * Barra sociograma: drawer docked on the left edge, mirroring the barra
 * multimídia on the right. Collapsed by default; its tab opens it to a
 * quarter of the screen, then to two thirds of it, then collapses it.
 *
 * Whenever `contentKey` changes (another event is selected or the event is
 * closed), the drawer opens at a quarter width if `hasContent`, and closes
 * otherwise. Content is passed as children.
 */
const SideDrawer = ({
  title,
  code,
  hasContent,
  contentKey,
  emptyMessage,
  children,
  isTabDisabled,
  onExpandedChange,
}) => {
  const [mode, setMode] = useState(CLOSED);
  const isExpanded = mode === FULL;

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
        onClick={() => setMode(NEXT_MODE[mode])}
        aria-label={TAB_LABEL[mode]}
        disabled={isTabDisabled}
      >
        <i className="material-icons">
          {isExpanded ? "chevron_left" : "chevron_right"}
        </i>
      </button>
      {title && (
        <h2 className="bar-title">
          {title}
          {code && <span className="bar-title-code">{code}</span>}
        </h2>
      )}
      <div className="side-drawer-content scrollbar-black">
        {hasContent ? children : <p>{emptyMessage}</p>}
      </div>
    </div>
  );
};

export default SideDrawer;
