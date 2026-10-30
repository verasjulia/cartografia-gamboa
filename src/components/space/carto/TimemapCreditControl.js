/**
 * Mapbox control with the TimeMap / Forensic Architecture credit, shown on
 * the same line as the Mapbox attribution, after "Improve this map".
 * Mapbox's own `customAttribution` would place it before "© Mapbox" and only
 * keeps links, so the credit is a separate control styled like the
 * attribution (see map.scss).
 */
export default class TimemapCreditControl {
  onAdd() {
    this.container = document.createElement("div");
    this.container.className =
      "mapboxgl-ctrl mapboxgl-ctrl-attrib timemap-credit";
    this.container.innerHTML =
      'Made with <a href="https://github.com/forensic-architecture/timemap" target="_blank" rel="noopener noreferrer">TimeMap</a>' +
      ' by <a href="https://forensic-architecture.org" target="_blank" rel="noopener noreferrer">Forensic Architecture</a>';
    return this.container;
  }

  onRemove() {
    this.container.remove();
  }
}
