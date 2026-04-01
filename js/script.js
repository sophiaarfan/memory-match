/**
 * Name: Sophia Arfan
 * Date: March 7th, 2026
 * Description: Main game logic for memory match game. Includes a canvas splash animation, levels, a live timer, 
 * scoring, feedback by colours for right/wrong choices, and personal best tracking using localStorage.
 */

/**
 * The card class will construct a card on the game board
 *
 * @param {String} emoji:  The emoji shown on the cards' face.
 * @param {number} id : A unique ID to tell two cards with the same emoji apart from eachother
 */
class Card {
    constructor(emoji, id) {
        this.emoji = emoji;
        this.id = id;
        this.isFlipped = false;
        this.isMatched = false;
    }
}
/**
 * Tracks the states in a game session (move counter, matched pairs, timer, etc.)
 */
class GameBoard {
    constructor() {
        this.cards = [];
        this.moveCounter = 0;
        this.foundPairs = 0;
        this.totalPairs = 0;
        this.flippedCards = [];
        this.locked = false;
        this.seconds = 0;
        this.timerInterval = null;
        this.difficulty = "medium";
    }
    /**
     * Constructs a shuffled deck based on the set difficulty. Easy mode has 4 pairs, medium has
     * 8 pairs, and hard has 12 pairs.
     *
     * @param {String} difficulty:  "easy", "medium", "hard"
     * @returns {void} 
     */
    buildBoard(difficulty) {
        this.difficulty = difficulty;
        const emojiSet = [
            "🌙", "🧸", "🎀", "⭐️", "🌸", "🍰",
            "🐰", "🫧", "🐿️", "🦢", "🪽", "🪐"
        ];
        let pairCount = 0;
        if (difficulty == "easy") {
            pairCount = 4;
        }
        else if (difficulty == "hard") {
            pairCount = 12;
        }
        else {
            pairCount = 8;
        }
        this.totalPairs = pairCount;
        const chosen = emojiSet.slice(0, pairCount);
        const doubled = chosen.concat(chosen);
        this.cards = doubled
            .map(function (emoji, i) { /**https://www.w3schools.com/jsref/jsref_map.asp*/
                return new Card(emoji, i);
            })
            .sort(function () {
                return Math.random() - 0.5;
            });
        this.moveCounter = 0;
        this.foundPairs = 0;
        this.flippedCards = [];
        this.locked = false;
        this.seconds = 0;
    }
    /**
     * This function flips a card face-up and increments the move counter.
     *
     * @param {Card} where card is card beinmg flipped
     * @returns {void} 
     */
    flippedCard(card) {
        card.isFlipped = true;
        this.flippedCards.push(card);
        if (this.flippedCards.length == 2) {
            this.moveCounter++;
        }
    }
    /**
     * This function checks if the two currently flipped cards have the same emoji.
     *
     * @returns {boolean} Will change to true if the cards match.
     */
    checkMatching() {
        return this.flippedCards[0].emoji == this.flippedCards[1].emoji;
    }
    /**
     * Marks the flipped pair as matched and clears the current flipped cards tracking.
     *
     * @returns {void} 
     */
    endMatching() {
        this.flippedCards[0].isMatched = true;
        this.flippedCards[1].isMatched = true;
        this.foundPairs++;
        this.flippedCards = [];
    }
    /**
     * Flips the unmatched pair back down and clears current flipped cards tracking
     *
     * @returns {void} 
     */
    resetFlipped() {
        this.flippedCards[0].isFlipped = false;
        this.flippedCards[1].isFlipped = false;
        this.flippedCards = [];
    }
    /**
     * Adds seconds to the timer as a penalty if theres a wrong match.
     *
     * @param {number} penalty: the number of seconds that have to be added (2)
     * @returns {void} 
     */
    addPenalty(penalty) {
        this.seconds += penalty;
    }
    /**
     * Begins the live timer and increments it by seconds.
     *
     * @param {Function} onTick: Called every second with the present seconds value
     * @returns {void} 
     */
    startTime(onTick) {
        const self = this;
        self.timerInterval = setInterval(function () {
            self.seconds++;
            onTick(self.seconds);
        }, 1000);
    }
    /**
     * Stops the live timer. 
     * 
     * @returns {void} 
     */
    stopTime() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
    /**
     * Checks if all pairs are found and returns true if so.
     *
     * @returns {void} 
     */
    isDone() {
        return this.foundPairs == this.totalPairs;
    }
}
window.addEventListener("load", function () {
    const splash = document.getElementById("splash");
    const difficulties = document.getElementById("difficulties");
    const game = document.getElementById("game");
    const ending = document.getElementById("ending");
    const startBtn = document.getElementById("startBtn");
    const backBtn = document.getElementById("backBtn");
    const rematch = document.getElementById("rematch");
    const difficultyReselect = document.getElementById("difficultyReselect");
    const helpBtn = document.getElementById("helpBtn");
    const doneReading = document.getElementById("gotitGame");
    const helpBox = document.getElementById("helpBox");
    const splashHelpBtn = document.getElementById("splashHelpBtn");
    const quitSplashHelp = document.getElementById("quitSplashHelp");
    const splashHelpBox = document.getElementById("splashHelpBox");
    const quitBtn = document.getElementById("quitBtn");
    const difficultyBtns = document.querySelectorAll(".difficultyBtn");
    const cardGrid = document.getElementById("cardGrid");
    const counter = document.getElementById("counter");
    const fillBar = document.getElementById("fillBar");
    const timeDisplay = document.getElementById("timeDisplay");
    const peek = document.getElementById("peek");
    const difficulty = document.getElementById("difficulty");
    const congratsEmoji = document.getElementById("congratsEmoji");
    const endingTitle = document.getElementById("endingTitle");
    const stars = document.getElementById("stars");
    const endingMessage = document.getElementById("endingMessage");
    const bestScore = document.getElementById("bestScore");
    const pastScores = document.getElementById("pastScores");
    const historyDifficulty = document.getElementById("historyDifficulty");
    const splashCanvas = document.getElementById("splashCanvas");
    const board = new GameBoard();
    let animationFrameId = null;
    let currentDifficulty = "medium";
    let giveUp = false;
    const ctx = splashCanvas.getContext("2d");
    const splashEmojis = [
        "🌙", "🧸", "🎀", "⭐️", "🌸", "🍰",
        "🐰", "🫧", "🐿️", "🦢", "🪽", "🪐"
    ];

    /**
     * Creates one bouncing emoji bubble at a random canvas edge
     *
     * @param {string} emoji: emoji for this bubble
     * @returns {Object} bubble object with position, velocity, and emoji
     */
    function makeBubble(emoji) {
        const edge = Math.floor(Math.random() * 4);
        let x;
        let y;
        let dx;
        let dy;
        const speed = 1.5 + Math.random() * 1.5;
        if (edge == 0) {
            x = Math.random() * splashCanvas.clientWidth;
            y = -20;
            dx = (Math.random() - 0.5) * speed;
            dy = speed;
        }
        else if (edge == 1) {
            x = splashCanvas.width + 20;
            y = Math.random() * splashCanvas.height;
            dx = -speed;
            dy = (Math.random() - 0.5) * speed;
        }
        else if (edge == 2) {
            x = Math.random() * splashCanvas.width;
            y = splashCanvas.height + 20;
            dx = (Math.random() - 0.5) * speed;
            dy = -speed;
        }
        else {
            x = -20;
            y = Math.random() * splashCanvas.height;
            dx = speed;
            dy = (Math.random() - 0.5) * speed;
        }
        return { emoji: emoji, x: x, y: y, dx: dx, dy: dy };
    }
    const bubbles = [];
    for (let i = 0; i < splashEmojis.length; i++) {
        bubbles.push(makeBubble(splashEmojis[i]));
    }

    /**
     * Draws one frame of the splash emoji bouncing around.
     *
     * @returns {Object} bubble object with position, velocity, and emoji
     */
    function splashDraw() {
        ctx.clearRect(0, 0, splashCanvas.width, splashCanvas.height);
        ctx.fillStyle = "rgb(251, 235, 240)";
        ctx.fillRect(0, 0, splashCanvas.width, splashCanvas.height);
        ctx.font = "35px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < bubbles.length; i++) {
            const move = bubbles[i];
            move.x += move.dx;
            move.y += move.dy;
            if (move.x < 22) {
                move.x = 22;
                move.dx *= -1;
            }
            if (move.x > splashCanvas.width - 22) {
                move.x = splashCanvas.width - 22;
                move.dx *= -1;
            }
            if (move.y < 22) {
                move.y = 22;
                move.dy *= -1;
            }
            if (move.y > splashCanvas.height - 22) {
                move.y = splashCanvas.height - 22;
                move.dy *= -1;
            }
            ctx.fillText(move.emoji, move.x, move.y);
        }
        animationFrameId = requestAnimationFrame(splashDraw);
    }
    splashDraw();
    setTimeout(function () {
        startBtn.classList.add("visible");
    }, 3000);

    /**
     * Shows the screen for difficulty selection
     *
     * @returns {void}
     */
    function showDifficulties() {
        cancelAnimationFrame(animationFrameId);
        splash.classList.add("hiding");
        ending.classList.add("hiding");
        game.classList.add("hiding");
        difficulties.classList.remove("hiding");
    }
    /**
     * Starts a new game based on the chosen difficulty level
     *
     * @param {string} chosenDifficulty: "easy", "medium", "hard"
     * @returns {void}
     */
    function startGame(chosenDifficulty) {
        ending.classList.add("hiding");
        currentDifficulty = chosenDifficulty;
        giveUp = false;
        difficulties.classList.add("hiding");
        game.classList.remove("hiding");
        helpBox.classList.add("hiding");
        board.stopTime();
        board.buildBoard(chosenDifficulty);
        cardGrid.style.gridTemplateColumns = "repeat(4, 1fr)"; /*https://www.w3schools.com/cssref/pr_grid-template-columns.php */
        updateStatus();
        renderCards();
        startPeeking();
        const label = { easy: "Easy", medium: "Medium", hard: "Hard" };
        difficulty.textContent = label[chosenDifficulty];
    }
    /**
     * Shows all the cards face-up for five seconds so the player can try to memorize them
     *
     * @returns {void}
     */
    function startPeeking() {
        const cardElements = cardGrid.querySelectorAll(".card");
        for (let i = 0; i < cardElements.length; i++) {
            cardElements[i].classList.add("flipped", "noClick");
        }
        let secondsLeft = 5
        peek.textContent = "Memorize the cards! " + secondsLeft + "s";
        const countdown = setInterval(function () {
            secondsLeft--;
            if (secondsLeft > 0) {
                peek.textContent = "Memorize the cards! " + secondsLeft + "s";
            }
            else {
                clearInterval(countdown);
                endPeeking();
            }
        }, 1000);
    }
    /**
     * flips card back around
     *
     * @returns {void}
     */
    function endPeeking() {
        const cardElements = cardGrid.querySelectorAll(".card");
        for (let i = 0; i < cardElements.length; i++) {
            cardElements[i].classList.remove("flipped", "noClick");
        }
        peek.textContent = "BEGIN!";
        setTimeout(function () {
            peek.textContent = "";
        }, 1000);
        board.startTime(function (secs) {
            timeDisplay.textContent = secs + "s";
        });
    }

    /**
     * Clears and re-renders all the cards on  the current board. 
     * 
     * @returns {void}
     */
    function renderCards() {
        cardGrid.innerHTML = "";
        for (let x = 0; x < board.cards.length; x++) {
            const cardData = board.cards[x];
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            cardElement.innerHTML = '<div class="cardInner">' + '<div class="cardFront">𓏲ּ𝄢</div>' +
                '<div class="cardBack">' + cardData.emoji + '</div>' + '</div>';
            if (cardData.isFlipped || cardData.isMatched) {
                cardElement.classList.add("flipped")
            }
            if (cardData.isMatched) {
                cardElement.classList.add("matched");
            }
            cardElement.addEventListener("click", function () {
                cardClicked(cardData, cardElement);
            });
            cardGrid.appendChild(cardElement);
        }
    }

    /**
     * Handles a card click. Shakes the cards if the cards have already been selected.
     * Flips the cards and checks for a match otherwise, wrong matches flash red and add
     * a 2 second time penalty.
     * 
     * @param {card} cardData: the card model object that is being clicked
     * @param {HTMLElement} cardElement: the DOM element
     * @returns {void}
     */
    function cardClicked(cardData, cardElement) {
        if (cardData.isMatched || (cardData.isFlipped && board.flippedCards.length < 2)) {
            shakeCard(cardElement);
            return;
        }
        if (board.locked) {
            return;
        }
        if (board.flippedCards.length == 2) {
            return;
        }
        board.flippedCard(cardData);
        cardElement.classList.add("flipped");
        updateStatus();
        if (board.flippedCards.length == 2) {
            board.locked = true;
            if (board.checkMatching()) {
                board.endMatching();
                board.locked = false;
                markMatched();
                updateStatus();
                if (board.isDone()) {
                    board.stopTime();
                    setTimeout(showEndScreen, 700);
                }
            }
            else {
                wrongSelection();
                board.addPenalty(2);
                timeDisplay.textContent = board.seconds + 's';
                setTimeout(function () {
                    board.resetFlipped();
                    board.locked = false;
                    renderCards();
                }, 1000);
            }
        }
    }

    /**
     * Applies shake animation to already selected cards
     * 
     * @param {HTMLElement} cardElement: card being shaken
     * @returns {void}
     */
    function shakeCard(cardElement) {
        cardElement.classList.remove("shake");
        void cardElement.offsetWidth;
        cardElement.classList.add("shake");
        setTimeout(function () {
            cardElement.classList.remove("shake");
        }, 300);
    }

    /**
     * Makes wrongly selected cards flash red
     * 
     * @returns {void}
     */
    function wrongSelection() {
        const cardElements = cardGrid.querySelectorAll(".card.flipped:not(.matched)");
        for (let i = 0; i < cardElements.length; i++) {
            cardElements[i].classList.add("wrong");
        }
        setTimeout(function () {
            const wrongElements = cardGrid.querySelectorAll(".card.wrong");
            for (let i = 0; i < wrongElements.length; i++) {
                wrongElements[i].classList.remove("wrong");
            }
        }, 800);
    }
    /**
     * Adds matched css class to every matched card on the game board grid.
     * 
     * @returns {void}
     */
    function markMatched() {
        const cardElements = cardGrid.querySelectorAll(".card");
        for (let i = 0; i < board.cards.length; i++) {
            if (board.cards[i].isMatched) {
                cardElements[i].classList.add("matched");
            }
        }
    }

    /**
     * Handles the give up button when a user wants to quit the game
     * 
     * @returns {void}
     */
    function quitHandled() {
        board.stopTime();
        giveUp = true;
        const cardElements = cardGrid.querySelectorAll(".card");
        for (let j = 0; j < cardElements.length; j++) {
            cardElements[j].classList.add("flipped", "noClick");
        }
        peek.textContent = "You quit. Better luck next time... :(";
        setTimeout(function () {
            showEndScreen();
        }, 2500);
    }
    /**
     * Updates the move count and progress bar, reflecting the present board state
     * 
     * @returns {void}
     */
    function updateStatus() {
        counter.textContent = board.moveCounter;
        const percentage = (board.foundPairs / board.totalPairs) * 100;
        fillBar.style.width = percentage + "%";
    }
    /**
     * Calculates a star rating (1-3) from  moves and time for the difficulty.
     * Uses moves+secs/10 with thresholds per difficulty
     * 
     * @param {string} difficulty: "easy" "medium" "hard"
     * @param {number} moves: total moves
     * @param {number} secs: total seconds with penality included
     * @returns {number} star count between 1-3
     */
    function calculateStars(difficulty, moves, secs) {
        const score = moves + (secs / 10);
        let threeStarLimit;
        let twoStarLimit;
        if (difficulty == "easy") {
            threeStarLimit = 6;
            twoStarLimit = 10;
        }
        else if (difficulty == "hard") {
            threeStarLimit = 30;
            twoStarLimit = 50;
        }
        else {
            threeStarLimit = 12;
            twoStarLimit = 22;
        }
        if (score <= threeStarLimit) {
            return 3;
        }
        if (score <= twoStarLimit) {
            return 2;
        }
        return 1;

    }

    /**
     * Builds a star string to represent stars earned
     * 
     * @param {number} starNumber: number of stars
     * @returns {string} star emoji string
     */
    function buildStars(starNumber) {
        let filled = "";
        let empty = "";
        for (let i = 0; i < starNumber; i++) {
            filled += "⭐";
        }
        for (let j = 0; j < 3 - starNumber; j++) {
            empty += "⚪";
        }
        return filled + empty;
    }

    /**
     * shows end screen with the results, including the star rating, personal best, and past game history
     * 
     * @returns {string} star emoji string
     */

    function showEndScreen() {
        game.classList.add("hiding");
        ending.classList.remove("hiding");
        if (giveUp) {
            congratsEmoji.textContent = "˙◠˙"
            endingTitle.textContent = "You gave up.";
            stars.textContent = "";
            endingMessage.textContent = "Better luck next time...";
            bestScore.textContent = "";
            saveHistory(currentDifficulty, board.moveCounter, board.seconds, true);
        }
        else {
            const starNumber = calculateStars(currentDifficulty, board.moveCounter, board.seconds);
            congratsEmoji.textContent = "🥳";
            endingTitle.textContent = "-ˋˏ YOU DID IT!!! ˎˊ˗";
            stars.textContent = buildStars(starNumber);
            endingMessage.textContent = board.moveCounter + " moves | " + board.seconds + "s";
            bestScore.textContent = bestCheck(currentDifficulty, board.seconds);
            saveHistory(currentDifficulty, board.moveCounter, board.seconds, false);
        }
        const difficultyLabels = { easy: "Easy", medium: "Medium", hard: "Hard" };
        historyDifficulty.textContent = "- " + difficultyLabels[currentDifficulty];
        displayHistory(currentDifficulty);
    }
    /**
     * Returns the localStorage key for the specified difficulty's game round history
     * 
     * @param {string} difficulty: "easy" "medium" "hard"
     * @returns {string} the localStorage string
     */
    function historyKey(difficulty) {
        return "emojiMatch_" + difficulty;
    }
    /**
     * returns the localStorage key for the users' personal best
     * 
     * @param {string} difficulty: "easy" "medium" "hard"
     * @returns {string} the localStorage string
     */
    function bestKey(difficulty) {
        return "emojiMatchBest_" + difficulty;
    }
    /**
     * saves a game in localStorage history
     * Keeps 5 most recent enteries per level
     * 
     * @param {string} difficulty: "easy" "medium" "hard"
     * @param {number} moves: moves taken
     * @param {number} secs: seconds taken
     * @param {boolean} givenUp: if the user gave up, true
     * @returns {void} 
     */
    function saveHistory(difficulty, moves, secs, givenUp) {
        const key = historyKey(difficulty);
        const stored = localStorage.getItem(key);
        const history = stored ? JSON.parse(stored) : [];
        const date = new Date().toLocaleDateString();
        let entry;
        if (givenUp) {
            entry = { date: date, label: "Gave up: 0 pts" };
        } else {
            entry = { date: date, label: moves + " moves | " + secs + "s" };
        }
        history.unshift(entry);
        if (history.length > 5) {
            history.pop();
        }
        localStorage.setItem(key, JSON.stringify(history));
        if (!givenUp) {
            const best = bestKey(difficulty);
            const prevBest = localStorage.getItem(best);
            if (prevBest == null || secs < parseInt(prevBest)) {
                localStorage.setItem(best, secs.toString());
            }
        }
    }
    /**
     * checks if the current best is better than the personal best that is stored
     * 
     * @param {string} difficulty: "easy" "medium" "hard"
     * @param {number} secs: seconds taken
     * @returns {string} personal best message
     */
    function bestCheck(difficulty, secs) {
        const best = bestKey(difficulty);
        const prevBest = localStorage.getItem(best);
        if (prevBest == null || secs <= parseInt(prevBest)) {
            return "New personal best on " + difficulty + " mode!"
        }
        return "Personal best: " + prevBest + "s";
    }
    /**
     * renders past game history list for the given difficulty
     * 
     * @param {string} difficulty: "easy" "medium" "hard"
     * @returns {void} 
     */
    function displayHistory(difficulty) {
        const stored = localStorage.getItem(historyKey(difficulty));
        const history = stored ? JSON.parse(stored) : [];
        pastScores.innerHTML = "";
        if (history.length == 0) {
            pastScores.innerHTML = "<li>No past games yet :(<\li>";
            return;
        }
        for (let i = 0; i < history.length; i++) {
            const list = document.createElement("li");
            list.textContent = history[i].date + " - " + history[i].label;
            pastScores.appendChild(list);
        }
    }
    startBtn.addEventListener("click", showDifficulties);
    backBtn.addEventListener("click", function () {
        difficulties.classList.add("hiding");
        splash.classList.remove("hiding");
        splashDraw();
    });
    for (let s = 0; s < difficultyBtns.length; s++) {
        difficultyBtns[s].addEventListener("click", function () {
            startGame(this.getAttribute("dataDifficulty"));
        });
    }
    rematch.addEventListener("click", function () {
        startGame(currentDifficulty);
    });

    difficultyReselect.addEventListener("click", function () {
        ending.classList.add("hiding");
        difficulties.classList.remove("hiding");
    });
    helpBtn.addEventListener("click", function () {
        helpBox.classList.toggle("hiding");
    });
    doneReading.addEventListener("click", function () {
        helpBox.classList.add("hiding");
    });
    splashHelpBtn.addEventListener("click", function () {
        splashHelpBox.classList.toggle("hiding");
    });
    quitSplashHelp.addEventListener("click", function () {
        splashHelpBox.classList.add("hiding");
    });
    quitBtn.addEventListener("click", quitHandled)
});