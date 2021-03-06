'use strict';

const { WebElement } = require('selenium-webdriver');
const { TypeUtils, CheckSettings, Region } = require('@applitools/eyes-sdk-core');

const { IgnoreRegionBySelector } = require('./IgnoreRegionBySelector');
const { IgnoreRegionByElement } = require('./IgnoreRegionByElement');
const { FloatingRegionBySelector } = require('./FloatingRegionBySelector');
const { FloatingRegionByElement } = require('./FloatingRegionByElement');
const { FrameLocator } = require('./FrameLocator');
const { EyesWebElement } = require('../wrappers/EyesWebElement');

class SeleniumCheckSettings extends CheckSettings {
  /**
   * @param {Region|RegionObject|By|WebElement|EyesWebElement} [region]
   * @param {number|string|By|WebElement|EyesWebElement} [frame]
   */
  constructor(region, frame) {
    super();

    this._targetSelector = null;
    this._targetElement = null;
    this._frameChain = [];

    if (region) {
      this.region(region);
    }

    if (frame) {
      this.frame(frame);
    }
  }

  /**
   * @return {By}
   */
  getTargetSelector() {
    return this._targetSelector;
  }

  /**
   * @return {WebElement}
   */
  getTargetElement() {
    return this._targetElement;
  }

  /**
   * @return {FrameLocator[]}
   */
  getFrameChain() {
    return this._frameChain;
  }

  /** @inheritDoc */
  layout() {
    super.layout();
    return this;
  }

  /** @inheritDoc */
  exact() {
    super.exact();
    return this;
  }

  /** @inheritDoc */
  strict() {
    super.strict();
    return this;
  }

  /** @inheritDoc */
  content() {
    super.content();
    return this;
  }

  /** @inheritDoc */
  matchLevel(matchLevel) {
    super.matchLevel(matchLevel);
    return this;
  }

  /** @inheritDoc */
  ignoreCaret(ignoreCaret) {
    super.ignoreCaret(ignoreCaret);
    return this;
  }

  /** @inheritDoc */
  fully(fully) {
    super.fully(fully);
    return this;
  }

  /** @inheritDoc */
  stitchContent(stitchContent) {
    super.stitchContent(stitchContent);
    return this;
  }

  /** @inheritDoc */
  timeout(timeoutMilliseconds) {
    super.timeout(timeoutMilliseconds);
    return this;
  }

  /**
   * @param {number|string|By|WebElement|EyesWebElement} frame The frame to switch to.
   * @return {this}
   */
  frame(frame) {
    const fl = new FrameLocator();
    // noinspection IfStatementWithTooManyBranchesJS
    if (TypeUtils.isInteger(frame)) {
      fl.setFrameIndex(frame);
    } else if (TypeUtils.isString(frame)) {
      fl.setFrameNameOrId(frame);
    } else if (EyesWebElement.isLocator(frame)) {
      fl.setFrameSelector(frame);
    } else if (frame instanceof WebElement) {
      fl.setFrameElement(frame);
    } else {
      throw new TypeError('frame method called with argument of unknown type!');
    }
    this._frameChain.push(fl);
    return this;
  }

  /**
   * @param {Region|RegionObject|By|WebElement|EyesWebElement} region The region to validate.
   * @return {this}
   */
  region(region) {
    // noinspection IfStatementWithTooManyBranchesJS
    if (Region.isRegionCompatible(region)) {
      super.updateTargetRegion(region);
    } else if (EyesWebElement.isLocator(region)) {
      this._targetSelector = region;
    } else if (region instanceof WebElement) {
      this._targetElement = region;
    } else {
      throw new TypeError('region method called with argument of unknown type!');
    }
    return this;
  }

  // noinspection JSMethodCanBeStatic
  /**
   * @inheritDoc
   * @protected
   * @param {By|WebElement|EyesWebElement|GetRegion|Region} region
   */
  _regionToRegionProvider(region) {
    if (EyesWebElement.isLocator(region)) {
      return new IgnoreRegionBySelector(region);
    }

    if (region instanceof WebElement) {
      return new IgnoreRegionByElement(region);
    }

    return super._regionToRegionProvider(region);
  }

  /**
   * @inheritDoc
   * @param {(By|WebElement|EyesWebElement|GetRegion|Region)...} regions A region to ignore when validating.
   */
  ignoreRegions(...regions) {
    // noinspection JSValidateTypes
    return super.ignoreRegions(...regions);
  }

  /**
   * @inheritDoc
   * @param {(By|WebElement|EyesWebElement|GetRegion|Region)...} regions A region to match using the Layout method.
   */
  layoutRegions(...regions) {
    // noinspection JSValidateTypes
    return super.layoutRegions(...regions);
  }

  /**
   * @inheritDoc
   * @param {(By|WebElement|EyesWebElement|GetRegion|Region)...} regions A region to match using the Strict method.
   */
  strictRegions(...regions) {
    // noinspection JSValidateTypes
    return super.strictRegions(...regions);
  }

  /**
   * @inheritDoc
   * @param {(By|WebElement|EyesWebElement|GetRegion|Region)...} regions A region to match using the Content method.
   */
  contentRegions(...regions) {
    // noinspection JSValidateTypes
    return super.contentRegions(...regions);
  }

  // noinspection JSCheckFunctionSignatures
  /**
   * @inheritDoc
   * @param {GetFloatingRegion|Region|FloatingMatchSettings|By|WebElement|EyesWebElement} regionOrContainer The content
   *   rectangle or region container
   * @param {number} [maxUpOffset] How much the content can move up.
   * @param {number} [maxDownOffset] How much the content can move down.
   * @param {number} [maxLeftOffset] How much the content can move to the left.
   * @param {number} [maxRightOffset] How much the content can move to the right.
   */
  floatingRegion(regionOrContainer, maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset) {
    if (EyesWebElement.isLocator(regionOrContainer)) {
      const floatingRegion = new FloatingRegionBySelector(
        regionOrContainer,
        maxUpOffset,
        maxDownOffset,
        maxLeftOffset,
        maxRightOffset
      );
      this._floatingRegions.push(floatingRegion);
    } else if (regionOrContainer instanceof WebElement) {
      const floatingRegion = new FloatingRegionByElement(
        regionOrContainer,
        maxUpOffset,
        maxDownOffset,
        maxLeftOffset,
        maxRightOffset
      );
      this._floatingRegions.push(floatingRegion);
    } else {
      super.floatingRegion(regionOrContainer, maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset);
    }
    return this;
  }

  // noinspection JSCheckFunctionSignatures
  /**
   * @inheritDoc
   * @param {number} maxOffset How much each of the content rectangles can move in any direction.
   * @param {(GetFloatingRegion|Region|By|WebElement|EyesWebElement)...} regionsOrContainers One or more content
   *   rectangles or region containers
   */
  floatingRegions(maxOffset, ...regionsOrContainers) {
    return super.floatingRegions(maxOffset, ...regionsOrContainers);
  }
}

exports.SeleniumCheckSettings = SeleniumCheckSettings;
