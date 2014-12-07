#eol-hypetrain
This is a [NodeCG](http://github.com/nodecg/nodecg) bundle.

This bundle manages the so-called "hype train" for subscriptions and/or donations.
It does not automatically listen for donations and subscriptions, but rather relies on some other bundle's extension to inform it of these events. This may change in the future.


## Installation
- Install to `nodecg/bundles/eol-hypetrain`
- (OPTIONAL) Create `nodecg/cfg/eol-hypetrain.json` to configure `eol-hypetrain`

### Config Example
```
#!json
{
    "autoStartCooldown": false,
    "resetAfterThreshold": false,
    "disableThresholdEditing": false
}
```

## Usage
eol-hypetrain isn't very useful on its own. It is a helper bundle meant to be leveraged by other bundles.

### Messages sent
eol-hypetrain broadcasts the following events that you can listen to in your bundle:
```
#!javascript
nodecg.listenFor('cooldownStart', 'eol-hypetrain', callback);
nodecg.listenFor('cooldownTick', 'eol-hypetrain', callback); // ticks every second with the elapsedTime and remainingTime
nodecg.listenFor('cooldownEnd', 'eol-hypetrain', callback);
```
... where `callback` is the name of a function with the signature `function callbackName(data)`

### Messages received
`eol-hypetrain` can receive the following messages:
```
#!javascript
nodecg.sendMessageToBundle('getPassengers', 'eol-hypetrain', callback);
nodecg.sendMessageToBundle('getDayTotal', 'eol-hypetrain', callback);
nodecg.sendMessageToBundle('startCooldown', 'eol-hypetrain');
nodecg.sendMessageToBundle('endCooldown', 'eol-hypetrain');
nodecg.sendMessageToBundle('resetCooldown', 'eol-hypetrain');
```
... where `callback` is the name of a function with the signature `function callbackName(data)`

### Synced variables
eol-hypetrain makes extensive use of synced variables, all of which your bundle can access, either to listen to
or modify directly.
```
#!javascript
// The number of 'passengers' on the train
nodecg.declareSyncedVar({ variableName: 'passengers',
    bundleName: 'eol-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// How many passengers there have been today
nodecg.declareSyncedVar({ variableName: 'dayTotal',
    bundleName: 'eol-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// Number of passengers needed to engage 'hype' status
nodecg.declareSyncedVar({ variableName: 'threshold',
    bundleName: 'eol-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// Duration of the cooldown
nodecg.declareSyncedVar({ variableName: 'duration',
    bundleName: 'eol-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// How much time has elapsed in the cooldown
nodecg.declareSyncedVar({ variableName: 'elapsedTime',
    bundleName: 'eol-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// How much time is left in the cooldown
nodecg.declareSyncedVar({ variableName: 'remainingTime',
    bundleName: 'eol-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// Is the countdown currently active and ticking
nodecg.declareSyncedVar({ variableName: 'isCooldownActive',
    bundleName: 'eol-hypetrain',
    setter: function(newVal) {
        // do work
    }
});
```

### Use in other bundles' extensions
To control the train, add code like the following to your bundle's extension:
```
#!javascript
var train = nodecg.extensions['eol-hypetrain'];
var sublistener = nodecg.extensions['eol-sublistener'];

sublistener.on('subscription', function subscription(data) {
    // train.addPassenger increments the passenger count and returns the current state of the train
    subscription.train = train.addPassenger();
    nodecg.sendMessage('subscription', subscription);

    // You can also control the cooldown directly
    // train.startCooldown();
    // train.resetCooldown();
    // train.endCooldown();

    // All events/synced variables listed above can be used here
});
```

