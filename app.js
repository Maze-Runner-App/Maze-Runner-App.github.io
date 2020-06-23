const btn = document.querySelectorAll('.difficulty button');
const scoreboard = document.querySelector('.scoreboard');
const timerDisplay = document.querySelector('span#timerDisplay');
const startBtn = document.querySelector('button.start');
const pauseBtn = document.querySelector('button.pause');
const tryAgainBtn = document.querySelectorAll('.playAgain');
const canvas = document.querySelector('.canvas');
const gameOverScreen = document.querySelector('.gameOver');
const winnerScreen = document.querySelector('.winner');
const pauseScreen = document.querySelector('.pauseScreen');

for (let button of btn) {
	button.addEventListener('click', () => {
		gameOverScreen.classList.add('hidden');
		winnerScreen.classList.add('hidden');
		document.querySelector('div.intro').classList.add('hidden');
		scoreboard.offsetHeight = window.innerHeight;

		if (button.className === 'easy') {
			createMaze(7, 4);
		}
		if (button.className === 'medium') {
			createMaze(14, 10);
		}
		if (button.className === 'hard') {
			createMaze(20, 14);
		}
	
	});
}

for (let button of tryAgainBtn)
	button.addEventListener('click', () => {
		canvas.innerHTML = '';
		timerDisplay.innerText = '30';
		document.querySelector('div.intro').classList.remove('hidden');
		
	});
