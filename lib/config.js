// server configuration block
exports.server = {
  env: 'local',
  logLevel: 'debug',
};

// zmq configuration block
exports.zmq = {
  publish: {
    local1: { connection: 'tcp://127.0.0.1', port: 14301 },
    local2: { connection: 'tcp://127.0.0.1', port: 14302 },
    local3: { connection: 'tcp://127.0.0.1', port: 14303 },
  },
  subscribe: {
    bch: { livenet: { connection: 'tcp://127.0.0.1', port: 3373 }, testnet: { connection: 'tcp://127.0.0.1', port: 13373}, },
    btc: { livenet: { connection: 'tcp://127.0.0.1', port: 3371 }, testnet: { connection: 'tcp://127.0.0.1', port: 13371 }, },
    ltc: { livenet: { connection: 'tcp://127.0.0.1', port: 3372 }, testnet: { connection: 'tcp://127.0.0.1', port: 13372 }, },
  },
};

// common timer delays
exports.delays = {
  exit: 2000,
};
