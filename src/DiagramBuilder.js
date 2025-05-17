// ERDiagramBuilder.js

const SVG_NS = "http://www.w3.org/2000/svg";

export default class DiagramBuilder {
  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.tables = [];
    this.relations = [];
  }

  static create(width, height) {
    return new DiagramBuilder(width, height);
  }

  addTable(tableJson) {
    const tb = new TableBuilder(this, tableJson);
    this.tables.push(tb);
    return tb;
  }

  addRelation({ fromTable, fromField, toTable, toField, cardinality = "1:N" }) {
    this.relations.push({ fromTable, fromField, toTable, toField, cardinality });
    return this;
  }


  build(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      throw new Error(`Container "${containerSelector}" not found`);
    }

    // 1) Try to find an existing SVG
    let svg = container.querySelector(`#${this.svgId}`);
    if (!svg) {
      // 2) If it doesn’t exist yet, create it once
      svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('id', this.svgId);
      container.appendChild(svg);
    }

    // 3) (Re-)configure root attributes
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);
    svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);

    // 4) Clear out any old tables/relations
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // 5) Re-render all tables
    this.tables.forEach(tb => tb._render(svg));

    // 6) Re-render all relations
    this.relations.forEach(rel => this._renderRelation(svg, rel));
  }

  _renderRelation(svg, { fromTable, fromField, toTable, toField, cardinality }) {
    const t1 = this.tables.find(t => t.data.name === fromTable);
    const t2 = this.tables.find(t => t.data.name === toTable);
    if (!t1 || !t2) return;

    const p1 = t1.getFieldAnchor(fromField);
    const p2 = t2.getFieldAnchor(toField);

    // draw polyline or path
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    line.setAttribute("stroke", "#bbb");
    line.setAttribute("marker-end", "url(#arrowhead)");

    svg.appendChild(line);

    // cardinality text
    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", (p1.x + p2.x) / 2);
    txt.setAttribute("y", (p1.y + p2.y) / 2 - 5);
    txt.setAttribute("font-size", "12");
    txt.setAttribute("fill", "#444");
    txt.textContent = cardinality;
    svg.appendChild(txt);
  }
}

class TableBuilder {
  constructor(parent, tableJson) {
    this.parent = parent;
    this.data = tableJson;
    this.x = 0;
    this.y = 0;
    this.width = 200;
    this.rowHeight = 20;
    this.padding = 6;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(width, rowHeight) {
    this.width = width;
    if (rowHeight) this.rowHeight = rowHeight;
    return this;
  }

  end() {
    return this.parent;
  }

  // returns the SVG <g> for later use by the diagram builder
  _render(svg) {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("transform", `translate(${this.x},${this.y})`);

    // header
    const headerHeight = this.rowHeight + this.padding * 2;
    const totalHeight = headerHeight + this.data.fields.length * this.rowHeight;

    // container rect
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("width", this.width);
    rect.setAttribute("height", totalHeight);
    rect.setAttribute("fill", "#2c2f33");
    rect.setAttribute("stroke", "#555");
    rect.setAttribute("rx", 4);
    rect.setAttribute("ry", 4);
    g.appendChild(rect);

    // table name
    const nameText = document.createElementNS(SVG_NS, "text");
    nameText.setAttribute("x", this.padding);
    nameText.setAttribute("y", this.padding + this.rowHeight - 4);
    nameText.setAttribute("fill", "#fff");
    nameText.setAttribute("font-weight", "bold");
    nameText.textContent = this.data.name;
    g.appendChild(nameText);

    // draw fields
    this.fieldPositions = {}; // remember for relations
    this.data.fields.forEach((f, i) => {
      const y = headerHeight + i * this.rowHeight + this.rowHeight - 4;
      // field text
      const txt = document.createElementNS(SVG_NS, "text");
      txt.setAttribute("x", this.padding);
      txt.setAttribute("y", y);
      txt.setAttribute("fill", f.pk ? "#f1c40f" : "#ccc");
      txt.textContent = f.name + " : " + f.type.type_name;
      g.appendChild(txt);

      // record the anchor point at the right edge of the field
      this.fieldPositions[f.name] = {
        x: this.width,
        y: headerHeight + i * this.rowHeight + this.rowHeight / 2
      };
    });

    svg.appendChild(g);
    this.g = g;
    return g;
  }

  getFieldAnchor(fieldName) {
    // global coordinates
    const p = this.fieldPositions[fieldName];
    return {
      x: this.x + p.x,
      y: this.y + p.y
    };
  }
}