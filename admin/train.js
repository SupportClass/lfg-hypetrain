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

    cooldownCtrls.find('.js-reset').click(function() { nodecg.sendMessage('resetCooldown') });
    cooldownCtrls.find('.js-end').click(function() { nodecg.sendMessage('endCooldown') });

    function cooldownTick(data) {
        if (data.remainingTime <= 0) {
            dispCooldown.text('OFF');
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

    function updateCooldownHTML(train) {
        cooldownTick({ remainingTime: train.remainingTime });
        setDuration.find('input').val(train.duration);
    }

    /** TRAIN **/

    var trainCtrls = modal.find('.js-trainCtrls');
    var setThreshold = trainCtrls.find('.js-threshold');
    var setPassengers = trainCtrls.find('.js-passengers');
    var setDayTotal = trainCtrls.find('.js-daytotal');

    var dispThreshold = panel.find('.js-threshold');
    var dispPassengers = panel.find('.js-passengers');
    var dispDayTotal = panel.find('.js-daytotal');

    function updateTrainHTML(train) {
        dispPassengers.text(train.passengers);
        dispThreshold.text(train.threshold);
        dispDayTotal.text(train.dayTotal);
        setPassengers.find('input').val(train.passengers);
        setThreshold.find('input').val(train.threshold);
        setDayTotal.find('input').val(train.dayTotal);
    }

    /** GENERAL **/

    nodecg.listenFor('trainBroadcast', trainBroadcast);

    function trainBroadcast(train) {
        updateTrainHTML(train);
        updateCooldownHTML(train);
        if (train.isHype) {
            //console.log('[eol-hypetrain] sub hype');
        }
    }

    function applyClick() {
        var train = {
            passengers: parseInt(setPassengers.find('input').val()),
            dayTotal: parseInt(setDayTotal.find('input').val()),
            threshold: parseInt(setThreshold.find('input').val()),
            duration: parseInt(setDuration.find('input').val())
        };

        nodecg.sendMessage('setTrain', train);
    }

    nodecg.sendMessage('getTrain', function (train) {
        updateTrainHTML(train);
        updateCooldownHTML(train);
        console.log('[eol-hypetrain] got initial train,', train);
    });

});