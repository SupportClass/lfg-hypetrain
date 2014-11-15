$(document).ready(function () {

    var modal = $('#eol-hypetrain_modal');
    var panel = $('#eol-hypetrain');
    var trainCtrls = modal.find('.js-trainCtrls');
    var cooldownCtrls = modal.find('.js-cooldownCtrls');

    modal.find('.js-apply').click(function applyClick() {
        nodecg.variables.passengers = parseInt(trainCtrls.find('.js-passengers').val());
        nodecg.variables.dayTotal = parseInt(trainCtrls.find('.js-daytotal').val());
        nodecg.variables.threshold = parseInt(trainCtrls.find('.js-threshold').val());
        nodecg.variables.duration = parseInt(trainCtrls.find('.js-duration').val());
    });

    nodecg.declareSyncedVar('remainingTime', 0, function remainingTime(newValue) {
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
    });

    nodecg.declareSyncedVar('duration', 300, function duration(newValue) {
        cooldownCtrls.find('.js-duration').val(newValue);
    });

    nodecg.declareSyncedVar('threshold', 0, function dayTotal(newValue) {
        trainCtrls.find('.js-threshold').val(newValue);
        panel.find('.js-threshold').text(newValue);
    });

    nodecg.declareSyncedVar('passengers', 0, function duration(newValue) {
        trainCtrls.find('.js-passengers').val(newValue);
        panel.find('.js-passengers').text(newValue);
    });

    nodecg.declareSyncedVar('dayTotal', 0, function duration(newValue) {
        trainCtrls.find('.js-daytotal').val(newValue);
        panel.find('.js-daytotal').text(newValue);
    });

    cooldownCtrls.find('.js-reset').click(function resetClick() {
        nodecg.sendMessage('resetCooldown')
    });
    cooldownCtrls.find('.js-end').click(function endClick() {
        nodecg.sendMessage('endCooldown')
    });

    $('#eol-hypetrain_test').click(function(){
        nodecg.sendMessage('startCooldown');
    });

    console.log(nodecg._varHandlers);
});