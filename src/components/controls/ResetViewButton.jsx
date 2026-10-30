import { ToolbarButton } from "./atoms/ToolbarButton";
import copy from "../../common/data/copy.json";

/**
 * Moves the map back to the initial view set in config.js.
 * Wraps ToolbarButton so react-tabs does not count it as a tab
 * (same as FullscreenToggle).
 */
export function ResetViewButton({ language, onClick }) {
  return (
    <ToolbarButton
      label={copy[language].toolbar.reset_view}
      iconKey="my_location"
      onClick={onClick}
    />
  );
}
