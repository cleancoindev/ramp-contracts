const BN = web3.utils.BN;

const expect = require('chai')
  .use(require('bn-chai')(BN))
  .expect;

module.exports.expect = expect;

module.exports.address0x = '0x0000000000000000000000000000000000000000';

module.exports.bn = (number) => {
  return web3.utils.toBN(number);
};

module.exports.toETH = (amount = 1) => {
  return this.bn(web3.utils.toWei(amount.toString()));
};

module.exports.toBytes32 = (source) => {
  source = web3.utils.toHex(source);
  const rl = 64;
  source = source.toString().replace('0x', '');
  if (source.length < rl) {
    const diff = 64 - source.length;
    source = '0'.repeat(diff) + source;
  }
  return '0x' + source;
};

module.exports.getBlockTime = async () => {
  const block = await web3.eth.getBlock(await web3.eth.getBlockNumber());
  return block.timestamp;
};

module.exports.toEvents = async (tx, ...events) => {
  if (tx instanceof Promise) {
    tx = await tx;
  }

  const logs = tx.logs;

  let eventObjs = [].concat.apply(
    [],
    events.map(
      event => logs.filter(
        log => log.event === event,
      ),
    ),
  );

  if (eventObjs.length === 0 || eventObjs.some(x => x === undefined)) {
    console.log('\t\u001b[91m\u001b[2m\u001b[1mError: The event dont find');
    assert.fail();
  }
  eventObjs = eventObjs.map(x => x.args);
  return (eventObjs.length === 1) ? eventObjs[0] : eventObjs;
};

// the promiseFunction should be a function
module.exports.tryCatchRevert = async (promise, message, headMsg = 'revert ') => {
  if (message === '') {
    headMsg = headMsg.slice(0, -1);
    console.log('    \u001b[93m\u001b[2m\u001b[1m⬐ Warning:\u001b[0m\u001b[30m\u001b[1m There is an empty revert/require message');
  }

  try {
    if (promise instanceof Function) {
      await promise();
    } else {
      await promise;
    }
  } catch (error) {
    assert(
      error.message.search(headMsg + message) >= 0 || process.env.SOLIDITY_COVERAGE,
      'Expected a revert \'' + headMsg + message + '\', got \'' + error.message + '\' instead',
    );
    return;
  }
  throw new Error('Expected throw not received');
};
