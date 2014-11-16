'use strict';

// Exports a train singleton
var db = require('./backend/db.js');
var Q = require('q');
var extend = require('extend');
var fs = require('fs');
var log = require('../../lib/logger');
var nodecg = {};

function Train(extensionApi) {
    if ( Train.prototype._singletonInstance ) {
        return Train.prototype._singletonInstance;
    }
    Train.prototype._singletonInstance = this;

    nodecg = extensionApi;
    var self = this;

    // These properties are transient and are not persisted in the DB
    nodecg.declareSyncedVar({ variableName: 'elapsedTime', initialVal: 0 });
    nodecg.declareSyncedVar({ variableName: 'remainingTime', initialVal: 0 });
    nodecg.declareSyncedVar({ variableName: 'isCooldownActive', initialVal: false });

    this._timer = null;

    // Set up options
    this.options = {};
    this.initializeOptions();

    this.init()
        .then(function(train) {
            nodecg.declareSyncedVar({ variableName: 'passengers',
                initialVal: train.passengers,
                setter: function(newVal) {
                    self.write({passengers: newVal});
                }
            });
            nodecg.declareSyncedVar({ variableName: 'dayTotal',
                initialVal: train.dayTotal,
                setter: function(newVal) {
                    self.write({dayTotal: newVal});
                }
            });
            nodecg.declareSyncedVar({ variableName: 'threshold',
                initialVal: train.threshold,
                setter: function(newVal) {
                    self.write({threshold: newVal});
                }
            });
            nodecg.declareSyncedVar({ variableName: 'duration',
                initialVal: train.duration,
                setter: function(newVal) {
                    self.write({duration: newVal});
                }
            });
        })
        .fail(function(err) {
            throw err;
        });

    nodecg.listenFor('startCooldown', this.startCooldown.bind(this));
    nodecg.listenFor('endCooldown', this.endCooldown.bind(this));
    nodecg.listenFor('resetCooldown', this.resetCooldown.bind(this));

    // temporary workaround for some bundles until I figure out how to make this better
    nodecg.listenFor('getPassengers', function(data, cb) {
        cb(nodecg.variables.passengers);
    });
    nodecg.listenFor('getDayTotal', function(data, cb) {
        cb(nodecg.variables.dayTotal);
    });
}

Train.prototype.initializeOptions = function() {
    var cfgPath = __dirname + '/config.json';
    var config = {};
    if (fs.existsSync(cfgPath)) {
        config = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    }

    // Intialize options to default values
    this.options.autoStartCooldown = false; // If 'true', automatically starts the cooldown when a passenger is added
    this.options.resetAfterThreshold = false; // If 'true', hitting the threshold causes the train to reset to zero

    // Overwrite defaults with any options from the config
    extend (true, this.options, config);
};

Train.prototype.init = function() {
    var deferred = Q.defer();
    db.findOne({ _id: 'train' }, function (err, doc) {
        if (err) {
            deferred.reject(new Error(err));
        } else if (doc === null) {
            // If the train isn't in the DB, make a new one with defaults
            var defaultTrain = {
                _id: 'train',
                passengers: 0,
                dayTotal: 0,
                threshold: 10,
                duration: 300
            };

            db.insert(defaultTrain, function (err, newDoc) {
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    deferred.resolve(newDoc);
                }
            });
        } else {
            // Else, return the train already present in the DB
            deferred.resolve(doc);
        }
    });
    return deferred.promise;
};

// Allows for setting any or all of the properties.
Train.prototype.write = function(args) {
    db.update({ _id: 'train' }, { $set: args }, { upsert: true }, function (err, numAdded) {
        if (err)
            log.error(err.stack);
    });
};

Train.prototype.startCooldown = function () {
    this._killTimer(); // Kill any existing cooldown timer

    nodecg.variables.elapsedTime = 0;
    nodecg.variables.remainingTime = nodecg.variables.duration;
    nodecg.variables.isCooldownActive = true;
    this._timer = setInterval(this.tickCooldown.bind(this), 1000);

    nodecg.sendMessage('cooldownStart');
};

Train.prototype.tickCooldown = function() {
    nodecg.variables.elapsedTime++;
    nodecg.variables.remainingTime--;

    if (nodecg.variables.remainingTime <= 0) {
        nodecg.variables.remainingTime = 0; // force to zero if we somehow went negative
        this.endCooldown();
    }
};

Train.prototype.resetCooldown = function() {
    nodecg.variables.elapsedTime = 0;
    nodecg.variables.remainingTime = nodecg.variables.duration;
};

Train.prototype.endCooldown = function() {
    this._killTimer();
    this.write({ passengers: 0 });
    nodecg.variables.isCooldownActive = false;
    nodecg.sendMessage('cooldownEnd');
};

Train.prototype._killTimer = function () {
    if (this._timer !== null) {
        clearInterval(this._timer);
        this._timer = null;
    }
};

Train.prototype.addPassenger = function() {
    nodecg.variables.passengers++;
    nodecg.variables.dayTotal++;

    if (this.options.autoStartCooldown)
        this.startCooldown();

    return nodecg.variables;
};

module.exports = function(extensionApi) { return new Train(extensionApi) };