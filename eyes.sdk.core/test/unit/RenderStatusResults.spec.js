'use strict';

const assert = require('assert');

const { RenderStatusResults } = require('../../index');

describe('RenderStatusResults', () => {
  it('constructor', () => {
    const results = new RenderStatusResults();
    assert.equal(results.hasOwnProperty('_status'), true);
    assert.equal(results.hasOwnProperty('_imageLocation'), true);
    assert.equal(results.hasOwnProperty('_error'), true);
    assert.equal(results.hasOwnProperty('_os'), true);
    assert.equal(results.hasOwnProperty('_userAgent'), true);
  });

  it('fromObject', () => {
    const status = 'some status';
    const error = 'some error';
    const imageLocation = 'some image location';
    const os = 'some os';
    const userAgent = 'some user agent';
    const results = RenderStatusResults.fromObject({
      status,
      error,
      imageLocation,
      os,
      userAgent
    });

    assert.equal(results.getStatus(), status);
    assert.equal(results.getError(), error);
    assert.equal(results.getImageLocation(), imageLocation);
    assert.equal(results.getOS(), os);
    assert.equal(results.getUserAgent(), userAgent);
  });

  it('toJSON', () => {
    const status = 'some status';
    const error = 'some error';
    const imageLocation = 'some image location';
    const os = 'some os';
    const userAgent = 'some user agent';
    const results = RenderStatusResults.fromObject({
      status,
      error,
      imageLocation,
      os,
      userAgent
    });

    assert.equal(JSON.stringify(results), '{"status":"some status","imageLocation":"some image location","error":"some error","os":"some os","userAgent":"some user agent"}');
  });

  it('toString', () => {
    const status = 'some status';
    const error = 'some error';
    const imageLocation = 'some image location';
    const os = 'some os';
    const userAgent = 'some user agent';
    const results = RenderStatusResults.fromObject({
      status,
      error,
      imageLocation,
      os,
      userAgent
    });

    assert.equal(results.toString(), 'RenderStatusResults { {"status":"some status","imageLocation":"some image location","error":"some error","os":"some os","userAgent":"some user agent"} }');
  })
})