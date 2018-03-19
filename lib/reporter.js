const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const inherits = require('util').inherits;
const uuidV4 = require('uuid').v4;

function Reporter(baseReporter, config, options) {
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
  let currentSuite = null;

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

  this.on('suite:start', (suite) => {
    if (suite.title) {
      const id = uuidV4();
      suite.id = id;
      const newSuite = {
        parentId: null,
        id,
        title: suite.title,
        tests: [],
      };
      if (hierarchyMode) {
        newSuite.suites = [];
        if (currentSuite) {
          newSuite.parentId = currentSuite.id;
          currentSuite.suites.push(newSuite);
        } else {
          suites.push(newSuite);
        }
      } else {
        suites.push(newSuite);
      }
      currentSuite = newSuite;
    }
  });

  this.on('suite:end', (suite) => {
    if (hierarchyMode) {
      currentSuite = suites.find((s) => s.id === suite.parentId);
    }
  });

  this.on('test:pass', (test) => {
    passes.push(test);
    currentSuite.tests.push(passTest(test));
  });

  this.on('test:fail', (test) => {
    failures.push(test);
    currentSuite.tests.push(failTest(test));
  });

  this.on('test:pending', (test) => {
    pending.push(test);
    currentSuite.tests.push(formatTest(test));
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
  delete suite.parentId;
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
