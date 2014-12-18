#lfg-hypetrain
This is a [NodeCG](http://github.com/nodecg/nodecg) bundle.

This bundle manages the so-called "hype train" for subscriptions and/or donations.
It does not automatically listen for donations and subscriptions, but rather relies on some other bundle's extension to inform it of these events. This may change in the future.


## Installation
- Install to `nodecg/bundles/lfg-hypetrain`
- (OPTIONAL) Create `nodecg/cfg/lfg-hypetrain.json` to configure `lfg-hypetrain`

### Config Example
```json
{
    "autoStartCooldown": false,
    "resetAfterThreshold": false,
    "disableThresholdEditing": false
}
```

## Usage
lfg-hypetrain isn't very useful on its own. It is a helper bundle meant to be leveraged by other bundles.

### Messages sent
lfg-hypetrain broadcasts the following events that you can listen to in your bundle:
```javascript
nodecg.listenFor('cooldownStart', 'lfg-hypetrain', callback);
nodecg.listenFor('cooldownTick', 'lfg-hypetrain', callback); // ticks every second with the elapsedTime and remainingTime
nodecg.listenFor('cooldownEnd', 'lfg-hypetrain', callback);
```
... where `callback` is the name of a function with the signature `function callbackName(data)`

### Messages received
`lfg-hypetrain` can receive the following messages:
```javascript
nodecg.sendMessageToBundle('getPassengers', 'lfg-hypetrain', callback);
nodecg.sendMessageToBundle('getDayTotal', 'lfg-hypetrain', callback);
nodecg.sendMessageToBundle('startCooldown', 'lfg-hypetrain');
nodecg.sendMessageToBundle('endCooldown', 'lfg-hypetrain');
nodecg.sendMessageToBundle('resetCooldown', 'lfg-hypetrain');
```
... where `callback` is the name of a function with the signature `function callbackName(data)`

### Synced variables
lfg-hypetrain makes extensive use of synced variables, all of which your bundle can access, either to listen to
or modify directly.
```javascript
// The number of 'passengers' on the train
nodecg.declareSyncedVar({ variableName: 'passengers',
    bundleName: 'lfg-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// How many passengers there have been today
nodecg.declareSyncedVar({ variableName: 'dayTotal',
    bundleName: 'lfg-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// Number of passengers needed to engage 'hype' status
nodecg.declareSyncedVar({ variableName: 'threshold',
    bundleName: 'lfg-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// Duration of the cooldown
nodecg.declareSyncedVar({ variableName: 'duration',
    bundleName: 'lfg-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// How much time has elapsed in the cooldown
nodecg.declareSyncedVar({ variableName: 'elapsedTime',
    bundleName: 'lfg-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// How much time is left in the cooldown
nodecg.declareSyncedVar({ variableName: 'remainingTime',
    bundleName: 'lfg-hypetrain',
    setter: function(newVal) {
        // do work
    }
});

// Is the countdown currently active and ticking
nodecg.declareSyncedVar({ variableName: 'isCooldownActive',
    bundleName: 'lfg-hypetrain',
    setter: function(newVal) {
        // do work
    }
});
```

### Use in other bundles' extensions
To control the train, add code like the following to your bundle's extension:
```javascript
var train = nodecg.extensions['lfg-hypetrain'];
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

