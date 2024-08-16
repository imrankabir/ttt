const app = 'Tic Tac Toe (TTT)';
const VISITS_KEY = 'ttt-visits';

const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cellElements = document.querySelectorAll('[data-cell]');
const board = document.querySelector('#game-board');
const winningMessageElement = document.querySelector('#winning-message');
const winningMessageTextElement = document.querySelector('[data-winning-message-text]');
const restartButton = document.querySelector('#restartButton');
const scoreKey = 'score';
let circleTurn;

const saveScore = type => {
    let {d, x, o} = getScore();
    switch(type) {
        case 'd':
            d++;
        break;
        case 'x':
            x++;
        break;
        case 'o':
            o++;
        break;
    }
    localStorage.setItem(scoreKey, JSON.stringify({d, x, o}));
};

const getScore = e => JSON.parse(localStorage.getItem(scoreKey)) ?? {d:0, x:0, o:0};

const showScore = e => {
    const {d, x, o} = getScore();
    const total = [d, x, o].reduce((a, c) => a + c, 0);
    document.querySelector('#x-wins').innerText = `${x}/${total}`;
    document.querySelector('#o-wins').innerText = `${o}/${total}`;
};

const placeMark = (cell, currentClass) => {
    cell.classList.add(currentClass);
    cell.innerText = currentClass;
};

const swapTurns = e => circleTurn = !circleTurn;

const setBoardHoverClass = e => {
    board.classList.remove(X_CLASS);
    board.classList.remove(O_CLASS);
    if (circleTurn) {
        board.classList.add(O_CLASS);
    } else {
        board.classList.add(X_CLASS);
    }
}

const isDraw = e => {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

const checkWin = currentClass => {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

const endGame = draw => {
    if (draw) {
        saveScore('d');
        winningMessageTextElement.innerText = 'Draw!';
    } else {
        saveScore(circleTurn ? 'o' : 'x');
        winningMessageTextElement.innerText = `${circleTurn ? "O's" : "X's"} Wins!`;
    }
    showScore();
    cellElements.forEach(cell => {
        cell.removeEventListener('click', handleClick);
    });
    winningMessageElement.classList.add('show');
}

const handleClick = e => {
    const cell = e.target;
    const currentClass = circleTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        // setBoardHoverClass();
    }
}

const startGame = e => {
    circleTurn = true;
    showScore();
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.innerText = '';
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    // setBoardHoverClass();
    winningMessageElement.classList.remove('show');
    winningMessageTextElement.innerText = 'No Result';
}

const padTwoDigits = num => num.toString().padStart(2, "0");

const formatDate = (date, dateDiveder = '-') => {
  return (
    [
      date.getFullYear(),
      padTwoDigits(date.getMonth() + 1),
      padTwoDigits(date.getDate()),
    ].join(dateDiveder) +
    " " +
    [
      padTwoDigits(date.getHours()),
      padTwoDigits(date.getMinutes()),
      padTwoDigits(date.getSeconds()),
    ].join(":")
  );
}

async function getVisitorIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return 'Unknown IP';
    }
}

async function trackVisitor() {
    const ip = await getVisitorIP();
    const time = formatDate(new Date());
    let visits = JSON.parse(localStorage.getItem(VISITS_KEY)) || [];
    visits.push({ip, time, app});
    localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    persistVisits();
}

async function persistVisits() {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  // headers.append('mode', 'no-cors');
  const response = await fetch('https://enabled-humpback-lively.ngrok-free.app/save-visits.php', {
    method: 'POST',
    body: JSON.stringify(localStorage.getItem(VISITS_KEY)),
    headers
  });

  if (response.ok === true && response.status === 200) {
    console.log(response);
    localStorage.setItem(VISITS_KEY, JSON.stringify([]));
  }

}

trackVisitor();

startGame();

restartButton.addEventListener('click', startGame);
