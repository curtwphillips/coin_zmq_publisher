/**
 * Receives blockchain data
 */
const zmq = require('zmq');
const log = require('./log');
const config = require('./config');
const publisher = require('./zmq_publisher');

// prepare coin and network data objects
exports.coins = {};
for (let coin in config.zmq.subscribe) {
  exports.coins[coin] = {};
  for (let network in config.zmq.subscribe[coin]) {
    exports.coins[coin][network] = {
      // Socket to listen for coin messages
      subscriber: zmq.socket('sub'),
      connection: config.zmq.subscribe[coin][network].connection + ':' + config.zmq.subscribe[coin][network].port,
      filter: config.zmq.subscribe[coin][network].filter || '', // Subscribe to filtered messages or '' for all
    };
    let cn = exports.coins[coin][network];
    cn.subscriber.subscribe(cn.filter);
    cn.subscriber.on('message', function (topic, msg) {
      let messageObj = {
        coin: coin,
        network: network,
        msg: msg,
      };
      publisher.emit(topic, messageObj);
    });
    // Handle monitor error
    cn.subscriber.on('monitor_error', function(err) {
      log.debug('Error in monitoring: %s, will restart monitoring in 5 seconds', err);
      setTimeout(function() { subscriber.monitor(500, 0); }, 5000);
    });
    cn.subscriber.on('connect', function(fd, ep) {log.debug('subscriber connect');});
    cn.subscriber.on('connect_delay', function(fd, ep) {log.debug('subscriber connect_delay');});
    cn.subscriber.on('connect_retry', function(fd, ep) {log.debug('subscriber connect_retry');});
    cn.subscriber.on('listen', function(fd, ep) {log.debug('subscriber listen');});
    cn.subscriber.on('bind_error', function(fd, ep) {log.debug('subscriber bind_error');});
    cn.subscriber.on('accept', function(fd, ep) {log.debug('subscriber accept');});
    cn.subscriber.on('accept_error', function(fd, ep) {log.debug('subscriber accept_error');});
    cn.subscriber.on('close', function(fd, ep) {log.debug('subscriber close');});
    cn.subscriber.on('close_error', function(fd, ep) {log.debug('subscriber close_error');});
    cn.subscriber.on('disconnect', function(fd, ep) {log.debug('subscriber disconnect');});
  }
}

exports.init = function () {
  for (let coin in exports.coins) {
    for (let network in exports.coins[coin]) {
      let cn = exports.coins[coin][network];
      cn.subscriber.connect(cn.connection);
      log.info(coin + ' ' + network + ' subscriber bound to ' + cn.connection);
    }
  }
}

exports.stop = function () {
  try {
    for (let coin in exports.coins) {
      for (let network in exports.coins[coin]) {
        let cn = exports.coins[coin][network];
        cn.subscriber.disconnect(config.zmq.subscribe[coin][network].connection);
      }
    }
  } catch (error) {
    // shutting down before the connection is made throws an error
  } finally {
    log.info('Subscriber disconnected');
  }
}

