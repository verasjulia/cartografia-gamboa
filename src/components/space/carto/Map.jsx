import { bindActionCreators } from "redux";
import mapboxgl from "mapbox-gl";
import { Component } from "react";
import { isMobileOnly } from "react-device-detect";
import DOMPurify from "dompurify";
import { marked } from "marked";

import { connect } from "react-redux";
import * as actions from "../../../actions";
import * as selectors from "../../../selectors";

import SatelliteOverlayToggle from "./atoms/SatelliteOverlayToggle";
import LoadingOverlay from "../../atoms/Loading";

import { isIdentical, urlFromEnv } from "../../../common/utilities";
import { applyEventLayers, getEventLayerIds } from "./eventLayers";
import {
  parsePopupRules,
  findPopupText,
  getPopupLayerIds,
} from "./featurePopups";
import TimemapCreditControl from "./TimemapCreditControl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Converts Leaflet-style bounds [[lat, lng], [lat, lng]] to Mapbox
 * [[lng, lat], [lng, lat]]. Returns null (no limit) if latitudes are invalid,
 * e.g. the store default [[180, -180], [-180, 180]].
 */
function toMapboxBounds(bounds) {
  if (!bounds) return null;
  const [[lat0, lng0], [lat1, lng1]] = bounds;
  if (Math.abs(lat0) > 90 || Math.abs(lat1) > 90) return null;
  return [
    [Math.min(lng0, lng1), Math.min(lat0, lat1)],
    [Math.max(lng0, lng1), Math.max(lat0, lat1)],
  ];
}

/**
 * Map drawn with Mapbox GL JS, using the Mapbox style set in config.js.
 * The SVG event layers (events, clusters, narratives, regions, sites) are
 * not rendered. Selecting an event shows its `camadas` and flies to its
 * `vista` (see eventLayers.js).
 * Coordinates in the store are [lat, lng]; Mapbox expects [lng, lat].
 */
class Map extends Component {
  constructor() {
    super();
    this.map = null;
    // style layers can only be changed once the style has loaded
    this.isStyleLoaded = false;
    this.warnedMissingLayers = new Set();
    // texts shown when clicking features (see featurePopups.js)
    this.popupRules = [];
    this.popup = null;
    this.syncMapViewToUrl = this.syncMapViewToUrl.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.onMapMouseMove = this.onMapMouseMove.bind(this);
  }

  componentDidMount() {
    if (this.map === null) {
      this.initializeMap();
    }
    this.loadPopupRules();
  }

  loadPopupRules() {
    const url = urlFromEnv("POPUPS_EXT");
    if (!url) return;
    fetch(url[0])
      .then((response) => response.json())
      .then((json) => {
        this.popupRules = parsePopupRules(json);
      })
      .catch((err) =>
        console.error("Não foi possível carregar popups.json:", err)
      );
  }

  // Rendered features under the cursor, of the layers that have popup texts
  getPopupFeatures(point) {
    const layers = getPopupLayerIds(this.popupRules).filter((id) =>
      this.map.getLayer(id)
    );
    if (layers.length === 0) return [];
    return this.map.queryRenderedFeatures(point, { layers });
  }

  findFeatureText(features) {
    for (const feature of features) {
      const text = findPopupText(this.popupRules, feature.layer.id, feature);
      if (text) return text;
    }
    return null;
  }

  onMapClick(e) {
    if (this.props.app.debug) this.logClickedFeatures(e.point);

    const text = this.findFeatureText(this.getPopupFeatures(e.point));
    if (!text) return;
    this.closePopup();
    this.popup = new mapboxgl.Popup({
      className: "feature-popup",
      maxWidth: "280px",
    })
      .setLngLat(e.lngLat)
      .setHTML(DOMPurify.sanitize(marked.parse(String(text))))
      .addTo(this.map);
  }

  onMapMouseMove(e) {
    const hasText = !!this.findFeatureText(this.getPopupFeatures(e.point));
    this.map.getCanvas().style.cursor = hasText ? "pointer" : "";
  }

  closePopup() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
  }

  // debug: layer, Feature ID and attributes of the project's layers clicked,
  // to help writing the rules of popups.json
  logClickedFeatures(point) {
    const ownLayers = new Set([
      ...getEventLayerIds(this.props.domain.events),
      ...getPopupLayerIds(this.popupRules),
    ]);
    const layers = [...ownLayers].filter((id) => this.map.getLayer(id));
    if (layers.length === 0) return;
    this.map
      .queryRenderedFeatures(point, { layers })
      .forEach((feature) =>
        console.info(
          `Clique em "${feature.layer.id}" — Feature ID: ${feature.id} — atributos:`,
          feature.properties
        )
      );
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ui.tile !== this.props.ui.tile && this.map) {
      this.isStyleLoaded = false;
      this.map.setStyle(this.props.ui.tile);
    }

    if (
      prevProps.app.selected !== this.props.app.selected ||
      prevProps.domain.events !== this.props.domain.events
    ) {
      this.updateEventLayers();
      // its layer may have just been hidden
      this.closePopup();
    }
  }

  /**
   * Shows the `camadas` of the selected events and hides the other event
   * layers (see eventLayers.js)
   */
  updateEventLayers() {
    if (!this.map || !this.isStyleLoaded) return;
    const missing = applyEventLayers(
      this.map,
      this.props.domain.events,
      this.props.app.selected
    );
    missing
      .filter((id) => !this.warnedMissingLayers.has(id))
      .forEach((id) => {
        this.warnedMissingLayers.add(id);
        console.warn(`Camada "${id}" não existe no estilo do Mapbox`);
      });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.map) return;

    // Update map view if anchor or zoom changed (e.g., from URL state rehydration)
    const { anchor: nextAnchor, startZoom: nextZoom } = nextProps.app.map;
    const { anchor: currAnchor, startZoom: currZoom } = this.props.app.map;
    if (!isIdentical(nextAnchor, currAnchor) || nextZoom !== currZoom) {
      const currentCenter = this.map.getCenter();
      const currentZoom = this.map.getZoom();
      // Only update if the values actually differ from the current map state
      if (
        Math.abs(currentCenter.lat - nextAnchor[0]) > 0.00001 ||
        Math.abs(currentCenter.lng - nextAnchor[1]) > 0.00001 ||
        currentZoom !== nextZoom
      ) {
        this.map.jumpTo({
          center: [nextAnchor[1], nextAnchor[0]],
          zoom: nextZoom,
        });
      }
    }

    // Set appropriate zoom for narrative
    const { bounds } = nextProps.app.map;
    if (!isIdentical(bounds, this.props.app.map.bounds) && bounds !== null) {
      this.map.fitBounds(toMapboxBounds(bounds));
    } else if (
      nextProps.features.MOVE_MAP_ON_EVENT_SELECT &&
      !isIdentical(nextProps.app.selected, this.props.app.selected)
    ) {
      // Fly to the event just added to the selection (several events can be
      // selected); removing an event leaves the map where it is
      const currentIds = this.props.app.selected.map((ev) => ev.id);
      const added = nextProps.app.selected.filter(
        (ev) => !currentIds.includes(ev.id)
      );
      const eventPoint = added.length > 0 ? added[added.length - 1] : null;

      if (eventPoint !== null && eventPoint.vista) {
        // view set for the event in events.json
        const { lat, lng, zoom } = eventPoint.vista;
        this.map.flyTo({ center: [lng, lat], zoom, essential: true });
      } else if (
        eventPoint !== null &&
        eventPoint.latitude &&
        eventPoint.longitude
      ) {
        this.map.easeTo({
          center: [+eventPoint.longitude, +eventPoint.latitude],
          duration: 700,
        });
      }
    }
  }

  initializeMap() {
    /**
     * Creates a Mapbox GL map
     */
    const { map: mapConfig } = this.props.app;

    if (!mapboxgl.accessToken) {
      console.error(
        "VITE_MAPBOX_TOKEN não definido. Adicione o token do Mapbox ao arquivo .env.local"
      );
    }

    let map;
    try {
      map = new mapboxgl.Map({
        container: this.props.ui.dom.map,
        style: this.props.ui.tile,
        center: [mapConfig.anchor[1], mapConfig.anchor[0]],
        zoom: mapConfig.startZoom,
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom,
        maxBounds: toMapboxBounds(mapConfig.maxBounds),
      });
    } catch (err) {
      // e.g. browser without WebGL: keep the rest of the app usable
      console.error("Não foi possível iniciar o mapa Mapbox:", err);
      return;
    }

    map.keyboard.disable();
    // after the Mapbox attribution, on the same line (see map.scss)
    map.addControl(new TimemapCreditControl(), "bottom-right");

    map.on("moveend", this.syncMapViewToUrl);
    map.on("click", this.onMapClick);
    map.on("mousemove", this.onMapMouseMove);
    // also fires again after setStyle, which resets layer visibility
    map.on("style.load", () => {
      this.isStyleLoaded = true;
      this.updateEventLayers();
    });

    this.map = map;
  }

  syncMapViewToUrl() {
    if (!this.map) return;
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    // Round to 5 decimal places for cleaner URLs
    const lat = Math.round(center.lat * 100000) / 100000;
    const lng = Math.round(center.lng * 100000) / 100000;
    this.props.actions.updateMapView(lat, lng, zoom);
  }

  render() {
    const { isFetchingDomain } = this.props.app.flags;
    const checkMobile = isMobileOnly || window.innerWidth < 600;

    const classes =
      (this.props.app.narrative
        ? "map-wrapper narrative-mode"
        : "map-wrapper") + (checkMobile ? " mobile" : "");

    return (
      <div className={classes} onKeyDown={this.props.onKeyDown} tabIndex="0">
        <div id={this.props.ui.dom.map} />
        <LoadingOverlay
          isLoading={this.props.app.loading || isFetchingDomain}
          ui={isFetchingDomain}
          language={this.props.app.language}
        />
        {this.props.features.USE_SATELLITE_OVERLAY_TOGGLE && (
          <SatelliteOverlayToggle
            isUsingSatellite={this.props.ui.isUsingSatellite}
            toggleSatellite={this.props.actions.toggleTileOverlay}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    domain: {
      // all events, also those hidden by filters, to know every event layer
      events: state.domain.events,
    },
    app: {
      debug: state.app.debug,
      selected: selectors.selectSelected(state),
      map: state.app.map,
      language: state.app.language,
      loading: state.app.loading,
      narrative: state.app.associations.narrative,
      flags: {
        isFetchingDomain: state.app.flags.isFetchingDomain,
      },
    },
    ui: {
      tile: selectors.getTile(state),
      isUsingSatellite: selectors.isUsingSatellite(state),
      dom: state.ui.dom,
    },
    features: selectors.getFeatures(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
