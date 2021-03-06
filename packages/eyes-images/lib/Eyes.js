'use strict';

const {
  ArgumentGuard,
  TypeUtils,
  EyesBase,
  EyesError,
  ImageUtils,
  RegionProvider,
  MutableImage,
  RectangleSize,
  NullRegionProvider,
  EyesSimpleScreenshot,
} = require('@applitools/eyes-sdk-core');

const { Target } = require('./fluent/Target');
const VERSION = require('../package.json').version;

/**
 * The main type - to be used by the users of the library to access all functionality.
 */
class Eyes extends EyesBase {
  /**
   * Initializes an Eyes instance.
   *
   * @param {string} [serverUrl=EyesBase.getDefaultServerUrl()] The Eyes server URL.
   * @param {?boolean} [isDisabled=false] Will be checked <b>before</b> any argument validation. If true, all method
   *   will immediately return without performing any action.
   */
  constructor(serverUrl, isDisabled) {
    super(serverUrl, isDisabled);

    this._title = null;
    this._screenshot = null;
    this._screenshotUrl = null;
    this._inferred = '';
  }

  /** @override */
  getBaseAgentId() {
    return `eyes-images/${VERSION}`;
  }

  /**
   * Starts a test.
   *
   * @param {string} appName The application being tested.
   * @param {string} testName The test's name.
   * @param {RectangleSize} [imageSize] Determines the resolution used for the baseline. {@code null} will
   *   automatically grab the resolution from the image.
   * @return {Promise<void>}
   */
  open(appName, testName, imageSize) {
    return super.openBase(appName, testName, imageSize);
  }

  /**
   * @param {string} name
   * @param {ImagesCheckSettings|CheckSettings} checkSettings
   * @return {Promise<boolean>}
   */
  async check(name, checkSettings) {
    ArgumentGuard.notNull(checkSettings, 'checkSettings');

    if (this.getIsDisabled()) {
      this._logger.verbose(`check('${name}', checkSettings): Ignored`);
      return false;
    }

    return this._checkImage(name, false, checkSettings);
  }

  /**
   * Perform visual validation for the current image.
   *
   * @param {string|Buffer|MutableImage} image The image path, base64 string, image buffer or MutableImage.
   * @param {string} [name] Tag to be associated with the validation checkpoint.
   * @param {boolean} [ignoreMismatch] True if the server should ignore a negative result for the visual validation.
   * @param {number} [retryTimeout] timeout for performing the match (ms).
   * @return {Promise<boolean>} True if the image matched the expected output, false otherwise.
   * @throws {DiffsFoundError} Thrown if a mismatch is detected and immediate failure reports are enabled.
   */
  async checkImage(image, name, ignoreMismatch, retryTimeout) {
    ArgumentGuard.notNull(image, 'image cannot be null!');

    if (this.getIsDisabled()) {
      this._logger.verbose(`checkImage(Image, '${name}', '${ignoreMismatch}', '${retryTimeout}'): Ignored`);
      return false;
    }

    this._logger.verbose(`checkImage(Image, '${name}', '${ignoreMismatch}', '${retryTimeout}')`);
    return this._checkImage(name, ignoreMismatch, Target.image(image).timeout(retryTimeout));
  }

  /**
   * Perform visual validation for the current image.
   *
   * @param {string|Buffer|MutableImage} image The image path, base64 string, image buffer or MutableImage.
   * @param {Region|RegionObject} region The region of the image which should be verified, or {undefined}/{null} if the
   *   entire image should be verified.
   * @param {string} [name] An optional tag to be associated with the validation checkpoint.
   * @param {boolean} [ignoreMismatch] True if the server should ignore a negative result for the visual validation.
   * @param {number} [retryTimeout] timeout for performing the match (ms).
   * @return {Promise<boolean>} True if the image matched the expected output, false otherwise.
   * @throws {DiffsFoundError} Thrown if a mismatch is detected and immediate failure reports are enabled.
   */
  async checkRegion(image, region, name, ignoreMismatch, retryTimeout) {
    ArgumentGuard.notNull(image, 'image');
    ArgumentGuard.notNull(region, 'region');

    if (this.getIsDisabled()) {
      this._logger.verbose(`checkRegion(Image, [${region}], '${name}', '${ignoreMismatch}', '${retryTimeout}'): Ignored`);
      return false;
    }

    this._logger.verbose(`checkRegion(Image, [${region}], '${name}', '${ignoreMismatch}', '${retryTimeout}')`);
    // noinspection JSCheckFunctionSignatures
    return this._checkImage(name, ignoreMismatch, Target.region(image, region).timeout(retryTimeout));
  }

  /**
   * Internal function for performing an image verification for an image (or a region of an image).
   *
   * @private
   * @param {string} name An optional tag to be associated with the validation checkpoint.
   * @param {boolean} ignoreMismatch True if the server should ignore a negative result for the visual validation.
   * @param {ImagesCheckSettings|CheckSettings} checkSettings The settings to use when checking the image.
   * @return {Promise<boolean>}
   */
  async _checkImage(name = '', ignoreMismatch, checkSettings) {
    try {
      let regionProvider = new NullRegionProvider();
      // Set the title to be linked to the screenshot.
      this._title = name;

      if (checkSettings.getImageUrl()) {
        this._screenshotUrl = checkSettings.getImageUrl();
        if (!this._viewportSizeHandler.get() && checkSettings.getImageSize()) {
          await this.setViewportSize(checkSettings.getImageSize());
        }
      } else {
        if (checkSettings.getTargetRegion()) {
          regionProvider = new RegionProvider(checkSettings.getTargetRegion());
        }

        const image = await this._normalizeImage(checkSettings);
        this._screenshot = new EyesSimpleScreenshot(image);
        if (!this._viewportSizeHandler.get()) {
          await this.setViewportSize(image.getSize());
        }
      }

      const matchResult = await super.checkWindowBase(regionProvider, name, ignoreMismatch, checkSettings);
      return matchResult.getAsExpected();
    } finally {
      this._screenshotUrl = null;
      this._screenshot = null;
      this._title = null;
    }
  }

  // noinspection JSMethodCanBeStatic
  /**
   * @private
   * @param {ImagesCheckSettings} checkSettings The settings to use when checking the image.
   * @return {Promise<MutableImage>}
   */
  async _normalizeImage(checkSettings) {
    if (checkSettings.getMutableImage()) {
      return checkSettings.getMutableImage();
    }

    if (checkSettings.getImageBuffer()) {
      return new MutableImage(checkSettings.getImageBuffer());
    }

    if (checkSettings.getImageString()) {
      return new MutableImage(checkSettings.getImageString());
    }

    if (checkSettings.getImagePath()) {
      try {
        const data = await ImageUtils.readImage(checkSettings.getImagePath());
        return new MutableImage(data);
      } catch (err) {
        throw new EyesError(`Can't read image [${err.message}]`);
      }
    }

    throw new EyesError("Can't recognize supported image from checkSettings.");
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Replaces the actual image in a running session.
   *
   * @param {number} stepIndex The zero based index of the step in which to replace the image.
   * @param {string|Buffer|MutableImage} image The image base64 string, image buffer or MutableImage.
   * @param {string} [tag] A tag to be associated with the validation checkpoint.
   * @param {string} [title] A title to be associated with the validation checkpoint.
   * @param {Trigger[]} [userInputs] An array of user inputs to which lead to the validation checkpoint.
   * @return {Promise<boolean>} True if the image matched the expected output, false otherwise.
   * @throws {DiffsFoundError} Thrown if a mismatch is detected and immediate failure reports are enabled.
   */
  async replaceImage(stepIndex, image, tag, title, userInputs) {
    ArgumentGuard.notNull(stepIndex, 'stepIndex');
    ArgumentGuard.notNull(image, 'image');

    if (this.getIsDisabled()) {
      this._logger.verbose(`replaceImage('${stepIndex}', Image, '${tag}', '${title}', '${userInputs}'): Ignored`);
      return Promise.resolve(false);
    }

    if (TypeUtils.isBuffer(image) || TypeUtils.isString(image)) {
      image = new MutableImage(image);
    }

    this._logger.verbose(`replaceImage('${stepIndex}', Image, '${tag}', '${title}', '${userInputs}')`);
    const results = await super.replaceWindow(stepIndex, image, tag, title, userInputs);
    return results.getAsExpected();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Adds a mouse trigger.
   *
   * @param {MouseTrigger.MouseAction} action  Mouse action.
   * @param {Region} control The control on which the trigger is activated (context relative coordinates).
   * @param {Location} cursor  The cursor's position relative to the control.
   */
  addMouseTrigger(action, control, cursor) {
    super.addMouseTriggerBase(action, control, cursor);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Adds a keyboard trigger.
   *
   * @param {Region} control The control's context-relative region.
   * @param {string} text The trigger's text.
   */
  addTextTrigger(control, text) {
    super.addTextTriggerBase(control, text);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the viewport size.
   *
   * @return {Promise<RectangleSize>}
   */
  getViewportSize() {
    return Promise.resolve(this._viewportSizeHandler.get());
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Set the viewport size.
   *
   * @param {RectangleSize} viewportSize The required viewport size.
   * @return {Promise<void>}
   */
  setViewportSize(viewportSize) {
    ArgumentGuard.notNull(viewportSize, 'size');

    this._viewportSizeHandler.set(new RectangleSize(viewportSize));
    return Promise.resolve();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the inferred environment.
   *
   * @protected
   * @return {Promise<string>} A promise which resolves to the inferred environment string.
   */
  getInferredEnvironment() {
    return Promise.resolve(this._inferred);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Sets the inferred environment for the test.
   *
   * @param {string} inferred The inferred environment string.
   */
  setInferredEnvironment(inferred) {
    this._inferred = inferred;
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the screenshot.
   *
   * @return {Promise<EyesSimpleScreenshot>} The screenshot.
   */
  getScreenshot() {
    return Promise.resolve(this._screenshot);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the screenshot URL.
   *
   * @return {Promise<string>} The screenshot URL.
   */
  getScreenshotUrl() {
    return Promise.resolve(this._screenshotUrl);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the title.
   *
   * @protected
   * @return {Promise<string>} The current title of of the AUT.
   */
  getTitle() {
    return Promise.resolve(this._title);
  }
}

exports.Eyes = Eyes;
