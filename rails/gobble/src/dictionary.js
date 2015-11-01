'use strict';

const fs = require('fs');
const Node = require('./../src/node');

class Dictionary
{
    constructor() {
        let words = fs.readFileSync('./src/words_ospd.txt').toString().split('\n');  // words.txt ?  or words_ospd.txt?

        // TODO I need a better dictionary;  the word 'beep' isn't in here!!

        this.root = new Node();
        words.forEach(word => this.root.add(word));
    }
	
    isWord(word) {
        return this.root.isValidWord(word);
    }

    isWordPrefix(prefix) {
        return this.root.isWordPrefix(prefix);
    }

    toString() {
        return this;
    }

    inspect() {  // for more succinct console.log() output
        return this.toString();
    }
};

module.exports = Dictionary;