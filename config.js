const one_day = 1440;

const config = {
  title: "Gamboa Ocean",
  // Data served from public/data
  SERVER_ROOT: ".",
  EVENTS_EXT: "/data/events.json",
  SOURCES_EXT: "/data/sources.json",
  ASSOCIATIONS_EXT: "/data/associations.json",
  DATE_FMT: "M/D/YYYY",
  TIME_FMT: "HH:mm",

  store: {
    app: {
      debug: true,
      map: {
        // Gamboa, Rio de Janeiro [lat, lng]
        anchor: [-22.8975, -43.1925],
        maxZoom: 18,
        minZoom: 4,
        startZoom: 14,
        // maxBounds: []
      },
      timeline: {
        dimensions: {
          height: 104,
          contentHeight: 104,
        },
        /**
         * Years shown on the timeline, each one taking an equal slice of it.
         * Years not listed take no space. Each event is drawn as a box with
         * its code (the event "id") under its year, 2 boxes per column.
         * Remove to use a continuous time scale instead.
         */
        years: [2016, 2019, 2020, 2021, 2022, 2024, 2025, 2026],
        range: {
          /**
           * Initial date range shown on map load.
           * Use [start, end] (strings in ISO 8601 format) for a fixed range.
           * Use undefined for a dynamic initial range based on the browser time.
           * Without "Z", dates are read in the browser's local time.
           */
          initial: ["2016-01-01T00:00:00", "2026-12-31T23:59:59"],
          /** The number of days to show when using a dynamic initial range */
          initialDaysShown: 31*12,
          limits: {
            /** Required. The lower bound of the range that can be accessed on the map. (ISO 8601) */
            lower: "2016-01-01T00:00:00",
            /**
             * The upper bound of the range that can be accessed on the map.
             * Defaults to current browser time if undefined.
             */
            upper: "2026-12-31T23:59:59",
          },
        },
      },
      flags: { isInfopoup: false, isCover: false },
      toolbar: {
        panels: {
          categories: {
            // TRUE: {
            //   icon: "public",
            //   label: "Verified",
            //   description: "todo",
            // },
            // FALSE: {
            //   icon: "public",
            //   label: "Unverified",
            //   description: "todo",
            // }
          },
        },
      },
      spotlights: {},
    },
    ui: {
      coloring: {
        mode: "STATIC",
        maxNumOfColors: 9,
        defaultColor: "#dfdfdf",
        colors: [
          "#7E57C2",
          "#F57C00",
          "#FFEB3B",
          "#D34F73",
          "#08B2E3",
          "#A1887F",
          "#90A4AE",
          "#E57373",
          "#80CBC4",
        ],
      },
      card: {
        layout: {
          template: "sourced",
        },
      },
      carto: {
        eventRadius: 8,
      },
      timeline: {
        eventRadius: 9,
      },
      // Mapbox style URLs (teste-mapbox). Leaflet/Esri originals:
      // default: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      // satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      tiles: {
        current: "mapbox://styles/mapbox/streets-v12",
        default: "mapbox://styles/mapbox/streets-v12",
        satellite: "mapbox://styles/mapbox/satellite-streets-v12"
      },
    },
    features: {
      USE_CATEGORIES: false,
      CATEGORIES_AS_FILTERS: false,
      COLOR_BY_CATEGORY: false,
      COLOR_BY_ASSOCIATION: true,
      USE_ASSOCIATIONS: true,
      USE_CLUSTERS: false,
      USE_FULLSCREEN: true,
      USE_DOWNLOAD: true,
      USE_SOURCES: true,
      USE_SPOTLIGHTS: false,
      USE_SHAPES: false,
      USE_COVER: false,
      USE_INTRO: false,
      USE_SATELLITE_OVERLAY_TOGGLE: true,
      USE_SEARCH: false,
      USE_SITES: false,
      ZOOM_TO_TIMEFRAME_ON_TIMELINE_CLICK: false,
      FETCH_EXTERNAL_MEDIA: false,
      USE_MEDIA_CACHE: false,
      GRAPH_NONLOCATED: false,
      NARRATIVE_STEP_STYLES: false,
      CUSTOM_EVENT_FIELDS: [],
    },
  },
};

export default config;
