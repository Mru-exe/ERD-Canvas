import EventBus from './EventBus.js';
import Editor from './Editor.js';
import Parser from './Parser.js';
import Renderer from './Renderer.js';

/* export class Application {
  #editor;
  #parser;
  #canvas;

  database;
  #inputTimeout;

  constructor(editorElement, canvasElement) {
    this.#canvas = new Canvas(canvasElement);
    this.#editor = new Editor(editorElement);
    this.#parser = new Parser();
    this.database = null;

    this.#editor.element.addEventListener('keyup', () => {
      if (this.#inputTimeout) {
        clearTimeout(this.#inputTimeout);
      }
      this.#inputTimeout = setTimeout(() => {
        this.handleInput();
      }, 500);
      // this.handleInput();
    });
  }

  handleInput(){
    let parsedDb;
    try {
      parsedDb = this.#parser.parseDBML(this.#editor.getValue());
    } catch (error) {
      // editor.handleSyntaxError(error);
      console.error("hadnleInput() thrown: ", JSON.stringify(error));
      return;
    }
    if(parsedDb.schemas.length == 0){
      return;
    }
    console.log("Parsed DBML of type" + typeof parsedDb + ": "+ JSON.stringify(parsedDb));
    this.#canvas.plot(parsedDb);
  }

  run() {
    // console.info('App is running');
  }

  notificationTest(){
    console.log("user inpu");
  }

  handleErrors(){

  }

  // parseDBML() {
  //   const dbml = this.editor.getValue();
  //   try {
  //     const parsed = this.parser.parse(dbml, 'dbml');
  //     this.database = parsed.schemas[0];
  //     console.log(this.database.tables);
  //   } catch (e) {
  //     console.error(e);
  //     throw e;
  //   }
  // }
} 
*/

export class Application {
  _editor;
  _renderer;
  _parser;
  _eventBus;

  constructor(){
    this.eventBus = EventBus;
    this._parser = new Parser();
  }

  run(editorElement, canvasElement){
    this._editor = new Editor(editorElement);
    this._renderer = new Renderer(canvasElement);

    this.#setupListeners();
  }

  #setupListeners(){
    //TODO
  }
}