//@ts-check

/**
 * @class EventBus
 * @description A singleton class that implements the observer pattern.
 */
class EventBus {

    /**
     * @type {EventBus}
     * @private
     */
    static instance;

    /**
     * @type {Map<string, Set<Function>>}
     * @protected
     */
    subscribers = new Map();
  
    /**
     * @returns {EventBus} The singleton instance.
     */
    static getInstance() {
      if (!EventBus.instance) {
        EventBus.instance = new EventBus()
      }
      return EventBus.instance
    }

    /**
     * @constructor
     * @private
     * @description Private constructor to enforce singleton pattern.
     */
    constructor() {
      if(EventBus.instance) {
        return EventBus.instance
      }
      Object.freeze(this);

      EventBus.instance = this;
      return this;
    }
  
    /**
     * @returns {Map<string, Set<Function>>} List of currently registered subscribers.
     */
    getSubscribers() {
      return this.subscribers;
    }
  
    /**
     * Subscribe to an event.
     * @param {string} event
     * @param {Function} callback
     * @description The callback function will be called with the event data when the event is emitted.
     */
    //Code is redudant for type safety
    subscribe(event, callback) {;
      if (!this.subscribers.has(event)) {
        this.subscribers.set(event, new Set())
      }
      const set = this.subscribers.get(event)
      if (set) {
        set.add(callback)
      } else {
        console.error(`[EventBus] Failed to subscribe to event: ${event}`)
      }
    }
  
    /**
     * Unsubscribe from an event.
     * @param {string} event
     * @param {Function} callback
     */
    unsubscribe(event, callback) {
      const set = this.subscribers.get(event)
      if (set) {
        set.delete(callback)
        if (set.size === 0) {
          this.subscribers.delete(event)
        }
      }
    }
  
    /**
     * Emit an event to all subscribers.
     * @param {string} event
     * @param {*} data
      */
    notify(event, data) {
      // console.warn(`[EventBus] notify: ${event}`, data)
      const set = this.subscribers.get(event);
      if (!set || set.size === 0) {
        if (event.toLowerCase().includes('error')) {
          console.error(`[EventBus] Unhandled error occurred:`, data)
        }
        return
      }
      for (const callback of set) {
        callback(data)
      }
    }
  }
  
  // Export the frozen singleton instance
  // const Bus = EventBus.getInstance()
  export default EventBus.getInstance()