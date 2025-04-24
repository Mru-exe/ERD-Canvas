//@ts-check
import EventBus from './EventBus.js';

export default class Editor {
  //TODO: Add types and doc
  //TODO: constructor
  //TODO: gutter

  //TODO: SYNTAX ERROR HANDLING
  //TODO: SYNTAX HIGHLIGHTING

  // #gutter;
  // #wrapper; 
  input;
  
  // #lineNumberElement;

  /**
   * @type {number}
   * @private
   */
  debounceTimeout;

  /**
   * @type {EventBus}
   * @private
   */
  eventBus;

  /**
   * TODO: constructor!
   * @param {EventBus} eventBus 
   * @param {any} editorInput <TODO!
   */
  constructor(eventBus, editorInput) {
    this.eventBus = eventBus;

    this.input = editorInput;
    // this.#gutter = editorGutter;
    // this.#wrapper = editorWrapper;

    // this.#lineNumberElement = document.createElement('div');
    // this.#lineNumberElement.className = 'line-number';
    this.setupEventListeners();
  }

  // #updateLineNumbers(){
  //   const lineCount = Array.from(this.input.children).filter(
  //     child => child.tagName.toLowerCase() === "div"
  //   ).length + 1;

  //   if(lineCount == 1) return;
    
  //   this.#gutter.innerHTML = '';

  //   for (let i = 1; i != lineCount; i++) {
  //     const ln = this.#lineNumberElement.cloneNode(true);
  //     ln.textContent = String(i);
  //     this.#gutter.append(ln);
  //   }

    // this.#gutter.replaceChildren(...Array.from({ length: lineCount }, (_, i) => {
    //   const ln = this.#lineNumberElement.cloneNode(true);
    //   ln.textContent = String(i + 1);
    //   return ln;
    // }));
  //}

  /**
   * @description Sets up event listeners for the editor.
   * @returns {void}
   * @private
   */
  setupEventListeners() {
    // this.eventBus.subscribe('parseError', (e) => {
    //   console.log("TODO: editor handling error");
    // });

    this.input.addEventListener('input', () => {
      // this.#updateLineNumbers();

      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => {
        this.eventBus.notify('inputChanged', this.input.innerText);
      }, 500);
    });

    this.input.addEventListener('scroll', () => {
      // this.#gutter.scrollTop = this.input.scrollTop;
    });
  }



  // this.eventBus.notify("inputChanged", input);
  
  handleSyntaxError(error) {
      //TODO: show error message in editor
  }
}