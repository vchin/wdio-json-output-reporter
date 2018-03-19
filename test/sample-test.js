const assert = require('assert');

describe('test suite', () => {

  it('test', () => null);
  it.skip('skipped test', () => null);
  it('failing test', () => assert.ok(false));

  describe('nested suite', () => {
    it('nested test', () => null);
    it('nested failing test', () => assert.ok(false));
  });
});
