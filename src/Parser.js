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
     * Converts user input (expected to be DBML) to JSON object
     * @param {string} input User input expected to be DBML
     * @returns JSON representation of the database
     */
    parseDatabase(input) {
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
