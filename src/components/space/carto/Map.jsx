import { bindActionCreators } from "redux";
import mapboxgl from "mapbox-gl";
import { Component } from "react";
import { isMobileOnly } from "react-device-detect";

import { connect } from "react-redux";
import * as actions from "../../../actions";
import * as selectors from "../../../selectors";

import SatelliteOverlayToggle from "./atoms/SatelliteOverlayToggle";
import LoadingOverlay from "../../atoms/Loading";

import { isIdentical } from "../../../common/utilities";

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
 * Mapbox GL test version of the map.
 * The SVG event layers (events, clusters, narratives, regions, sites) are
 * intentionally not rendered here; only the base map is shown.
 * Coordinates in the store are [lat, lng]; Mapbox expects [lng, lat].
 */
class Map extends Component {
  constructor() {
    super();
    this.map = null;
    this.syncMapViewToUrl = this.syncMapViewToUrl.bind(this);
  }

  componentDidMount() {
    if (this.map === null) {
      this.initializeMap();
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ui.tile !== this.props.ui.tile && this.map) {
      this.map.setStyle(this.props.ui.tile);
    }
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
    } else if (!isIdentical(nextProps.app.selected, this.props.app.selected)) {
      // Fly to first of events selected
      const eventPoint =
        nextProps.app.selected.length > 0 ? nextProps.app.selected[0] : null;

      if (eventPoint !== null && eventPoint.latitude && eventPoint.longitude) {
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

    map.on("moveend", this.syncMapViewToUrl);

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
    app: {
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
