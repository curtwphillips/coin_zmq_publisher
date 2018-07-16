/**
 * coin zmq publisher entry point.
 */
process.env.UV_THREADPOOL_SIZE = 128; // increase default request threads before accessing thread pool
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // allow SSL errors on requests
const config = require('./lib/config');
process.env.LOG_LEVEL = config.server.logLevel; // LOG_LEVEL for winston, it defaults to 'debug'
const log = require('./lib/log');
const zmq_publisher = require('./lib/zmq_publisher');
const zmq_subscriber = require('./lib/zmq_subscriber');

Error.stackTraceLimit = Infinity;

async function init() {
  try {
    zmq_publisher.init();
    zmq_subscriber.init();
    log.info(config.server.env + ' initialized');
  } catch (err) { log.error(err.stack); }
}

init();

async function shutDown () {
  try {
    // ensure exit within a few seconds
    setTimeout(function () { exitProcess(); }, 5000);
    config.server.shuttingDown = true;
    // stop emitting messages
    zmq_publisher.stop();
    // stop receiving messages about blocks and txs
    zmq_subscriber.stop();
    // give processes an extra moment to complete
    setTimeout(function () {
      exitProcess();
    }, config.delays.exit);
  } catch (err) { log.error(err.stack); }
}

function exitProcess () { process.exit(); }

process.on('SIGTERM', function () { shutDown(); });
process.on('SIGINT',  function () { shutDown(); });

process.on('unhandledRejection', (err, promise) => {
  log.error('Unhandled Rejection at: Promise', promise, 'err:', err);
  log.info(err.stack);
});
