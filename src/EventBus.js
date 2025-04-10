/**
 * EventBus (Singleton)
 * Captures and emits custom events, using the observer design pattern.
 */
class EventBus {
    /**
     * @returns {EventBus} The singleton instance of EventBus.
     */
    constructor() {
        if (!EventBus.instance) {
            EventBus.instance = this;
        }
        this.subscribers = {}
        return EventBus.instance;
    }
    
    /**
     * Subscribes to an event.
     * @param {string} event - The event name.
     * @param {function} callback - The callback function to be executed when the event is emitted.
     */
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    }

    /**
     * Unsubscribes from an event.
     * @param {string} event - The event name.
     * @param {function} callback - The callback function to be removed.
     */
    unsubscribe(event, callback) {
        if (!this.subscribers[event]) return;
        this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    }

    /**
     * Emits an event, notifying all subscribers.
     * @param {string} event - The event name.
     * @param {any} data - The data to be passed to the subscribers.
     */
    notify(event, data) {
        if (!this.subscribers[event]) return;
        this.subscribers[event].forEach(callback => callback(data));
    }
}

const instance = new EventBus();
export default instance;