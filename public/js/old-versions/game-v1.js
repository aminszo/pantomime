// ----------------------------- Global Constants And Variables -----------------------------

// Default values for the initial game state. These can be overridden by values stored in LocalStorage.
const gameDefaults = {
    groups: {
        1: { name: "گروه یک", score: 0 },
        2: { name: "گروه دو", score: 0 },
    },
    currentRound: 1,
    totalRounds: 3,
    currentGroup: 1, // The game starts with group 1's turn
    winner: null,
    currentChoice: { genre: null, genre_fa: null, score: null, type: null },
    addition: { wordChangeChances: 2, wordChangeScore: 0, faults: 0 },
    isGameStarted: false,
};

let game = {}; // Game state object

// Object that stores all genres
const genres = {

    /**
     * playTime: A dictionary that maps word and proverb scores to their respective play times.
     * For example: A word with a score of 1 has a play time of 45 seconds.
     */
    word: {
        meta: { parentClass: 'col', scores: [1, 2, 3], playTime: { 1: 45, 2: 60, 3: 75 } },
        content: {
            thing: { name: 'اشیا', color: 'orange' },
            food: { name: 'غذا', color: 'green' },
            animal: { name: 'حیوان', color: 'blue' },
            sport: { name: 'ورزش', color: 'pink' },
            place: { name: 'مکان', color: 'reddish-brown' },
            famous: { name: 'مشاهیر', color: 'light-blue' },
            book: { name: 'کتاب', color: 'dark-cyan' },
            film: { name: 'فیلم', color: 'orange-red' },
            city: { name: 'شهر و کشور', color: 'purple' }
        }
    },
    proverb: {
        meta: { parentClass: 'col-12', scores: [2, 4, 6], playTime: { 2: 90, 4: 105, 6: 120 } },
        content: { proverb: { name: 'ضرب‌المثل', color: 'light-pink' }, }
    },
    rush: {
        meta: { parentClass: 'col-12', scores: ['نامحدود'], playTime: 180 },
        content: { rush: { name: 'سرعتی', color: 'green' }, }
    },
};

let countdown, timeLeft, currentWord = {};

// for rush play
const wordsBagDefaults = { words: {}, count: 0, current: 0, usedWords: new Set(), correctWords: [], };
let wordsBag = structuredClone(wordsBagDefaults);

const numberStrings = { 1: "اول", 2: "دوم", 3: "سوم", 4: "چهارم", 5: "پنجم", 6: "ششم" }

// -------------------------------------- DOM Elements -------------------------------------

const optionsBoard = document.getElementById('game-options-board');
const scoreBoard = document.getElementById('score-board');
const selectorBoard = document.getElementById('selector-board');
const genreSelector = document.getElementById('genre-selector');
const scoreSelector = document.getElementById('score-selector');
const gameBoard = document.getElementById('game-board');
const resultScreen = document.getElementById('result-screen');
const rushBoard = document.getElementById('rush-board');
const rush_resultScreen = document.getElementById('rush-result-screen');
const allBoards = [optionsBoard, scoreBoard, selectorBoard, gameBoard, resultScreen, rushBoard, rush_resultScreen];

const rush_turnIndicator = document.getElementById('current-group-indicator-rush');
const rush_timerElement = document.getElementById('timer-rush');
const rush_startTimerBtn = document.getElementById('start-timer-btn-rush');
const rush_stopTimerBtn = document.getElementById('stop-timer-btn-rush');
const rush_correctBtn = document.getElementById('correct-btn-rush');
const rush_nextWordBtn = document.getElementById('next-word-btn');
const rush_perviousWordBtn = document.getElementById('previus-word-btn');
const rush_wordContainer = document.getElementById('word-container-rush');
const rush_wordInfoContainer = document.getElementById('word-genre-and-score-rush');

const scoreBoardTableBody = document.querySelector('#score-board table tbody');
const roundsIndcatorElement = document.getElementById('rounds-indicator');
const turnIndicator = document.getElementById('current-group-indicator');
const wordContainer = document.getElementById('word-container');
const wordInfoContainer = document.getElementById('word-genre-and-score');
const timerElement = document.getElementById('timer');
const winnerIndicator = document.getElementById('winner-indicator');
const confirmRoundStartModal = new bootstrap.Modal(document.getElementById('confirm-round-start'));
const confirmSelectionQuestion = document.getElementById('confirm-round-start-question');
const renameGroupModal = new bootstrap.Modal(document.getElementById('rename-group-modal'));

const setGameOptionsBtn = document.getElementById('set-game-options-btn');
const startRoundBtn = document.getElementById('start-round-btn');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const confirmSelectionBtn = document.getElementById('confirm-selection-btn');
const changeWordBtn = document.getElementById('change-word-btn');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const continueBtn = document.getElementById('continue-btn');
const resetGameBtn = document.getElementById('reset-game-btn');

const countdownMusic = document.getElementById('countdown-music');
const endCountdownMusic = document.getElementById('end-countdown-music');

const csrf_token = document.getElementById('csrf-token').innerText;

// --------------------------------------- Event Listeners ---------------------------------

setGameOptionsBtn.addEventListener('click', () => {
    game.totalRounds = document.getElementById('rounds-count-input').value;

    const groupsCount = document.getElementById('groups-count-input').value;
    for (let i = 1; i <= groupsCount; i++) {
        game.groups[i] = { name: `گروه ${numberStrings[i]}`, score: 0 }
    }

    game.isGameStarted = true;
    switchTo(scoreBoard, updateScoreBoard, savegame);
});

document.getElementById('confirm-rename-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('rename-group-input');
    const groupId = nameInput.dataset.groupId;
    game.groups[groupId].name = nameInput.value;;
    savegame();
    updateScoreBoard();
    renameGroupModal.hide();
});

startRoundBtn.addEventListener('click', () => {
    switchTo(selectorBoard, renderSelectorBoard);
});

confirmSelectionBtn.addEventListener('click', () => {
    if (['word', 'proverb'].includes(game.currentChoice.type))
        getNewWord();
    else if (game.currentChoice.type === 'rush')
        getWordsBag();

    hide(scoreSelector);
    confirmRoundStartModal.hide();
});

startTimerBtn.addEventListener('click', () => {
    hide([startTimerBtn, changeWordBtn]);
    show(stopTimerBtn);
    startCountdown(onRoundFinish, timerElement);
})

stopTimerBtn.addEventListener('click', () => {
    stopCountdown(onRoundFinish);
});

changeWordBtn.addEventListener('click', () => {
    game.addition.wordChangeChances--;
    game.addition.wordChangeScore--;
    getNewWord();
});

correctBtn.addEventListener('click', () => {
    hide([correctBtn, wrongBtn]);
    calculateScore(true);
});

wrongBtn.addEventListener('click', () => {
    hide([correctBtn, wrongBtn]);
    calculateScore(false);
});

document.querySelectorAll('.continue-btn').forEach(element => {
    element.addEventListener('click', () => {
        switchTo(scoreBoard, updateScoreBoard);
    })
});

resetGameBtn.addEventListener('click', () => {
    if (confirm('میخواهید بازی را ریست کنید!؟'))
        resetgame();
});

rush_startTimerBtn.addEventListener('click', () => {
    rush_showCurrentWord();
    hide([rush_startTimerBtn]);
    show([rush_correctBtn, rush_nextWordBtn, rush_perviousWordBtn, rush_stopTimerBtn]);
    startCountdown(rush_onRoundFinish, rush_timerElement);
})

rush_stopTimerBtn.addEventListener('click', () => {
    if (confirm('پایان اجرا؟'))
        stopCountdown(rush_onRoundFinish)
})

rush_nextWordBtn.addEventListener('click', () => {
    do {
        wordsBag.current == wordsBag.count ? wordsBag.current = 0 : wordsBag.current++;
    } while (!(wordsBag.current in wordsBag.words));

    rush_showCurrentWord();
});

rush_perviousWordBtn.addEventListener('click', () => {
    do {
        wordsBag.current == 0 ? wordsBag.current = wordsBag.count : wordsBag.current--;
    } while (!(wordsBag.current in wordsBag.words));

    rush_showCurrentWord();
});

rush_correctBtn.addEventListener('click', () => {
    wordsBag.correctWords.push(wordsBag.words[wordsBag.current]);
    delete wordsBag.words[wordsBag.current];
    rush_nextWordBtn.click();
});

// --------------------------------------- Functions ---------------------------------------

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
    if (savedState)
        game = JSON.parse(savedState);
    else
        resetgame() // if there is no saved state in local storage, use default values.
}

/**
 * Resets the game state to default values and saves it to the local storage.
 */
function resetgame() {
    game = structuredClone(gameDefaults);
    savegame();
    switchTo(optionsBoard);
}

/**
 * Shows one or more HTML elements by removing the 'hidden' class from each element.
 */
function show(elementObject) {
    // Check if the elementObject is an array-like object, iterate over each element
    if (Array.isArray(elementObject)) {
        elementObject.forEach(element => {
            // Remove the 'hidden' class from the current element
            element.classList.remove('hidden');
        });
    } else {
        // If elementObject is a single element, remove the 'hidden' class directly
        elementObject.classList.remove('hidden');
    }
}

/**
 * Hides one or more HTML elements by adding the 'hidden' class to each element.
 */
function hide(elementObject) {
    // Check if the elementObject is an array-like objec, iterate over each element
    if (Array.isArray(elementObject)) {
        elementObject.forEach(element => {
            // Add the 'hidden' class to the current element
            element.classList.add('hidden');
        });
    } else {
        // If elementObject is a single element, add the 'hidden' class directly
        elementObject.classList.add('hidden');
    }
}

function switchTo(board, before = null, after = null) {
    runIfIsFunction(before);
    hide(allBoards);
    show(board);
    runIfIsFunction(after);
}

function startCountdown(onStop = null, timerElem) {
    timeLeft = --currentWord.playTime;
    timerElem.innerText = formatTime(timeLeft);
    countdownMusic.play(); // Start playing music
    countdown = setInterval(function () {
        timerElem.innerText = formatTime(--timeLeft);
        if (timeLeft === 0)
            stopCountdown(onStop);
    }, 1000);
}

function stopCountdown(next = null) {
    clearInterval(countdown);
    countdownMusic.pause();
    countdownMusic.currentTime = 0; // Stop playing music
    endCountdownMusic.play();
    runIfIsFunction(next);
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function runIfIsFunction(param) {
    if (typeof param === 'function')
        param();
}

// Function to update the score board
function updateScoreBoard() {
    roundsIndcatorElement.innerHTML = `دور ${game.currentRound} از ${game.totalRounds}`;

    scoreBoardTableBody.innerHTML = ''; // Clear existing rows
    for (const [groupId, group] of Object.entries(game.groups)) {
        const row = document.createElement('tr');

        const buttonCell = document.createElement('td');
        const btn = document.createElement('i');
        btn.classList.add('bi', 'bi-pencil-square', 'rename-btn');
        btn.dataset.groupId = groupId;
        buttonCell.appendChild(btn);
        row.appendChild(buttonCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = group.name;

        if (game.winner != null) {
            if (game.winner == groupId) {
                nameCell.textContent += " 🏆";
                row.classList.add("table-success");
            }
        } else if (groupId == game.currentGroup) {
            nameCell.textContent += " ▶️";
            row.classList.add("table-active");
        }

        row.appendChild(nameCell);

        const scoreCell = document.createElement('td');
        scoreCell.textContent = group.score;
        row.appendChild(scoreCell);

        scoreBoardTableBody.appendChild(row);
    }

    document.querySelectorAll('.rename-btn').forEach(element => {
        element.addEventListener('click', function () {
            const nameInput = document.getElementById('rename-group-input');
            const groupId = this.dataset.groupId;
            nameInput.dataset.groupId = groupId;
            nameInput.value = game.groups[groupId].name;
            renameGroupModal.show();
        })
    });


    if (game.winner != null) {
        hide(startRoundBtn);
        show(winnerIndicator);

        if (game.winner == 'tie')
            winnerIndicator.textContent = "نتیجه : مساوی!";
        else
            winnerIndicator.textContent = `برنده بازی : ${game.groups[game.winner].name} !`;
    } else {
        show(startRoundBtn);
        hide(winnerIndicator);
    }
}

function renderSelectorBoard() {

    genreSelector.innerHTML = ''; // Clear existing elements

    // Iterate over each genre in the genres object
    for (const [genreKey, genre] of Object.entries(genres)) {
        for (const [itemKey, item] of Object.entries(genre.content)) {
            const col = document.createElement('div');
            col.classList.add(genre.meta.parentClass);
            const div = document.createElement('div');
            div.classList.add('genre', `${item.color}-bg`, 'my-3');

            div.dataset.genre = itemKey;
            div.dataset.type = genreKey;
            div.dataset.name_fa = item.name;
            div.textContent = item.name;

            col.appendChild(div);
            genreSelector.appendChild(col);
        }
    }

    document.querySelectorAll('.genre').forEach(element => {
        element.addEventListener('click', function () {
            game.currentChoice.genre = this.dataset.genre;
            game.currentChoice.genre_fa = this.dataset.name_fa;
            game.currentChoice.type = this.dataset.type;
            renderScoreSelector();
        })
    });
}

function renderScoreSelector() {
    const row = document.getElementById("score-selector-row");
    row.innerHTML = ''; // Clear existing elements

    const scores = genres[game.currentChoice.type].meta.scores;
    for (const i in scores) {
        const col = document.createElement('div');
        col.classList.add('col')
        const div = document.createElement('div');
        div.classList.add('score');

        div.dataset.score = scores[i];
        div.innerText = scores[i];
        col.appendChild(div);
        row.appendChild(col);
    }

    document.querySelectorAll('.score').forEach(element => {
        element.addEventListener('click', function () {
            game.currentChoice.score = this.dataset.score;
            confirmSelectionQuestion.innerText =
                `انتخاب ${game.currentChoice.genre_fa} با امتیاز ${game.currentChoice.score}`;
            confirmRoundStartModal.show();
        })
    });

    show(scoreSelector);
}

function getNewWord() {
    fetch(`word/random/${game.currentChoice.genre}/${game.currentChoice.score}`)
        .then(response => response.json())
        .then(data => {
            currentWord = data;
            currentWord.playTime = genres[currentWord.type].meta.playTime[currentWord.score];
            show(startTimerBtn);
            switchTo(gameBoard, updateGameBoard);
        })
        .catch(error => {
            console.error('Error fetching random word:', error);
        });
}

function updateGameBoard() {
    // Update turn indicator with the current group's name
    turnIndicator.innerHTML = game.groups[game.currentGroup].name;
    // Show current word and it's genre and score
    wordContainer.innerText = currentWord.content;
    wordInfoContainer.innerText = `${game.currentChoice.genre_fa} - ${currentWord.score} امتیاز`;
    // update timer text with playTime of current word
    timerElement.innerHTML = formatTime(currentWord.playTime);
    // Show or hide the change word button based on the remaining word changes
    game.addition.wordChangeChances > 0 ? show(changeWordBtn) : hide(changeWordBtn);
}

function onRoundFinish() {
    show([correctBtn, wrongBtn])
    hide(stopTimerBtn);
}

function calculateScore(isCorrect) {
    let word_score = 0;
    let remainingTime_score = 0;
    let wordChange_score = game.addition.wordChangeScore;

    if (isCorrect) {
        word_score = currentWord.score;
        remainingTime_score = Math.floor(timeLeft / 30);
    }

    game.groups[game.currentGroup].score += word_score + remainingTime_score + wordChange_score;

    // reset round score variables
    game.addition = JSON.parse(JSON.stringify(gameDefaults.addition));

    updateResultScreen(word_score, remainingTime_score, wordChange_score);
    switchTo(resultScreen);
    goToNextRound();
}

function updateResultScreen(wordScore, timeScore = 0, wordChangeScore) {
    const totalScore = wordScore + timeScore + wordChangeScore;
    document.getElementById('result-word-score').innerHTML = wordScore;
    document.getElementById('result-time-score').innerHTML = timeScore;
    document.getElementById('result-word-change-score').innerHTML = wordChangeScore;
    document.getElementById('result-total-score').innerHTML = totalScore;
}

function goToNextRound() {
    // Switch to next group
    if (game.currentGroup === Object.keys(game.groups).length) {
        game.currentGroup = 1; // if it was the last group, go back to first group
        game.currentRound++; // And switch to next round
    } else { // else, go to the next group
        game.currentGroup++;
    }

    // Check if all rounds have been played
    if (game.currentRound > game.totalRounds) {
        game.currentRound--; // reduce current round by 1, just to show the correct number in the scoreboard end screen.
        determineWinner();
    }
    // Save game state
    savegame();
}

/**
 * Determines the winner of the game by comparing the scores of all groups.
 * If there is a tie for the highest score, the winner is set to 'tie'.
 * Saves the game state after determining the winner.
 */
function determineWinner() {
    let highestScore = Number.NEGATIVE_INFINITY; // Initialize to the lowest possible number
    let winner = null;
    let isTie = false;

    // Iterate over each group in the game
    for (const groupId in game.groups) {
        if (game.groups.hasOwnProperty(groupId)) {
            const group = game.groups[groupId];

            if (group.score > highestScore) {
                highestScore = group.score;
                winner = groupId;
                isTie = false; // Reset the tie flag as we found a higher score
            } else if (group.score === highestScore) {
                isTie = true; // If another group has the same highest score, it's a tie
            }
        }
    }

    // Set the winner to 'tie' if there is a tie
    if (isTie)
        winner = 'tie';

    // Update the game state with the determined winner
    game.winner = winner;

    // Save the updated game state
    savegame();
}

// this function is for future use
function sendDataToServer(payload) {
    // Make sure to replace '/save-data' with your actual Laravel route URL
    const url = 'save-data';

    const final_data = {
        data: payload,
        _token: csrf_token,
    }

    // Make an AJAX request
    $.ajax({
        type: 'POST',         // HTTP method for the request
        url: url,             // Laravel route URL
        data: final_data,     // Data to send to the server
        dataType: 'json',     // Expected data type from the server
        success: function (response) {
            console.log('Data saved successfully:', response);
            game.wordsUsed = [];
        },
        error: function (xhr, status, error) {
            console.error('Error saving data:', error);
        }
    });
}

function getWordsBag() {
    fetch('words-bag')
        .then(response => response.json())
        .then(data => {
            wordsBag.words = data;
            wordsBag.count = Object.keys(data).length - 1;
            currentWord.playTime = genres.rush.meta.playTime;
            show(rush_startTimerBtn);
            switchTo(rushBoard, updateRushBoard);
        })
        .catch(error => {
            console.error('Error fetching words bag:', error);
        });
}

function updateRushBoard() {
    // Update turn indicator with the current group's name
    rush_turnIndicator.innerHTML = game.groups[game.currentGroup].name;

    // update timer text with current playTime
    rush_timerElement.innerHTML = formatTime(currentWord.playTime);
}

function rush_showCurrentWord() {
    const thisWord = wordsBag.words[wordsBag.current];
    wordsBag.usedWords.add(thisWord.id)
    rush_wordContainer.innerHTML = thisWord.content;
    rush_wordInfoContainer.innerHTML = `${thisWord.genre_fa} ${thisWord.score} امتیازی`;
}

function rush_onRoundFinish() {
    hide([rush_correctBtn, rush_nextWordBtn, rush_perviousWordBtn, rush_stopTimerBtn]);
    rush_wordContainer.innerHTML = rush_wordInfoContainer.innerHTML = '';

    let totalScore = 0;
    totalScore = wordsBag.correctWords.reduce((sum, word) => sum + word.score, 0);
    game.groups[game.currentGroup].score += totalScore;

    goToNextRound();
    rush_renderResultScreen(totalScore);
    wordsBag = structuredClone(wordsBagDefaults);
}

function rush_renderResultScreen(totalScore) {
    const list = document.getElementById('correct-words-list');
    document.getElementById('total-score-rush').innerHTML = `مجموع امتیاز : ${totalScore}`;

    list.innerHTML = '';
    for (word of wordsBag.correctWords) {
        const p = document.createElement('p');
        p.innerHTML = `${word.content} : ${word.score}`;
        list.appendChild(p);
    }

    switchTo(rush_resultScreen);
}

// -------------------------------------- Initialization -----------------------------------

// Initialize the game state and load the saved state if it exists
loadgame();

if (!game.isGameStarted) {
    switchTo(optionsBoard);
} else {
    updateScoreBoard();
}