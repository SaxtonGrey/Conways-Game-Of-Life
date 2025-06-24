export class UI {
  constructor(game) {
    this.game = game;
    this.canvas = null;
    this.ctx = null;
    this.cellSize = 12;
    this.gridColor = '#e5e7eb';
    this.aliveColor = '#3b82f6';
    this.deadColor = '#ffffff';
    this.isMouseDown = false;
    this.lastToggleCell = null;
  }

  init() {
    this.createHTML();
    this.setupCanvas();
    this.setupEventListeners();
    this.loadPresetPatterns();
    this.render();
    this.startRenderLoop();
  }

  createHTML() {
    document.getElementById('app').innerHTML = `
      <div class="container">
        <header class="header">
          <h1 class="title">Conway's Game of Life</h1>
          <p class="subtitle">Click cells to toggle them, or use the controls below</p>
        </header>

        <div class="controls">
          <div class="control-group">
            <button id="playBtn" class="btn btn-primary">
              <span class="play-icon">▶</span>
              <span class="pause-icon" style="display: none;">⏸</span>
              <span class="btn-text">Play</span>
            </button>
            <button id="stepBtn" class="btn btn-secondary">Step</button>
            <button id="clearBtn" class="btn btn-secondary">Clear</button>
            <button id="randomBtn" class="btn btn-secondary">Random</button>
          </div>

          <div class="control-group">
            <label class="speed-label">
              Speed: <span id="speedValue">200ms</span>
              <input type="range" id="speedSlider" min="50" max="1000" value="200" step="50" class="slider">
            </label>
          </div>

          <div class="control-group">
            <label class="preset-label">
              Presets:
              <select id="presetSelect" class="select">
                <option value="">Choose a pattern...</option>
              </select>
            </label>
          </div>
        </div>

        <div class="game-info">
          <span class="generation">Generation: <span id="generationCount">0</span></span>
        </div>

        <div class="canvas-container">
          <canvas id="gameCanvas"></canvas>
        </div>

        <div class="instructions">
          <h3>How to Play:</h3>
          <ul>
            <li><strong>Click</strong> on cells to toggle them alive/dead</li>
            <li><strong>Drag</strong> to paint multiple cells</li>
            <li><strong>Play</strong> to start the simulation</li>
            <li><strong>Step</strong> to advance one generation</li>
            <li>Try the preset patterns to see interesting behaviors!</li>
          </ul>
        </div>
      </div>
    `;
  }

  setupCanvas() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    const containerWidth = Math.min(800, window.innerWidth - 40);
    const containerHeight = Math.min(600, window.innerHeight - 300);
    
    this.canvas.width = containerWidth;
    this.canvas.height = containerHeight;
    this.canvas.style.width = containerWidth + 'px';
    this.canvas.style.height = containerHeight + 'px';
    
    this.cellSize = Math.floor(Math.min(
      containerWidth / this.game.width,
      containerHeight / this.game.height
    ));
  }

  setupEventListeners() {
    // Play/Pause button
    const playBtn = document.getElementById('playBtn');
    playBtn.addEventListener('click', () => {
      if (this.game.isRunning) {
        this.game.stop();
        this.updatePlayButton(false);
      } else {
        this.game.start();
        this.updatePlayButton(true);
      }
    });

    // Step button
    document.getElementById('stepBtn').addEventListener('click', () => {
      this.game.step();
      this.updatePlayButton(false);
    });

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', () => {
      this.game.clear();
      this.updatePlayButton(false);
    });

    // Random button
    document.getElementById('randomBtn').addEventListener('click', () => {
      this.game.randomize();
      this.updatePlayButton(false);
    });

    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    speedSlider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      this.game.setSpeed(speed);
      document.getElementById('speedValue').textContent = speed + 'ms';
    });

    // Preset selector
    document.getElementById('presetSelect').addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadPreset(e.target.value);
        e.target.value = '';
      }
    });

    // Canvas mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.handleCanvasClick(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        this.handleCanvasClick(e);
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.lastToggleCell = null;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseDown = false;
      this.lastToggleCell = null;
    });

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientY - rect.top) / this.cellSize);
    const y = Math.floor((e.clientX - rect.left) / this.cellSize);
    
    const cellKey = `${x},${y}`;
    if (this.lastToggleCell !== cellKey) {
      this.game.toggleCell(x, y);
      this.lastToggleCell = cellKey;
    }
  }

  updatePlayButton(isPlaying) {
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');
    const btnText = playBtn.querySelector('.btn-text');
    
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline';
      btnText.textContent = 'Pause';
    } else {
      playIcon.style.display = 'inline';
      pauseIcon.style.display = 'none';
      btnText.textContent = 'Play';
    }
  }

  loadPresetPatterns() {
    const presets = {
      'glider': {
        name: 'Glider',
        pattern: [
          [0, 1, 0],
          [0, 0, 1],
          [1, 1, 1]
        ]
      },
      'blinker': {
        name: 'Blinker',
        pattern: [
          [1, 1, 1]
        ]
      },
      'toad': {
        name: 'Toad',
        pattern: [
          [0, 1, 1, 1],
          [1, 1, 1, 0]
        ]
      },
      'beacon': {
        name: 'Beacon',
        pattern: [
          [1, 1, 0, 0],
          [1, 1, 0, 0],
          [0, 0, 1, 1],
          [0, 0, 1, 1]
        ]
      },
      'pulsar': {
        name: 'Pulsar',
        pattern: [
          [0,0,1,1,1,0,0,0,1,1,1,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0],
          [1,0,0,0,0,1,0,1,0,0,0,0,1],
          [1,0,0,0,0,1,0,1,0,0,0,0,1],
          [1,0,0,0,0,1,0,1,0,0,0,0,1],
          [0,0,1,1,1,0,0,0,1,1,1,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,1,1,1,0,0,0,1,1,1,0,0],
          [1,0,0,0,0,1,0,1,0,0,0,0,1],
          [1,0,0,0,0,1,0,1,0,0,0,0,1],
          [1,0,0,0,0,1,0,1,0,0,0,0,1],
          [0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,1,1,1,0,0,0,1,1,1,0,0]
        ]
      }
    };

    const select = document.getElementById('presetSelect');
    Object.entries(presets).forEach(([key, preset]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = preset.name;
      select.appendChild(option);
    });

    this.presets = presets;
  }

  loadPreset(presetKey) {
    const preset = this.presets[presetKey];
    if (preset) {
      const startX = Math.floor((this.game.height - preset.pattern.length) / 2);
      const startY = Math.floor((this.game.width - preset.pattern[0].length) / 2);
      this.game.loadPattern(preset.pattern, startX, startY);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= this.game.width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, this.game.height * this.cellSize);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.game.height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(this.game.width * this.cellSize, y * this.cellSize);
      this.ctx.stroke();
    }
    
    // Draw cells
    for (let x = 0; x < this.game.height; x++) {
      for (let y = 0; y < this.game.width; y++) {
        if (this.game.grid[x][y] === 1) {
          this.ctx.fillStyle = this.aliveColor;
          this.ctx.fillRect(
            y * this.cellSize + 1,
            x * this.cellSize + 1,
            this.cellSize - 2,
            this.cellSize - 2
          );
        }
      }
    }
    
    // Update generation counter
    document.getElementById('generationCount').textContent = this.game.generation;
  }

  startRenderLoop() {
    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}