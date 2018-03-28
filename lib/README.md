# wdio-json-output-reporter
outputs json file after wdio test run

similar format as [mocha-spec-json-output-reporter](https://github.com/vchin/mocha-spec-json-output-reporter)

## Usage
in wdio.conf.js file

```
const Reporter = require('wdio-json-output-reporter');
```

add reporter to reporters:
```
exports.config = {
  reporters: [Reporter]
};
```

### Options
specify output fileName & hierarchy mode (nested describe blocks are considered suite inside a suite)
```
exports.config = {
  reporterOptions: {
    fileName: '<fileName>',
    filePath: '<filePath>',
    hierarchy: true
  }
};
```
