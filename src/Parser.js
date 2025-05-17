//@ts-check
//@ts-ignore
import { Parser as DBMLParser, ModelExporter } from 'https://esm.sh/@dbml/core';
import EventBus from './EventBus.js';

export default class Parser extends DBMLParser {

    /**
     * @type {EventBus}
     * @private
     */
    eventBus;

    constructor(eventBus) {
        super();
        this.eventBus = eventBus;
        this.setupListeners();
    }

    /**
     * Sets up event listeners for the parser
     * @private
     */
    setupListeners(){
        this.eventBus.subscribe('inputChanged', (input) => {
            try {
                const sanitizedInput = this.saniziteInput(input);
                const dbml = this.parseDatabase(sanitizedInput);
                const json = this.exportToJson(dbml);
                this.eventBus.notify('parseSuccess', json);
            } catch (error) {
                this.eventBus.notify('parseError', error);
            }
        })
    }

    /**
     * Sanitizes user input
     * @description Removes extra spaces, trims the input and splits it into lines
     * @returns {string} sanitized input
     * @param {string} input
     * @private
     */
    saniziteInput(input) {
        input = input.split('\n').map(line => line.trim()).join('\n');
        return input;
    }

    /**
     * Converts user input to DBML text
     * @param {string} input User input 
     * @returns DBML representation of the database
     * @private
     */
    parseDatabase(input) {
        const parsed = super.parse(input, 'dbmlv2');
        return parsed;
    }

    /**
     * Converts DBML to JSON format
     * @param {string} dbml representation of the database in DBML format
     * @returns JSON object of the database
     * @private
     */
    exportToJson(dbml) {
        const json = ModelExporter.export(dbml, 'json', false);
        return JSON.parse(json);
    }
}
