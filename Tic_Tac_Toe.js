 /**
         * Advanced Tic-Tac-Toe Game
         * Features: PvP, AI with multiple difficulties, score tracking, animations
         */
        class TicTacToe {
            constructor() {
                // Game state
                this.board = ['', '', '', '', '', '', '', '', ''];
                this.currentPlayer = 'X';
                this.gameActive = true;
                this.mode = 'pvp'; // 'pvp' or 'ai'
                this.difficulty = 'easy'; // 'easy', 'medium', 'hard', 'impossible'
                
                // Score tracking
                this.scores = this.loadScores();
                
                // Winning combinations
                this.winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                    [0, 4, 8], [2, 4, 6]             // Diagonals
                ];
                
                // Cache DOM elements
                this.cells = document.querySelectorAll('.cell');
                this.status = document.getElementById('status');
                this.scoreX = document.getElementById('scoreX');
                this.scoreO = document.getElementById('scoreO');
                this.scoreTies = document.getElementById('scoreTies');
                this.thinking = document.getElementById('thinking');
                this.difficultySelection = document.getElementById('difficultySelection');
                
                this.init();
            }

            /**
             * Initialize the game
             */
            init() {
                this.cells.forEach(cell => {
                    cell.addEventListener('click', (e) => this.handleCellClick(e));
                });
                
                this.updateScoreDisplay();
            }

            /**
             * Handle cell click event
             */
            handleCellClick(e) {
                const index = parseInt(e.target.dataset.index);
                
                // Prevent clicks if game is over or cell is taken or AI is thinking
                if (!this.gameActive || this.board[index] !== '' || 
                    (this.mode === 'ai' && this.currentPlayer === 'O')) {
                    return;
                }
                
                this.makeMove(index);
            }

            /**
             * Make a move on the board
             */
            makeMove(index) {
                // Update board state
                this.board[index] = this.currentPlayer;
                
                // Update UI
                const cell = this.cells[index];
                cell.textContent = this.currentPlayer;
                cell.classList.add('taken', this.currentPlayer.toLowerCase());
                
                // Check for win or tie
                if (this.checkWin()) {
                    this.handleWin();
                    return;
                }
                
                if (this.checkTie()) {
                    this.handleTie();
                    return;
                }
                
                // Switch player
                this.switchPlayer();
                
                // If AI mode and now O's turn, make AI move
                if (this.mode === 'ai' && this.currentPlayer === 'O') {
                    this.makeAIMove();
                }
            }

            /**
             * Switch to the other player
             */
            switchPlayer() {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                const playerName = this.mode === 'ai' && this.currentPlayer === 'O' ? 'Computer' : `Player ${this.currentPlayer}`;
                this.status.textContent = `${playerName}'s Turn`;
            }

            /**
             * Check if current player has won
             */
            checkWin() {
                return this.winPatterns.some(pattern => {
                    const [a, b, c] = pattern;
                    if (this.board[a] && 
                        this.board[a] === this.board[b] && 
                        this.board[a] === this.board[c]) {
                        this.winningPattern = pattern;
                        return true;
                    }
                    return false;
                });
            }

            /**
             * Check if game is a tie
             */
            checkTie() {
                return this.board.every(cell => cell !== '');
            }

            /**
             * Handle win scenario
             */
            handleWin() {
                this.gameActive = false;
                const winner = this.currentPlayer;
                const winnerName = this.mode === 'ai' && winner === 'O' ? 'Computer' : `Player ${winner}`;
                
                this.status.textContent = `🎉 ${winnerName} Wins! 🎉`;
                this.status.classList.add('winner');
                
                // Highlight winning cells
                this.winningPattern.forEach(index => {
                    this.cells[index].classList.add('winner-cell');
                });
                
                // Update scores
                if (winner === 'X') {
                    this.scores.x++;
                } else {
                    this.scores.o++;
                }
                this.saveScores();
                this.updateScoreDisplay();
            }

            /**
             * Handle tie scenario
             */
            handleTie() {
                this.gameActive = false;
                this.status.textContent = "🤝 It's a Tie! 🤝";
                this.scores.ties++;
                this.saveScores();
                this.updateScoreDisplay();
            }

            /**
             * Make AI move based on difficulty
             */
            makeAIMove() {
                this.thinking.classList.add('show');
                
                // Add delay to simulate thinking
                setTimeout(() => {
                    let moveIndex;
                    
                    switch(this.difficulty) {
                        case 'easy':
                            moveIndex = this.getRandomMove();
                            break;
                        case 'medium':
                            moveIndex = Math.random() < 0.5 ? this.getBestMove() : this.getRandomMove();
                            break;
                        case 'hard':
                            moveIndex = Math.random() < 0.8 ? this.getBestMove() : this.getRandomMove();
                            break;
                        case 'impossible':
                            moveIndex = this.getBestMove();
                            break;
                    }
                    
                    this.thinking.classList.remove('show');
                    this.makeMove(moveIndex);
                }, 500);
            }

            /**
             * Get random available move
             */
            getRandomMove() {
                const availableMoves = this.board
                    .map((cell, index) => cell === '' ? index : null)
                    .filter(val => val !== null);
                
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }

            /**
             * Get best move using Minimax algorithm
             */
            getBestMove() {
                let bestScore = -Infinity;
                let bestMove;
                
                for (let i = 0; i < 9; i++) {
                    if (this.board[i] === '') {
                        this.board[i] = 'O';
                        let score = this.minimax(this.board, 0, false);
                        this.board[i] = '';
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = i;
                        }
                    }
                }
                
                return bestMove;
            }

            /**
             * Minimax algorithm for optimal AI moves
             */
            minimax(board, depth, isMaximizing) {
                // Check terminal states
                if (this.checkWinForPlayer('O')) return 10 - depth;
                if (this.checkWinForPlayer('X')) return depth - 10;
                if (board.every(cell => cell !== '')) return 0;
                
                if (isMaximizing) {
                    let bestScore = -Infinity;
                    for (let i = 0; i < 9; i++) {
                        if (board[i] === '') {
                            board[i] = 'O';
                            let score = this.minimax(board, depth + 1, false);
                            board[i] = '';
                            bestScore = Math.max(score, bestScore);
                        }
                    }
                    return bestScore;
                } else {
                    let bestScore = Infinity;
                    for (let i = 0; i < 9; i++) {
                        if (board[i] === '') {
                            board[i] = 'X';
                            let score = this.minimax(board, depth + 1, true);
                            board[i] = '';
                            bestScore = Math.min(score, bestScore);
                        }
                    }
                    return bestScore;
                }
            }

            /**
             * Check if a specific player has won
             */
            checkWinForPlayer(player) {
                return this.winPatterns.some(pattern => {
                    const [a, b, c] = pattern;
                    return this.board[a] === player && 
                           this.board[b] === player && 
                           this.board[c] === player;
                });
            }

            /**
             * Reset the current game
             */
            resetGame() {
                this.board = ['', '', '', '', '', '', '', '', ''];
                this.currentPlayer = 'X';
                this.gameActive = true;
                this.winningPattern = null;
                
                this.cells.forEach(cell => {
                    cell.textContent = '';
                    cell.classList.remove('taken', 'x', 'o', 'winner-cell');
                });
                
                this.status.textContent = "Player X's Turn";
                this.status.classList.remove('winner');
                this.thinking.classList.remove('show');
            }

            /**
             * Start a new game (reset without clearing scores)
             */
            newGame() {
                this.resetGame();
            }

            /**
             * Clear all scores
             */
            clearScores() {
                if (confirm('Are you sure you want to clear all scores?')) {
                    this.scores = { x: 0, o: 0, ties: 0 };
                    this.saveScores();
                    this.updateScoreDisplay();
                }
            }

            /**
             * Set game mode (PvP or AI)
             */
            setMode(mode) {
                this.mode = mode;
                
                // Update mode buttons
                const modeBtns = document.querySelectorAll('.mode-btn');
                modeBtns.forEach(btn => {
                    const btnMode = btn.textContent.includes('2 Players') ? 'pvp' : 'ai';
                    btn.classList.toggle('active', btnMode === mode);
                });
                
                // Show/hide difficulty selection
                if (mode === 'ai') {
                    this.difficultySelection.classList.add('show');
                } else {
                    this.difficultySelection.classList.remove('show');
                }
                
                this.resetGame();
            }

            /**
             * Set AI difficulty
             */
            setDifficulty(difficulty) {
                this.difficulty = difficulty;
                
                // Update difficulty buttons
                const diffBtns = document.querySelectorAll('.difficulty-btn');
                diffBtns.forEach(btn => {
                    btn.classList.toggle('active', 
                        btn.textContent.toLowerCase() === difficulty);
                });
                
                this.resetGame();
            }

            /**
             * Update score display
             */
            updateScoreDisplay() {
                this.scoreX.textContent = this.scores.x;
                this.scoreO.textContent = this.scores.o;
                this.scoreTies.textContent = this.scores.ties;
            }

            /**
             * Save scores to localStorage
             */
            saveScores() {
                localStorage.setItem('tictactoe_scores', JSON.stringify(this.scores));
            }

            /**
             * Load scores from localStorage
             */
            loadScores() {
                const saved = localStorage.getItem('tictactoe_scores');
                return saved ? JSON.parse(saved) : { x: 0, o: 0, ties: 0 };
            }
        }

        // Initialize the game
        const game = new TicTacToe();