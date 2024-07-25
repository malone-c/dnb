// Dual N-Back Game

// Game configuration
const config = {
    trials: 20,
    positions: 3 * 3, // 3x3 grid
    letters: ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'], // Only using available letters
    interval: 3000, // 3 seconds
};

// Game state
let state = {
    n: 2,
    currentTrial: 0,
    sequence: [],
    falsePositives: { position: 0, letter: 0 },
    falseNegatives: { position: 0, letter: 0 },
    lastResponse: { position: null, letter: null },
    gameActive: false,
    gameInterval: null
};

// Initialize the game
function initGame() {
    stopGame(); // Stop any ongoing game
    state.n = parseInt(document.getElementById('n-back-select').value);
    state.sequence = [];
    for (let i = 0; i < config.trials; i++) {
        state.sequence.push({
            position: Math.floor(Math.random() * config.positions),
            letter: config.letters[Math.floor(Math.random() * config.letters.length)],
        });
    }
    state.currentTrial = 0;
    state.falsePositives = { position: 0, letter: 0 };
    state.falseNegatives = { position: 0, letter: 0 };
    state.gameActive = true;
    enableButtons();
    updateDisplay();
}

// Update the display
function updateDisplay() {
    if (!state.gameActive) return;

    const current = state.sequence[state.currentTrial];
    
    // Reset all squares
    document.querySelectorAll('#position div').forEach(div => div.classList.remove('active'));
    
    // Activate the current square
    document.querySelectorAll('#position div')[current.position].classList.add('active');

    // Log current trial info to console
    console.log(`Trial ${state.currentTrial + 1}: Position: ${current.position}, Letter: ${current.letter}`);

    // Play the audio for the current letter
    playLetterAudio(current.letter);

    // Enable buttons for the new trial
    enableButtons();
}

// Play audio for the given letter
function playLetterAudio(letter) {
    if (!state.gameActive) return;

    const audio = new Audio(`audio/${letter.toLowerCase()}.wav`);
    audio.play().catch(error => console.error('Audio playback failed:', error));
}

// Check for matches
function checkMatch(type) {
    if (state.currentTrial >= state.n) {
        const current = state.sequence[state.currentTrial];
        const nBack = state.sequence[state.currentTrial - state.n];
        const isMatch = current[type] === nBack[type];
        
        if (!isMatch && state.lastResponse[type]) {
            state.falsePositives[type]++;
        } else if (isMatch && !state.lastResponse[type]) {
            state.falseNegatives[type]++;
        }
    }
    state.lastResponse[type] = null;
}

// Handle user input
function handleInput(type) {
    if (!state.gameActive) return;
    state.lastResponse[type] = true;
    document.getElementById(`${type}-button`).disabled = true;
}

// Advance to the next trial
function nextTrial() {
    if (!state.gameActive) return;

    checkMatch('position');
    checkMatch('letter');
    state.currentTrial++;
    if (state.currentTrial < config.trials) {
        updateDisplay();
    } else {
        endGame();
    }
}

// Start the game
function startGame() {
    initGame();
    state.gameInterval = setInterval(nextTrial, config.interval);
}

// Stop the game
function stopGame() {
    state.gameActive = false;
    if (state.gameInterval) {
        clearInterval(state.gameInterval);
        state.gameInterval = null;
    }
    // Reset display
    document.querySelectorAll('#position div').forEach(div => div.classList.remove('active'));
    disableButtons();
}

// End the game and show results
function endGame() {
    stopGame();
    const totalTrials = config.trials - state.n;
    const totalErrors = state.falsePositives.position + state.falsePositives.letter + 
                        state.falseNegatives.position + state.falseNegatives.letter;
    const errorRate = (totalErrors / (totalTrials * 2) * 100).toFixed(2);
    const accuracy = (100 - errorRate).toFixed(2);
    
    alert(`Game Over!\n\n` +
          `Your accuracy rate: ${accuracy}%\n` +
          `(Error rate: ${errorRate}%)`);

    console.log('Game Over!');
    console.log('False Positives:', state.falsePositives);
    console.log('False Negatives:', state.falseNegatives);
}

// Enable both buttons
function enableButtons() {
    document.getElementById('position-button').disabled = false;
    document.getElementById('letter-button').disabled = false;
}

// Disable both buttons
function disableButtons() {
    document.getElementById('position-button').disabled = true;
    document.getElementById('letter-button').disabled = true;
}

// Event listeners
document.getElementById('position-button').addEventListener('click', () => handleInput('position'));
document.getElementById('letter-button').addEventListener('click', () => handleInput('letter'));
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('stop-button').addEventListener('click', stopGame);

// Keyboard event listener
document.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'A') {
        handleInput('position');
    } else if (event.key === 'l' || event.key === 'L') {
        handleInput('letter');
    }
});