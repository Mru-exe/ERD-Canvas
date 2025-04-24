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
     * Converts user input (expected to be DBML) to JSON object
     * @param {string} input User input expected to be DBML
     * @returns JSON representation of the database
     */
    parseDatabase(input) {
        input = this.saniziteInput(input);
        const parsed = super.parse(input, 'dbmlv2');
        return this.exportToJson(parsed);

    }

    /**
     * Converts DBML to JSON format
     * @param {string} dbml representation of the database in DBML format
     * @returns JSON object of the database
     */
    exportToJson(dbml) {
        const json = ModelExporter.export(dbml, 'json', false);
        return JSON.parse(json);
    }
}
