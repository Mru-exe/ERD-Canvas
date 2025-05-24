//@ts-check
import EventBus from "./diagram/EventBus.js";
import Editor from "./diagram/Editor.js";
import Parser from "./diagram/Parser.js";
import DiagramBuilder from "./diagram/DiagramBuilder.js";

/**
 * AppClass manages the application state and handles the interaction between the editor, parser, and diagram builder.
 * @module App
 */
export default class App {
  /**
   * @type {Editor}
   * @private
   */
  editor;

  diagramContainer;

  /**
   * @typedef {{input: string, database: Object}} AppState
   * @type {AppState}
   * @private
   */
  appState = {
    input: "",
    database: {},
  };

  constructor() {
    this.parser = new Parser(EventBus);
    //load saved state from local storage
    const savedState = localStorage.getItem("appState");
    if (savedState != null) {
      console.log("found saved state in local storage: ");
      this.appState = JSON.parse(savedState);
      console.log(this.appState);
    }
  }

  /**
   * Runs the application from the point of last saved sate.
   * @param {HTMLElement} diagramContainerId - The container for the diagram.
   */
  run(diagramContainerId) {
    console.log("running application");
    this.editor = new Editor(EventBus);
    this.diagramContainer = document.getElementById("diagram-container");

    this.loadAppState(this.appState);

    this.setupListeners();
  }

  getEventBus() {
    return EventBus;
  }

  /**
   * Load the application state
   * @return {void}
   * @param {AppState} state - The state to load.
   * @private
   */
  loadAppState(state) {
    if (state.input == "" || state.database.schemas == null) return;
    console.log("loading from app state");
    this.state = state;
    this.editor.setInput(state.input);
    this.plotDatabase(state.database);
  }

  /**
   * Sets up event listeners for the application.
   * @returns {void}
   * @private
   */
  setupListeners() {
    EventBus.subscribe("parseSuccess", (data) => {
      this.appState.database = data;
      this.appState.input = this.editor.getInput();

      this.plotDatabase(data);
      localStorage.setItem("appState", JSON.stringify(this.appState));
    });

    EventBus.subscribe("inputChanged", (input) => {
      this.appState.input = input;
    });
  }

  /**
   * @param {Object} data - JSON representation of the database to plot.
   * @returns {void}
   * @private
   */
  plotDatabase(data) {
    console.log(data);
    if (data.schemas == null) return;
    const builder = DiagramBuilder.create(
      this.diagramContainer.clientWidth,
      this.diagramContainer.clientHeight
    );
    for (const schema of data.schemas) {
      for (const table of schema.tables) {
        builder.addTable(table).end();
      }
      for (const ref of schema.refs) {
        const A = ref.endpoints[0];
        const B = ref.endpoints[1];
        builder.addRelation({
          fromTable: A.tableName,
          fromField: A.fieldNames[0],
          toTable: B.tableName,
          toField: B.fieldNames[0],
          cardinalityFrom: `${A.relation}`,
          cardinalityTo: `${B.relation}`,
        });
      }
    }
    builder.build("#diagram-container");
  }
}
