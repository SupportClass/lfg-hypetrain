$(document).ready(function () {

    var modal = $('#eol-hypetrain_modal');
    var panel = $('#eol-hypetrain');

    modal.find('.js-apply').click(function applyClick() {
        nodecg.sendMessage('setTrain', train);
    });

    var trainCtrls = modal.find('.js-trainCtrls');
    var cooldownCtrls = modal.find('.js-cooldownCtrls');
    cooldownCtrls.find('.js-reset').click(function resetClick() {
        nodecg.sendMessage('resetCooldown')
    });
    cooldownCtrls.find('.js-end').click(function endClick() {
        nodecg.sendMessage('endCooldown')
    });

    var train = {};

    var durationVal = 0;
    Object.defineProperty(train, 'duration', {
        get: function() {
            return durationVal;
        },
        set: function(newValue) {
            durationVal = newValue;
            cooldownCtrls.find('.js-duration').val(newValue);
        },
        enumerable: true
    });

    var remainingTimeVal = 0;
    Object.defineProperty(train, 'remainingTime', {
        get: function() {
            return remainingTimeVal;
        },
        set: function(newValue) {
            remainingTimeVal = newValue;

            if (newValue <= 0) {
                panel.find('.js-cooldown').text('OFF');
                this.passengers = 0;
            } else {
                var minutes = Math.floor(newValue / 60);
                var seconds = newValue - minutes * 60;
                if (seconds < 10)
                    seconds = '0' + seconds;

                panel.find('.js-cooldown').text(minutes + ':' + seconds);
            }
        },
        enumerable: true
    });

    var thresholdVal = 0;
    Object.defineProperty(train, 'threshold', {
        get: function() {
            return thresholdVal;
        },
        set: function(newValue) {
            thresholdVal = newValue;
            trainCtrls.find('.js-threshold').val(newValue);
            panel.find('.js-threshold').text(newValue);
        },
        enumerable: true
    });

    var passengersVal = 0;
    Object.defineProperty(train, 'passengers', {
        get: function() {
            return passengersVal;
        },
        set: function(newValue) {
            passengersVal = newValue;
            trainCtrls.find('.js-passengers').val(newValue);
            panel.find('.js-passengers').text(newValue);
        },
        enumerable: true
    });

    var dayTotalVal = 0;
    Object.defineProperty(train, 'dayTotal', {
        get: function() {
            return dayTotalVal;
        },
        set: function(newValue) {
            dayTotalVal = newValue;
            trainCtrls.find('.js-daytotal').val(newValue);
            panel.find('.js-daytotal').text(newValue);
        },
        enumerable: true
    });

    nodecg.listenFor('cooldownTick', function cooldownTick(data) {
        train.remainingTime = data.remainingTime;
    });

    nodecg.listenFor('trainBroadcast', gotTrain);
    nodecg.sendMessage('getTrain', gotTrain);

    function gotTrain(data) {
        for (var key in data) {
            if (train.hasOwnProperty(key)) {
                train[key] = data[key];
            }
        }

        trainCtrls.find('.js-threshold').prop('disabled', data.config.disableThresholdEditing);
    }

});