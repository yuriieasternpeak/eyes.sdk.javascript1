exports.Eyes = require('./src/Eyes');
exports.ImageProvider = require('./src/ImageProvider');
var EyesSDK = require('eyes.sdk');
exports.ConsoleLogHandler = EyesSDK.ConsoleLogHandler;
exports.NullLogHandler  = EyesSDK.NullLogHandler;
exports.Triggers = EyesSDK.Triggers;
exports.MatchLevel = EyesSDK.MatchLevel;
exports.ImageMatchSettings = EyesSDK.ImageMatchSettings;
exports.ExactMatchSettings = EyesSDK.ExactMatchSettings;
exports.FixedScaleProvider = EyesSDK.FixedScaleProvider;
exports.FixedScaleProviderFactory = EyesSDK.FixedScaleProviderFactory;
exports.ContextBasedScaleProvider = EyesSDK.ContextBasedScaleProvider;
exports.ContextBasedScaleProviderFactory = EyesSDK.ContextBasedScaleProviderFactory;
exports.TestResultsFormatter = EyesSDK.TestResultsFormatter;
var eyesBase = EyesSDK.EyesBase;
exports.FailureReport = eyesBase.FailureReport;
var EyesUtils = require('eyes.utils');
exports.ArgumentGuard = EyesUtils.ArgumentGuard;
exports.BrowserUtils = EyesUtils.BrowserUtils;
exports.CoordinatesType = EyesUtils.CoordinatesType;
exports.GeneralUtils = EyesUtils.GeneralUtils;
exports.GeometryUtils = EyesUtils.GeometryUtils;
exports.ImageDeltaCompressor = EyesUtils.ImageDeltaCompressor;
exports.ImageUtils = EyesUtils.ImageUtils;
exports.MutableImage = EyesUtils.MutableImage;
exports.PositionProvider = EyesUtils.PositionProvider;
exports.PromiseFactory = EyesUtils.PromiseFactory;
exports.RegionProvider = EyesUtils.RegionProvider;
exports.ScaleProvider = EyesUtils.ScaleProvider;
exports.ScaleProviderIdentityFactory = EyesUtils.ScaleProviderIdentityFactory;
exports.SimplePropertyHandler = EyesUtils.SimplePropertyHandler;
exports.ReadOnlyPropertyHandler = EyesUtils.ReadOnlyPropertyHandler;