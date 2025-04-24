/**
 * This is the main entry point for the application.
 * @author Martin Kindl
 */
import { Application } from './src/App.js';

const CANVAS = document.getElementById('debug'); //TODO id

const app = new Application();

app.run(document.getElementById("editor-input"), CANVAS);
