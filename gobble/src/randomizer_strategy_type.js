'use strict';

class RandomizerStrategyType {};

RandomizerStrategyType.BARREN  = 'barren';
RandomizerStrategyType.CLASSIC = 'classic';
RandomizerStrategyType.FERTILE = 'fertile';
RandomizerStrategyType.NATURAL = 'natural';
RandomizerStrategyType.UNIFORM = 'uniform';

RandomizerStrategyType.ALL = [
	RandomizerStrategyType.BARREN,
	RandomizerStrategyType.CLASSIC,
	RandomizerStrategyType.FERTILE,
	RandomizerStrategyType.NATURAL,
	RandomizerStrategyType.UNIFORM
];

module.exports = RandomizerStrategyType;