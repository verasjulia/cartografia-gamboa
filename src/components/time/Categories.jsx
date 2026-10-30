import { Component } from "react";

class TimelineCategories extends Component {
  renderCategory(cat, idx) {
    const { features, dims } = this.props;
    const strokeWidth = 1; // dims.trackHeight / (this.props.categories.length + 1)
    if (
      features.GRAPH_NONLOCATED &&
      features.GRAPH_NONLOCATED.categories &&
      features.GRAPH_NONLOCATED.categories.includes(cat)
    ) {
      return null;
    }

    return (
      <>
        <g
          className="tick"
          style={{ strokeWidth }}
          opacity="0.5"
          transform={`translate(0, 66)`}
        >
          <line x1={dims.marginLeft} x2={dims.width - dims.marginLeft} />
        </g>
        <g className="tick" opacity="1" transform={`translate(0, 66)`}>
          <text x={dims.marginLeft - 5} dy="0.32em">
            {cat}
          </text>
        </g>
      </>
    );
  }

  render() {
    const { categories, fallbackLabel } = this.props;
    const categoriesExist = categories && categories.length > 0;
    const renderedCategories = categoriesExist
      ? categories.map((cat, idx) => this.renderCategory(cat, idx))
      : this.renderCategory(fallbackLabel, 0);

    return <g className="yAxis">{renderedCategories}</g>;
  }
}

export default TimelineCategories;
