$(document).ready(function () {

    var modal = $('#eol-hypetrain_modal');
    var panel = $('#eol-hypetrain');

    modal.find('.js-apply').click(applyClick);

    /** COOLDOWN **/

    var cooldownCtrls = modal.find('.js-cooldownCtrls');
    var setDuration = cooldownCtrls.find('.js-duration');
    var resetCooldown = cooldownCtrls.find('.js-reset');
    var endCooldown = cooldownCtrls.find('.js-end');
    var dispCooldown = panel.find('.js-cooldown');

    nodecg.listenFor('cooldownTick', cooldownTick);

    cooldownCtrls.find('.js-reset').click(function() { nodecg.sendMessage('resetCooldown', '') });
    cooldownCtrls.find('.js-end').click(function() { nodecg.sendMessage('endCooldown', '') });

    function cooldownTick(data) {
        if (data.remainingTime <= 0) {
            dispCooldown.text('INACTIVE');
            dispPassengers.text(0);
            setPassengers.find('input').val(0);
        } else {
            var minutes = Math.floor(data.remainingTime / 60);
            var seconds = data.remainingTime - minutes * 60;
            if (seconds < 10)
                seconds = '0' + seconds;

            dispCooldown.text(minutes + ':' + seconds);
        }
    }

    function updateCooldownHTML(remainingTime, duration) {
        cooldownTick({ remainingTime: remainingTime });
        setDuration.find('input').val(duration);
    }

    /** TRAIN **/

    var trainCtrls = modal.find('.js-trainCtrls');
    var setThreshold = trainCtrls.find('.js-threshold');
    var setPassengers = trainCtrls.find('.js-passengers');

    var dispThreshold = panel.find('.js-threshold');
    var dispPassengers = panel.find('.js-passengers');

    function updateTrainHTML(passengers, threshold) {
        dispPassengers.text(passengers);
        dispThreshold.text(threshold);
        setPassengers.find('input').val(passengers);
        setThreshold.find('input').val(threshold);
    }

    /** GENERAL **/

    nodecg.listenFor('trainBroadcast', trainBroadcast);

    function trainBroadcast(train) {
        updateTrainHTML(train.passengers, train.threshold);
        updateCooldownHTML(train.remainingTime, train.duration);
        if (train.isHype) {
            //console.log('[eol-hypetrain] sub hype');
        }
    }

    function applyClick() {
        var train = {
            passengers: parseInt(setPassengers.find('input').val()),
            threshold: parseInt(setThreshold.find('input').val()),
            duration: parseInt(setDuration.find('input').val())
        };

        nodecg.sendMessage('setTrain', train);
    }

    nodecg.sendMessage('getTrain', {}, function (train) {
        updateTrainHTML(train.passengers, train.threshold);
        updateCooldownHTML(train.remainingTime, train.duration);
        console.log('[eol-hypetrain] got initial train, ' + train.passengers + ' passengers, hype threshold: ' + train.threshold);
    });

});