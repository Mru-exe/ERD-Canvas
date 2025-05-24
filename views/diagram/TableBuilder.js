//@ts-check
const SVG_NS = "http://www.w3.org/2000/svg";

export default class TableBuilder {

  /**
   * @typedef {[{x, y}]}
   * @private
   */
  fieldPositions;

  constructor(parent, tableJson) {
    this.parent = parent;
    this.data = tableJson;
    this.x = 0;
    this.y = 0;
    this.manualPosition = false;
    this.width = 200;
    this.rowHeight = 20;
    this.padding = 6;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.manualPosition = true;
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

  getHeight() {
    return (
      this.rowHeight +
      this.padding * 2 +
      this.data.fields.length * this.rowHeight
    );
  }

  _render(parentGroup) {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("transform", `translate(${this.x},${this.y})`);

    const totalH = this.getHeight();
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("width", this.width.toString());
    rect.setAttribute("height", totalH.toString());
    rect.setAttribute("fill", "#1C1C1C");
    rect.setAttribute("rx", "2");
    g.appendChild(rect);

    const titleBg = document.createElementNS(SVG_NS, "rect");
    titleBg.setAttribute("width", this.width.toString());
    titleBg.setAttribute("y", "2");
    titleBg.setAttribute("height", (this.padding + this.rowHeight).toString());
    titleBg.setAttribute("fill", "#50FF90");
    g.appendChild(titleBg);

    const title = document.createElementNS(SVG_NS, "text");
    title.setAttribute("x", this.padding.toString());
    title.setAttribute("y", (this.padding + this.rowHeight - 6).toString());
    title.setAttribute("fill", "#000");
    title.setAttribute("font-weight", "bold");
    title.textContent = this.data.name;
    g.appendChild(title);

    this.fieldPositions = {};
    const headerH = this.rowHeight + this.padding * 2;
    this.data.fields.forEach((f, i) => {
      const y = headerH + i * this.rowHeight + this.rowHeight - 4;
      const txt = document.createElementNS(SVG_NS, "text");
      txt.setAttribute("x", (this.padding).toString());
      txt.setAttribute("y", y.toString());
      txt.setAttribute("font-size", "14");
      txt.setAttribute("fill", "#fff");
      if (f.pk) {
        txt.setAttribute("font-weight", "bold");
        txt.setAttribute("fill", "#50FF90");
      }
      txt.textContent = `${f.name} : ${f.type.type_name}`;
      g.appendChild(txt);

      this.fieldPositions[f.name] = {
        x: this.width,
        y: headerH + i * this.rowHeight + this.rowHeight / 2,
      };
    });

    parentGroup.appendChild(g);
    return g;
  }

  getFieldAnchor(fieldName) {
    const p = this.fieldPositions[fieldName];
    return { x: this.x + p.x, y: this.y + p.y };
  }
  getFieldAnchors(fieldName) {
    const p = this.fieldPositions[fieldName];
    if (!p) return [];

    return [
      { x: this.x + 0, y: this.y + p.y },
      { x: this.x + this.width, y: this.y + p.y },
    ];
  }
}
