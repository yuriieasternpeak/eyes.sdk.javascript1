'use strict';

const { Region } = require('@applitools/eyes-sdk-core');

const { RegionPositionCompensation } = require('./RegionPositionCompensation');

class SafariRegionPositionCompensation extends RegionPositionCompensation {
  /** @inheritDoc */
  compensateRegionPosition(region, pixelRatio) {
    if (pixelRatio === 1) {
      return region;
    }

    if (region.getWidth() <= 0 || region.getHeight() <= 0) {
      return Region.EMPTY;
    }

    return region.offset(0, Math.ceil(pixelRatio));
  }
}

exports.SafariRegionPositionCompensation = SafariRegionPositionCompensation;
