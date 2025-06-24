import './style.css';
import { GameOfLife } from './game.js';
import { UI } from './ui.js';

const game = new GameOfLife();
const ui = new UI(game);

// Initialize the application
ui.init();