import App from './App.js';

export default class AppView extends App {
    constructor(container) {
        super();

        this.container = container;
    }

    /**
     * Renders the HTML template for the application view.
     * @returns {string} HTML template for the application view
     */
    render() {
        const template = `
        <aside>
            <div class="editor" id="editor-container">
                <div class="editor" id="editor-gutter"></div>
                <textarea class="editor" id="editor-input" spellcheck="false"></textarea>
            </div>
        </aside>
        <main>
            <div id="diagram-container">

            </div>
        </main>
        `;
        return template;
    }

    onSuccess(){
        if(navigator.onLine) {
            super.run();
        } else {
            this.container.innerHTML = `Unavailable in offline mode. Please connect to the internet.`;
        }
    }
}