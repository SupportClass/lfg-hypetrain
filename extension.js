'use strict';

// Exports a train singleton
var Q = require('q');
var nodecg = {};
var elapsedTime, remainingTime, isCooldownActive; // transient variables
var passengers, dayTotal, threshold, duration; // persistent variables

var cdTimer = null;

function Train(extensionApi) {
    nodecg = extensionApi;

    initOptions();

    // These properties are transient and are not persisted
    elapsedTime = nodecg.Replicant('elapsedTime', { defaultValue: 0, persistent: false });
    remainingTime = nodecg.Replicant('remainingTime', { defaultValue: 0, persistent: false });
    isCooldownActive = nodecg.Replicant('isCooldownActive', { defaultValue: false, persistent: false });

    // These properties are persisted to disk
    passengers = nodecg.Replicant('passengers', { defaultValue: 0 });
    dayTotal = nodecg.Replicant('dayTotal', { defaultValue: 0 });
    threshold = nodecg.Replicant('threshold', { defaultValue: 10 });
    duration = nodecg.Replicant('duration', { defaultValue: 300 });

    nodecg.listenFor('startCooldown', this.startCooldown.bind(this));
    nodecg.listenFor('endCooldown', this.endCooldown.bind(this));
    nodecg.listenFor('resetCooldown', this.resetCooldown.bind(this));

    // temporary workaround for some bundles until I figure out how to make this better
    nodecg.listenFor('getPassengers', function(data, cb) {
        cb(passengers.value);
    });
    nodecg.listenFor('getDayTotal', function(data, cb) {
        cb(dayTotal.value);
    });
}

Train.prototype.startCooldown = function () {
    _killTimer(); // Kill any existing cooldown timer

    elapsedTime.value = 0;
    remainingTime.value = duration.value;
    isCooldownActive.value = true;
    cdTimer = setInterval(this.tickCooldown.bind(this), 1000);

    nodecg.sendMessage('cooldownStart');
};

Train.prototype.tickCooldown = function() {
    elapsedTime.value++;
    remainingTime.value--;

    if (remainingTime.value <= 0) {
        remainingTime.value = 0; // force to zero if we somehow went negative
        this.endCooldown();
    }
};

Train.prototype.resetCooldown = function() {
    elapsedTime.value = 0;
    remainingTime.value = duration.value;
};

Train.prototype.endCooldown = function() {
    _killTimer();
    passengers.value = 0;
    isCooldownActive.value = false;
    nodecg.sendMessage('cooldownEnd');
};

Train.prototype.addPassenger = function() {
    passengers.value++;
    dayTotal.value++;

    var train = {
        passengers: passengers.value,
        dayTotal: dayTotal.value,
        threshold: threshold.value,
        isHype: passengers.value >= threshold.value
    };

    if (train.isHype && nodecg.bundleConfig.resetAfterThreshold) {
        passengers.value = 0;
        this.endCooldown();
    } else if (nodecg.bundleConfig.autoStartCooldown) {
        this.startCooldown();
    }

    return train;
};

function _killTimer() {
    if (cdTimer !== null) {
        clearInterval(cdTimer);
        cdTimer = null;
    }
}

function initOptions() {
    if (typeof(nodecg.bundleConfig.autoStartCooldown) === 'undefined')
        nodecg.bundleConfig.autoStartCooldown = false;
    if (typeof(nodecg.bundleConfig.resetAfterThreshold) === 'undefined')
        nodecg.bundleConfig.resetAfterThreshold = false;
    if (typeof(nodecg.bundleConfig.disableThresholdEditing) === 'undefined')
        nodecg.bundleConfig.disableThresholdEditing = false;
}

module.exports = function(extensionApi) { return new Train(extensionApi); };
