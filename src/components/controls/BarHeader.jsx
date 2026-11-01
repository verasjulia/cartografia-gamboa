/**
 * Black header band of the event bars (barra multimídia on the right, barra
 * sociograma on the left), with the bar title and a close (X) button.
 * Clicking anywhere on the band closes the bar. `closeSide` puts the X on the
 * "left" (default) or on the "right" of the band.
 */
const BarHeader = ({ title, onClose, closeSide = "left" }) => (
  <div
    className={`bar-header${closeSide === "right" ? " close-right" : ""}`}
    onClick={onClose}
  >
    <button className="side-menu-burg is-active" aria-label="Fechar">
      <span />
    </button>
    <h2 className="bar-title">{title}</h2>
  </div>
);

export default BarHeader;
