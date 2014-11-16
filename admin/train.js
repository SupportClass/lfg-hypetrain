$(document).ready(function () {

    var modal = $('#eol-hypetrain_modal');
    var panel = $('#eol-hypetrain');
    var trainCtrls = modal.find('.js-trainCtrls');
    var cooldownCtrls = modal.find('.js-cooldownCtrls');

    modal.find('.js-apply').click(function applyClick() {
        nodecg.variables.passengers = parseInt(trainCtrls.find('.js-passengers').val());
        nodecg.variables.dayTotal = parseInt(trainCtrls.find('.js-daytotal').val());
        nodecg.variables.threshold = parseInt(trainCtrls.find('.js-threshold').val());
        nodecg.variables.duration = parseInt(cooldownCtrls.find('.js-duration').val());
    });

    var cooldownEl = panel.find('.js-cooldown');
    nodecg.declareSyncedVar({ variableName: 'remainingTime',
        initialVal: 0,
        setter: function(newVal) {
            var minutes = Math.floor(newVal / 60);
            var seconds = newVal - minutes * 60;
            if (seconds < 10)
                seconds = '0' + seconds;

            cooldownEl.text(minutes + ':' + seconds);
        }
    });

    nodecg.declareSyncedVar({ variableName: 'isCooldownActive',
        initialVal: false,
        setter: function(newVal) {
            if (newVal === false) {
                cooldownEl.text('OFF');
            }
        }
    });

    nodecg.declareSyncedVar({ variableName: 'passengers',
        initialVal: 0,
        setter: function(newVal) {
            trainCtrls.find('.js-passengers').val(newVal);
            panel.find('.js-passengers').text(newVal);
        }
    });
    nodecg.declareSyncedVar({ variableName: 'dayTotal',
        initialVal: 0,
        setter: function(newVal) {
            trainCtrls.find('.js-daytotal').val(newVal);
            panel.find('.js-daytotal').text(newVal);
        }
    });
    nodecg.declareSyncedVar({ variableName: 'threshold',
        initialVal: 0,
        setter: function(newVal) {
            trainCtrls.find('.js-threshold').val(newVal);
            panel.find('.js-threshold').text(newVal);
        }
    });
    nodecg.declareSyncedVar({ variableName: 'duration',
        initialVal: 300,
        setter: function(newVal) {
            cooldownCtrls.find('.js-duration').val(newVal);
        }
    });

    cooldownCtrls.find('.js-reset').click(function resetClick() {
        nodecg.sendMessage('resetCooldown')
    });
    cooldownCtrls.find('.js-end').click(function endClick() {
        nodecg.sendMessage('endCooldown')
    });

    //dayTotal resetting
    panel.find('.reset-btn')
        .on("mouseenter", function() {
            $(this).siblings('.reset-target').css('opacity', 0);
        })
        .on("mouseleave", function() {
            $(this).siblings('.reset-target').css('opacity', 1);
        });

    $('#eol-hypetrain_resetmodal').find('.js-reset').click(function() {
        nodecg.variables.dayTotal = 0;
    });
});