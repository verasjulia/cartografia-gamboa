import { createRef, Component } from "react";
import { connect } from "react-redux";
import { generateCardLayout, Card } from "./Card";

import * as selectors from "../../selectors";
import { getFilterIdxFromColorSet } from "../../common/utilities";
import copy from "../../common/data/copy.json";

class CardStack extends Component {
  constructor() {
    super();
    this.refs = {};
    this.refCardStack = createRef();
    this.refCardStackContent = createRef();
    // isManuallyOpen: drawer opened from its tab when no event is selected
    // isExpanded: drawer widened from a quarter to three quarters of the screen
    this.state = { isManuallyOpen: false, isExpanded: false };
    this.onClose = this.onClose.bind(this);
    this.onToggleTab = this.onToggleTab.bind(this);
  }

  isOpen() {
    return this.props.selected.length > 0 || this.state.isManuallyOpen;
  }

  onClose() {
    this.setState({ isManuallyOpen: false, isExpanded: false });
    this.props.onToggleCardstack();
  }

  // Tab cycles: closed -> quarter width -> three quarters width -> closed
  onToggleTab() {
    if (!this.isOpen()) {
      this.setState({ isManuallyOpen: true });
    } else if (!this.state.isExpanded) {
      this.setState({ isExpanded: true });
    } else {
      this.onClose();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const isNarrative = !!this.props.narrative;

    if (isNarrative) {
      this.scrollToCard();
    }

    // Always reopen at a quarter width, whatever closed the drawer
    if (!this.isOpen() && this.state.isExpanded) {
      this.setState({ isExpanded: false });
    }

    if (prevState.isExpanded !== this.state.isExpanded) {
      this.props.onExpandedChange?.(this.state.isExpanded);
    }
  }

  scrollToCard() {
    const duration = 500;
    const element = this.refCardStack.current;
    const cardScroll =
      this.refs[this.props.narrative.current].current.offsetTop;

    const start = element.scrollTop;
    const change = cardScroll - start;
    let currentTime = 0;
    const increment = 20;

    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    Math.easeInOutQuad = function (t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t -= 1;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animateScroll = function () {
      currentTime += increment;
      const val = Math.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) setTimeout(animateScroll, increment);
    };
    animateScroll();
  }

  renderCards(events, selections) {
    // if no selections provided, select all
    if (!selections) {
      selections = events.map((e) => true);
    }
    this.refs = [];

    const generateTemplate =
      generateCardLayout[this.props.cardUI.layout.template];

    return events.map((event, idx) => {
      const thisRef = createRef();
      this.refs[idx] = thisRef;

      const content = generateTemplate({
        event,
        colors: this.props.colors,
        coloringSet: this.props.coloringSet,
        getFilterIdxFromColorSet,
      });

      return (
        <Card
          key={idx}
          cardIdx={idx}
          content={content}
          language={this.props.language}
          isLoading={this.props.isLoading}
          isSelected={selections[idx]}
        />
      );
    });
  }

  renderSelectedCards() {
    const { selected } = this.props;

    if (selected.length > 0) {
      return this.renderCards(selected);
    }
    return null;
  }

  renderNarrativeCards() {
    const { narrative } = this.props;
    const showing = narrative.steps;

    const selections = showing.map((_, idx) => idx === narrative.current);

    return this.renderCards(showing, selections);
  }

  renderCardStackHeader() {
    const headerLang = copy[this.props.language].cardstack.header;

    return (
      <div
        id="card-stack-header"
        className="card-stack-header"
        onClick={this.onClose}
      >
        <button className="side-menu-burg is-active">
          <span />
        </button>
        <p className="header-copy top">
          {`${this.props.selected.length} ${headerLang}`}
        </p>
      </div>
    );
  }

  renderCardStackContent() {
    if (this.props.selected.length === 0) {
      return (
        <div className="card-stack-content card-stack-empty">
          <p>{copy[this.props.language].cardstack.empty}</p>
        </div>
      );
    }
    return (
      <div
        id="card-stack-content"
        className="card-stack-content scrollbar-black"
      >
        <ul>{this.renderSelectedCards()}</ul>
      </div>
    );
  }

  renderDrawerTab(isOpen) {
    const willClose = isOpen && this.state.isExpanded;
    const label = !isOpen
      ? "Open panel"
      : willClose
      ? "Close panel"
      : "Expand panel";
    return (
      <button
        className="card-stack-tab"
        onClick={this.onToggleTab}
        aria-label={label}
        disabled={this.props.isTabDisabled}
      >
        <i className="material-icons">
          {willClose ? "chevron_right" : "chevron_left"}
        </i>
      </button>
    );
  }

  renderNarrativeContent() {
    return (
      <div
        id="card-stack-content"
        className="card-stack-content"
        ref={this.refCardStackContent}
      >
        <ul>{this.renderNarrativeCards()}</ul>
      </div>
    );
  }

  render() {
    const { isCardstack, selected, narrative } = this.props;

    if (narrative) {
      if (selected.length === 0) return <div />;
      return (
        <div
          id="card-stack"
          ref={this.refCardStack}
          className={`card-stack narrative-mode
          ${isCardstack ? "" : " folded"}`}
        >
          {this.renderNarrativeContent()}
        </div>
      );
    }

    // Drawer docked on the right: collapsed by default, slides out when an
    // event is selected (or when its tab is clicked)
    const isOpen = this.isOpen();
    const isExpanded = isOpen && this.state.isExpanded;
    return (
      <div
        id="card-stack"
        className={`card-stack drawer ${isOpen ? "open" : ""} ${
          isExpanded ? "expanded" : ""
        }`}
      >
        {this.renderDrawerTab(isOpen)}
        {selected.length > 0 ? this.renderCardStackHeader() : null}
        {this.renderCardStackContent()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    narrative: selectors.selectActiveNarrative(state),
    selected: selectors.selectSelected(state),
    sourceError: state.app.errors.source,
    language: state.app.language,
    isCardstack: state.app.flags.isCardstack,
    isLoading: state.app.flags.isFetchingSources,
    cardUI: state.ui.card,
    colors: state.ui.coloring.colors,
    coloringSet: state.app.associations.coloringSet,
    features: state.features,
  };
}

export default connect(mapStateToProps)(CardStack);
