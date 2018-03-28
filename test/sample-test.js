const assert = require('assert');

describe('file1', () => {

  it('f1 - test', () => null);
  it.skip('f1 - skipped test', () => null);
  it('f1 - failing test', () => assert.ok(false));

  describe('f1 - nested suite', () => {
    it('f1 - nested test', () => null);
    it('f1 - nested failing test', () => assert.ok(false));
  });

  describe('f1 - nested suite 2', () => {
    it('f1 - nested test2', () => null);
  });
});
