/**
 * Event layers: Mapbox style layers listed in the `camadas` field of the
 * events. Any layer listed by at least one event is hidden, except the ones
 * listed by the selected events. Layers not listed by any event (base map,
 * bens-tombados...) are left as they are in the Mapbox style.
 */

function collectLayerIds(events) {
  const ids = new Set();
  events.forEach((event) => {
    if (event && Array.isArray(event.camadas)) {
      event.camadas.forEach((id) => ids.add(id));
    }
  });
  return ids;
}

export function getEventLayerIds(events) {
  return collectLayerIds(events);
}

export function getActiveLayerIds(selected) {
  return collectLayerIds(selected);
}

/**
 * Sets the visibility of every event layer on a Mapbox map, and returns the
 * ids not found in the style (e.g. typos in events.json).
 */
export function applyEventLayers(map, events, selected) {
  const active = getActiveLayerIds(selected);
  const missing = [];
  getEventLayerIds(events).forEach((id) => {
    if (!map.getLayer(id)) {
      missing.push(id);
      return;
    }
    map.setLayoutProperty(
      id,
      "visibility",
      active.has(id) ? "visible" : "none"
    );
  });
  return missing;
}
