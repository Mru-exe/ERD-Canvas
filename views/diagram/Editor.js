//@ts-check
import EventBus from './EventBus.js';

export default class Editor {
  /**
   * @type {HTMLTextAreaElement}
   * @private
   */
  input;

  /**
   * @type {HTMLDivElement}
   * @private
   */
  lineNumbers;

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
   */
  constructor(eventBus) {
    this.eventBus = eventBus;

    
    this.input = /** @type {HTMLTextAreaElement} */ (document.getElementById('editor-input'));
    this.lineNumbers = /** @type {HTMLDivElement} */ (document.getElementById('editor-gutter'));

    this.initEditor();

    this.setupListeners();
  }

  setInput(input) {
    this.input.innerText = input;
    this.updateLineNumbers();
  }

  getInput() {
    return this.input.innerText;
  }

  updateLineNumbers() {
    const lines = this.input.value.split('\n').length;
    this.lineNumbers.innerHTML = '';
    for (let i = 1; i <= lines; i++) {
      const lineNum = /** @type {HTMLDivElement} */(document.createElement('div'));
      lineNum.className = 'line-number';
      lineNum.setAttribute('data-linenumber', i.toString());
      lineNum.textContent = i.toString();
      this.lineNumbers.appendChild(lineNum);
    }
  }
  
  /**
   * initializes the editor elements.
   * @private
   * @returns {void}
   */
  initEditor(){
    this.input.addEventListener('keydown', e => {
      if (e.ctrlKey && (e.key === 'y' || e.key === 'z')) {
        e.preventDefault();
        return;
      }
    });
    this.input.addEventListener('scroll', () => {this.lineNumbers.scrollTop = this.input.scrollTop;}, {passive: true});
    this.updateLineNumbers();
  }

  /**
   * @description Sets up event listeners for the editor.
   * @returns {void}
   * @private
   */
  setupListeners() {
    this.eventBus.subscribe('parseError', error => {
      this.handleSyntaxError(error);
    });

    this.input.addEventListener('input', e => {
      this.updateLineNumbers();

      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => {
        this.eventBus.notify('inputChanged', this.input.value);
      }, 400);
    });
  }

  /**
   * @description Handles syntax errors by displaying them in the editor.
   * @param {Error} error - The error to handle.
   * @returns {void}
   * @private
   */
  handleSyntaxError(error) {
    this.updateLineNumbers();
    const errLines = new Set();
    //@ts-ignore
    error.diags.forEach(element => {
      console.log(element.location.start.line);
      errLines.add(
        document.querySelector(`.line-number[data-linenumber="${element.location.start.line}"]`),
      );
    });
    console.log(errLines);
    errLines.forEach(element => {
      element.classList.add('error-line');
    })
  }
}