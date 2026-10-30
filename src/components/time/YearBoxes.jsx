/**
 * Timeline made of a fixed list of years, each taking an equal slice of the
 * width. Every event is drawn as a box labelled with its code (the `id` from
 * the data, stored as `civId`) under its year. Boxes fill columns of
 * `ROWS` boxes; extra boxes open a new column to the right, inside the year's
 * slice.
 */
const ROWS = 2;
const LABEL_Y = 16;
const LINE_Y = 30;
const DOT_RADIUS = 5;
const BOXES_TOP = 42;
const BOX_HEIGHT = 22;
const BOX_MAX_WIDTH = 46;
const GAP = 6;
// space kept free before the next year's dot
const SLICE_END_PADDING = 16;

const compareCodes = (a, b) =>
  a.datetime - b.datetime ||
  String(a.civId).localeCompare(String(b.civId), undefined, { numeric: true });

const YearBoxes = ({ years, events, selected, dims, onSelect }) => {
  const sortedYears = [...years].sort((a, b) => a - b);
  const start = dims.marginLeft;
  const end = dims.width - dims.marginLeft;
  // width is 0 until the timeline is measured
  if (!(end > start) || sortedYears.length === 0) return null;
  const step = (end - start) / sortedYears.length;

  const eventsByYear = sortedYears.reduce((acc, year) => {
    acc[year] = [];
    return acc;
  }, {});
  events.forEach((event) => {
    if (!event || !event.datetime) return;
    const year = event.datetime.getFullYear();
    if (year in eventsByYear) eventsByYear[year].push(event);
  });

  // Same box width everywhere, sized so the fullest year still fits its slice
  const maxColumns = Math.max(
    1,
    ...sortedYears.map((year) => Math.ceil(eventsByYear[year].length / ROWS))
  );
  const boxWidth = Math.min(
    BOX_MAX_WIDTH,
    (step - SLICE_END_PADDING - (maxColumns - 1) * GAP) / maxColumns
  );

  const selectedIds = selected.map((ev) => ev.id);

  return (
    <g className="year-boxes">
      <line className="year-line" x1={start} x2={end} y1={LINE_Y} y2={LINE_Y} />
      {sortedYears.map((year, yearIdx) => {
        const x = start + yearIdx * step + DOT_RADIUS;
        const yearEvents = eventsByYear[year].sort(compareCodes);

        return (
          <g key={year} className="year">
            <text className="year-label" x={x} y={LABEL_Y}>
              {year}
            </text>
            <circle className="year-dot" cx={x} cy={LINE_Y} r={DOT_RADIUS} />
            {yearEvents.map((event, idx) => {
              const column = Math.floor(idx / ROWS);
              const row = idx % ROWS;
              const boxX = x - DOT_RADIUS + column * (boxWidth + GAP);
              const boxY = BOXES_TOP + row * (BOX_HEIGHT + GAP);
              const isSelected = selectedIds.includes(event.id);

              return (
                <g
                  key={event.id}
                  className={`event-box${isSelected ? " selected" : ""}`}
                  transform={`translate(${boxX}, ${boxY})`}
                  onClick={() => onSelect(event)}
                >
                  <title>{event.civId}</title>
                  <rect width={boxWidth} height={BOX_HEIGHT} />
                  <text x={boxWidth / 2} y={BOX_HEIGHT / 2}>
                    {event.civId}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

export default YearBoxes;
