document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const livesElement = document.getElementById('lives');
    const pointsElement = document.getElementById('points');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backBtn = document.getElementById('back-btn');
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');

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

    let pacpyPos = [[1, 1], [1, 2]]; // Adiciona o segundo pacpy
    let pacpyLives = [3, 3]; // Vidas individuais para cada Pac-Py
    let fasminhasPos = [
        [5, 5],   // Posição do fasminha rosa
        [2, 7],   // Posição do fasminha vermelho
        [6, 10]   // Posição do fasminha azul
    ];

    let pontosRestantes = countPoints();
    let vidas = 3; // Total de vidas (se aplicável)

    function countPoints() {
        return labirinto.flatMap(line => line.split('')).filter(char => char === '.').length;
    }

    function renderBoard() {
        gameBoard.innerHTML = '';
        const cellSize = Math.min(window.innerWidth / labirinto[0].length, window.innerHeight / labirinto.length);
        gameBoard.style.gridTemplateColumns = `repeat(${labirinto[0].length}, ${cellSize}px)`;
        gameBoard.style.gridTemplateRows = `repeat(${labirinto.length}, ${cellSize}px)`;

        labirinto.forEach((linha, y) => {
            linha.split('').forEach((char, x) => {
                let cell = document.createElement('div');
                cell.classList.add('cell');

                // Verifica se a célula é ocupada por um pacpy
                const pacpyIndex = pacpyPos.findIndex(pos => pos[0] === y && pos[1] === x);
                if (pacpyIndex !== -1 && pacpyLives[pacpyIndex] > 0) {
                    cell.classList.add(`pacpy-${pacpyIndex}`);
                } else if (fasminhasPos.some((pos, index) => pos[0] === y && pos[1] === x)) {
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
                    cell.classList.add('pontinho');
                } else if (char === '#') {
                    cell.classList.add('parede');
                    cell.textContent = '#'; // Adiciona o caractere # às células de parede
                }

                gameBoard.appendChild(cell);
            });
        });

        // Atualiza o display de vidas e pontos
        livesElement.innerHTML = `Vidas Pacpy 1: ${pacpyLives[0]} | Vidas Pacpy 2: ${pacpyLives[1]}`;
        pointsElement.textContent = `Pontos restantes: ${pontosRestantes}`;

        if (pacpyLives.every(life => life <= 0) || pontosRestantes === 0) {
            restartBtn.style.display = 'block'; // Exibe o botão de reinício
            document.removeEventListener('keydown', handleKeydown);
        } else {
            restartBtn.style.display = 'none'; // Oculta o botão de reinício
        }
    }

    function movePacpy(dx, dy, pacpyIndex) {
        if (pacpyLives[pacpyIndex] <= 0) return; // Não move pacpys com 0 vidas

        const [x, y] = pacpyPos[pacpyIndex];
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < labirinto.length && newY >= 0 && newY < labirinto[0].length &&
            labirinto[newX][newY] !== '#') {
            pacpyPos[pacpyIndex] = [newX, newY];

            if (labirinto[newX][newY] === '.') {
                labirinto[newX] = labirinto[newX].substring(0, newY) + ' ' + labirinto[newX].substring(newY + 1);
                pontosRestantes--;
            }

            // Verificar colisão com Fasminhas
            if (fasminhasPos.some(pos => pos[0] === newX && pos[1] === newY)) {
                pacpyLives[pacpyIndex]--;
                alert(`Pacpy ${pacpyIndex + 1} perdeu uma vida! Vidas restantes: ${pacpyLives[pacpyIndex]}`);
                if (pacpyLives.every(life => life <= 0)) {
                    alert("Ambos os Pac-Pys ficaram sem vidas! Game Over!");
                }
            }
        }

        renderBoard();
    }

    function moveFasminhas() {
        for (let i = 0; i < fasminhasPos.length; i++) {
            let [x, y] = fasminhasPos[i];
            const dx = Math.floor(Math.random() * 3) - 1;
            const dy = Math.floor(Math.random() * 3) - 1;
            const newX = x + dx;
            const newY = y + dy;

            if (newX >= 0 && newX < labirinto.length && newY >= 0 && newY < labirinto[0].length &&
                labirinto[newX][newY] !== '#' && !fasminhasPos.some(pos => pos[0] === newX && pos[1] === newY)) {
                fasminhasPos[i] = [newX, newY];
            }
        }
    }

    function resetGame() {
        pacpyPos = [[1, 1], [1, 2]]; // Reseta as posições dos pacpys
        pacpyLives = [3, 3]; // Reseta as vidas dos pacpys
        pontosRestantes = countPoints(); // Recalcula a quantidade de pontos
        fasminhasPos = [[5, 5], [2, 7], [6, 10]];
        labirinto.forEach((linha, index) => {
            labirinto[index] = linha.replace(/ /g, '.'); // Restaura os pontos no labirinto
        });
        renderBoard();
        gameContainer.style.display = 'block'; // Mostra o tabuleiro novamente
        startScreen.style.display = 'none'; // Esconde o botão de iniciar
        document.addEventListener('keydown', handleKeydown);
    }

    function handleKeydown(e) {
        switch (e.key) {
            case 'w': movePacpy(-1, 0, 0); break; // Move o pacpy 1 para cima
            case 's': movePacpy(1, 0, 0); break;  // Move o pacpy 1 para baixo
            case 'a': movePacpy(0, -1, 0); break; // Move o pacpy 1 para a esquerda
            case 'd': movePacpy(0, 1, 0); break;  // Move o pacpy 1 para a direita
            case 'ArrowUp': movePacpy(-1, 0, 1); break; // Move o pacpy 2 para cima
            case 'ArrowDown': movePacpy(1, 0, 1); break;  // Move o pacpy 2 para baixo
            case 'ArrowLeft': movePacpy(0, -1, 1); break; // Move o pacpy 2 para a esquerda
            case 'ArrowRight': movePacpy(0, 1, 1); break;  // Move o pacpy 2 para a direita
        }

        moveFasminhas();
        if (pontosRestantes === 0) {
            alert("Parabéns! Você coletou todos os pontos!");
            renderBoard();
        }
    }

    startBtn.addEventListener('click', () => {
        gameContainer.style.display = 'block'; // Mostra o tabuleiro
        startScreen.style.display = 'none'; // Esconde a tela de início
        renderBoard();
        document.addEventListener('keydown', handleKeydown);
    });

    restartBtn.addEventListener('click', () => {
        resetGame();
    });

    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html'; // Redireciona para index.html
    });

    // Inicializa a tela com o botão de iniciar visível
    gameContainer.style.display = 'none'; // Garante que o tabuleiro não apareça no início

    // Adiciona um evento de redimensionamento para atualizar o tamanho das células
    window.addEventListener('resize', () => {
        renderBoard();
    });
});
