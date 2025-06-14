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
        const onlineStatus = navigator.onLine ? 'true' : 'false';
        const template = `
        <aside>
            <div class="editor" id="editor-container">
                <div class="editor" id="editor-gutter"></div>
                <textarea class="editor" id="editor-input" spellcheck="false"></textarea>
            </div>
            <div id="aside-footer">
                <span id="online-status" data-online="${onlineStatus}"></span>
                <span id="editor-status"></span>
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
            // this.container.innerHTML = `Unavailable in offline mode. Please connect to the internet.`;
        }
    }
}