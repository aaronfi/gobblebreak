'use strict';

class Node {
    constructor(isWord = false) {
        this.isWord = isWord;
        this.children = {};
    }

    add(word) {
        let curr = this;
        word.split('').forEach((c, i) => {
            let found = curr.children[c];
            let isWordEnd = (i === word.length - 1);

            if (found) {
                if (isWordEnd) {
                    curr.isWord = true;
                } 
            } else {
                curr.children[c] = new Node(isWordEnd);
            }

            curr = curr.children[c];
        });
    }

    isValidWord(candidate) {
        if (!candidate) {
            return false;
        }

        let curr = this;
        let bail = false;
        candidate.split('').forEach(c => {

            let found = curr.children[c];
            if (found) {
                curr = curr.children[c];
            } else {
                bail = true;
            }
        });

        if (bail) return false;
        return curr.isWord;
    }

    isWordPrefix(candidate) {
        if (!candidate) {
            return false;
        }

        let curr = this;
        let bail = false;

        candidate.split('').forEach((c, i) => {
            let found = curr.children[c];
            if (found) {
                curr = curr.children[c];
            } else {
                bail = true;
            }
        });

        if (bail) return false;
        return curr.isWord || Object.keys(curr.children).length > 0;
    }

    toString() {
        return this;
    }

    inspect() {  // for more succinct console.log() output
        return this.toString();
    }
};

module.exports = Node;