export class GameOfLife {
  constructor(width = 40, height = 30) {
    this.width = width;
    this.height = height;
    this.grid = this.createEmptyGrid();
    this.generation = 0;
    this.isRunning = false;
    this.speed = 200; // milliseconds between generations
    this.intervalId = null;
  }

  createEmptyGrid() {
    return Array(this.height).fill().map(() => Array(this.width).fill(0));
  }

  padGrid(grid) {
    const width = grid[0].length;
    const padded = [
      new Array(width + 2).fill(0),
      ...grid.map((row) => [0, ...row, 0]),
      new Array(width + 2).fill(0),
    ];
    return padded;
  }

  countNeighbors(grid, x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        if (grid[x + i] && grid[x + i][y + j]) {
          count += grid[x + i][y + j];
        }
      }
    }
    return count;
  }

  nextGeneration() {
    const padded = this.padGrid(this.grid);
    const newGrid = padded.map((row, x) =>
      row.map((cell, y) => {
        const neighbors = this.countNeighbors(padded, x, y);
        if (cell === 1 && (neighbors === 2 || neighbors === 3)) return 1;
        if (cell === 0 && neighbors === 3) return 1;
        return 0;
      })
    );
    
    // Remove padding
    this.grid = newGrid.slice(1, -1).map(row => row.slice(1, -1));
    this.generation++;
  }

  toggleCell(x, y) {
    if (x >= 0 && x < this.height && y >= 0 && y < this.width) {
      this.grid[x][y] = this.grid[x][y] === 1 ? 0 : 1;
    }
  }

  clear() {
    this.grid = this.createEmptyGrid();
    this.generation = 0;
    this.stop();
  }

  randomize() {
    this.grid = this.grid.map(row => 
      row.map(() => Math.random() < 0.3 ? 1 : 0)
    );
    this.generation = 0;
  }

  loadPattern(pattern, startX = 0, startY = 0) {
    this.clear();
    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        const x = startX + i;
        const y = startY + j;
        if (x < this.height && y < this.width) {
          this.grid[x][y] = pattern[i][j];
        }
      }
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => {
        this.nextGeneration();
      }, this.speed);
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.intervalId);
    }
  }

  step() {
    this.stop();
    this.nextGeneration();
  }

  setSpeed(speed) {
    this.speed = speed;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}