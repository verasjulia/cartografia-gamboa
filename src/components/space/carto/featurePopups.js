/**
 * Popup texts for features of Mapbox layers, read from public/data/popups.json:
 *
 *   {
 *     "zeis-5[id=5]": "text for the feature whose Feature ID is 5",
 *     "savam-apcp[CODIGO=ABC][AREA=10]": "every condition must match",
 *     "zeis-5": "text for any other feature of the layer"
 *   }
 *
 * The key is a layer id followed by optional [attribute=value] conditions.
 * `id` is the feature's Feature ID (Mapbox turns an `id` attribute into the
 * feature id when the data is uploaded); any other key is an attribute of the
 * feature. When several rules match, the one with most conditions wins.
 */

const KEY_RE = /^([^[\]]+)((?:\[[^[\]=]+=[^[\]]*\])*)$/;
const CONDITION_RE = /\[([^[\]=]+)=([^[\]]*)\]/g;

export function parsePopupRules(json) {
  const rules = [];
  Object.entries(json || {}).forEach(([key, text], order) => {
    const match = key.trim().match(KEY_RE);
    if (!match) {
      console.warn(`Regra de popup inválida: "${key}"`);
      return;
    }
    const conditions = [...match[2].matchAll(CONDITION_RE)].map((c) => [
      c[1].trim(),
      c[2].trim(),
    ]);
    rules.push({ layer: match[1].trim(), conditions, text, order });
  });
  // most specific first, then file order
  return rules.sort(
    (a, b) => b.conditions.length - a.conditions.length || a.order - b.order
  );
}

function featureValue(feature, key) {
  const props = feature.properties || {};
  if (key in props) return props[key];
  if (key === "id") return feature.id;
  return undefined;
}

export function findPopupText(rules, layerId, feature) {
  const rule = rules.find(
    (r) =>
      r.layer === layerId &&
      r.conditions.every(
        ([key, value]) => String(featureValue(feature, key)) === value
      )
  );
  return rule ? rule.text : null;
}

export function getPopupLayerIds(rules) {
  return [...new Set(rules.map((r) => r.layer))];
}
