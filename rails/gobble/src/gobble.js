'use strict';

const Dictionary = require('./../src/dictionary');
const RandomizerStrategy = require('./../src/randomizer_strategy');
const RandomizerStrategyType = require('./../src/randomizer_strategy_type');
const EventLog = require('./../src/event_log');

//
// TODO scoring strategy should indicate which [guessed, and also computer-solved] dictionary words were omitted (due to ineligibility based on scoring cutoff)
// probably going to go with frequency count based on http://corpus.byu.edu/coca/
//
// TODO add decoupled scoring system; default to "classic" scoring strategy
// other scoring strategy:  difficulty/obscurity of word
// other scoring strategy:  length of word
//
// TODO add board generation strategies
// one strategy would honor the original dice and probabilities of the classic game
// one would just be all letters, equally likely
// one would be "fertile!" -- some letters are more weighted than others, meaning MANY words are likely
// one would be "barren" -- some letters are more weighted than others, meaning FEW words are likely
//
// one could require the resulting board to have at least N words, no more than M words -- THAT is a FANTASTIC idea!!
//
// TODO add an inline dictionary definition for found words, especially obscure ones!
//
// TODO cool feature idea:  assign each word in a given dictionary file a "commonality"
// or "reading grade level" score;  then let user filter out words from dictionary outside of said score range
//
// TODO part of the scoring strategy -- parameterize the minimum word length
//
// TODO game timer with optional increment value
//
// TODO end game when all words are found
////
// TODO let user decide if words are rejected immediately, or scored immediately
//
// TODO add a pause button that when clicked, obscures the board
//
// TODO let users type words instead of swiping;
// TODO -- possibly match each letter keystroke to first matching square on board;
//      -- repeat the keystroke to advance to next h?  no that wouldn't work;
//      -- space key to advance to next match... ugh...complicated....
class Gobble {

    constructor(options = {}) {
        options = Object.assign({}, {
            htmlAnchor: undefined,
            x: 4,
            y: 4,
            minWordLength: 3,
            minWords: 0,
            maxWords: 0,
            includeUwithQ: true,
            rejectInvalidGuesses: false,
            warnOnDuplicateGuess: true,
            dictionary: Dictionary,  // a global object,
            size: 35
        }, options);

        // #<x>x<y>,<letters>,<minWordLength>,<minWords>,<maxWords>,<pixelSize> TODO add rest of params
        // #7x4,arisnnblintdalinhhidaeewvdil,3,0,0,45
        if (options.htmlAnchor) {
            let vals = options.htmlAnchor.split(',');
            let sizes = vals[0].split('x');
            options.x = Number(sizes[0].substring(1));  // remove leading #
            options.y = Number(sizes[1]);
            options.letters = vals[1];
            options.minWordLength = Number(vals[2]);
            options.minWords = Number(vals[3]);
            options.maxWords = Number(vals[4]);
            options.size = Number(vals[5]);
        }

        this.x = Number(options.x);
        this.y = Number(options.y);
        this.size = Number(options.size);  // pixel length of a letter's square on the board
        this.minWordLength = options.minWordLength;
        this.minWords = options.minWords;
        this.maxWords = options.maxWords;
        this.includeUwithQ = options.includeUwithQ;
        this.rejectInvalidGuesses = options.rejectInvalidGuesses;
        this.warnOnDuplicateGuess = options.warnOnDuplicateGuess;

        this.randomizerStrategy = new RandomizerStrategy({ 
        	x: this.y, 
        	y: this.x, 
        	type: RandomizerStrategyType.CLASSIC,
        	includeUwithQ: this.includeUwithQ
        });

		this.board = this._calcNeighbors();

		this.dict = new Dictionary();

		this.guesses = new Set();
        this.correctGuesses = new Set();

        this.answers = [];

		if (options.letters) {
		    this.letters = options.letters;
            setTimeout(() => {
                this.answers = this.solve();
            }, 0);
		} else {
			this.shuffleBoard();
		}

        this.eventLog = new EventLog();
    }

	// board square indexing scheme, e.g. for a 4x4 board:
	//
	//  0  1  2  3
	//  4  5  6  7
	//  8  9 10 11
	// 12 13 14 15
	//
	// programmatically construct a list of all neighboring indices for each square on our x by y board.
	_calcNeighbors(x = Number(this.x), y = Number(this.y)) {
		let board = [];
		for(let j = 0; j < y; j++) {
			for(let i = 0; i < x; i++) {
				let neighbors = [];

				let curr = (j*x)+i;
				let n = curr - x;
				let e = curr + 1;
				let s = curr + x;
				let w = curr - 1;
				let ne = n + 1;
				let nw = n - 1;
				let se = s + 1;
				let sw = s - 1;

				if (i != x-1) neighbors.push(e);
				if (i != 0)   neighbors.push(w);
				if (j != y-1) neighbors.push(s);
				if (j != 0)   neighbors.push(n);

				if (i != 0   && j != 0)   neighbors.push(nw);
				if (i != x-1 && j != 0)   neighbors.push(ne);
				if (i != 0   && j != y-1) neighbors.push(sw);
				if (i != x-1 && j != y-1) neighbors.push(se);

				board.push(neighbors.sort((a,b) => a-b));  // built-in sort defaults to alphabetical, not numerical
			}
		}

		return board;
	}

	resize(options) {
        this.answers = [];

        this.x = Number(options.x);
        this.y = Number(options.y);

		this.board = this._calcNeighbors();

		this.randomizerStrategy.x = options.x;
        this.randomizerStrategy.y = options.y;

        // TODO confirm...
        this.eventLog = new EventLog();

        this.shuffleBoard(options.onShuffleBoardCallback);
    }

    submitWord(moves /* array of board index values */) {
    	// verify adjacency of submitted moves
    	for(let i = 1; i < moves.length; i++) {
    		if (this.board[moves[i-1]].indexOf(moves[i]) === -1) {
				this.eventLog.add(`User submission had invalid adjacency: ${moves}:  no way to reach ${moves[i]} from ${moves[i-1]}`);
                return [undefined, ':impossible'];
    		}
    	}

    	let word = '';
    	moves.forEach((i,n) => {
            if (this.letters[i] === '.') {
                word += 'qu';
            } else {
                word += this.letters[i];
            }
	   	});

    	if (this.guesses.has(word)) {
			this.eventLog.add(`User guessed already guessed word: ${word}`);

			if (this.warnOnDuplicateGuess) {
				// TODO warn user on guess.
			}

			return [word, ':duplicate'];
    	} else {
	    	this.guesses.add(word);
			this.eventLog.add(`User guessed the word: ${word}`);

            if (this.answers[this.minWordLength] && this.answers[this.minWordLength].indexOf(word) !== -1) {
                this.correctGuesses.add(word);
				return [word, ':correct'];
            }

			return [word, ':incorrect'];
	    }
    }

    scoreGuess(guess) {
    	if (this.x === 6 && this.y === 6) { 
	    	switch (guess.length) {
	    		case 1:
	    		case 2:
	    		case 3:
	    			return 0;
	    		case 4:
					return 1;
	    		case 5:
	    			return 2;
	    		case 6:
	    			return 3;
	    		case 7:
	    			return 5;
	    		case 8:
	    			return 11;
				default:
					return (guess.length * 2);
			}
    	} else if (this.x === 5 && this.y === 5) {
	    	switch (guess.length) {
	    		case 1:
	    		case 2:
	    		case 3:
	    			return 0;
	    		case 4:
					return 1;
	    		case 5:
	    			return 2;
	    		case 6:
	    			return 3;
	    		case 7:
	    			return 5;
	    		case 8:
	    		default:
	    			return 11;
	    	}
    	} else {
	    	// this is the default scoring system
	    	switch (guess.length) {
	    		case 1:
	    		case 2:
	    			return 0;
	    		case 3:
	    		case 4:
					return 1;
	    		case 5:
	    			return 2;
	    		case 6:
	    			return 3;
	    		case 7:
	    			return 5;
	    		case 8:
	    		default:
	    			return 11;
    		}
	    }
    }

    scoreGuesses() {
		// TODOrefcator this method to use this.answers, not our dictoinary object/worker thread...

		let score = 0;
    	this.guesses.forEach(guess => {
    		if (this.isLegalWord(guess)) {
    			score += this.scoreGuess(guess);
    		}
    	});

    	return score;
    }

	toHtml() {
        let result = '';

        for(let j = 0; j < this.y; j++) {
            result += '<div class="row">';
            for (let i = 0; i < this.x; i++) {
                let curr = (j * this.x) + i;

                result += `<div class="outer-square"><div class="square"><div><span id="sq${curr}" data-square-id="${curr}">`;
                if (this.letters[curr] === '.') {
                    result += 'Qu';
                } else {
                    result += this.letters[curr] ? this.letters[curr].toUpperCase() : 'x';
                }
                result += `</span></div></div></div>`;
            }

            result += '<div class="clearfix"></div></div>';
        }

        return result;
	}

    //TODO game.size doesn't really belong as a uniquely defining characteristic of an instance of a game
    toHtmlAnchor() {
        return `${this.x}x${this.y},${this.letters},${this.minWordLength},${this.minWords},${this.maxWords},${this.size}`;
    }

    toString() {
    	let result = '\n+-' + '---'.repeat(this.x) + '+\n';
    	for(let j = 0; j < this.y; j++) {
    		result += '| ';
    		for(let i = 0; i < this.x; i++) {
			    let curr = (j*this.x)+i;
    			if (this.letters[curr] === '.') {
    				result += 'Qu ';
    			} else {
	    			result += this.letters[curr].toUpperCase() + '  ';
	    		}
    		}

    		result += '|\n';
    	}

    	result += '+-' + '---'.repeat(this.x) + '+\n';
    	result += `\nLetters: ${this.letters}\n\n`;

    	if (this.answers.length > 0) {
    		this.answers.forEach((count, i) => {
    			result += `${i}+ letter words: ${count.length}`;

    			if (count.length < 10) {
    				result += ` (${count})`;
    			}

    			if (this.minWordLength === i) {
	    			result += '  <-- chosen minimum word length';
	    		}
	    		result += '\n';
    		});
    	}

    	if (this.answers[this.minWordLength].length > 0) {
			result += '\nAnswers: '; 
    		result += this.answers[this.minWordLength];
    		result += '\n'; 
		}

		if (this.guesses.size > 0) {
			result += '\nGuesses: ';
			result += Array.from(this.guesses);
			result += `\n\nScore: ${this.scoreGuesses()}\n`;
		}

    	return result;
    }

    inspect() {  // for more succinct console.log() output
        return this.toString();
    }

	solve(letters) {
		const currentLetters = this.letters;
		if (letters) {
			this.letters = letters;
		}

		let originalMinWordLength = this.minWordLength;
		this.minWordLength = 2;
		let answers = [];

		while (true) {
			this.words = new Set();
			this.board.forEach((neighbors, i) => {
				let visited = [];
				visited[i] = true;
				this._solve(i, visited, (this.letters[i] === '.' ? 'qu' : this.letters[i]));
			});

			if (this.words.size > 0) {
				answers[this.minWordLength] = [...this.words].sort();
                this.minWordLength++;
			} else {
				this.minWordLength = originalMinWordLength;
				if (letters) {  // restore our original letters
					this.letters = currentLetters;
				}

				return answers;			
			}
		}
	}

	_solve(curr, visited, candidate) {
	    if (! this.isLegalWordPrefix(candidate)) {
	        return;
	    }
	 
	    if (this.isLegalWord(candidate)) {
	        this.words.add(candidate);
	    }

	    visited[curr] = true;
	 
	 	this.board[curr].forEach(i => {
	 		if (! visited[i]) {
	 			visited[i] = true;
	 			this._solve(i, visited.slice(), candidate + (this.letters[i] === '.' ? 'qu' : this.letters[i]));
                visited[i] = false;  // back out one step of our depth first search
	 		}
	 	});
	}

	isLegalWord(word) {
		return word.length >= this.minWordLength && this.dict.isWord(word);
	}

	isLegalWordPrefix(prefix) {
		return this.dict.isWordPrefix(prefix);
	}

	shuffleBoard(onShuffleBoardCallback) {
        this.correctGuesses = new Set();
        this.guesses = new Set();

		this.letters = this.randomizerStrategy.shuffleBoard();
		setTimeout(() => {
            this.answers = this.solve();

            if (onShuffleBoardCallback) {
                onShuffleBoardCallback();
            }
        }, 0);
	}
};

module.exports = Gobble;