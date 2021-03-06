'use strict';

const assert = require('assert');
const { ConsoleLogHandler, TestResultsStatus } = require('@applitools/eyes-sdk-core');
const { Eyes } = require('../index');

let /** @type {Eyes} */ eyes = null;
describe('Eyes.Images.JavaScript - find diffs between image', function () {
  this.timeout(5 * 60 * 1000);

  before(async function () {
    eyes = new Eyes();
    eyes.setLogHandler(new ConsoleLogHandler(true));
  });

  it('should be similar', async function () {
    const testName = `${this.test.title}_${Math.random().toString(36).substring(2, 12)}`;
    const image1 = `${__dirname}/resources/image1.png`;
    const image2 = `${__dirname}/resources/image2.png`;

    await eyes.open(this.test.parent.title, testName);
    await eyes.checkImage(image1);
    await eyes.close(false);

    await eyes.open(this.test.parent.title, testName);
    await eyes.checkImage(image2);
    const results = await eyes.close(false);

    assert.equal(results.getStatus(), TestResultsStatus.Unresolved);
  });

  afterEach(async function () {
    await eyes.abortIfNotClosed();
  });
});
