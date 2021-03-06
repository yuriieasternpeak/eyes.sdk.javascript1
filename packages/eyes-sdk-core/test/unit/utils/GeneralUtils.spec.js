'use strict';

const assert = require('assert');

const { GeneralUtils, RenderInfo, EyesError } = require('../../../index');

describe('GeneralUtils', () => {
  describe('urlConcat()', () => {
    it('should return / when the values are empty', () => {
      assert.equal(GeneralUtils.urlConcat('', ''), '/');
    });
    it('should return the correct Url when both parts don\'t start/end with a "/"', () => {
      const left = 'http://www.applitools.com';
      const right = 'subdomain/index.html';
      assert.equal(GeneralUtils.urlConcat(left, right), `${left}/${right}`);
    });
    it('should return the correct Url when only left part ends with a "/"', () => {
      const left = 'http://www.applitools.com/';
      const right = 'subdomain/index.html';
      assert.equal(GeneralUtils.urlConcat(left, right), left + right);
    });
    it('should return the correct Url when only right part starts with a "/"', () => {
      const left = 'http://www.applitools.com';
      const right = '/subdomain/index.html';
      assert.equal(GeneralUtils.urlConcat(left, right), left + right);
    });
    it('should return the correct Url when both parts start/end with a "/"', () => {
      const left = 'http://www.applitools.com';
      const right = '/subdomain/index.html';
      assert.equal(GeneralUtils.urlConcat(`${left}/`, right), left + right);
    });
    it('should return the correct Url when given multiple suffixes', () => {
      assert.equal(GeneralUtils.urlConcat('http://www.applitools.com/', '/subdomain/', '/index.html'), 'http://www.applitools.com/subdomain/index.html');
    });
    it('should return the correct Url when given multiple suffixes and query params', () => {
      assert.equal(GeneralUtils.urlConcat('http://www.applitools.com/', '/subdomain/', '?param=1'), 'http://www.applitools.com/subdomain?param=1');
    });
    it('concatenate suffixes without slashes', () => {
      assert.equal(GeneralUtils.urlConcat('http://www.applitools.com/', 'api', '/sessions/', 1233, 'create'), 'http://www.applitools.com/api/sessions/1233/create');
    });
  });

  describe('isAbsoluteUrl()', () => {
    it('should detect this urls as absolute', () => {
      assert.ok(GeneralUtils.isAbsoluteUrl('http://applitools.com'));
      assert.ok(GeneralUtils.isAbsoluteUrl('https://applitools.com'));
      assert.ok(GeneralUtils.isAbsoluteUrl('file://applitools.com'));
      assert.ok(GeneralUtils.isAbsoluteUrl('mailto:someone@applitools.com'));
      assert.ok(GeneralUtils.isAbsoluteUrl('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'));
    });

    it('should detect this urls as relative', () => {
      assert.ok(!GeneralUtils.isAbsoluteUrl('//applitools.com'));
      assert.ok(!GeneralUtils.isAbsoluteUrl('/foo/bar'));
      assert.ok(!GeneralUtils.isAbsoluteUrl('foo/bar'));
      assert.ok(!GeneralUtils.isAbsoluteUrl('foo'));
    });
  });

  describe('toISO8601DateTime()', () => {
    it('should return formatted string', () => {
      // noinspection MagicNumberJS
      const date = new Date(1520616682000);
      assert.equal(GeneralUtils.toISO8601DateTime(date), '2018-03-09T17:31:22Z');
    });
  });

  describe('toRfc1123DateTime()', () => {
    it('should return formatted string', () => {
      // noinspection MagicNumberJS
      const date = new Date(1520616682000);
      assert.equal(GeneralUtils.toRfc1123DateTime(date), 'Fri, 09 Mar 2018 17:31:22 GMT');
    });
  });

  describe('toLogFileDateTime()', () => {
    it('should return formatted string', () => {
      // noinspection MagicNumberJS
      const date = new Date(1520616682332);
      assert.equal(GeneralUtils.toLogFileDateTime(date), '2018_03_09_18_31_22_332');
    });
  });

  describe('fromISO8601DateTime()', () => {
    it('should return formatted string', () => {
      const input = '2018-03-09T17:31:22Z';
      // noinspection MagicNumberJS
      assert.equal(GeneralUtils.fromISO8601DateTime(input)
        .getTime(), 1520616682000);
    });
  });

  describe('jwtDecode()', () => {
    it('decoded should be equal with original', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
      const decoded = GeneralUtils.jwtDecode(token);

      assert.equal(decoded.admin, true);
      assert.equal(decoded.name, 'John Doe');
      assert.equal(decoded.sub, '1234567890');
    });
  });

  describe('stringify()', () => {
    it('should return the same args for non-objects', () => {
      assert.equal(GeneralUtils.stringify(4), 4);
      assert.equal(GeneralUtils.stringify('str'), 'str');
    });

    it('should call JSON.stringify for plain objects', () => {
      assert.equal(GeneralUtils.stringify({ prop: 'value' }), JSON.stringify({ prop: 'value' }));
    });

    it('should return the stack for errors', () => {
      const pattern = RegExp(/^Error: bla(\n\s+at [^\n]+)+$/);
      assert.ok(pattern.test(GeneralUtils.stringify(new Error('bla'))));
    });

    it('should return the stack for errors (custom error)', () => {
      const pattern = RegExp(/^EyesError: tra(\n\s+at [^\n]+)+$/);
      assert.ok(pattern.test(GeneralUtils.stringify(new EyesError('tra'))));
    });

    it('should call toString on non-plain objects', () => {
      assert.equal(
        GeneralUtils.stringify(new RenderInfo({ width: 3, height: 4, sizeMode: 'bla' })),
        'RenderInfo { {"width":3,"height":4,"sizeMode":"bla"} }'
      );
    });

    it('should return stringified function', () => {
      // eslint-disable-next-line
      assert.equal(GeneralUtils.stringify(() => { return 'bla'; }), '() => { return \'bla\'; }');
    });

    it('should concat multiple arguments', () => {
      assert.equal(GeneralUtils.stringify(4, 'str', { prop: 'bla' }), '4 str {"prop":"bla"}');
    });
  });

  describe('cartesianProduct()', () => {
    it('should return product of collections', () => {
      const dataProvider = GeneralUtils.cartesianProduct(
        'Google Pixel GoogleAPI Emulator',
        ['portrait', 'landscape'],
        '7.1',
        [false, true]
      );

      assert.deepStrictEqual(dataProvider, [
        ['Google Pixel GoogleAPI Emulator', 'portrait', '7.1', false],
        ['Google Pixel GoogleAPI Emulator', 'portrait', '7.1', true],
        ['Google Pixel GoogleAPI Emulator', 'landscape', '7.1', false],
        ['Google Pixel GoogleAPI Emulator', 'landscape', '7.1', true],
      ]);
    });
  });
});
