// Waits for the DOM to fully load before executing the code
document.addEventListener('DOMContentLoaded', () => {
    // Gets the necessary DOM elements to interact with the game
    const gameBoard = document.getElementById('game-board');
    const livesElement = document.getElementById('lives');
    const pointsElement = document.getElementById('points');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backBtn = document.getElementById('back-btn');
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');

    // Maze representation, where "#" is wall and "." is point
    const labirinto = [
        "#############################",
        "#..#......#.........#........#",
        "#......#.....######...##.....#",
        "#......#...#.......#.....#...#",
        "#.#...#....#..#..#........#..#",
        "#.#.....#...#.#.......#...#..#",
        "#.###.....###...##....#.....##",
        "#.......#...#...#.....#.....##",
        "######...........#....#..#####",
        "#.......#...#.........#......#",
        "##############################"
    ];

    // Initial positions for Pacpys and their lives
    let pacpyPos = [[1, 1], [1, 2]]; // Adds the second Pacpy
    let pacpyLives = [3, 3]; // Individual lives for each Pac-Py

    // Positions of the "Fasminhas"
    let fasminhasPos = [
        [5, 5],   // Position of the pink Fasminha
        [2, 7],   // Position of the red Fasminha
        [6, 10]   // Position of the blue Fasminha
    ];

    // Counts the remaining points in the maze (i.e., ".")
    let pontosRestantes = countPoints();
    let vidas = 3; // Total number of lives (if applicable)

    // Function to count the number of points in the maze (".")
    function countPoints() {
        return labirinto.flatMap(line => line.split('')).filter(char => char === '.').length;
    }

    // Function to render the game board
    function renderBoard() {
        gameBoard.innerHTML = ''; // Clears the board before rendering it

        // Calculates cell size based on the screen dimensions
        const cellSize = Math.min(window.innerWidth / labirinto[0].length, window.innerHeight / labirinto.length);
        gameBoard.style.gridTemplateColumns = `repeat(${labirinto[0].length}, ${cellSize}px)`;
        gameBoard.style.gridTemplateRows = `repeat(${labirinto.length}, ${cellSize}px)`;

        // Loop through the maze to create each cell
        labirinto.forEach((linha, y) => {
            linha.split('').forEach((char, x) => {
                let cell = document.createElement('div');
                cell.classList.add('cell');

                // Check if the cell is occupied by a Pacpy
                const pacpyIndex = pacpyPos.findIndex(pos => pos[0] === y && pos[1] === x);
                if (pacpyIndex !== -1 && pacpyLives[pacpyIndex] > 0) {
                    cell.classList.add(`pacpy-${pacpyIndex}`);
                } else if (fasminhasPos.some((pos, index) => pos[0] === y && pos[1] === x)) {
                    // Add the appropriate Fasminha based on the position
                    switch (fasminhasPos.findIndex(pos => pos[0] === y && pos[1] === x)) {
                        case 0:
                            cell.classList.add('fasminha-rosa');
                            break;
                        case 1:
                            cell.classList.add('fasminha-vermelho');
                            break;
                        case 2:
                            cell.classList.add('fasminha-azul');
                            break;
                    }
                } else if (char === '.') {
                    cell.classList.add('pontinho'); // Add a dot if it's a point cell
                } else if (char === '#') {
                    cell.classList.add('parede'); // Add a wall if it's a wall cell
                    cell.textContent = '#'; // Add the "#" symbol to wall cells
                }

                gameBoard.appendChild(cell);
            });
        });

        // Update the lives and points display
        livesElement.innerHTML = `Pacpy 1 Lives: ${pacpyLives[0]} | Pacpy 2 Lives: ${pacpyLives[1]}`;
        pointsElement.textContent = `Remaining Points: ${pontosRestantes}`;

        // Show restart button if both Pacpys are out of lives or all points are collected
        if (pacpyLives.every(life => life <= 0) || pontosRestantes === 0) {
            restartBtn.style.display = 'block'; // Show restart button
            document.removeEventListener('keydown', handleKeydown); // Remove keydown event listener
        } else {
            restartBtn.style.display = 'none'; // Hide restart button
        }
    }

    // Function to move Pacpy based on the keyboard input
    function movePacpy(dx, dy, pacpyIndex) {
        if (pacpyLives[pacpyIndex] <= 0) return; // Don't move Pacpy if it has no lives left

        const [x, y] = pacpyPos[pacpyIndex];
        const newX = x + dx;
        const newY = y + dy;

        // Check if the move is within bounds and not a wall
        if (newX >= 0 && newX < labirinto.length && newY >= 0 && newY < labirinto[0].length &&
            labirinto[newX][newY] !== '#') {
            pacpyPos[pacpyIndex] = [newX, newY];

            // If it's a point, decrease the remaining points
            if (labirinto[newX][newY] === '.') {
                labirinto[newX] = labirinto[newX].substring(0, newY) + ' ' + labirinto[newX].substring(newY + 1);
                pontosRestantes--;
            }

            // Check for collision with Fasminhas
            if (fasminhasPos.some(pos => pos[0] === newX && pos[1] === newY)) {
                pacpyLives[pacpyIndex]--;
                alert(`Pacpy ${pacpyIndex + 1} lost a life! Remaining lives: ${pacpyLives[pacpyIndex]}`);
                if (pacpyLives.every(life => life <= 0)) {
                    alert("Both Pacpys ran out of lives! Game Over!");
                }
            }
        }

        renderBoard(); // Re-render the board after the move
    }

    // Function to move Fasminhas randomly
    function moveFasminhas() {
        for (let i = 0; i < fasminhasPos.length; i++) {
            let [x, y] = fasminhasPos[i];
            const dx = Math.floor(Math.random() * 3) - 1;
            const dy = Math.floor(Math.random() * 3) - 1;
            const newX = x + dx;
            const newY = y + dy;

            // Ensure the Fasminha doesn't move into a wall or another Fasminha
            if (newX >= 0 && newX < labirinto.length && newY >= 0 && newY < labirinto[0].length &&
                labirinto[newX][newY] !== '#' && !fasminhasPos.some(pos => pos[0] === newX && pos[1] === newY)) {
                fasminhasPos[i] = [newX, newY];
            }
        }
    }

    // Function to reset the game to its initial state
    function resetGame() {
        pacpyPos = [[1, 1], [1, 2]]; // Reset Pacpy positions
        pacpyLives = [3, 3]; // Reset Pacpy lives
        pontosRestantes = countPoints(); // Recalculate remaining points
        fasminhasPos = [[5, 5], [2, 7], [6, 10]]; // Reset Fasminha positions
        labirinto.forEach((linha, index) => {
            labirinto[index] = linha.replace(/ /g, '.'); // Restore the points in the maze
        });
        renderBoard(); // Re-render the board
        gameContainer.style.display = 'block'; // Show the game board again
        startScreen.style.display = 'none'; // Hide the start screen
        document.addEventListener('keydown', handleKeydown); // Re-enable keydown listener
    }

    // Handle keyboard input for Pacpy movement
    function handleKeydown(e) {
        switch (e.key) {
            case 'w': movePacpy(-1, 0, 0); break; // Move Pacpy 1 up
            case 's': movePacpy(1, 0, 0); break;  // Move Pacpy 1 down
            case 'a': movePacpy(0, -1, 0); break; // Move Pacpy 1 left
            case 'd': movePacpy(0, 1, 0); break;  // Move Pacpy 1 right
            case 'ArrowUp': movePacpy(-1, 0, 1); break; // Move Pacpy 2 up
            case 'ArrowDown': movePacpy(1, 0, 1); break;  // Move Pacpy 2 down
            case 'ArrowLeft': movePacpy(0, -1, 1); break; // Move Pacpy 2 left
            case 'ArrowRight': movePacpy(0, 1, 1); break;  // Move Pacpy 2 right
        }

        moveFasminhas(); // Move the Fasminhas after each Pacpy move
        if (pontosRestantes === 0) {
            alert("Congratulations! You've collected all the points!");
            renderBoard();
        }
    }

    // Event listener to start the game when the start button is clicked
    startBtn.addEventListener('click', () => {
        gameContainer.style.display = 'block'; // Show the game board
        startScreen.style.display = 'none'; // Hide the start screen
        renderBoard(); // Render the board
        document.addEventListener('keydown', handleKeydown); // Enable keydown listener for movement
    });

    // Event listener to restart the game when the restart button is clicked
    restartBtn.addEventListener('click', () => {
        resetGame(); // Reset the game
    });

    // Event listener for the back button to navigate back to the home page
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html'; // Redirect to index.html
    });

    // Initialize the game with the start button visible and the game board hidden
    gameContainer.style.display = 'none'; // Ensure the game board is not visible initially

    // Add a resize event listener to update the cell sizes when the window is resized
    window.addEventListener('resize', () => {
        renderBoard(); // Re-render the board to adjust for resizing
    });
});
