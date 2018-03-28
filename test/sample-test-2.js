const assert = require('assert');

describe('file2', () => {

  it('f2 - test', () => null);
  it.skip('f2 - skipped test', () => null);
  it('f2 - failing test', () => assert.ok(false));

  describe('f2 - nested suite', () => {
    it('f2 - nested test', () => null);
    it('f2 - nested failing test', () => assert.ok(false));
  });

  describe('f2 - nested suite 2', () => {
    it('f2 - nested test2', () => null);
  });
});
