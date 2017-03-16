(function () {
	'use strict';

	const thresholdEl = document.querySelector('div[data-field="threshold"]');
	const cooldownEl = document.querySelector('div[data-field="cooldown"]');
	const passengersEl = document.querySelector('div[data-field="passengers"]');
	const dayTotalEl = document.querySelector('div[data-field="dayTotal"]');

	const remainingTime = nodecg.Replicant('remainingTime');
	remainingTime.on('change', newVal => {
		const minutes = Math.floor(newVal / 60);
		let seconds = newVal - (minutes * 60);
		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		cooldownEl.innerText = minutes + ':' + seconds;
	});

	const isCooldownActive = nodecg.Replicant('isCooldownActive');
	isCooldownActive.on('change', newVal => {
		if (newVal === false) {
			cooldownEl.innerText = 'OFF';
		}
	});

	const passengers = nodecg.Replicant('passengers');
	passengers.on('change', newVal => {
		passengersEl.innerText = newVal;
	});

	const dayTotal = nodecg.Replicant('dayTotal');
	dayTotal.on('change', newVal => {
		dayTotalEl.innerText = newVal;
	});

	const threshold = nodecg.Replicant('threshold');
	threshold.on('change', newVal => {
		thresholdEl.innerText = newVal;
	});
})();
