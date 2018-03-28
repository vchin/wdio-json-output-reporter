const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const inherits = require('util').inherits;

function Reporter(baseReporter, config, options) {
  const suitesFlatView = [];
  const suites = [];
  const pending = [];
  const failures = [];
  const passes = [];

  const date = moment().format('YYYYMMDDHHmmss');
  const defaultFileName = `wdio-output-${date}.json`;
  const defaultFilePath = process.cwd();

  let fileName = defaultFileName;
  let filePath = path.join(defaultFilePath, fileName);
  let hierarchyMode = false;

  if (options) {
    if (options.fileName) {
      fileName = options.fileName;
      filePath = path.join(defaultFilePath, fileName);
    }
    if (options.filePath) {
      filePath = path.join(options.filePath, fileName);
    }
    if (options.hierarchy) {
      hierarchyMode =
        options.hierarchy === 'true' || options.hierarchy === true;
    }
  }

  const addSuite = (id, title) => {
    let suite = suitesFlatView.find((s) => s.id === id);
    if (!suite) {
      suite = {
        id,
        title,
        tests: [],
      };
      suitesFlatView.push(suite);
    }
    if (hierarchyMode) {
      suite.suites = [];
    }
    return suite;
  };

  this.on('suite:start', (suite) => {
    if (suite.title) {
      const newSuite = addSuite(suite.uid, suite.title);
      if (hierarchyMode) {
        // wdio reports spec file as own suite
        if (suite.title === suite.parent) {
          newSuite.specHash = suite.specHash;
          suites.push(newSuite);
        } else {
          // bug in wdio reporter doesnt actually list
          // parentUid as parent describe block
          // instead use the specHash for parents
          const parentSuite = suitesFlatView.find(
            (s) => s.specHash === suite.specHash);
          parentSuite.suites.push(newSuite);
        }
      } else {
        suites.push(newSuite);
      }
    }
  });

  this.on('test:pass', (test) => {
    passes.push(test);
    const suite = suitesFlatView.find((s) => s.id === test.parentUid);
    suite.tests.push(passTest(test));
  });

  this.on('test:fail', (test) => {
    failures.push(test);
    const suite = suitesFlatView.find((s) => s.id === test.parentUid);
    suite.tests.push(failTest(test));
  });

  this.on('test:pending', (test) => {
    pending.push(test);
    const suite = suitesFlatView.find((s) => s.id === test.parentUid);
    suite.tests.push(formatTest(test));
  });

  this.once('end', () => {
    const cleanedSuites = suites.map(removeIds);
    const obj = {
      stats: Object.assign(
        baseReporter.stats.counts,
        {start: baseReporter.stats.start},
        {end: baseReporter.stats.end},
        {duration: baseReporter.stats._duration}
      ),
      suites: cleanedSuites,
      pending: pending.map(formatTest),
      failures: failures.map(formatTest),
      passes: passes.map(formatTest),
    };

    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
  });
};

const removeIds = (suite) => {
  delete suite.id;
  if (suite.suites && suite.suites.length > 0) {
    suite.suites.map(removeIds);
  }
  return suite;
};

const getTestResult = (test) => {
  if (test.state) {
    return test.state;
  }
  if (test.pending === true) {
    return 'pending';
  }
  return 'unknown';
};

const formatTest = (test) => ({
  title: test.title,
  duration: test.duration,
  result: getTestResult(test),
  err: errorJSON(test.err || {}),
});

const passTest = (test) => {
  test.state = 'passed';
  return formatTest(test);
};

const failTest = (test) => {
  test.state = 'failed';
  return formatTest(test);
};

const errorJSON = (err) => {
  const res = {};
  Object.getOwnPropertyNames(err).forEach((key) => {
    res[key] = err[key];
  }, err);
  return res;
};

Reporter.reporterName = 'wdio-json-output';

inherits(Reporter, EventEmitter);

exports = module.exports = Reporter;
