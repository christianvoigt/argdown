import { html } from "lit-html";
import {
  component,
  useState,
  useEffect,
  useRef,
  useLayoutEffect
} from "haunted";
import { ArgdownMark } from "./ArgdownMark";
import { ExpandIcon } from "./ExpandIcon";
import { MinimizeIcon } from "./MinimizeIcon";
import { select } from "d3-selection";
import { addZoom, removeZoom } from "./zoomUtils";
import "./snow-in-spring.argdown-theme.css";
import "./global-styles.css";

let idCounter = 0;
const getId = () => {
  const id = "argdown-map-" + idCounter;
  idCounter++;
  return id;
};
const ArgdownMap = function(
  el: HTMLElement & {
    initialView: string;
    withoutZoom: string;
    withoutMaximize: string;
    withoutLogo: string;
    withoutHeader: string;
  }
) {
  if (!el.id) {
    el.id = getId();
  }
  const [activeView, setActiveView] = useState(el.initialView || "map");

  // fixes issue when loading url with page anchor (initial view will first be undefined and only later change, even if set explicitely in html)
  useEffect(() => {
    if (el.initialView && el.initialView != "") {
      setActiveView(el.initialView);
    }
  }, [el.initialView]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomIsActive, setZoomIsActive] = useState(false);
  const [zoomMessage, setZoomMessage] = useState("");
  const initialHeight = useRef(null);
  const removeZoomTimeout: any = useRef(null);
  const [hasMap, setHasMap] = useState(
    el.querySelector<HTMLElement>(`[slot="map"]`) !== null
  );
  const [hasSource, setHasSource] = useState(
    el.querySelector<HTMLElement>(`[slot="source"]`) !== null
  );

  const onSlotChange = () => {
    setHasMap(el.querySelector<HTMLElement>(`[slot="map"]`) !== null);
    setHasSource(el.querySelector<HTMLElement>(`[slot="source"]`) !== null);
    initialHeight.current = el.shadowRoot
      .querySelector(".component")
      .getBoundingClientRect().height;
  };

  useLayoutEffect(() => {
    if (activeView != "map") {
      return;
    }
    initialHeight.current = el.shadowRoot
      .querySelector(".component")
      .getBoundingClientRect().height;
  }, [activeView]);

  const onMouseOutMap = () => {
    if (el.withoutZoom === "true") {
      return;
    }
    setZoomMessage("");
    if (!removeZoomTimeout.current) {
      removeZoomTimeout.current = setTimeout(
        () => setZoomIsActive(false),
        3000
      );
    }
  };
  const onMouseOverMap = () => {
    if (el.withoutZoom === "true") {
      return;
    }
    if (removeZoomTimeout.current) {
      clearTimeout(removeZoomTimeout.current);
      removeZoomTimeout.current = null;
    }
    if (activeView == "map" && !zoomIsActive && zoomMessage == "") {
      setZoomMessage("Click to enable zoom");
    }
  };
  const onMapClick = () => {
    if (el.withoutZoom === "true") {
      return;
    }
    setZoomMessage("");
    setZoomIsActive(true);
  };
  useEffect(() => {
    if (el.withoutZoom === "true") {
      return;
    }
    const mapSlot = el.shadowRoot.querySelector<HTMLSlotElement>(".map-slot");
    if (!mapSlot) {
      return;
    }

    const assignedNodes = mapSlot.assignedNodes();
    if (zoomIsActive && assignedNodes.length > 0) {
      const svg = select<HTMLElement, null>(
        assignedNodes[0] as HTMLElement
      ).select<SVGSVGElement>("svg");
      const g = svg.select<SVGGraphicsElement>("g");
      const mapView = select(el.shadowRoot.querySelector(".map-view"));
      if (!isExpanded) {
        mapView.attr("style", `height:${initialHeight.current}px;`);
      }
      el.classList.add("zooming");
      const initialZoomState = {
        // width: svg.attr("width"),
        // height: svg.attr("height"),
        viewBox: svg.attr("viewBox"),
        transform: g.attr("transform")
      };
      // svg.attr("width", "100%");
      // svg.attr("height", "100%");
      svg.attr("viewBox", null);
      svg.attr("style", "height:100%; max-height: none;");
      const headerOffset = el.withoutHeader === "true" ? 0 : 40;
      const zoomBehavior = addZoom(svg, headerOffset);
      return () => {
        removeZoom(svg, zoomBehavior);
        el.classList.remove("zooming");
        // svg.attr("width", initialZoomState.width);
        // svg.attr("height", initialZoomState.height);
        svg.attr("style", "");
        svg.attr("viewBox", initialZoomState.viewBox);
        g.attr("transform", initialZoomState.transform);
        mapView.attr("style", null);
      };
    }
  }, [zoomIsActive]);
  useEffect(() => {
    if (el.withoutZoom === "true") {
      return;
    }
    if (activeView !== "map" && zoomIsActive) {
      setZoomIsActive(false);
      if (removeZoomTimeout.current) {
        clearTimeout(removeZoomTimeout.current);
        removeZoomTimeout.current = null;
      }
    }
  }, [activeView, zoomIsActive]);
  useEffect(() => {
    if (el.withoutZoom === "true") {
      return;
    }
    if (isExpanded) {
      //remove style if zooming was already going on
      if (zoomIsActive) {
        const content = select(el.shadowRoot.querySelector(".content"));
        content.attr("style", null);
      }
      setZoomIsActive(true);
    } else {
      setZoomIsActive(false);
    }
  }, [isExpanded]);
  return html`
    ${styles}
    <div
      class="component ${isExpanded ? "expanded" : ""} ${el.withoutHeader ===
      "true"
        ? "without-header"
        : ""}"
    >
      ${el.withoutHeader !== "true"
        ? html`
            <header>
              ${el.withoutLogo !== "true" ? ArgdownMark() : null}
              <nav>
                ${zoomMessage && zoomMessage !== ""
                  ? html`
                      <div class="zoom-message">${zoomMessage}</div>
                    `
                  : null}
                <ul class="flat">
                  <li>
                    ${activeView === "map"
                      ? hasSource
                        ? html`
                            <button
                              title="Source"
                              @click=${() => setActiveView("source")}
                            >
                              Source
                            </button>
                          `
                        : null
                      : hasMap
                      ? html`
                          <button
                            title="Map"
                            @click=${() => setActiveView("map")}
                          >
                            Map
                          </button>
                        `
                      : null}
                  </li>
                  <li>
                    ${el.withoutMaximize !== "true"
                      ? isExpanded
                        ? html`
                            <button
                              title="Minimize"
                              @click=${() => {
                                setIsExpanded(false);
                              }}
                            >
                              ${MinimizeIcon()}
                            </button>
                          `
                        : html`
                            <button
                              title="Expand"
                              @click=${() => setIsExpanded(true)}
                            >
                              ${ExpandIcon()}
                            </button>
                          `
                      : null}
                  </li>
                </ul>
              </nav>
            </header>
          `
        : null}
      ${activeView === "map"
        ? html`
            <div
              @click=${onMapClick}
              @mouseout=${onMouseOutMap}
              @mouseover=${onMouseOverMap}
              class="map-view${zoomIsActive ? " zooming" : ""}"
            >
              <slot
                name="map"
                class="map-slot"
                @slotchange="${onSlotChange}"
              ></slot>
            </div>
          `
        : html`
            <div class="source-view">
              <slot name="source" @slotchange="${onSlotChange}"></slot>
            </div>
          `}
    </div>
  `;
};
const styles = html`
  <style>
    :host {
      display: block;
      background-color: var(--argdown-bg-color, #fff);
      border: 1px solid var(--argdown-border-color, #eee);
    }
    :host .component {
      display: flex;
      background-color: var(--argdown-bg-color, #fff);
      flex-direction: column;
      position: relative;
      width: 100%;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    }
    ::slotted([slot="map"]) {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ::slotted([slot="source"]) {
      width: 100%;
      height: 100%;

      display: flex;
    }
    .map-view {
      width: 100%;
      height: 100%;
      padding-top: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    .component.without-header .map-view {
      padding-top: 0px;
    }
    .source-view {
      width: 100%;
      height: 100%;
      margin-top: 40px;
      display: flex;
      overflow-y: auto;
      box-sizing: border-box;
    }
    .component.without-header .source-view {
      margin-top: 0px;
    }
    .map-view.zooming {
      padding-top: 0px;
    }
    :host > .expanded .map-view,
    :host > .expanded .source-view {
      height: 100%;
      overflow-y: auto;
    }
    :host > .expanded .source-view {
      max-width: 45rem;
      margin: 0 auto;
    }
    /* :host .content.zooming ::slotted(svg) {
      width: 100%;
    } */
    :host > div.expanded {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 1000000;
    }
    nav {
      height: 2rem;
      width: 100%;
      display: flex;
      position: absolute;
      right: 3px;
      flex-direction: row;
      justify-content: flex-end;
      align-content: center;
      z-index: 10;
      top: 6px;
      pointer-events: none;
    }
    nav button,
    nav a {
      pointer-events: auto;
    }
    nav .zoom-message {
      color: var(--argdown-logo-color, #ccc);
      background-color: var(--argdown-bg-color, #fff);
      display: flex;
      align-items: center;
      padding: 0 1rem;
      margin: 0 auto;
    }
    ul.flat {
      margin: 0;
      padding: 0;
      list-style-type: none;
      display: flex;
    }
    ul.flat li {
      margin: 0;
      padding: 0;
      display: flex;
    }
    button {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      display: inline-block;
      font-size: 0.8rem;
      color: var(--argdown-button-font-color, #fff);
      background-color: var(--argdown-button-bg-color, #3e8eaf);
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      border: 0;
      cursor: pointer;
      transition: background-color 0.1s ease;
      box-sizing: border-box;
      border-bottom: 1px solid
        var(--argdown-button-border-bottom-color, #38809d);
      font-weight: 500;
      margin: 0 3px;
    }
    button:hover {
      background-color: var(--argdown-button-bg-hover-color, #387e9c);
    }
    button svg {
      height: 0.8rem;
      width: auto;
      color: var(--argdown-button-font-color, #fff);
    }
  </style>
`;
ArgdownMap.observedAttributes = [
  "initial-view",
  "without-zoom",
  "without-maximize",
  "without-logo",
  "without-header"
];
customElements.define(
  "argdown-map",
  component<HTMLElement & { initialView: string }>(ArgdownMap as any) as any
); // errors in haunted.js types makes it necessary to use any
