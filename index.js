'use strict';

// Exports a train singleton
var db = require('./backend/db.js');
var Q = require('q');
var extend = require('extend');
var fs = require('fs');
var nodecg = {};

function Train(extensionApi) {
    if ( Train.prototype._singletonInstance ) {
        return Train.prototype._singletonInstance;
    }
    Train.prototype._singletonInstance = this;

    nodecg = extensionApi;
    var self = this;

    // These properties are transient and are not persisted in the DB
    this.elapsedTime = 0;
    this.remainingTime = 0;
    this._timer = null;

    // Set up options
    this.options = {};
    this.initializeOptions();

    this.init()
        .fail(function(err) {
            throw err;
        });

    // When the view page loads, it will request the history
    nodecg.listenFor('getTrain', function getTrain(data, cb) {
        self.get()
            .then(cb)
            .fail(function (err) {
                console.err('[eol-hypetrain] failed to get train: ' + err);
                cb(null);
            });
    });

    nodecg.listenFor('setTrain', function setTrain(data, cb) {
        self.set(data.content)
            .then(fn)
            .fail(function (err) {
                console.err('[eol-hypetrain] failed to set train: ' + err);
                fn(null);
            });
    });

    nodecg.listenFor('startCooldown', this.startCooldown);
    nodecg.listenFor('endCooldown', this.endCooldown);
    nodecg.listenFor('resetCooldown', this.resetCooldown);
}

Train.prototype.initializeOptions = function(options) {
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

Train.prototype.get = function() {
    var self = this;
    var deferred = Q.defer();
    db.findOne({ _id: 'train' }, function (err, train) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            train.elapsedTime = self.elapsedTime;
            train.remainingTime = self.remainingTime;
            deferred.resolve(train);
        }
    });
    return deferred.promise;
};

// Allows for setting any or all of the properties.
Train.prototype.set = function(args) {
    var self = this;
    var deferred = Q.defer();
    db.update({ _id: 'train' }, { $set: args }, { upsert: true }, function (err, numAdded) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            self.broadcast();
            deferred.resolve(numAdded);
        }
    });
    return deferred.promise;
};

Train.prototype.startCooldown = function () {
    this._killTimer(); // Kill any existing cooldown timer

    var self = this;
    this.get()
        .then(function(train) {
            self.elapsedTime = 0;
            self.remainingTime = train.duration;
            self._timer = setInterval(self.tickCooldown.bind(self), 1000);

            nodecg.sendMessage('cooldownStart', {
                elapsedTime: self.elapsedTime,
                remainingTime: self.remainingTime,
                duration: self.duration
            });
        });
};

Train.prototype.tickCooldown = function() {
    this.elapsedTime++;
    this.remainingTime--;

    if (this.remainingTime <= 0) {
        this.remainingTime = 0; // force to zero if we somehow went negative
        this.endCooldown();
    }

    nodecg.sendMessage('cooldownTick', {
        elapsedTime: this.elapsedTime,
        remainingTime: this.remainingTime
    });
};

Train.prototype.resetCooldown = function() {
    var self = this;
    this.get()
        .then(function(train) {
            self.elapsedTime = 0;
            self.remainingTime = train.duration;
            self.tickCooldown();
        });
};

Train.prototype.endCooldown = function() {
    this._killTimer();

    // Another hack to make sure all listeners register zero seconds remaining
    nodecg.sendMessage('cooldownTick', {
        elapsedTime: 0,
        remainingTime: 0
    });

    nodecg.sendMessage('cooldownEnd');

    this.set({ passengers: 0 });
};

Train.prototype._killTimer = function () {
    if (this._timer !== null) {
        clearInterval(this._timer);
        this._timer = null;
    }
    this.elapsedTime = 0;
    this.remainingTime = 0;
};

Train.prototype.addPassenger = function() {
    var self = this;
    var deferred = Q.defer();
    db.update({ _id: 'train' }, { $inc: { passengers: 1, dayTotal: 1 } }, { upsert: true }, function (err) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            // This is somewhat convoluted, but the idea is to start the cooldown (will automatically restart if necessary)
            // and then broadcast out all the new data, but then leverage the ".get" that .broadcast did and return that
            // so that we don't have to do another ".get"
            if (self.options.autoStartCooldown)
                self.startCooldown();

            self.broadcast()
                .then(function(train) {
                    deferred.resolve(train);
                });
        }
    });
    return deferred.promise;
};

Train.prototype.broadcast = function () {
    var self = this;
    var deferred = Q.defer();
    this.get()
        .then(function (train) {
            train.isHype = train.passengers >= train.threshold;
            if (train.isHype && self.options.resetAfterThreshold) {
                self.set({ passengers: 0 });
            }

            nodecg.sendMessage('trainBroadcast', train);
            deferred.resolve(train);
        })
        .fail(function() {
            console.err('[eol-hypetrain] failed to broadcast train update:', err);
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

module.exports = function(extensionApi) { new Train(extensionApi) };