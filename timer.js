class Timer {
	constructor(durationInput, startBtn, pauseBtn, callbacks) {
		this.durationInput = durationInput;
		this.startBtn = startBtn;
		this.pauseBtn = pauseBtn;
		if (callbacks) {
			this.onStart = callbacks.onStart;
			this.onComplete = callbacks.onComplete;
			this.onPause = callbacks.onPause;
		}
		this.startBtn.addEventListener('click', this.start);
		this.pauseBtn.addEventListener('click', this.pause);
	}
	//I'm using an arrow function here, because it doesn't get its own "this",
	//so when I call this.start from the event listener, this inside the start function
	//will be the new instance of the timer class and not the startBtn itself
	start = () => {
		// this.tick();
		if (this.onStart) {
			this.onStart();
		}
		this.intervalId = setInterval(this.tick, 1000);
	};

	pause = () => {
		if (this.onPause) {
			this.onPause();
		}
		clearInterval(this.intervalId);
	};

	tick = () => {
		if (this.timeRemaining <= 0) {
			this.pause();
			if (this.onComplete) {
				this.onComplete();
			}
		} else {
			this.timeRemaining = this.timeRemaining - 1;
			if (this.onTick) {
				this.onTick(this.timeRemaining);
			}
		}
	};

	get timeRemaining() {
		return parseFloat(this.durationInput.innerText);
	}

	set timeRemaining(time) {
		this.durationInput.innerText = time.toFixed(2);
	}
}
