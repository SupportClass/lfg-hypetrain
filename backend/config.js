'use strict';

var fs = require('fs');
var extend = require('extend');

var config = {
    autoStartCooldown: false,       // If 'true', automatically starts the cooldown when a passenger is added
    resetAfterThreshold: false,     // If 'true', hitting the threshold causes the train to reset to zero
    disableThresholdEditing: false  // If 'true', prevents threshold from being modified during runtime
};

// Load user config if it exists, and merge it
if (fs.existsSync('../config.json')) {
    var userConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    extend (true, config, userConfig);
}

module.exports = config;
