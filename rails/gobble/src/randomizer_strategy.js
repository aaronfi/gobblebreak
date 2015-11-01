'use strict';

const RandomizerStrategyType = require('./../src/randomizer_strategy_type');

class RandomizerStrategy {
    constructor(options) {
    	this.x = options.x;
    	this.y = options.y;
        this.type = options.type;    // RandomizerStrategyType -- e.g. CLASSIC, BARREN, FERTILE
        this.includeUwithQ = options.includeUwithQ;

        // non-uninform probability distribution for selecting letters from the English alphabet
        // distribution is based on observed frequency count of letters in "everyday speech and written words"
		this.naturalDistribution = `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbccccccccccccccccccccccccccccccccccccccdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeffffffffffffffffffffffffffffffffgggggggggggggggggggggggggggghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijkkkkkkkkkllllllllllllllllllllllllllllllllllllllllllllllllllllllllmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooopppppppppppppppppppppppppp${this.includeUwithQ ? '.' : 'q'}rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssstttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuvvvvvvvvvvvvvvvwwwwwwwwwwwwwwwwwwwwwwwwwwwwwxxyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyz`;

		// uninform probability distribution for selecting letters from the English alphabet
		this.uniformDistribution = `abcdefghijklmnop${this.includeUwithQ ? '.' : 'q'}rstuvwxyz`;
    }

    shuffleBoard() {
		let letters = '';
    	switch (this.type) {

	    	case RandomizerStrategyType.UNIFORM:
				for(let i = 0; i < this.x * this.y; i++) {
					letters += this.uniformDistribution[~~(Math.random() * this.uniformDistribution.length - 1)];
				}
				return letters;

			// TODO allow user to submit their own dice;

    		case RandomizerStrategyType.CLASSIC:	
    			if (this.x === 4 && this.y === 4) {

    				// TODO properly wire up to a strategy type
/*    				
					// older 4x4 distribution
					return 'aaciot'[~~(Math.random() * 5)] +
						   'ahmors'[~~(Math.random() * 5)] +
						   'egkluy'[~~(Math.random() * 5)] +
						   'abilty'[~~(Math.random() * 5)] +
					   
						   'acdemp'[~~(Math.random() * 5)] +
						   'egintv'[~~(Math.random() * 5)] +
						   'gilruw'[~~(Math.random() * 5)] +
						   'elpstu'[~~(Math.random() * 5)] +
					   
						   'denosw'[~~(Math.random() * 5)] +
						   'acelrs'[~~(Math.random() * 5)] +
						   'abjmoq'[~~(Math.random() * 5)] +
						   'eefhiy'[~~(Math.random() * 5)] +
					   
						   'ehinps'[~~(Math.random() * 5)] +
						   'dknotu'[~~(Math.random() * 5)] +
						   'adenvz'[~~(Math.random() * 5)] +
						   'biforx'[~~(Math.random() * 5)];
*/
					// newer 4x4 distribution
    				return 'aaeegn'[~~(Math.random() * 5)] + 
		   				   'elrtty'[~~(Math.random() * 5)] + 
		   				   'aoottw'[~~(Math.random() * 5)] + 
		   				   'abbjoo'[~~(Math.random() * 5)] + 

		   				   'ehrtvw'[~~(Math.random() * 5)] + 
		   				   'cimotu'[~~(Math.random() * 5)] +
		   				   'distty'[~~(Math.random() * 5)] + 
		   				   'eiosst'[~~(Math.random() * 5)] + 
		   				   
		   				   'delrvy'[~~(Math.random() * 5)] + 		   				   
		   				   'achops'[~~(Math.random() * 5)] + 
		   				   'himn.u'[~~(Math.random() * 5)] + 
		   				   'eeinsu'[~~(Math.random() * 5)] + 

		   				   'eeghnw'[~~(Math.random() * 5)] + 
		   				   'affkps'[~~(Math.random() * 5)] + 
		   				   'hlnnrz'[~~(Math.random() * 5)] + 
		   				   'deilrx'[~~(Math.random() * 5)]; 
				} else if (this.x === 5 && this.y === 5) {
					return 'aaafrs'[~~(Math.random() * 5)] + 
		   				   'aaeeee'[~~(Math.random() * 5)] + 
		   				   'aafirs'[~~(Math.random() * 5)] + 
		   				   'adennn'[~~(Math.random() * 5)] + 
		   				   'aeeeem'[~~(Math.random() * 5)] + 

		   				   'aeegmu'[~~(Math.random() * 5)] +
		   				   'aegmnn'[~~(Math.random() * 5)] + 
		   				   'afirsy'[~~(Math.random() * 5)] + 
		   				   'bjk.xz'[~~(Math.random() * 5)] + 
		   				   'ccenst'[~~(Math.random() * 5)] + 

		   				   'ceiilt'[~~(Math.random() * 5)] + 
		   				   'ceilpt'[~~(Math.random() * 5)] + 
		   				   'ceipst'[~~(Math.random() * 5)] + 
		   				   'ddhnot'[~~(Math.random() * 5)] + 
		   				   'dhhlor'[~~(Math.random() * 5)] + 

		   				   'dhlnor'[~~(Math.random() * 5)] + 
		   				   'dhlnor'[~~(Math.random() * 5)] + 
		   				   'eiiitt'[~~(Math.random() * 5)] + 
		   				   'emottt'[~~(Math.random() * 5)] + 
		   				   'ensssu'[~~(Math.random() * 5)] + 

		   				   'fiprsy'[~~(Math.random() * 5)] + 
		   				   'gorrvw'[~~(Math.random() * 5)] + 
		   				   'iprrry'[~~(Math.random() * 5)] + 
		   				   'nootuw'[~~(Math.random() * 5)] + 
		   				   'ooottu'[~~(Math.random() * 5)]; 
				} else if (this.x === 6 && this.y === 6) {
						// TODO
				} 


	    	case RandomizerStrategyType.BARREN:  // TODO

	    	case RandomizerStrategyType.FERTILE:  // TODO

	    	case RandomizerStrategyType.NATURAL:
	    	default:
				for(let i = 0; i < this.x * this.y; i++) {
					letters += this.naturalDistribution[~~(Math.random() * this.naturalDistribution.length - 1)];
				}
				return letters;
    	}
    } 

    toString() {
        return this.type;
    }

    inspect() {  // for more succinct console.log() output
        return this.toString();
    }
};

RandomizerStrategy.ALL = [
	RandomizerStrategyType.BARREN,
	RandomizerStrategyType.CLASSIC,
	RandomizerStrategyType.FERTILE
];

module.exports = RandomizerStrategy;