//@ts-check

import TableBuilder from "./TableBuilder.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export default class DiagramBuilder {
  /**
   * @type {string}
   */
  static svgId;

  constructor(width = "100%", height = "100%") {
    this.width = width;
    this.height = height;
    this.tables = [];
    this.relations = [];
    this.svgId = "er-diagram-svg";
    this.contentGroupId = "diagram-content";
    this.zoomLevel = 1;
  }

  static clear(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container)
      throw new Error(`Container "${containerSelector}" not found`);
    const svg = container.querySelector(`#${this.svgId}`);
    if (svg) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.remove();
    }
  }

  static create(width, height) {
    return new DiagramBuilder(width, height);
  }

  addTable(tableJson) {
    const tb = new TableBuilder(this, tableJson);
    this.tables.push(tb);
    return tb;
  }

  addRelation({
    fromTable,
    fromField,
    toTable,
    toField,
    cardinalityFrom,
    cardinalityTo,
  }) {
    this.relations.push({
      fromTable,
      fromField,
      toTable,
      toField,
      cardinalityFrom,
      cardinalityTo,
    });
    return this;
  }

  build(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container)
      throw new Error(`Container "${containerSelector}" not found`);

    let svg = container.querySelector(`#${this.svgId}`);
    if (!svg) {
      svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("id", this.svgId);
      svg.setAttribute("tabindex", 0);
      container.appendChild(svg);
      svg.addEventListener("wheel", this._onWheel.bind(this));
    }
    svg.setAttribute("width", this.width);
    svg.setAttribute("height", this.height);
    svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);

    // 2) Get or create content <g>
    let content = svg.querySelector(`#${this.contentGroupId}`);
    if (!content) {
      content = document.createElementNS(SVG_NS, "g");
      content.setAttribute("id", this.contentGroupId);
      svg.appendChild(content);
    }

    this._autoLayoutTables();

    while (content.firstChild) content.removeChild(content.firstChild);

    this.tables.forEach((tb) => {
      const g = tb._render(content);
      this._makeDraggable(g, tb);
      g.classList.add("svg-table");
    });

    this.relations.forEach((rel) => {
      //@ts-ignore
      const { lineEl, textEl } = this.renderRelation(content, rel);
      rel.lineEl = lineEl;
      rel.textEl = textEl;
    });
  }

  _onWheel(evt) {
    evt.preventDefault();
    const factor = evt.deltaY < 0 ? 1.1 : 0.9;
    this.zoomLevel *= factor;
    const content = document.querySelector(
      `#${this.svgId} #${this.contentGroupId}`
    );
    if (!content) return;
    content.setAttribute("transform", `scale(${this.zoomLevel})`);
  }

  _makeDraggable(g, tableBuilder) {
    let isDown = false,
    pt = null,
    orig = null;
    const svg = document.getElementById(this.svgId);
    const toSVGPoint = (x, y) => {
      //@ts-ignore
      const p = svg.createSVGPoint();
      p.x = x;
      p.y = y;
      //@ts-ignore
      return p.matrixTransform(svg.getScreenCTM().inverse());
    };

    g.style.cursor = "move";

    g.addEventListener("pointerdown", (e) => {
      isDown = true;
      pt = toSVGPoint(e.clientX, e.clientY);
      orig = { x: tableBuilder.x, y: tableBuilder.y };
      g.setPointerCapture(e.pointerId);
    });

    g.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const p = toSVGPoint(e.clientX, e.clientY);
      const dx = p.x - pt.x;
      const dy = p.y - pt.y;
      tableBuilder.x = orig.x + dx / this.zoomLevel;
      tableBuilder.y = orig.y + dy / this.zoomLevel;
      g.setAttribute(
        "transform",
        `translate(${tableBuilder.x},${tableBuilder.y})`
      );
      this.updateRelationsFor(tableBuilder);
    });

    g.addEventListener("pointerup", (e) => {
      isDown = false;
      g.releasePointerCapture(e.pointerId);
    });
  }

  _autoLayoutTables() {
    const marginX = 20,
      marginY = 20,
      hGap = 40,
      vGap = 40;
    let cursorX = marginX,
      cursorY = marginY,
      rowMaxH = 0;

    this.tables.forEach((tb) => {
      if (!tb.manualPosition) {
        const w = tb.width,
          h = tb.getHeight();
          //@ts-ignore
        if (cursorX + w > this.width - marginX) {
          cursorX = marginX;
          cursorY += rowMaxH + vGap;
          rowMaxH = 0;
        }
        tb.x = cursorX;
        tb.y = cursorY;
        rowMaxH = Math.max(rowMaxH, h);
        cursorX += w + hGap;
      }
    });
  }

  /**
   * @protected
   */
  updateRelationsFor(movedTable) {
    this.relations.forEach((rel) => {
      if (
        rel.fromTable === movedTable.data.name ||
        rel.toTable === movedTable.data.name
      ) {
        const t1 = this.tables.find((t) => t.data.name === rel.fromTable);
        const t2 = this.tables.find((t) => t.data.name === rel.toTable);
        if (!t1 || !t2) return;

        const { p1, p2 } = this.getBestAnchors(
          t1,
          rel.fromField,
          t2,
          rel.toField
        );

        if(!p1 || !p2) return;

        rel.lineEl.setAttribute("x1", p1.x);
        rel.lineEl.setAttribute("y1", p1.y);
        rel.lineEl.setAttribute("x2", p2.x);
        rel.lineEl.setAttribute("y2", p2.y);

        rel.textEl.setAttribute("x", (p1.x + p2.x) / 2);
        rel.textEl.setAttribute("y", (p1.y + p2.y) / 2 - 5);

        rel.textEl.textContent =
          p1.x < p2.x
            ? `${rel.cardinalityTo} : ${rel.cardinalityFrom}`
            : `${rel.cardinalityFrom} : ${rel.cardinalityTo}`;
      }
    });
  }

  /**
   * @protected
   * @returns {{p1: {x: number, y: number}|null, p2: {x: number, y: number}|null}}
   */
  getBestAnchors(tableA, fieldA, tableB, fieldB) {
    const a1 = tableA.getFieldAnchors(fieldA);
    const a2 = tableB.getFieldAnchors(fieldB);
    let minDist = Infinity,
      best = { p1: null, p2: null };

    for (const p1 of a1) {
      for (const p2 of a2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < minDist) {
          minDist = d2;
          best = { p1, p2 };
        }
      }
    }
    return best;
  }

  /**
   * Renders a relationship line and its cardinality label between two tables on an SVG canvas.
   * @protected
   * 
   * @param {SVGGElement} parentGroup - The parent SVG group element to which the relationship elements will be appended.
   * @param {{fromTable: Object, fromField: Object, toTable: Object, toField: Object, cardinalityFrom: string, cardinalityTo: string}} relation - An object containing details about the relationship.
   * @returns {{lineEl: SVGLineElement, textEl: SVGTextElement}|{}} An object containing the created line and text SVG elements.
   */
  renderRelation(
    parentGroup,
    { fromTable, fromField, toTable, toField, cardinalityFrom, cardinalityTo }
  ) {
    const t1 = this.tables.find((t) => t.data.name === fromTable);
    const t2 = this.tables.find((t) => t.data.name === toTable);
    if (!t1 || !t2) return {};

    // pick closest anchor pair
    const { p1, p2 } = this.getBestAnchors(t1, fromField, t2, toField);

    if (!p1 || !p2) return {};

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", p1.x.toString());
    line.setAttribute("y1", p1.y.toString());
    line.setAttribute("x2", p2.x.toString());
    line.setAttribute("y2", p2.y.toString());
    line.setAttribute("stroke", "#bbb");
    parentGroup.appendChild(line);

    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", ((p1.x + p2.x) / 2).toString());
    txt.setAttribute("y", ((p1.y + p2.y) / 2 - 5).toString());
    txt.setAttribute("font-size", "14");
    txt.setAttribute("fill", "#444");
    txt.textContent =
      p1.x < p2.x
        ? `${cardinalityTo} : ${cardinalityFrom}`
        : `${cardinalityFrom} : ${cardinalityTo}`;
    console.log(p1.x > p2.x);
    parentGroup.appendChild(txt);

    return { lineEl: line, textEl: txt };
  }
}
