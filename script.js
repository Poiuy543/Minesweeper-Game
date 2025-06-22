const width = 10;
const height = 10;
const mineCount = 10;
let board = [];
let mineLocations = [];
let flags = 0;
let timerInterval;
let secondsElapsed = 0;

const boardElement = document.getElementById('board');
const minesLeftText = document.getElementById('mines-count');

function startGame(){
    board = [];
    mineLocations = [];
    flags = 0;
    minesLeftText.innerHTML = mineCount;
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${width}, 30px)`;
    createBoard();
    startTimer();
}

function createBoard(){
    // Initialize empty board
    for(let r=0; r<height; r++){
        board[r] = [];
        for(let c=0; c<width; c++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', r);
            cell.setAttribute('data-col', c);
            cell.addEventListener('click', revealCell);
            cell.addEventListener('contextmenu', flagCell);
            boardElement.appendChild(cell);
            board[r][c] = {
                element: cell,
                mine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0
            };
        }
    }
    placeMines();
    calculateAdjacentMines();
}

function placeMines(){
    let placed = 0;
    while(placed < mineCount){
        const r = Math.floor(Math.random() * height);
        const c = Math.floor(Math.random() * width);
        if(!board[r][c].mine){
            board[r][c].mine = true;
            mineLocations.push([r, c]);
            placed++;
        }
    }
}

function calculateAdjacentMines(){
    for(let r=0; r<height; r++){
        for(let c=0; c<width; c++){
            if(board[r][c].mine) continue;
            let count = 0;
            for(let dr = -1; dr<=1; dr++){
                for(let dc=-1; dc<=1; dc++){
                    const nr = r + dr, nc = c + dc;
                    if(nr>=0 && nr<height && nc>=0 && nc<width && board[nr][nc].mine){
                        count++;
                    }
                }
            }
            board[r][c].adjacentMines = count;
        }
    }
}

// Reveal Cell and Flood fill logic
function revealCell(e){
    const r = parseInt(this.getAttribute('data-row'));
    const c = parseInt(this.getAttribute('data-col'));
    const cell = board[r][c];

    if(cell.revealed || cell.flagged) return;

    if(cell.mine){
        revealAllMines();
        stopTimer();
        alert("Game Over!");
        return;
    }
    reveal(r, c);

    if(checkWin()){
        stopTimer();
        saveBestScore(secondsElapsed);
        alert("You Win!");
    }
}

function reveal(r, c){
    const cell = board[r][c];
    if(cell.revealed || cell.flagged) return;

    cell.revealed = true;
    cell.element.classList.add('revealed');

    if(cell.adjacentMines > 0){
        cell.element.innerText = cell.adjacentMines;
    }
    else{
        // Flood fill
        for(let dr=-1; dr<=1; dr++){
            for(let dc=-1; dc<=1; dc++){
                const nr = r+dr, nc = c+dc;
                if(nr>=0 && nr<height && nc>=0 && nc<width){
                    reveal(nr, nc);
                }
            }
        }
    }
}

// Flag Cell (Right click)
function flagCell(e){
    e.preventDefault();
    const r = parseInt(this.getAttribute('data-row'));
    const c = parseInt(this.getAttribute('data-col'));

    if(cell.revealed) return;

    if(cell.flagged){
        cell.flagged = false;
        cell.element.classList.remove('flag');
        cell.element.innerText = '';
        flags--;
    }
    else{
        if(flags < mineCount){
            cell.flagged = true;
            cell.element.classList.add('flag');
            cell.element.innerText = 'F';
            flags++;
        }
    }
    minesLeftText.innerText = mineCount - flags;
}

// Reveal all mines & check win
function revealAllMines(){
    mineLocations.forEach(([r, c]) => {
        const cell = board[r][c];
        cell.element.classList.add('revealed');
        cell.element.innerText = 'B';
    });
}

function checkWin(){
    let revealedCount = 0;
    for(let r=0; r<height; r++){
        for(let c=0; c<width; c++){
            if(board[r][c].revealed) revealedCount++;
        }
    }
    return revealedCount === width * height - mineCount;
}

function startTimer(){
    clearInterval(timerInterval);
    secondsElapsed = 0;
    document.getElementById('timer').innerText = '0';
    timerInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').innerText = secondsElapsed;
    }, 1000);
}

function stopTimer(){
    clearInterval(timerInterval);
}

function saveBestScore(time){
    let scores = JSON.parse(localStorage.getItem("minesweeper-scores")) || [];
    scores.push(time);
    scores = scores.sort((a, b) => a-b).slice(0, 5) // top 5
    localStorage.setItem("minesweeper-scores", JSON.stringify(scores));
    displayScoreboard();
}

function displayScoreboard(){
    const scores = JSON.parse(localStorage.getItem("minesweeper-sscores")) || [];
    const scoreList = document.getElementById("score-list");
    scoreList.innerHTML = "";
    scores.forEach((score, index) => {
        const li = document.createElement("li");
        li.innerText = `#${index + 1}: ${score}s`;
        scoreList.appendChild(li);
    });
}

function loadBestScore(){
    const best = loadBestScore.getItem("minesweeper-best-time");
    if(best){
        document.getElementById("best-time").innerText = best;
    }
}



window.onload = () => {
    loadBestScore();
    displayScoreboard()
    startGame();
}
