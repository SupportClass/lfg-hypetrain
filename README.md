#eol-hypetrain

This bundle manages the so-called "hype train" for subscriptions and/or donations.
It does not automatically listen for donations and subscriptions, but rather relies on some other bundle's extension to inform it of these events. This may change in the future.


## Installation

- Install to `nodecg/bundles/eol-hypetrain`
- (OPTIONAL) Create `config.json` in `nodecg/bundles/eol-hypetrain`

### Config Example
:::json
{
    "autoStartCooldown": false;
    "resetAfterThreshold": false;
}
:::

## Usage

### Messages sent
If you would like to use this data in another bundle, listen to the following events in your view/panel:
:::javascript
nodecg.listenFor('cooldownStart', 'eol-hypetrain', callback);
nodecg.listenFor('cooldownTick', 'eol-hypetrain', callback);
nodecg.listenFor('cooldownEnd', 'eol-hypetrain', callback);
nodecg.listenFor('trainBroadcast', 'eol-hypetrain', callback);
:::
... where 'callback' is the name of a function with the signature `function callback(data)`

### Messages received
`eol-hypetrain` can receive the following messages:
:::javascript
nodecg._socket.emit('message', { bundleName: 'eol-hypetrain', messageName: 'getTrain' }, callback);
nodecg._socket.emit('message', { bundleName: 'eol-hypetrain', messageName: 'setTrain', content: data }[, callback]);
nodecg._socket.emit('message', { bundleName: 'eol-hypetrain', messageName: 'startCooldown' });
nodecg._socket.emit('message', { bundleName: 'eol-hypetrain', messageName: 'endCooldown' });
nodecg._socket.emit('message', { bundleName: 'eol-hypetrain', messageName: 'resetCooldown' });
:::
... where 'callback' is the name of a function with the signature `function callback(data)`

### Use in other bundles' extensions
To control the train, add code like the following to your bundle's extension:
:::javascript
var train = require('../eol-hypetrain');
var sublistener = require('../eol-sublistener');

sublistener.on('subscriber', function(data) {
    // increments the train by one THEN sends out the socket message with the sub train data
    train.addPassenger()
        .then(function(traindata) {
            subscriber.train = traindata;
            // Notify all bundles of the new subscriber
            io.sockets.json.send({
                bundleName: 'my-bundle',
                messageName: 'subscriber',
                content: subscriber
            });
        });
});
:::

