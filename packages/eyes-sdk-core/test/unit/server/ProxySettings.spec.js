'use strict';

const assert = require('assert');

const { ProxySettings } = require('../../../index');

describe('ProxySettings', () => {
  it('should parse url with host and port', () => {
    const proxy = new ProxySettings('http://localhost:1234/');
    const proxyObject = proxy.toProxyObject();
    assert.equal(proxyObject.host, 'localhost');
    assert.equal(proxyObject.port, 1234);
  });

  it('should parse url with host, port and use auth from constructor', () => {
    const proxy = new ProxySettings('http://localhost:1234/', 'admin', '1111');
    const proxyObject = proxy.toProxyObject();
    assert.equal(proxyObject.host, 'localhost');
    assert.equal(proxyObject.port, 1234);
    assert.equal(proxyObject.auth.username, 'admin');
    assert.equal(proxyObject.auth.password, '1111');
  });

  it('should parse url with host, port and auth', () => {
    const proxy = new ProxySettings('http://username:password@localhost:1234/');
    const proxyObject = proxy.toProxyObject();
    assert.equal(proxyObject.host, 'localhost');
    assert.equal(proxyObject.port, 1234);
    assert.equal(proxyObject.auth.username, 'username');
    assert.equal(proxyObject.auth.password, 'password');
  });
});
