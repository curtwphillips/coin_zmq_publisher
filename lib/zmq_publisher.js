/**
 * Publishes coin zmq messages to api servers
 */
const log = require('./log');
const config = require('./config');
const zmq = require('zmq');

// sends data to api
var publishers = {}; // zmq.socket('pub');
logged = {}; // tracked logged messages to help show if some message types aren't coming through

for (let host in config.zmq.publish) {
  publishers[host] = zmq.socket('pub');
}

// connect each configured connection
exports.init = function (increment, host) {
  try {
    increment = increment || 0;
    if (host) {
      try {
        if (config.server.env === 'local') {
          // we can't bind to the same port on localhost
          config.zmq.publish[host].port += increment;
        }
        publishers[host].bindSync(config.zmq.publish[host].connection + ':' + config.zmq.publish[host].port);
        log.info(host + ' publisher connected to: ' + JSON.stringify(config.zmq.publish[host]));
        return;
      } catch (err) {
        if (err.message === 'Address already in use') {
          exports.init(1, host);
        } else {
          log.error(err.stack);
        }
      }
      return;
    }
    for (let host in publishers) {
      try {
        publishers[host].bindSync(config.zmq.publish[host].connection + ':' + config.zmq.publish[host].port);
        log.info(host + ' publisher connected to: ' + JSON.stringify(config.zmq.publish[host]));
      } catch (err) {
        if (err.message === 'Address already in use') {
          exports.init(1, host);
        } else {
          log.error(err.stack);
        }
      }
    }
  } catch (err) {
    log.error(err.stack);
  }
}

// send data to all subscribers
exports.emit = function (topic, message) {
  try {
    topic = topic || 'cryptogateway coin_zmq_broadcaster';
    for (let host in config.zmq.publish) {
      publishers[host].send([topic, JSON.stringify(message)]); // send array of multiple frames, first frame is topic for subscriber filtering
    }
    let logmsg = message.coin + ' ' + message.network + ' ' + topic;
    if (!logged[logmsg]) { // log a specific coin network topic combination only once
      logged[logmsg] = true;
      log.debug(message.coin + ' ' + message.network + ' ' + topic);
    }
  } catch (error) {
    log.error(error);
  }
}

// disconnect each configured connection
exports.disconnect = function (publisher) {
  for (let host in config.zmq.publish) {
    publishers[host].disconnect(config.zmq.publish[host]);
  }
}

// stop all publishing
exports.stop = function () {
  try {
    for (let host in publishers) {
      exports.disconnect(publishers[host]);
    }
  } catch (err) {
    // shutting down before the connection is made throws an error
  } finally {
    log.info('Publisher disconnected');
  }
}

