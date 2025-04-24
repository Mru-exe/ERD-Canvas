//@ts-check

import EventBus from './EventBus.js';
import Editor from './Editor.js';
import Parser from './Parser.js';
import Renderer from './Renderer.js';

export class Application {
  /**
   * @type {Editor}
   * @private
   */
  editor;

  /**
   * @type {Renderer}
   * @private
   */
  renderer;

  /**
   * @type {Parser}
   * @private
   */
  parser;

  constructor(){
    this.parser = new Parser();
  }

  /**
   * TODO!
   * @description Runs the application.
   */
  run(inputElement, canvasElement){
    //TODO: param types & doc
    this.editor = new Editor(EventBus, inputElement);
    this.renderer = new Renderer(canvasElement);

    this.setupListeners();
  }

  getEventBus(){
    return EventBus;
  }

  /**
   * 
   * @param {String} input User input
   * @returns {void}
   * @private
   */
  handleInputChange(input){
    if(input == null || input.length == 0){ 
      this.renderer.clear(); 
      return; 
    }
    
    try {
      const db = this.parser.parseDatabase(input);
      if(db == null){
        console.warn("db is null");
        return;
      }
      this.renderer.plot(db);
    } catch (error) {
      EventBus.notify('parseError', error);
    }
  }

  /**
   * @returns {void}
   * @private
   */
  setupListeners(){
    EventBus.subscribe('inputChanged', (e) => { this.handleInputChange(e) } );
  }
}