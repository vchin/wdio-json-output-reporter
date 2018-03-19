const Reporter = require('./lib/reporter');

exports.config = {
  specs: [
    'test/sample-test.js'
  ],
  capabilities: [{
    browserName: 'chrome',
    chromeOptions: {
      args: [
        '--headless',
        '--disable-gpu'
      ]
    }
  }],
  services: ['selenium-standalone'],
  sync: true,
  framework: 'mocha',
  reporters: ['spec', Reporter],
  reporterOptions: {
    outputDir: './',
    fileName: 'wdio-output.json',
    hierarchy: true
  }
};
