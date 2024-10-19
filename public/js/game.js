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

/**
 * Definitions for different genres used in the game.
 */
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

// for rush mode
const wordsBagDefaults = { words: {}, count: 0, current: 0, usedWords: new Set(), correctWords: [], };
let wordsBag = structuredClone(wordsBagDefaults);

const numberStrings = { 1: "اول", 2: "دوم", 3: "سوم", 4: "چهارم", 5: "پنجم", 6: "ششم" }

// -------------------------------------- DOM Elements -------------------------------------

// Board elements for different game screens
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

// Other DOM elements
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

// Buttons
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

// Elements specific to rush mode
const rush_turnIndicator = document.getElementById('current-group-indicator-rush');
const rush_timerElement = document.getElementById('timer-rush');
const rush_startTimerBtn = document.getElementById('start-timer-btn-rush');
const rush_stopTimerBtn = document.getElementById('stop-timer-btn-rush');
const rush_correctBtn = document.getElementById('correct-btn-rush');
const rush_nextWordBtn = document.getElementById('next-word-btn');
const rush_perviousWordBtn = document.getElementById('previus-word-btn');
const rush_wordContainer = document.getElementById('word-container-rush');
const rush_wordInfoContainer = document.getElementById('word-genre-and-score-rush');

// Audio elements
const countdownMusic = document.getElementById('countdown-music');
const endCountdownMusic = document.getElementById('end-countdown-music');

// CSRF token for server communication
const csrf_token = document.getElementById('csrf-token').innerText;

// --------------------------------------- Event Listeners ---------------------------------

// Event listeners for game setup and interactions

// Set game options and start the game
setGameOptionsBtn.addEventListener('click', () => {
    // Update game settings based on user inputs
    game.totalRounds = document.getElementById('rounds-count-input').value;
    const groupsCount = document.getElementById('groups-count-input').value;
    for (let i = 1; i <= groupsCount; i++) {
        game.groups[i] = { name: `گروه ${numberStrings[i]}`, score: 0 }
    }

    game.isGameStarted = true;
    switchTo(scoreBoard, updateScoreBoard, savegame);
});

// Rename a group and update the score board
document.getElementById('confirm-rename-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('rename-group-input');
    const groupId = nameInput.dataset.groupId;
    game.groups[groupId].name = nameInput.value;;
    savegame();
    updateScoreBoard();
    renameGroupModal.hide();
});

// Start a round and show the selector board
startRoundBtn.addEventListener('click', () => {
    switchTo(selectorBoard, renderSelectorBoard);
});

// Confirm selection of genre and score
confirmSelectionBtn.addEventListener('click', () => {
    if (['word', 'proverb'].includes(game.currentChoice.type))
        getNewWord();
    else if (game.currentChoice.type === 'rush')
        getWordsBag();

    hide(scoreSelector);
    confirmRoundStartModal.hide();
});

// Start timer for the current round (normal mode)
startTimerBtn.addEventListener('click', () => {
    hide([startTimerBtn, changeWordBtn]);
    show(stopTimerBtn);
    startCountdown(onRoundFinish, timerElement);
})

// Stop timer for the current round (normal mode)
stopTimerBtn.addEventListener('click', () => {
    stopCountdown(onRoundFinish);
});

// Change the current word (normal mode)
changeWordBtn.addEventListener('click', () => {
    game.addition.wordChangeChances--;
    game.addition.wordChangeScore--;
    getNewWord();
});

// Handle correct answer (normal mode)
correctBtn.addEventListener('click', () => {
    hide([correctBtn, wrongBtn]);
    calculateScore(true);
});

// Handle wrong answer (normal mode)
wrongBtn.addEventListener('click', () => {
    hide([correctBtn, wrongBtn]);
    calculateScore(false);
});

// switch to score board at the end of current round (both modes)
document.querySelectorAll('.continue-btn').forEach(element => {
    element.addEventListener('click', () => {
        switchTo(scoreBoard, updateScoreBoard);
    })
});

// Reset the game
resetGameBtn.addEventListener('click', () => {
    if (confirm('میخواهید بازی را ریست کنید!؟'))
        resetgame();
});

// Start timer (rush mode)
rush_startTimerBtn.addEventListener('click', () => {
    rush_showCurrentWord();
    hide([rush_startTimerBtn]);
    show([rush_correctBtn, rush_nextWordBtn, rush_perviousWordBtn, rush_stopTimerBtn]);
    startCountdown(rush_onRoundFinish, rush_timerElement);
})

// Stop timer (rush mode)
rush_stopTimerBtn.addEventListener('click', () => {
    if (confirm('پایان اجرا؟'))
        stopCountdown(rush_onRoundFinish)
})

// Move to next word in rush mode
rush_nextWordBtn.addEventListener('click', () => {
    do {
        wordsBag.current == wordsBag.count ? wordsBag.current = 0 : wordsBag.current++;
    } while (!(wordsBag.current in wordsBag.words));

    rush_showCurrentWord();
});

// Move to previous word in rush mode
rush_perviousWordBtn.addEventListener('click', () => {
    do {
        wordsBag.current == 0 ? wordsBag.current = wordsBag.count : wordsBag.current--;
    } while (!(wordsBag.current in wordsBag.words));

    rush_showCurrentWord();
});

// Handle correct answer in rush mode
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
 * And switch to options board to start a new game.
 */
function resetgame() {
    game = structuredClone(gameDefaults);
    savegame();
    switchTo(optionsBoard);
}

/**
 * Displays the specified element or array of elements by removing the 'hidden' class.
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
 * Hides the specified element or array of elements by adding the 'hidden' class.
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

/**
 * Switches the display to a specified board while optionally executing functions before and after.
 * Hides all other boards except the specified one.
 */
function switchTo(board, before = null, after = null) {
    runIfIsFunction(before); // Execute 'before' function if provided and is a function
    hide(allBoards); // Hide all boards currently displayed
    show(board); // Show the specified board
    runIfIsFunction(after); // Execute 'after' function if provided and is a function
}

/**
 * Starts a countdown timer and updates the timer element with the remaining time.
 * Plays countdown music while the timer is running.
 *
 * @param {Function} onStop - Optional function to execute when the countdown stops.
 * @param {HTMLElement} timerElem - The HTML element where the timer should be displayed.
 */
function startCountdown(onStop = null, timerElem) {
    timeLeft = --currentWord.playTime;
    timerElem.innerText = formatTime(timeLeft); // Display initial time
    countdownMusic.play(); // Start playing countdown music
    countdown = setInterval(function () {
        timerElem.innerText = formatTime(--timeLeft); // Update timer display every second
        if (timeLeft === 0)
            stopCountdown(onStop); // Stop countdown when time is up
    }, 1000);
}

/**
 * Stops the currently running countdown timer.
 * Pauses countdown music and resets its position.
 *
 * @param {Function} next - Optional function to execute after stopping the countdown.
 */
function stopCountdown(next = null) {
    clearInterval(countdown); // Clear the interval to stop the countdown
    countdownMusic.pause(); // Pause countdown music
    countdownMusic.currentTime = 0; // Reset music position to start
    endCountdownMusic.play(); // Play end countdown music
    runIfIsFunction(next); // Execute 'next' function if provided and is a function
}

/**
 * Formats time in seconds into a displayable string format (mm:ss).
 *
 * @param {number} timeInSeconds - Time in seconds to be formatted.
 * @returns {string} Formatted time string in "mm:ss" format.
 */
function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60); // Calculate minutes
    const seconds = timeInSeconds % 60; // Calculate seconds
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; // Format time string
}

/**
 * Executes the given parameter if it is a function.
 */
function runIfIsFunction(param) {
    if (typeof param === 'function')
        param();
}

/**
 * Updates the score board with the current game state.
 * Updates the round indicator, group names, scores, and visual cues for active and winning groups.
 * Also manages event listeners for renaming groups and displays the winner or start round button accordingly.
 */
function updateScoreBoard() {
    // Update rounds indicator
    roundsIndcatorElement.innerHTML = `دور ${game.currentRound} از ${game.totalRounds}`;

    // Clear existing rows in the score board table
    scoreBoardTableBody.innerHTML = '';

    // Iterate over each group in the game state and update the score board table
    for (const [groupId, group] of Object.entries(game.groups)) {
        const row = document.createElement('tr');

        // Create button cell with a rename button for each group
        const buttonCell = document.createElement('td');
        const btn = document.createElement('i');
        btn.classList.add('bi', 'bi-pencil-square', 'rename-btn');
        btn.dataset.groupId = groupId;
        buttonCell.appendChild(btn);
        row.appendChild(buttonCell);

        // Create name cell and add group name with visual cues for active and winning groups
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

        // Create score cell and add group score
        const scoreCell = document.createElement('td');
        scoreCell.textContent = group.score;
        row.appendChild(scoreCell);

        // Append the row to the score board table
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

/**
 * Renders the selector board with genres and items based on the 'genres' object.
 * Adds event listeners to genre elements for selecting a genre and triggering the rendering of the score selector.
 */
function renderSelectorBoard() {
    genreSelector.innerHTML = ''; // Clear existing elements

    // Iterate over each genre in the genres object
    for (const [genreKey, genre] of Object.entries(genres)) {
        // Iterate over each item in the genre content
        for (const [itemKey, item] of Object.entries(genre.content)) {
            const col = document.createElement('div');
            col.classList.add(genre.meta.parentClass);
            const div = document.createElement('div');
            div.classList.add('genre', `${item.color}-bg`);

            div.dataset.genre = itemKey;
            div.dataset.type = genreKey;
            div.dataset.name_fa = item.name;
            div.textContent = item.name;

            col.appendChild(div);
            genreSelector.appendChild(col);
        }
    }

    // Add click event listeners to each genre element
    document.querySelectorAll('.genre').forEach(element => {
        element.addEventListener('click', function () {
            // Set game's current choice properties based on clicked element's dataset
            game.currentChoice.genre = this.dataset.genre;
            game.currentChoice.genre_fa = this.dataset.name_fa;
            game.currentChoice.type = this.dataset.type;

            // Render the score selector board based on the selected genre
            renderScoreSelector();
        })
    });
}

/**
 * Renders the score selector based on the current game choice's type.
 * Adds event listeners to score elements for selecting a score and displaying a confirmation message in the modal.
 */
function renderScoreSelector() {
    const row = document.getElementById("score-selector-row");
    row.innerHTML = ''; // Clear existing elements

    // Retrieve scores for the current game choice type from genres meta
    const scores = genres[game.currentChoice.type].meta.scores;

    // Iterate over each score option and create corresponding HTML elements
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

    // Add click event listeners to each score element
    document.querySelectorAll('.score').forEach(element => {
        element.addEventListener('click', function () {
            // Set game's current choice score based on clicked element's dataset
            game.currentChoice.score = this.dataset.score;

            // Update confirmation message in modal with current choice details
            confirmSelectionQuestion.innerText =
                `انتخاب ${game.currentChoice.genre_fa} با امتیاز ${game.currentChoice.score}`;

            // Show the confirmation modal for round start
            confirmRoundStartModal.show();
        })
    });

    // Display the score selector board
    show(scoreSelector);
}

/**
 * Fetches a new word from the server based on the current game choice's genre and score.
 * And switches to the game board with the updated game board.
 */
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

/**
 * Updates the game board with the current word and game state information.
 */
function updateGameBoard() {
    // Update turn indicator with the current group's name
    turnIndicator.innerHTML = game.groups[game.currentGroup].name;

    // Show current word and its genre and score
    wordContainer.innerText = currentWord.content;
    wordInfoContainer.innerText = `${game.currentChoice.genre_fa} - ${currentWord.score} امتیاز`;

    // update timer text with playTime of current word
    timerElement.innerHTML = formatTime(currentWord.playTime);

    // Show or hide the change word button based on the remaining word change chances
    changeWordBtn.innerHTML = `تعویض (${game.addition.wordChangeChances})`;
    game.addition.wordChangeChances > 0 ? show(changeWordBtn) : hide(changeWordBtn);
}

/**
 * Handles actions to perform when a round finishes (normal mode)
 */
function onRoundFinish() {
    show([correctBtn, wrongBtn])
    hide(stopTimerBtn);
}

/**
 * Calculates and updates the score for the current group based on correctness of the word guess
 * Resets round-specific variables to default values after calculation
 * Switches the view to the result screen and proceeds to the next round
 * 
 * @param {boolean} isCorrect Indicates if the word guess was correct.
 */
function calculateScore(isCorrect) {
    let word_score = 0;
    let remainingTime_score = 0;
    let wordChange_score = game.addition.wordChangeScore;

    if (isCorrect) {
        word_score = currentWord.score;
        remainingTime_score = Math.floor(timeLeft / 30);
    }

    game.groups[game.currentGroup].score += word_score + remainingTime_score + wordChange_score;

    // Reset round-specific variables to default values
    game.addition = JSON.parse(JSON.stringify(gameDefaults.addition));

    updateResultScreen(word_score, remainingTime_score, wordChange_score);
    switchTo(resultScreen);
    goToNextRound();
}

/**
 * Updates the result screen with the detailed breakdown of calculated scores.
 */
function updateResultScreen(wordScore, timeScore = 0, wordChangeScore) {
    const totalScore = wordScore + timeScore + wordChangeScore;
    document.getElementById('result-word-score').innerHTML = wordScore;
    document.getElementById('result-time-score').innerHTML = timeScore;
    document.getElementById('result-word-change-score').innerHTML = wordChangeScore;
    document.getElementById('result-total-score').innerHTML = totalScore;
}

/*
 * Advances to the next round or determines the winner if all rounds have been played.
 */
function goToNextRound() {
    // Switch to next group
    if (game.currentGroup === Object.keys(game.groups).length) {
        game.currentGroup = 1; // if it was the last group, go back to first group
        game.currentRound++; // And switch to next round
    } else { // else, go to the next group
        game.currentGroup++;
    }

    // Check if all rounds have been completed
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

    // Iterate over each group to find the one with the highest score
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

    // If there is a tie, Set the winner to 'tie'
    if (isTie)
        winner = 'tie';

    // Update game state with the determined winner and save it
    game.winner = winner;
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

/**
 * Retrieves a bag of words from the server, updates necessary game state variables,
 * and switches to the rush game board to start the rush mode.
 */
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

/**
 * Updates the rush game board.
 */
function updateRushBoard() {
    // Update turn indicator with the current group's name
    rush_turnIndicator.innerHTML = game.groups[game.currentGroup].name;

    // update timer text with current playTime
    rush_timerElement.innerHTML = formatTime(currentWord.playTime);
}

/**
 * Displays the current word details on the rush game board and marks it as used.
 */
function rush_showCurrentWord() {
    const thisWord = wordsBag.words[wordsBag.current];
    rush_wordContainer.innerHTML = thisWord.content;
    rush_wordInfoContainer.innerHTML = `${thisWord.genre_fa} ${thisWord.score} امتیازی`;

    // Add the word to used words
    wordsBag.usedWords.add(thisWord.id)
}

/**
 * Handles actions and updates after finishing a round in the rush game mode,
 * calculates the total score, updates the group's score, renders the result screen,
 * and prepares for the next round.
 */
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

/**
 * Renders the result screen for the rush game mode with the total score and list of correct words.
 */
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

// Switch to the options board if the game has not started; otherwise, update the score board
if (!game.isGameStarted) {
    switchTo(optionsBoard);
} else {
    updateScoreBoard();
}
