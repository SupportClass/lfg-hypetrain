(function () {
	'use strict';

	const thresholdEl = document.getElementById('threshold');
	const durationEl = document.getElementById('duration');
	const passengersEl = document.getElementById('passengers');
	const dayTotalEl = document.getElementById('dayTotal');

	const duration = nodecg.Replicant('duration');
	duration.on('change', newVal => {
		durationEl.value = newVal;
	});

	const passengers = nodecg.Replicant('passengers');
	passengers.on('change', newVal => {
		passengersEl.value = newVal;
	});

	const dayTotal = nodecg.Replicant('dayTotal');
	dayTotal.on('change', newVal => {
		dayTotalEl.value = newVal;
	});

	const threshold = nodecg.Replicant('threshold');
	threshold.on('change', newVal => {
		thresholdEl.value = newVal;
	});

	document.getElementById('reset').addEventListener('click', () => {
		nodecg.sendMessage('resetCooldown');
	}, false);

	document.getElementById('end').addEventListener('click', () => {
		nodecg.sendMessage('endCooldown');
	}, false);

	document.addEventListener('dialog-confirmed', () => {
		duration.value = durationEl.value;
		passengers.value = passengersEl.value;
		dayTotal.value = dayTotalEl.value;
		threshold.value = thresholdEl.value;
	}, false);
})();
