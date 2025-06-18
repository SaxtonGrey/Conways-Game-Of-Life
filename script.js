const padGrid = (grid) => {
  const width = grid[0].length;
  const padded = [
    new Array(width + 2).fill(0), // top row
    ...grid.map((row) => [0, ...row, 0]), // each row padded
    new Array(width + 2).fill(0),
  ];
  return padded;
};

const countNeighbors = (grid, x, y) => {
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
};

const nextGeneration = (grid) => {
  const padded = padGrid(grid);
  const newGrid = padded.map((row, x) =>
    row.map((cell, y) => {
      const neighbors = countNeighbors(padded, x, y);
      if (cell === 1 && (neighbors === 2 || neighbors === 3)) return 1;
      if (cell === 0 && neighbors === 3) return 1;
      return 0;
    })
  );
  return crop(newGrid);
};

const crop = (grid) => {
  // Remove empty top rows
  while (grid.length && grid[0].every((cell) => cell === 0)) grid.shift();
  // Remove empty bottom rows
  while (grid.length && grid[grid.length - 1].every((cell) => cell === 0))
    grid.pop();
  // Remove empty left/right columns
  while (grid[0] && grid.every((row) => row[0] === 0))
    grid.forEach((row) => row.shift());
  while (grid[0] && grid.every((row) => row[row.length - 1] === 0))
    grid.forEach((row) => row.pop());
  return grid.length ? grid : [[]]; // fallback if grid is fully dead
};

const getGeneration = (cells, generations) => {
  let current = cells;
  for (let i = 0; i < generations; i++) {
    current = nextGeneration(current);
  }
  return current;
};

const glider = [
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 1],
];

console.log(getGeneration(glider, 1));
