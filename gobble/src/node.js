'use strict';

// TODO this class is currently deprecated and isn't being used, for perf reasons.
// You'll want to keep it around for when you need to (manually) regenerate your Dictionary.WORDS_JSON struct blob...
class Node {
    constructor(isWord = false) {
        this.i = isWord ? 1 : 0;
        this.c = {};  // children;  using "c" for minimalism in JSON string
    }

    add(word) {
        let curr = this;
        word.split('').forEach((c, i) => {
            let found = curr.c[c];
            let isWordEnd = (i === word.length - 1);

            if (found) {
                if (isWordEnd) {
                    curr.i = 1;
                } 
            } else {
                curr.c[c] = new Node(isWordEnd);
            }

            curr = curr.c[c];
        });
    }

    isValidWord(candidate) {
        if (!candidate) {
            return false;
        }

        let curr = this;
        let bail = false;
        candidate.split('').forEach(c => {

            let found = curr.c[c];
            if (found) {
                curr = curr.c[c];
            } else {
                bail = true;
            }
        });

        if (bail) return false;
        return curr.i;
    }

    isWordPrefix(candidate) {
        if (!candidate) {
            return false;
        }

        let curr = this;
        let bail = false;

        candidate.split('').forEach((c, i) => {
            let found = curr.c[c];
            if (found) {
                curr = curr.c[c];
            } else {
                bail = true;
            }
        });

        if (bail) return false;
        return curr.i || Object.keys(curr.c).length > 0;
    }

    toString() {
        return this;
    }

    inspect() {  // for more succinct console.log() output
        return this.toString();
    }
};

module.exports = Node;