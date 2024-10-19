// =========================================================================================
// --------------------------------------- CONSTANTS ---------------------------------------
// =========================================================================================

// Default values for the initial game state. These can be overridden by values stored in LocalStorage.
const gameDefaults = {
    groups: {
        1: { name: "تیم یک", score: 0 }, // Group 1 with initial score of 0
        2: { name: "تیم دو", score: 0 }, // Group 2 with initial score of 0
        // Uncomment and edit the following line to add more groups
        // 3: { name: "Team C", score: 0 },
    },
    currentRound: 1, // The game starts at round 1
    totalRounds: 2, // Total number of rounds in the game
    currentGroup: 1, // The game starts with group 1's turn
    wordsUsed: [], // List to keep track of words that have already been used
    winner: null, // No winner at the start of the game

    currentChoice: { genre: null, score: null }, // Current word genre and score selected

    remainingWordChanges: 2, // Number of word changes allowed
    additionScores: { wordChange: 0, fault: 0 }, // Additional scores for word changes and faults
};

// Object that stores all genres
const genres = {
    words: {
        thing: { name: 'اشیا', color: 'orange' },
        food: { name: 'غذا', color: 'green' },
        animal: { name: 'حیوان', color: 'blue' },
        sport: { name: 'ورزش', color: 'pink' },
        place: { name: 'مکان', color: 'brown' },
        famous: { name: 'مشاهیر', color: 'lightblue' },
        book: { name: 'کتاب', color: 'darkcyan' },
        film: { name: 'فیلم', color: 'orangered' },
        city: { name: 'شهر و کشور', color: 'purple' }
    },
    proverbs: {
        one: { name: 'ضرب‌المثل دو امتیازی', color: 'lightpink', score: 2 },
        two: { name: 'ضرب‌المثل چهار امتیازی', color: 'lightpink', score: 4 },
        three: { name: 'ضرب‌المثل شش امتیازی', color: 'lightpink', score: 6 },
    }
};

// =========================================================================================
// -------------------------------------- GLOBAL VARIABLES ---------------------------------
// =========================================================================================

let game = {}; // Game state object

const playTimeDict = { word: { 1: 45, 2: 60, 3: 75 }, proverb: { 2: 90, 4: 105, 6: 120 } };
let countdown;
let timeLeft;
let currentWord = {};

// =========================================================================================
// -------------------------------------- DOM ELEMENTS -------------------------------------
// =========================================================================================

const scoreBoard = document.getElementById('score-board');
const gameBoard = document.getElementById('game-board');
const selectorBoard = document.getElementById('selector-board');
const scoreSelector = document.getElementById('score-selector');
const genreSelector = document.getElementById('genre-selector');
const resultScreen = document.getElementById('result-screen');

const turnIndicator = document.getElementById('current-group-indicator');
const wordContainer = document.getElementById('word-container');
const wordScoreContainer = document.getElementById('word-score');
const timerElement = document.getElementById('timer');
const winnerIndicator = document.getElementById('winner-indicator');

const startRoundBtn = document.getElementById('start-round-btn');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const changeWordBtn = document.getElementById('change-word-btn');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const continueBtn = document.getElementById('continue-btn');
const resetGameBtn = document.getElementById('reset-game-btn');

const countdownMusic = document.getElementById('countdown-music');

// =========================================================================================
// --------------------------------------- EVENT LISTENERS ---------------------------------
// =========================================================================================

startRoundBtn.addEventListener('click', switchToSelectorboard);
document.querySelectorAll('.score').forEach(element => {
    element.addEventListener('click', () => {
        game.currentChoice.score = element.dataset.score;
        getNewWord();
    });
});
startTimerBtn.addEventListener('click', () => {
    startCountdown();
    toggleButtons([startTimerBtn, changeWordBtn], [stopTimerBtn]);
});
stopTimerBtn.addEventListener('click', stopCountdown);
changeWordBtn.addEventListener('click', () => {
    game.remainingWordChanges--;
    game.additionScores.wordChange--;
    getNewWord();
});
correctBtn.addEventListener('click', () => {
    clearInterval(countdown);
    toggleButtons([correctBtn, wrongBtn]);
    handleSelection(true, currentWord.score);
});
wrongBtn.addEventListener('click', () => {
    clearInterval(countdown);
    toggleButtons([correctBtn, wrongBtn]);
    handleSelection(false, 0);
});
continueBtn.addEventListener('click', continueGame);
resetGameBtn.addEventListener('click', () => {
    resetgame();
    updateScoreBoard();
});

// =========================================================================================
// --------------------------------------- FUNCTIONS ---------------------------------------
// =========================================================================================

/**
 * Saves the current game state to the local storage.
 */
function savegame() {
    localStorage.setItem('pantomimegamestate', JSON.stringify(game));
}

/**
 * Loads the game state from the local storage or initializes it with default values if no saved state exists.
 */
function loadgame() {
    const savedState = localStorage.getItem('pantomimegamestate');
    if (savedState) {
        game = JSON.parse(savedState);
    } else {
        resetgame(); // if there is no saved state in local storage, use default values.
    }
}

/**
 * Resets the game state to default values and saves it to the local storage.
 */
function resetgame() {
    game = JSON.parse(JSON.stringify(gameDefaults));
    savegame();
}

/**
 * Shows one or more HTML elements by removing the 'hidden' class from each element.
 */
function show(elements) {
    elements.forEach(element => element.classList.remove('hidden'));
}

/**
 * Hides one or more HTML elements by adding the 'hidden' class to each element.
 */
function hide(elements) {
    elements.forEach(element => element.classList.add('hidden'));
}

/**
 * Toggles the visibility of HTML elements.
 */
function toggleButtons(hideElements, showElements = []) {
    hide(hideElements);
    show(showElements);
}

/**
 * Updates the game board and switches the view to the game board.
 */
function switchToGameBoard() {
    turnIndicator.innerHTML = game.groups[game.currentGroup].name;
    timerElement.innerHTML = currentWord.playTime;

    if (game.remainingWordChanges > 0) {
        show([changeWordBtn]);
    } else {
        hide([changeWordBtn]);
    }

    hide([scoreBoard, selectorBoard]);
    show([gameBoard]);
}

/**
 * Updates the score board and switches the view to the score board.
 */
function switchToScoreBoard() {
    updateScoreBoard();
    hide([gameBoard, selectorBoard, resultScreen]);
    show([scoreBoard]);
}

/**
 * Renders the selector board and switches the view to the selector board.
 */
function switchToSelectorboard() {
    renderSelectorBoard();
    hide([gameBoard, scoreBoard]);
    show([selectorBoard]);
}

/**
 * Renders the result screen with the scores.
 */
function switchToResultScreen(wordScore, timeScore = 0, wordChangeScore) {
    document.getElementById('result-word-score').innerHTML = wordScore;
    document.getElementById('result-time-score').innerHTML = timeScore;
    document.getElementById('result-word-change-score').innerHTML = wordChangeScore;

    const totalScore = wordScore + timeScore + wordChangeScore;
    document.getElementById('result-total-score').innerHTML = totalScore;

    hide([gameBoard, selectorBoard, scoreBoard]);
    show([resultScreen]);
}

/**
 * Renders the selector board with genres and proverbs.
 */
function renderSelectorBoard() {
    genreSelector.innerHTML = ''; // Clear existing elements

    // Iterate over each word-type genre in the genres object
    for (const genreKey in genres.words) {
        if (genres.words.hasOwnProperty(genreKey)) {
            const genre = genres.words[genreKey];

            // Create a button element for the genre
            const col = document.createElement('div');
            col.classList.add('col');
            const div = document.createElement('div');
            div.classList.add('genre', `${genre.color}-bg`);

            div.dataset.genre = genreKey;
            div.textContent = genre.name;

            col.appendChild(div);
            genreSelector.appendChild(col);
        }
    }

    // Iterate over each proverb-type genre in the genres object
    for (const genreKey in genres.proverbs) {
        if (genres.proverbs.hasOwnProperty(genreKey)) {
            const genre = genres.proverbs[genreKey];

            // Create a button element for the genre
            const col = document.createElement('div');
            col.classList.add('col');
            const div = document.createElement('div');
            div.classList.add('genre', `${genre.color}-bg`);

            div.dataset.genre = genreKey;
            div.dataset.score = genre.score;
            div.textContent = genre.name;

            col.appendChild(div);
            genreSelector.appendChild(col);
        }
    }

    // Add click event listeners to each genre button
    document.querySelectorAll('.genre').forEach(element => {
        element.addEventListener('click', event => {
            game.currentChoice.genre = event.currentTarget.dataset.genre;

            // Check if the selected genre is a proverb and display the score selector if true
            if (event.currentTarget.classList.contains('lightpink-bg')) {
                hide([genreSelector]);
                show([scoreSelector]);
            } else {
                getNewWord();
            }
        });
    });

    // Add an event listener to the back button to return to the score board
    document.getElementById('back-btn').addEventListener('click', switchToScoreBoard);
}

/**
 * Updates the scoreboard with the current scores of each group.
 */
function updateScoreBoard() {
    const tbody = scoreBoard.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows

    // Create a new row for each group and append it to the table body
    for (const groupId in game.groups) {
        if (game.groups.hasOwnProperty(groupId)) {
            const group = game.groups[groupId];
            const row = document.createElement('tr');
            const groupCell = document.createElement('td');
            const scoreCell = document.createElement('td');

            groupCell.textContent = group.name;
            scoreCell.textContent = group.score;

            row.appendChild(groupCell);
            row.appendChild(scoreCell);
            tbody.appendChild(row);
        }
    }
}

/**
 * Selects a new word based on the current genre and updates the game state.
 */
function getNewWord() {
    const newWord = selectWord(game.currentChoice.genre);
    wordContainer.textContent = newWord.word;
    wordScoreContainer.textContent = newWord.score;
    currentWord = newWord;
    switchToGameBoard();
}

/**
 * Handles the completion of a selection, updating scores and proceeding to the next round or ending the game.
 */
function handleSelection(isCorrect, score) {
    if (isCorrect) {
        game.groups[game.currentGroup].score += score;
    }

    const wordChangeScore = game.additionScores.wordChange;
    const totalScore = score + wordChangeScore;
    game.groups[game.currentGroup].score += totalScore;

    const nextGroup = game.currentGroup + 1;
    if (nextGroup > Object.keys(game.groups).length) {
        game.currentRound++;
        game.currentGroup = 1;
    } else {
        game.currentGroup = nextGroup;
    }

    savegame();
    if (game.currentRound > game.totalRounds) {
        determineWinner();
    } else {
        switchToScoreBoard();
    }
}

/**
 * Continues the game by switching to the next group's turn.
 */
function continueGame() {
    toggleButtons([continueBtn, resetGameBtn]);
    switchToSelectorboard();
}

/**
 * Determines the winner of the game based on the scores and displays the result.
 */
function determineWinner() {
    let maxScore = -1;
    let winningGroup = null;

    for (const groupId in game.groups) {
        if (game.groups.hasOwnProperty(groupId)) {
            const group = game.groups[groupId];
            if (group.score > maxScore) {
                maxScore = group.score;
                winningGroup = group;
            }
        }
    }

    game.winner = winningGroup;
    winnerIndicator.textContent = `Winner: ${winningGroup.name} with ${winningGroup.score} points`;
    savegame();
    switchToResultScreen(0, 0, 0); // Display the result screen
}

/**
 * Starts the countdown timer for the current word.
 */
function startCountdown() {
    timeLeft = currentWord.playTime;
    timerElement.textContent = timeLeft;

    countdown = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            countdownMusic.play();
            handleSelection(false, 0);
        }
    }, 1000);
}

/**
 * Stops the countdown timer.
 */
function stopCountdown() {
    clearInterval(countdown);
    toggleButtons([stopTimerBtn], [correctBtn, wrongBtn]);
}

/**
 * Selects a new word from the available words in the chosen genre.
 * This function should be implemented to provide the actual words for the game.
 * @param {string} genre - The genre of the word to select.
 * @returns {object} - The selected word and its properties.
 */
function selectWord(genre) {
    // Placeholder implementation, replace with actual logic to select a word from the chosen genre
    const words = {
        اشیا: [{ word: 'قلم', score: 1 }, { word: 'کتاب', score: 2 }],
        غذا: [{ word: 'پیتزا', score: 1 }, { word: 'کباب', score: 2 }],
        حیوان: [{ word: 'گربه', score: 1 }, { word: 'سگ', score: 2 }],
        ورزش: [{ word: 'فوتبال', score: 1 }, { word: 'والیبال', score: 2 }],
        مکان: [{ word: 'پارک', score: 1 }, { word: 'مدرسه', score: 2 }],
        مشاهیر: [{ word: 'سعدی', score: 1 }, { word: 'حافظ', score: 2 }],
        کتاب: [{ word: 'قرآن', score: 1 }, { word: 'شاهنامه', score: 2 }],
        فیلم: [{ word: 'گلادیاتور', score: 1 }, { word: 'پدرخوانده', score: 2 }],
        'شهر و کشور': [{ word: 'تهران', score: 1 }, { word: 'ایران', score: 2 }]
    };

    const genreWords = words[genre] || [];
    const randomIndex = Math.floor(Math.random() * genreWords.length);
    return genreWords[randomIndex] || { word: 'Placeholder', score: 1, playTime: 60 };
}

// =========================================================================================
// -------------------------------------- INITIALIZATION -----------------------------------
// =========================================================================================

// Initialize the game state and load the saved state if it exists
loadgame();
updateScoreBoard();

