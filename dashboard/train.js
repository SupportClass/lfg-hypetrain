'use strict';

var modal = $('#lfg-hypetrain_modal');
var panel = $bundle.filter('.train');
var trainCtrls = modal.find('.js-trainCtrls');
var cooldownCtrls = modal.find('.js-cooldownCtrls');
var cooldownEl = panel.find('.js-cooldown');

modal.find('.js-apply').click(function applyClick() {
    passengers.value = parseInt(trainCtrls.find('.js-passengers').val());
    dayTotal.value = parseInt(trainCtrls.find('.js-daytotal').val());
    threshold.value = parseInt(trainCtrls.find('.js-threshold').val());
    duration.value = parseInt(cooldownCtrls.find('.js-duration').val());
});


var remainingTime = nodecg.Replicant('remainingTime');
remainingTime.on('change', function(oldVal, newVal) {
    var minutes = Math.floor(newVal / 60);
    var seconds = newVal - minutes * 60;
    if (seconds < 10)
        seconds = '0' + seconds;

    cooldownEl.text(minutes + ':' + seconds);
});

var isCooldownActive = nodecg.Replicant('isCooldownActive');
isCooldownActive.on('change', function(oldVal, newVal) {
    if (newVal === false) {
        cooldownEl.text('OFF');
    }
});

var passengers = nodecg.Replicant('passengers');
passengers.on('change', function(oldVal, newVal) {
    trainCtrls.find('.js-passengers').val(newVal);
    panel.find('.js-passengers').text(newVal);
});

var dayTotal = nodecg.Replicant('dayTotal');
dayTotal.on('change', function(oldVal, newVal) {
    trainCtrls.find('.js-daytotal').val(newVal);
    panel.find('.js-daytotal').text(newVal);
});

var threshold = nodecg.Replicant('threshold');
threshold.on('change', function(oldVal, newVal) {
    trainCtrls.find('.js-threshold').val(newVal);
    panel.find('.js-threshold').text(newVal);
});

var duration = nodecg.Replicant('duration');
duration.on('change', function(oldVal, newVal) {
    cooldownCtrls.find('.js-duration').val(newVal);
});

cooldownCtrls.find('.js-reset').click(function resetClick() {
    nodecg.sendMessage('resetCooldown');
});
cooldownCtrls.find('.js-end').click(function endClick() {
    nodecg.sendMessage('endCooldown');
});

//dayTotal resetting
panel.find('.reset-btn')
    .on('mouseenter', function() {
        $(this).siblings('.reset-target').css('opacity', 0);
    })
    .on('mouseleave', function() {
        $(this).siblings('.reset-target').css('opacity', 1);
    });

$('#lfg-hypetrain_resetmodal').find('.js-reset').click(function() {
    dayTotal.value = 0;
});
