/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(13);
	__webpack_require__(19);
	__webpack_require__(20);
	__webpack_require__(21);
	__webpack_require__(22);
	__webpack_require__(23);
	__webpack_require__(24);
	__webpack_require__(25);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// TODO consider adding assignObject() npm module as a substitute for Object.assign ?

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var BoardVariation = __webpack_require__(2);
	var Color = __webpack_require__(3);
	var Fen = __webpack_require__(5);
	var Flags = __webpack_require__(6);
	var Game = __webpack_require__(11);
	var Move = __webpack_require__(7);
	var PieceType = __webpack_require__(8);

	var Chess = (function () {
	    function Chess() /* string */ // TODO think about also having a constructor that takes in PGN ?
	    {
	        var fen = arguments.length <= 0 || arguments[0] === undefined ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : arguments[0];

	        _classCallCheck(this, Chess);

	        var game = new Game(fen);
	        this.games = [game];

	        this.currentGame = game;
	        this.currentGameNum = 0;

	        this.lastTimerSnapshot = -1;
	        this.replayLog = [];
	    }

	    _createClass(Chess, [{
	        key: 'toString',
	        value: function toString() {
	            return this.games.length + ' game' + (games.length > 1 ? 's' : '') + ' loaded.  Game #' + (this.currentGameNum + 1) + ' selected:\n\n' + this.currentGame.toString();
	        }
	    }, {
	        key: 'addGame',
	        value: function addGame() {
	            var game = arguments.length <= 0 || arguments[0] === undefined ? new Game() : arguments[0];

	            this.games.push(game);
	        }
	    }, {
	        key: 'selectGame',
	        value: function selectGame(i) {
	            if (i < 0 || i >= this.games.length) {
	                return false;
	            }

	            this.currentGame = this.games[i];
	            this.currentGameNum = i;

	            return true;
	        }
	    }, {
	        key: 'toPgn',
	        value: function toPgn() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	            options = Object.assign({}, {
	                maxWidth: 0,
	                newlineChar: '\n',
	                showMoveCursor: false,
	                showHeaders: true
	            }, options);

	            return this.currentGame.toPgn(options);
	        }
	    }, {
	        key: 'loadPgn',
	        value: function loadPgn(pgnText) {
	            var options = arguments.length <= 1 || arguments[1] === undefined ? {
	                newlineChar: '\r?\n'
	            } : arguments[1];

	            // reduce all newlines into \n for simplified parsing
	            pgnText = pgnText.replace(new RegExp(options.newlineChar.replace(/\\/g, '\\'), 'g'), '\n');

	            var pairs = this._parsePgnGames(pgnText);

	            for (var i = 0; i < pairs.length; i++) {
	                var game = this._parsePgnGame(pairs[i].headerText, pairs[i].gameText);
	                if (!game) {
	                    return false;
	                }
	                this.addGame(game);
	            }

	            this.selectGame(this.games.length - 1); // select the game we just loaded...

	            return true;
	        }

	        // sanitizes our raw input PGN text, dividing it up by each unique game entry it contains
	    }, {
	        key: '_parsePgnGames',
	        value: function _parsePgnGames(pgnText) {
	            var results = [];

	            var headMatch = undefined,
	                prevHead = undefined,
	                newHead = undefined,
	                startNew = undefined,
	                afterNew = undefined,
	                lastOpen = undefined,
	                checkedGame = "",
	                numberOfGames = 0,
	                validHead = undefined;
	            var headerBlockRegex = /\s*(\[\s*\w+\s*"[^"]*"\s*\]\s*)+/;

	            // fix common mistakes in PGN text
	            pgnText = pgnText.replace(/[\u00A0\u180E\u2000-\u200A\u202F\u205F\u3000]/g, " "); // some spaces to plain space
	            pgnText = pgnText.replace(/\u00BD/g, "1/2"); // "half fraction" to "1/2"
	            pgnText = pgnText.replace(/[\u2010-\u2015]/g, "-"); // "hyphens" to "-"
	            pgnText = pgnText.replace(/\u2024/g, "."); // "one dot leader" to "."
	            pgnText = pgnText.replace(/[\u2025-\u2026]/g, "..."); // "two dot leader" and "ellipsis" to "..."
	            pgnText = pgnText.replace(/\\"/g, "'"); // fix [Opening "Queen\"s Gambit"]

	            // escape html entities
	            pgnText = pgnText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

	            // PGN standard: ignore lines starting with %
	            pgnText = pgnText.replace(/(^|\n)%.*(\n|$)/g, "\n");

	            if (headerBlockRegex.exec(pgnText)) {
	                while (headMatch = headerBlockRegex.exec(pgnText)) {
	                    newHead = headMatch[0];
	                    startNew = pgnText.indexOf(newHead);
	                    afterNew = startNew + newHead.length;
	                    if (prevHead) {
	                        checkedGame += pgnText.slice(0, startNew);
	                        validHead = (lastOpen = checkedGame.lastIndexOf("{")) < 0 || checkedGame.lastIndexOf("}") > lastOpen;
	                        if (validHead) {
	                            results.push({
	                                headerText: prevHead,
	                                gameText: checkedGame
	                            });
	                            checkedGame = "";
	                        } else {
	                            checkedGame += newHead;
	                        }
	                    } else {
	                        validHead = true;
	                    }
	                    if (validHead) {
	                        prevHead = newHead;
	                    }
	                    pgnText = pgnText.slice(afterNew);
	                }
	            } else {
	                results.push({
	                    headerText: "",
	                    gameText: pgnText
	                });
	            }

	            if (prevHead) {
	                checkedGame += pgnText;
	                results.push({
	                    headerText: prevHead,
	                    gameText: checkedGame
	                });
	            }

	            return results;
	        }

	        // behold, an actual PGN parser and lexer, with full support for variations.
	    }, {
	        key: '_parsePgnGame',
	        value: function _parsePgnGame(pgnHeaderText, pgnGameText) {
	            var POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*']; // TODO:  this is a constant, put it somewhere better...?

	            function _openNewVariation(game, isContinuation) {
	                var parentLastMoveIndex = game.currentVariation.moveHistory.length - 1;

	                var innerVariation = BoardVariation.createFromParentVariation(game.currentVariation, { isContinuation: isContinuation });

	                game.boardVariations.push(innerVariation);

	                // take the variation we just started, and append it to the list of child variations that start from its "parent" move.
	                game.currentVariation.moveHistory[parentLastMoveIndex].childVariations.push(innerVariation);

	                game.currentVariation = innerVariation;
	            }

	            function _closeCurrentVariation(game) {
	                game.currentVariation = game.currentVariation.parentVariation;
	            }

	            // parse pgn's header text
	            var key = undefined,
	                value = undefined,
	                headers = pgnHeaderText.split('\n');

	            var fen = Fen.DEFAULT_POSITION_FULL;
	            var pairs = [];
	            for (var i = 0; i < headers.length; i++) {
	                var header = headers[i].trim();

	                key = header.replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
	                value = header.replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1');

	                if (key.length > 0) {
	                    pairs.push(key);
	                    pairs.push(value);

	                    if (key.toUpperCase() === 'FEN') {
	                        fen = value;
	                    }
	                }
	            }

	            var game = new Game(fen, pairs);

	            // parse pgn's chess text
	            var prevMove = undefined,
	                start = undefined,
	                end = undefined,
	                comment = undefined,
	                ss = pgnGameText;

	            for (start = 0; start < ss.length; start++) {
	                switch (ss.charAt(start)) {
	                    case ' ':
	                    case '\b':
	                    case '\f':
	                    case '\n':
	                    case '\r':
	                    case '\t':
	                        break;

	                    case ';':
	                        // TODO:  add support for "rest of line" comment.  http://www6.chessclub.com/help/PGN-spec
	                        break;

	                    case '{':
	                        end = start;
	                        while (ss.charAt(end) != '}') {
	                            end++;
	                        }

	                        comment = ss.substring(start, end + 1); // TODO need to properly sanitize this input.

	                        if (game.currentVariation.intraMoveAnnotationSlots[game.currentVariation.selectedMoveHistoryIndex + 1]) {
	                            game.currentVariation.intraMoveAnnotationSlots[game.currentVariation.selectedMoveHistoryIndex + 1].push(comment);
	                        } else {
	                            game.currentVariation.intraMoveAnnotationSlots[game.currentVariation.selectedMoveHistoryIndex + 1] = [comment];
	                        }

	                        if (prevMove) {
	                            prevMove.metadata.comment = comment; // assign all comment blocks to their preceding move
	                            // TODO this logic is broken;  there could be multiple comments;  need to push onto a .comments array;
	                            // TODO figure out the interplay between metadata.comment and intraMoveAnnotationSlots;
	                            // you should probably just have metadata link to the given slots?  instead of duplicating?
	                        }

	                        start = end;
	                        break;

	                    case '(':
	                        var isContinuation = false;
	                        if (ss.charAt(start + 1) === '*') {
	                            isContinuation = true;
	                            start++;
	                        }
	                        _openNewVariation(game, isContinuation);
	                        break;

	                    case ')':
	                        _closeCurrentVariation(game);
	                        break;

	                    case '$':
	                        // http://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs
	                        end = start + 1;
	                        while (ss.charAt(end) != ' ') {
	                            end++;
	                        }

	                        var glyph = ss.substring(start, end); // TODO need to properly sanitize this input.

	                        if (game.currentVariation.intraMoveAnnotationSlots[game.currentVariation.selectedMoveHistoryIndex + 1]) {
	                            game.currentVariation.intraMoveAnnotationSlots[game.currentVariation.selectedMoveHistoryIndex + 1].push(glyph);
	                        } else {
	                            game.currentVariation.intraMoveAnnotationSlots[game.currentVariation.selectedMoveHistoryIndex + 1] = [glyph];
	                        }

	                        start = end;
	                        break;

	                    default:
	                        var sanText = undefined;

	                        for (var i = 0; i < POSSIBLE_RESULTS.length; i++) {
	                            if (ss.indexOf(POSSIBLE_RESULTS[i], start) == start) {
	                                if (game.currentVariation === game.currentVariation[0]) {
	                                    end = ss.length;
	                                } else {
	                                    end = start + POSSIBLE_RESULTS[i].length;
	                                }
	                                start = end;
	                                break;
	                            }
	                        }
	                        if (start == ss.length) {
	                            break;
	                        }

	                        var needle = game.currentVariation.moveNumber.toString();

	                        if (ss.indexOf(needle, start) == start) {
	                            start += needle.length;
	                            while (' .\n\r'.indexOf(ss.charAt(start)) != -1) {
	                                start++;
	                            }
	                        }

	                        if (ss.substr(start, 2) === Move.WILDCARD_MOVE) {
	                            var someMove = Move.createWildcardMove(game.currentVariation);
	                            prevMove = game.makeMove(someMove);
	                            end = start + 2;
	                        } else if (ss.substr(start, 8) === "&lt;&gt;") {
	                            var someMove = Move.createWildcardMove(game.currentVariation);
	                            prevMove = game.makeMove(someMove);
	                            end = start + 8;
	                        } else {
	                            if ((end = start + ss.substr(start).search(/[\s${;!?()]/)) < start) {
	                                end = ss.length;
	                            }

	                            sanText = ss.substring(start, end);
	                            prevMove = game.makeMoveFromSan(sanText);
	                        }

	                        if (!prevMove) {
	                            throw new Error('error when trying to apply the parsed PGN move "' + sanText + '"');
	                        }

	                        comment = null;

	                        if (ss.charAt(end) === ' ') {
	                            start = end;
	                        } else {
	                            start = end - 1;
	                        }

	                        break;
	                }
	            }

	            if (game.currentVariation !== game.boardVariations[0]) {
	                // error: parse_pgn ended with one or more dangling variations that weren't closed off
	                while (game.currentVariation !== game.boardVariations[0]) {
	                    _closeCurrentVariation(game);
	                }
	            }

	            return game;
	        }
	    }, {
	        key: 'clear',
	        value: function clear() {
	            var game = new Game();
	            this.currentGameNum = 0;
	            this.currentGame = game;

	            this.games[this.currentGameNum] = game;
	        }
	    }, {
	        key: 'reset',
	        value: function reset() {
	            var game = new Game(Fen.DEFAULT_POSITION_FULL);
	            this.currentGameNum = 0;
	            this.currentGame = game;

	            this.games[this.currentGameNum] = game;
	        }
	    }, {
	        key: 'whoseTurn',
	        value: function whoseTurn() {
	            return this.currentGame.currentVariation.turn;
	        }

	        // --------------------------------------
	        // pass-through API methods, alphabetized
	        // --------------------------------------

	    }, {
	        key: 'createContinuationFromSan',
	        value: function createContinuationFromSan(san /* string, e.g. "Rxa7" or "e8=Q#" */) {
	            return this.currentGame.createContinuationFromSan(san);
	        }
	    }, {
	        key: 'createVariationFromSan',
	        value: function createVariationFromSan(san /* string, e.g. "Rxa7" or "e8=Q#" */) {
	            return this.currentGame.createVariationFromSan(san);
	        }
	    }, {
	        key: 'get',
	        value: function get(square /* string, e.g. 'a1' */) {
	            return this.currentGame.get(square);
	        }
	    }, {
	        key: 'header',
	        value: function header() {
	            return this.currentGame.header;
	        }
	    }, {
	        key: 'history',
	        value: function history() {
	            return this.currentGame.history();
	        }
	    }, {
	        key: 'isCheck',
	        value: function isCheck() {
	            return this.currentGame.isCheck();
	        }
	    }, {
	        key: 'isCheckmate',
	        value: function isCheckmate() {
	            return this.currentGame.isCheckmate();
	        }
	    }, {
	        key: 'isDraw',
	        value: function isDraw() {
	            return this.currentGame.isDraw();
	        }
	    }, {
	        key: 'isGameOver',
	        value: function isGameOver() {
	            return this.currentGame.isGameOver();
	        }
	    }, {
	        key: 'isInsufficientMaterial',
	        value: function isInsufficientMaterial() {
	            return this.currentGame.isInsufficientMaterial();
	        }
	    }, {
	        key: 'isStalemate',
	        value: function isStalemate() {
	            return this.currentGame.isStalemate();
	        }
	    }, {
	        key: 'isThreefoldRepetition',
	        value: function isThreefoldRepetition() {
	            return this.currentGame.isThreefoldRepetition();
	        }
	    }, {
	        key: 'loadFen',
	        value: function loadFen(fen) {
	            return this.currentGame.loadFen(fen);
	        }
	    }, {
	        key: 'makeMove',
	        value: function makeMove(move /* Move.js object */) {
	            return this.currentGame.makeMove(move);
	        }
	    }, {
	        key: 'makeMoveFromSan',
	        value: function makeMoveFromSan(san /* string, e.g. "Rxa7" or "e8=Q#" */) {
	            return this.currentGame.makeMoveFromSan(san);
	        }
	    }, {
	        key: 'moves',
	        value: function moves() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                onlyAlgebraicSquares: false
	            } : arguments[0];

	            return this.currentGame.moves(options);
	        }
	    }, {
	        key: 'next',
	        value: function next() {
	            return this.currentGame.next();
	        }
	    }, {
	        key: 'prev',
	        value: function prev() {
	            return this.currentGame.prev();
	        }
	    }, {
	        key: 'put',
	        value: function put(piece, /* Piece, e.g. Piece.WHITE_ROOK */square /* string, e.g. 'h8' */) {
	            var success = this.currentGame.put(piece, square);
	            if (success) {
	                this.currentGame._updateSetup();
	            }
	            return success;
	        }
	    }, {
	        key: 'remove',
	        value: function remove(square /* string, e.g. 'a1' */) {
	            return this.currentGame.remove(square);
	        }
	    }, {
	        key: 'rewindToBeginning',
	        value: function rewindToBeginning() {
	            return this.currentGame.rewindToBeginning();
	        }
	    }, {
	        key: 'selectMove',
	        value: function selectMove(i) {
	            return this.currentGame._selectMove(i, { shouldLog: true });
	        }
	    }, {
	        key: 'toFen',
	        value: function toFen() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                omitExtras: false
	            } : arguments[0];

	            return this.currentGame.currentVariation.toFen(options);
	        }
	    }, {
	        key: 'validateFen',
	        value: function validateFen(fen) {
	            return Fen.validate(fen);
	        }
	    }]);

	    return Chess;
	})();

	;

	module.exports = Chess;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Color = __webpack_require__(3);
	var EventLog = __webpack_require__(4);
	var Fen = __webpack_require__(5);
	var Flags = __webpack_require__(6);
	var Move = __webpack_require__(7);
	var MoveContext = __webpack_require__(10);
	var Piece = __webpack_require__(9);
	var PieceType = __webpack_require__(8);

	var BoardVariation = (function () {
	    function BoardVariation(eventLog) {
	        var _castlingEligibility, _kings;

	        _classCallCheck(this, BoardVariation);

	        this.id = BoardVariation.id++;

	        this.parentVariation = null;
	        this.parentLastMoveIndex = null;
	        this.turn = Color.WHITE;
	        this.enPassantSquare = -1; // the 0x88 index of the current en passant capture square, if any
	        this.moveNumber = 1; // logical move number
	        this.plyCount = 0; // physical move number
	        this.halfMoves = 0; // halfMoves != plyCount, but the number of ply since last capture or pawn advancement

	        this.board = Array.apply(null, new Array(128)).map(function () {
	            return Piece.NONE;
	        }); // an array of Pieces, just { color, type }.  Blank squares are left as Piece.NONE.
	        // Conceptually, this array is 128 elements long, per the 0x88 system.

	        this.castlingEligibility = (_castlingEligibility = {}, _defineProperty(_castlingEligibility, Color.WHITE, Flags.KSIDE_CASTLE & Flags.QSIDE_CASTLE), _defineProperty(_castlingEligibility, Color.BLACK, Flags.KSIDE_CASTLE & Flags.QSIDE_CASTLE), _castlingEligibility);
	        this.kings = (_kings = {}, _defineProperty(_kings, Color.WHITE, -1), _defineProperty(_kings, Color.BLACK, -1), _kings);

	        // the 0x88 index of the black King's current location
	        this.moveHistory = []; // array of MoveContext objects...
	        this.selectedMoveHistoryIndex = -1;

	        this.positionCount = new Map(); // a mapping from FEN positional string to frequency count;  used in isThreefoldRepetition()

	        this.intraMoveAnnotationSlots = []; // an array of arrays, used for storing PGN comments and PGN Glyphs

	        this.eventLog = eventLog; // EventLog for tracking all player interactions at the Game.js level

	        this.isContinuation = false;
	    }

	    // copy constructor

	    _createClass(BoardVariation, [{
	        key: 'loadFen',
	        value: function loadFen(fen /* string */) {
	            if (!Fen.validate(fen).isValid) {
	                return false;
	            }

	            this.id = BoardVariation.id++; // loading from fen should (probably) force a new variation ID
	            this.board = Array.apply(null, new Array(128)).map(function () {
	                return Piece.NONE;
	            });

	            var tokens = fen.split(/\s+/);
	            var position = tokens[0];
	            var square = 0;

	            for (var i = 0; i < position.length; i++) {
	                var symbol = position.charAt(i);

	                if (symbol === '/') {
	                    square += 8;
	                } else if ('0123456789'.indexOf(symbol) !== -1) {
	                    square += parseInt(symbol, 10);
	                } else {
	                    this.put(Piece.forSymbol(symbol), BoardVariation._algebraic(square));
	                    square++;
	                }
	            }

	            this.turn = tokens[1];

	            if (tokens[2].indexOf('K') > -1) {
	                this.castlingEligibility[Color.WHITE] |= Flags.KSIDE_CASTLE;
	            }
	            if (tokens[2].indexOf('Q') > -1) {
	                this.castlingEligibility[Color.WHITE] |= Flags.QSIDE_CASTLE;
	            }
	            if (tokens[2].indexOf('k') > -1) {
	                this.castlingEligibility[Color.BLACK] |= Flags.KSIDE_CASTLE;
	            }
	            if (tokens[2].indexOf('q') > -1) {
	                this.castlingEligibility[Color.BLACK] |= Flags.QSIDE_CASTLE;
	            }

	            this.enPassantSquare = tokens[3] === '-' ? -1 : Move.SQUARES[tokens[3]];
	            this.halfMoves = parseInt(tokens[4], 10);
	            this.moveNumber = parseInt(tokens[5], 10);

	            this.positionCount.set(this.toFen({ omitExtras: true }), 1);

	            return true;
	        }
	    }, {
	        key: 'inspect',
	        value: function inspect() {
	            // for more succinct console.log() output
	            return this.toString();
	        }
	    }, {
	        key: 'toString',
	        value: function toString() {
	            var s = '   +------------------------+' + (this.turn === Color.BLACK ? '  <-- ' + this.plyCount : '') + '\n';
	            for (var i = Move.SQUARES.a8; i <= Move.SQUARES.h1; i++) {
	                // display the rank
	                if (BoardVariation._file(i) === 0) {
	                    s += ' ' + '87654321'[BoardVariation._rank(i)] + ' |';
	                }

	                s += ' ' + this.board[i] + ' ';

	                if (i + 1 & 0x88) {
	                    s += '|\n';
	                    i += 8;
	                }
	            }
	            s += '   +------------------------+' + (this.turn === Color.WHITE ? '  <-- ' + this.plyCount : '') + '\n';
	            s += '     a  b  c  d  e  f  g  h\n';

	            return s;
	        }
	    }, {
	        key: 'toFen',
	        value: function toFen() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                omitExtras: false
	            } : arguments[0];

	            var empty = 0;
	            var fen = '';

	            for (var i = Move.SQUARES.a8; i <= Move.SQUARES.h1; i++) {
	                if (this.board[i] === Piece.NONE) {
	                    empty++;
	                } else {
	                    if (empty > 0) {
	                        fen += empty;
	                        empty = 0;
	                    }
	                    fen += this.board[i];
	                }

	                if (i + 1 & 0x88) {
	                    if (empty > 0) {
	                        fen += empty;
	                    }

	                    if (i !== Move.SQUARES.h1) {
	                        fen += '/';
	                    }

	                    empty = 0;
	                    i += 8;
	                }
	            }

	            if (options.omitExtras) {
	                return fen;
	            }

	            var castlingFlags = '';
	            if (this.castlingEligibility[Color.WHITE] & Flags.KSIDE_CASTLE) {
	                castlingFlags += 'K';
	            }
	            if (this.castlingEligibility[Color.WHITE] & Flags.QSIDE_CASTLE) {
	                castlingFlags += 'Q';
	            }
	            if (this.castlingEligibility[Color.BLACK] & Flags.KSIDE_CASTLE) {
	                castlingFlags += 'k';
	            }
	            if (this.castlingEligibility[Color.BLACK] & Flags.QSIDE_CASTLE) {
	                castlingFlags += 'q';
	            }

	            // do we have an empty castling flag?
	            castlingFlags = castlingFlags || '-';
	            var epFlags = this.enPassantSquare === -1 ? '-' : BoardVariation._algebraic(this.enPassantSquare);

	            return [fen, this.turn, castlingFlags, epFlags, this.halfMoves, this.moveNumber].join(' ');
	        }
	    }, {
	        key: 'put',
	        value: function put(piece, /* Piece, e.g. Piece.WHITE_ROOK */square /* string, e.g. 'h8' */) {
	            // no event logging;  this method is user facing, but is not involved with puzzle interaction

	            if (!(piece in Piece.LOOKUP && square in Move.SQUARES)) {
	                return false;
	            }

	            var sq = Move.SQUARES[square];

	            // don't let the user place more than one king
	            if (piece.type == PieceType.KING && !(this.kings[piece.color] === -1 || this.kings[piece.color] === sq)) {
	                return false;
	            }

	            this.board[sq] = piece;

	            if (piece.type === PieceType.KING) {
	                this.kings[piece.color] = sq;
	            }

	            return true;
	        }
	    }, {
	        key: 'get',
	        value: function get(square /* string, e.g. 'a1' */) {
	            if (!square in Move.SQUARES) {
	                return false;
	            }

	            return this.board[Move.SQUARES[square]];
	        }
	    }, {
	        key: 'remove',
	        value: function remove(square /* string, e.g. 'a1' */) {
	            // no event logging;  this method is user facing, but is not involved with puzzle interaction

	            if (!square in Move.SQUARES) {
	                return false;
	            }

	            var piece = this.get(square);
	            this.board[Move.SQUARES[square]] = Piece.NONE;

	            if (piece.type === PieceType.KING) {
	                this.kings[piece.color] = -1;
	            }

	            return piece;
	        }
	    }, {
	        key: 'moves',
	        value: function moves() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                onlyAlgebraicSquares: false
	            } : arguments[0];

	            // no event logging;  this method is user facing, but is not involved with puzzle interaction

	            if (options.onlyAlgebraicSquares) {
	                return this._generateMoves({ calculateSan: false }).map(function (move) {
	                    return move.algebraic;
	                });
	            } else {
	                return this._generateMoves({ calculateSan: true }).map(function (move) {
	                    return move.san;
	                });
	            }
	        }
	    }, {
	        key: '_applyMove',
	        value: function _applyMove(move /* Move object from move.js */) {
	            var us = this.turn;
	            var them = us === Color.WHITE ? Color.BLACK : Color.WHITE;

	            this.board[move.to] = this.board[move.from];
	            this.board[move.from] = Piece.NONE;

	            // if ep capture, remove the captured pawn
	            if (move.flags & Flags.EP_CAPTURE) {
	                if (this.turn === Color.BLACK) {
	                    this.board[move.to - 16] = Piece.NONE;
	                } else {
	                    this.board[move.to + 16] = Piece.NONE;
	                }
	            }

	            // if pawn promotion, replace with new piece
	            if (move.flags & Flags.PROMOTION) {
	                this.board[move.to] = move.promotionPiece;
	            }

	            // if we moved the king
	            if (move.movedPiece.type === PieceType.KING) {
	                this.kings[move.movedPiece.color] = move.to;
	                // if we castled, move the rook next to the king
	                if (move.flags & Flags.KSIDE_CASTLE) {
	                    var castlingTo = move.to - 1;
	                    var castlingFrom = move.to + 1;

	                    this.board[castlingTo] = this.board[castlingFrom];
	                    this.board[castlingFrom] = Piece.NONE;
	                } else if (move.flags & Flags.QSIDE_CASTLE) {
	                    var castlingTo = move.to + 1;
	                    var castlingFrom = move.to - 2;

	                    this.board[castlingTo] = this.board[castlingFrom];
	                    this.board[castlingFrom] = Piece.NONE;
	                }
	                // turn off castling
	                this.castlingEligibility[us] = 0;
	            }

	            // turn off castling if we move a rook
	            if (this.castlingEligibility[us]) {
	                if (us === Color.WHITE) {
	                    if (move.from === 112 /* a1 */ && this.castlingEligibility[us] & Flags.QSIDE_CASTLE) {
	                        this.castlingEligibility[us] ^= Flags.QSIDE_CASTLE;
	                    } else if (move.from === 119 /* a8 */ && this.castlingEligibility[us] & Flags.KSIDE_CASTLE) {
	                        this.castlingEligibility[us] ^= Flags.KSIDE_CASTLE;
	                    }
	                } else {
	                    if (move.from === 0 /* a8 */ && this.castlingEligibility[us] & Flags.QSIDE_CASTLE) {
	                        this.castlingEligibility[us] ^= Flags.QSIDE_CASTLE;
	                    } else if (move.from === 7 /* h8 */ && this.castlingEligibility[us] & Flags.KSIDE_CASTLE) {
	                        this.castlingEligibility[us] ^= Flags.KSIDE_CASTLE;
	                    }
	                }
	            }

	            // turn off castling if we capture a rook
	            if (this.castlingEligibility[them]) {
	                if (them === Color.WHITE) {
	                    if (move.from === 112 /* a1 */ && this.castlingEligibility[them] & Flags.QSIDE_CASTLE) {
	                        this.castlingEligibility[them] ^= Flags.QSIDE_CASTLE;
	                    } else if (move.from === 119 /* a8 */ && this.castlingEligibility[them] & Flags.KSIDE_CASTLE) {
	                        this.castlingEligibility[them] ^= Flags.KSIDE_CASTLE;
	                    }
	                } else {
	                    if (move.from === 0 /* a8 */ && this.castlingEligibility[them] & Flags.QSIDE_CASTLE) {
	                        this.castlingEligibility[them] ^= Flags.QSIDE_CASTLE;
	                    } else if (move.from === 7 /* h8 */ && this.castlingEligibility[them] & Flags.KSIDE_CASTLE) {
	                        this.castlingEligibility[them] ^= Flags.KSIDE_CASTLE;
	                    }
	                }
	            }

	            // if big pawn move, update the en passant square
	            if (move.flags & Flags.BIG_PAWN) {
	                if (this.turn === Color.BLACK) {
	                    this.enPassantSquare = move.to - 16;
	                } else {
	                    this.enPassantSquare = move.to + 16;
	                }
	            } else {
	                this.enPassantSquare = -1;
	            }

	            // reset the 100 half-move counter if a pawn is moved or a piece is captured
	            if (move.movedPiece.type === PieceType.PAWN) {
	                this.halfMoves = 0;
	            } else if (move.flags & (Flags.CAPTURE | Flags.EP_CAPTURE)) {
	                this.halfMoves = 0;
	            } else {
	                this.halfMoves++;
	            }
	            if (this.turn === Color.BLACK) {
	                this.moveNumber++;
	            }

	            this.plyCount = this.plyCount + 1;

	            this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
	        }

	        // TODO(6.27.15)   need to reinstrument all pair-wise calls to makeMove() <--> undoCurrentMove(),
	        // and possibly _applyMove() <--> _applyUndoMove() should you want to properly avoid fenCount calculations
	    }, {
	        key: 'undoCurrentMove',
	        value: function undoCurrentMove() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                updatePositionCount: true
	            } : arguments[0];

	            // no event logging;  this method is only used internally

	            if (this.selectedMoveHistoryIndex < 0) {
	                return false;
	            }

	            var oldMoveContext = this.moveHistory[this.selectedMoveHistoryIndex];

	            this.moveHistory.length = this.selectedMoveHistoryIndex; // we're undoing the currently selected move, so truncate and remove all moves ahead of us
	            this.selectedMoveHistoryIndex--;

	            var oldMove = this._applyUndoMove(oldMoveContext);

	            if (options.updatePositionCount) {
	                var key = this.toFen({ omitExtras: true });
	                this.positionCount.set(key, this.positionCount.get(key) - 1);

	                if (this.positionCount.get(key) === 0) {
	                    this.positionCount['delete'](key);
	                }
	            }

	            return oldMove;
	        }
	    }, {
	        key: '_applyUndoMove',
	        value: function _applyUndoMove(oldMoveContext) {
	            var _castlingEligibility2, _kings2;

	            var move = oldMoveContext.move;

	            this.castlingEligibility = (_castlingEligibility2 = {}, _defineProperty(_castlingEligibility2, Color.WHITE, oldMoveContext.castlingEligibility[Color.WHITE]), _defineProperty(_castlingEligibility2, Color.BLACK, oldMoveContext.castlingEligibility[Color.BLACK]), _castlingEligibility2);
	            this.kings = (_kings2 = {}, _defineProperty(_kings2, Color.WHITE, oldMoveContext.kings[Color.WHITE]), _defineProperty(_kings2, Color.BLACK, oldMoveContext.kings[Color.BLACK]), _kings2);

	            this.enPassantSquare = oldMoveContext.enPassantSquare;
	            this.halfMoves = oldMoveContext.halfMoves;
	            this.moveNumber = oldMoveContext.moveNumber;
	            this.plyCount = oldMoveContext.plyCount - 1;
	            this.timeTakenToMove = oldMoveContext.timeTakenToMove; // TODO need to change this to be metadata struct
	            this.turn = oldMoveContext.turn;

	            var us = this.turn;

	            this.board[move.from] = Piece.forSymbol(move.movedPiece); // to undo any promotions
	            this.board[move.to] = Piece.NONE;

	            if (move.flags & Flags.CAPTURE) {
	                this.board[move.to] = move.capturedPiece;
	            } else if (move.flags & Flags.EP_CAPTURE) {
	                var index = undefined;
	                if (us === Color.BLACK) {
	                    index = move.to - 16;
	                } else {
	                    index = move.to + 16;
	                }
	                this.board[index] = move.capturedPiece;
	            }

	            if (move.flags & (Flags.KSIDE_CASTLE | Flags.QSIDE_CASTLE)) {
	                var castling_to = undefined,
	                    castling_from = undefined;
	                if (move.flags & Flags.KSIDE_CASTLE) {
	                    castling_to = move.to + 1;
	                    castling_from = move.to - 1;
	                } else if (move.flags & Flags.QSIDE_CASTLE) {
	                    castling_to = move.to - 2;
	                    castling_from = move.to + 1;
	                }
	                this.board[castling_to] = this.board[castling_from];
	                this.board[castling_from] = Piece.NONE;
	            }

	            return move;
	        }
	    }, {
	        key: 'makeMoveFromSan',
	        value: function makeMoveFromSan(sanText, /* string, e.g. "Rxa7" or "e8=Q#" */
	        game /* Game object from game.js */
	        ) /* boolean */
	        {
	            var metadata = arguments.length <= 2 || arguments[2] === undefined ? { // TODO wrap up this move metadata object into its own class, for DRY purposes.  e.g. move_metadata.js
	                comment: null, /* string */
	                timeTakenToMove: null, /* int */
	                isPuzzleSolution: null } : arguments[2];

	            // event logging, always:  this method is user facing, and is involved with puzzle interaction

	            var move = Move.createFromSan(sanText, this);
	            if (move) {
	                this.eventLog.add('makeMoveFromSan(' + sanText + ', ...) --> ' + move.san);

	                return this.makeMove(move, game, metadata);
	            } else {
	                this.eventLog.add('makeMoveFromSan(' + sanText + ', ...) --> invalid move');

	                return false;
	            }
	        }
	    }, {
	        key: '_selectMove',
	        value: function _selectMove(i) {
	            var options = arguments.length <= 1 || arguments[1] === undefined ? {
	                shouldLog: false
	            } : arguments[1];

	            if (options.shouldLog) {
	                this.eventLog.add('_selectMove(' + i);
	            }

	            if (this.selectedMoveHistoryIndex === i) {
	                return true; // already on requested move;  nothing to do.
	            }

	            if (i < -1 || i > this.moveHistory.length - 1) {
	                return false;
	            }

	            return this.replayToPlyNum(i + 1);
	        }
	    }, {
	        key: 'next',
	        value: function next() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                shouldLog: true
	            } : arguments[0];

	            if (options.shouldLog) {
	                this.eventLog.add('next()');
	            }

	            return this._selectMove(this.selectedMoveHistoryIndex + 1);
	        }
	    }, {
	        key: 'prev',
	        value: function prev() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                shouldLog: true
	            } : arguments[0];

	            if (options.shouldLog) {
	                this.eventLog.add('prev()');
	            }

	            return this._selectMove(this.selectedMoveHistoryIndex - 1);
	        }

	        // TODO -- makeMove vs makeMoveFromSan -- these two methods should be combined into one...

	        // TODO(6.27.15) consider a top-level API method for making a move, and an internal API method that does the same making of a move, but is only done
	        // for internal calculations, exploratory moves, etc -- i.e. not official moves, so official board state (puzzle timing;  position count;  etc) should not be updated.
	        // Is this even a good or viable idea??

	    }, {
	        key: 'makeMove',
	        value: function makeMove(move, /* Move object from move.js */
	        game) {
	            var metadata = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	            var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	            metadata = Object.assign({}, {
	                comment: null, /* string */
	                timeTakenToMove: null, /* int */
	                isPuzzleSolution: null /* boolean */
	            }, metadata);

	            options = Object.assign({}, {
	                updatePositionCount: true,
	                isUserMove: true
	            }, options);

	            // no event logging;  method is only used internally;  TODO verify this, after your attempted merger bt makeMove and makeMoveFromSan

	            // TODO:  consider how to handle if made move is in fact a match of the isPuzzleSolution?
	            //// here's the original comment and code
	            ////
	            //// what's happening here;  i need to pass back whether or not the move just made was a "is_puzzle_solution" move
	            //// that exists in the loaded PGN;  however, this here move() method doesn't reference stored moves[], instead it
	            //// uses generate_moves()
	            //
	            //if (next.call(this, false)) {
	            //    pretty_move.is_puzzle_solution = this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index].is_puzzle_solution;
	            //    return pretty_move;
	            //} else {
	            //    return null;
	            //}

	            // TODO(Aaron, 4/3) need to hide time_taken_to_move parameter;  should not be exposed to caller;
	            // instead perform internal calculation here;  replace time_taken with boolean flag, ... ???

	            // TODO(aaron,4/7) add logic for updating the time_take_to_move of an existing move....
	            // if it's an is_puzzle_solution == true move, and no previous timing value exists.... ???

	            // if we're not already at the end of our move list...
	            // TODO damn I really want this logic encapsulated inside an iterator class... this.iterator.isLast()

	            if (options.isUserMove) {

	                // step 1:  check if the next move in our history, if any, matches the requested move
	                if (this.selectedMoveHistoryIndex + 1 !== this.moveHistory.length) {
	                    var nextMoveContext = this.moveHistory[this.selectedMoveHistoryIndex + 1];

	                    // if the requested move is identical to the next move that was already made in
	                    // our move history, then we simply advance our move cursor to that next move.
	                    if (nextMoveContext.move.san === move.san || move.isWildcard) {
	                        this.next({ shouldLog: options.isUserMove });
	                        return this.moveHistory[this.selectedMoveHistoryIndex];
	                    }

	                    // step 1-a:  otherwise, check if the next move has any variations whose first move matches
	                    // the requested move.  If found, then we simply advance our move cursor into that variation.
	                    //
	                    // TODO write a bloody unit test for this
	                    //
	                    for (var i = 0; i < nextMoveContext.childVariations.length; i++) {
	                        if (!nextMoveContext.childVariations[i].isContinuation && ( // variations only
	                        nextMoveContext.childVariations[i].moveHistory[0].move.san === move.san || nextMoveContext.childVariations[i].moveHistory[0].move.isWildcard)) {
	                            // TODO i need to pass back whether or not the move just made was a "is_puzzle_solution" move
	                            // that exists in the loaded PGN;  however, this here move() method doesn't reference stored moves[], instead it
	                            // uses generate_moves()
	                            if (game.descendIntoVariation(i)) {
	                                return game.currentVariation.moveHistory[0];
	                            } else {
	                                return false;
	                            }
	                        }
	                    }
	                }

	                // step 2:  otherwise, check if the current move in our history has a continuation whose first move matches
	                // the requested move.  If found, then we simply advance our move cursor into that continuation.
	                if (this.moveHistory[this.selectedMoveHistoryIndex] && this.moveHistory[this.selectedMoveHistoryIndex].childVariations.length > 0) {
	                    var childVariations = this.moveHistory[this.selectedMoveHistoryIndex].childVariations;

	                    for (var i = 0; i < childVariations.length; i++) {
	                        if (childVariations[i].isContinuation && ( // continuations only
	                        childVariations[i].moveHistory[0].move.san === move.san || childVariations[i].moveHistory[0].move.isWildcard)) {
	                            if (game.descendIntoContinuation(i)) {
	                                return game.currentVariation.moveHistory[0].move;
	                            } else {
	                                return false;
	                            }
	                        }
	                    }
	                }

	                // step 3:  otherwise, if the requested move is a new move *and* we're not at the head of our move branch,
	                // then let's automatically create a new variation on behalf of the user for the requested move
	                if (this.selectedMoveHistoryIndex + 1 !== this.moveHistory.length) {
	                    var currentMoveContext = this.moveHistory[this.selectedMoveHistoryIndex + 1];
	                    // TODO won't this auto-made variation also need its own variation-ID generation logic passed in?  same as code later on down
	                    var newChildVariation = BoardVariation.createFromParentVariation(this, { skipUndoingCurrentMove: true });

	                    currentMoveContext.childVariations.push(newChildVariation);
	                    newChildVariation.makeMove(move, game, metadata, options); // TODO re-use of options here is suspect
	                    game.currentVariation = newChildVariation; // the whole reason we needed to plumb the game object into this method

	                    return currentMoveContext;
	                }
	            }

	            // step 4:  otherwise, our move is a new move, and we're at the head of our move branch;
	            // *or* this is not a user-requested move, in which case we simply make the requested move
	            var moveContext = new MoveContext({
	                move: move,

	                castlingEligibility: this.castlingEligibility,
	                kings: this.kings,

	                turn: this.turn,
	                enPassantSquare: this.enPassantSquare,

	                moveNumber: this.moveNumber,
	                halfMoves: this.halfMoves,
	                plyCount: this.plyCount + 1,

	                metadata: metadata
	            });

	            // insert our new move into moveHistory[] after the current selectedMoveHistoryIndex;  There's offset-by-one logic here.
	            // Do NOT reverse the order of the two lines below, or you will cause all sorts of board state corruption
	            this.selectedMoveHistoryIndex++;
	            this.moveHistory.splice(this.selectedMoveHistoryIndex, 0, moveContext);

	            // generate an ID for this move, one that is unique across the entire game tree.
	            // format:  (({parent_variation's id}-)*)-{half_move_number}
	            //
	            // e.g.:  1. e4 {1} e5 {2} 2. d4 {3} d5 {4} (2... d6 {1-4} 3. c4 {1-5} (3. c3 {1-2-5}))
	            //
	            // TODO(aaron,4/2) I probably want to change this ID scheme from variation_ids to variation_index offset from child_variations;
	            // will make tree traversal significantly easier.  although... what about when a variation is deleted?  hmmm....

	            // TODO(aaron 5.3..15) reinstate eventually
	            /*
	             var moveId = '0-';
	             var current = this;
	             while (current.parentVariation) {
	             moveId += current.id + '-';
	             current = current.parentVariation;
	             }
	             moveId += this.plyCount + this.selectedMoveHistoryIndex;
	              this.moveHistory[this.selectedMoveHistoryIndex].moveId = moveId;
	             */

	            this._applyMove(move);

	            if (options.updatePositionCount) {
	                var key = this.toFen({ omitExtras: true });

	                if (this.positionCount.has(key)) {
	                    this.positionCount.set(key, this.positionCount.get(key) + 1);
	                } else {
	                    this.positionCount.set(key, 1);
	                }
	            }

	            return moveContext;
	        }
	    }, {
	        key: 'replayToPlyNum',
	        value: function replayToPlyNum(n /* logical ply number, starting from 1 */) {
	            // no event logging;  this method is only used internally

	            n = n - 1; // translate from logical ply number to selectedMoveHistoryIndex number
	            if (n > this.selectedMoveHistoryIndex) {
	                this.selectedMoveHistoryIndex++;
	                for (; this.selectedMoveHistoryIndex <= n; this.selectedMoveHistoryIndex++) {
	                    var moveContext = this.moveHistory[this.selectedMoveHistoryIndex].move;

	                    this._applyMove(moveContext);
	                }
	                this.selectedMoveHistoryIndex--;
	            } else if (n < this.selectedMoveHistoryIndex) {
	                for (; n < this.selectedMoveHistoryIndex; this.selectedMoveHistoryIndex--) {
	                    var moveContext = this.moveHistory[this.selectedMoveHistoryIndex];

	                    this._applyUndoMove(moveContext);
	                }
	            }

	            return this.selectedMoveHistoryIndex > -1 && this.selectedMoveHistoryIndex < this.moveHistory.length ? this.moveHistory[this.selectedMoveHistoryIndex] : null;
	        }

	        // helper method, used only in generateMoves(...)
	    }, {
	        key: '_addMove',
	        value: function _addMove(from, to, flags, newMoves, calculateSan, them) {

	            var capturedPiece = flags === Flags.EP_CAPTURE ? this.board[to + (them === Color.BLACK ? 16 : -16)] : this.board[to];

	            var moveConstructorOptions = {
	                from: from,
	                to: to,
	                movedPiece: this.board[from],
	                capturedPiece: capturedPiece,
	                flags: flags,
	                boardVariation: calculateSan ? this : undefined
	            };

	            // if pawn promotion
	            if (this.board[from].type === PieceType.PAWN && (BoardVariation._rank(to) === 0 || BoardVariation._rank(to) === 7)) {
	                var promotionPieces = this.turn === Color.WHITE ? Piece.WHITE_PROMOTION_PIECES : Piece.BLACK_PROMOTION_PIECES;
	                promotionPieces.forEach(function (promotionPiece) {
	                    moveConstructorOptions.promotionPiece = promotionPiece;
	                    newMoves.push(new Move(moveConstructorOptions));
	                });
	            } else {
	                newMoves.push(new Move(moveConstructorOptions));
	            }
	        }
	    }, {
	        key: '_generateMoves',
	        value: function _generateMoves() {
	            var _secondRank,
	                _this = this;

	            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	            options = Object.assign({}, {
	                onlyForSquare: null, /* string, e.g. 'a1' */
	                calculateSan: false,
	                onlyLegalMoves: true
	            }, options);

	            var us = this.turn;
	            var them = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;

	            var secondRank = (_secondRank = {}, _defineProperty(_secondRank, Color.BLACK, 1), _defineProperty(_secondRank, Color.WHITE, 6), _secondRank);

	            var newMoves = [];
	            var firstSquare = Move.SQUARES.a8;
	            var lastSquare = Move.SQUARES.h1;

	            // are we generating moves for a single square?
	            if (options.onlyForSquare) {
	                if (options.onlyForSquare in Move.SQUARES) {
	                    firstSquare = lastSquare = Move.SQUARES[options.onlyForSquare];
	                } else {
	                    return []; // invalid square
	                }
	            }

	            // TODO(aaron) what if instead of inspecting every square, you
	            // instead tracked in BoardVariation the location of all active non-blank pieces
	            // then you could just iterate over them here.  Do a perf test before and after!!!!!!!!!

	            for (var i = firstSquare; i <= lastSquare; i++) {
	                if (i & 0x88) {
	                    i += 7;continue;
	                } // did we run off the end of the board?

	                var piece = this.board[i];
	                if (piece === Piece.NONE || piece.color !== us) {
	                    continue;
	                }

	                var square = undefined;

	                if (piece.type === PieceType.PAWN) {
	                    // single square, non-capturing
	                    square = i + Move.PAWN_OFFSETS[us][0];
	                    if (this.board[square] === Piece.NONE) {
	                        this._addMove(i, square, Flags.NORMAL, newMoves, options.calculateSan);

	                        // double square
	                        square = i + Move.PAWN_OFFSETS[us][1];
	                        if (secondRank[us] === BoardVariation._rank(i) && this.board[square] === Piece.NONE) {
	                            this._addMove(i, square, Flags.BIG_PAWN, newMoves, options.calculateSan);
	                        }
	                    }

	                    // pawn captures
	                    for (var j = 2; j < 4; j++) {
	                        square = i + Move.PAWN_OFFSETS[us][j];
	                        if (square & 0x88) continue;

	                        if (this.board[square] !== Piece.NONE && this.board[square].color === them) {
	                            this._addMove(i, square, Flags.CAPTURE, newMoves, options.calculateSan);
	                        } else if (square === this.enPassantSquare) {
	                            this._addMove(i, this.enPassantSquare, Flags.EP_CAPTURE, newMoves, options.calculateSan, them);
	                        }
	                    }
	                } else {
	                    for (var j = 0, len = Move.PIECE_OFFSETS[piece.type].length; j < len; j++) {
	                        var offset = Move.PIECE_OFFSETS[piece.type][j];
	                        square = i;

	                        while (true) {
	                            square += offset;
	                            if (square & 0x88) break;

	                            if (this.board[square] === Piece.NONE) {
	                                this._addMove(i, square, Flags.NORMAL, newMoves, options.calculateSan);
	                            } else {
	                                if (this.board[square].color === us) break;
	                                this._addMove(i, square, Flags.CAPTURE, newMoves, options.calculateSan);
	                                break;
	                            }

	                            // break, if knight or king
	                            if (piece.type === PieceType.KNIGHT || piece.type === PieceType.KING) {
	                                break;
	                            }
	                        }
	                    }
	                }
	            }

	            // check for castling if: a) we're generating all moves, or b) we're doing single square move generation on the king's square
	            if (!options.onlyForSquare || lastSquare === this.kings[us]) {
	                // king-side castling
	                if (this.castlingEligibility[us] & Flags.KSIDE_CASTLE) {
	                    var castlingFrom = this.kings[us];
	                    var castlingTo = castlingFrom + 2;

	                    if (this.board[castlingFrom + 1] === Piece.NONE && this.board[castlingTo] === Piece.NONE && !this.isAttacked(them, this.kings[us]) && !this.isAttacked(them, castlingFrom + 1) && !this.isAttacked(them, castlingTo)) {
	                        this._addMove(this.kings[us], castlingTo, Flags.KSIDE_CASTLE, newMoves, options.calculateSan);
	                    }
	                }

	                // queen-side castling
	                if (this.castlingEligibility[us] & Flags.QSIDE_CASTLE) {
	                    var castlingFrom = this.kings[us];
	                    var castlingTo = castlingFrom - 2;

	                    if (this.board[castlingFrom - 1] === Piece.NONE && this.board[castlingFrom - 2] === Piece.NONE && this.board[castlingFrom - 3] === Piece.NONE && !this.isAttacked(them, this.kings[us]) && !this.isAttacked(them, castlingFrom - 1) && !this.isAttacked(them, castlingTo)) {
	                        this._addMove(this.kings[us], castlingTo, Flags.QSIDE_CASTLE, newMoves, options.calculateSan);
	                    }
	                }
	            }

	            // return all pseudo-legal moves (this includes moves that allow the king to be captured)
	            if (!options.onlyLegalMoves) {
	                return newMoves;
	            }

	            // filter out illegal moves
	            var legalMoves = [];

	            if (newMoves.length > 0) {
	                // TODO this futureMoves logic is duplicated in Move.toSan(move, boardVariation);
	                // might be good candidate for abstraction behind would-be-named MoveHistory object

	                // makeMove() below is destructive to all future moves ahead
	                // of our current move pointer, so we save a copy here
	                var futureMoves = this.moveHistory.slice(this.selectedMoveHistoryIndex + 1);

	                newMoves.forEach(function (newMove) {
	                    _this.makeMove(newMove, null, null, { updatePositionCount: false, isUserMove: false });
	                    if (!_this.isKingAttacked(us)) {
	                        legalMoves.push(newMove);
	                    }

	                    _this.undoCurrentMove({ updatePositionCount: false });
	                });

	                // restore our previously saved future moves
	                this.moveHistory = this.moveHistory.concat(futureMoves);
	            }

	            return legalMoves;
	        }

	        // this function is used to uniquely identify ambiguous moves
	    }, {
	        key: 'getDisambiguator',
	        value: function getDisambiguator(move /* Move object from move.js */) {
	            var moves = this._generateMoves();

	            var from = move.from;
	            var to = move.to;
	            var piece = move.movedPiece;

	            var ambiguities = 0;
	            var sameRank = 0;
	            var sameFile = 0;

	            for (var i = 0, len = moves.length; i < len; i++) {
	                var ambigFrom = moves[i].from;
	                var ambigTo = moves[i].to;
	                var ambigPiece = moves[i].movedPiece;

	                // if a move of the same piece type ends on the same to square, we'll
	                // need to add a disambiguator to the algebraic notation
	                if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {
	                    ambiguities++;

	                    if (BoardVariation._rank(from) === BoardVariation._rank(ambigFrom)) {
	                        sameRank++;
	                    }

	                    if (BoardVariation._file(from) === BoardVariation._file(ambigFrom)) {
	                        sameFile++;
	                    }
	                }
	            }
	            if (ambiguities > 0) {
	                // if there exists a similar moving piece on the same rank and file as
	                // the move in question, use the square as the disambiguator
	                if (sameRank > 0 && sameFile > 0) {
	                    return BoardVariation._algebraic(from);
	                }
	                // if the moving piece rests on the same file,
	                // use the rank symbol as the disambiguator
	                else if (sameFile > 0) {
	                        return BoardVariation._algebraic(from).charAt(1);
	                    }
	                    // else use the file symbol
	                    else {
	                            return BoardVariation._algebraic(from).charAt(0);
	                        }
	            }

	            return '';
	        }
	    }, {
	        key: 'isAttacked',
	        value: function isAttacked(color, square) {
	            for (var i = Move.SQUARES.a8; i <= Move.SQUARES.h1; i++) {
	                // did we run off the end f the board
	                if (i & 0x88) {
	                    i += 7;continue;
	                }

	                // if empty square or wrong color
	                if (this.board[i] === Piece.NONE) continue;
	                if (this.board[i].color !== color) continue;

	                var difference = i - square;
	                var index = difference + 119;

	                var piece = this.board[i];

	                if (Move.ATTACKS[index] & 1 << Move.SHIFTS[piece.type]) {
	                    if (piece.type === PieceType.PAWN) {
	                        if (difference > 0) {
	                            if (piece.color === Color.WHITE) return true;
	                        } else {
	                            if (piece.color === Color.BLACK) return true;
	                        }
	                        continue;
	                    }

	                    // if the piece is a knight or a king
	                    if (piece.type === PieceType.KNIGHT || piece.type === PieceType.KING) return true;

	                    var offset = Move.RAYS[index];
	                    var j = i + offset;

	                    var blocked = false;
	                    while (j !== square) {
	                        if (this.board[j] !== Piece.NONE) {
	                            blocked = true;
	                            break;
	                        }
	                        j += offset;
	                    }

	                    if (!blocked) return true;
	                }
	            }

	            return false;
	        }
	    }, {
	        key: 'isKingAttacked',
	        value: function isKingAttacked(color) {
	            return this.isAttacked(color === Color.WHITE ? Color.BLACK : Color.WHITE, this.kings[color]);
	        }
	    }, {
	        key: 'isCheck',
	        value: function isCheck() {
	            return this.isKingAttacked(this.turn);
	        }
	    }, {
	        key: 'isCheckmate',
	        value: function isCheckmate() {
	            return this.isCheck() && this._generateMoves().length === 0;
	        }
	    }, {
	        key: 'isStalemate',
	        value: function isStalemate() {
	            return !this.isCheck() && this._generateMoves().length === 0;
	        }
	    }, {
	        key: 'isDraw',
	        value: function isDraw() {
	            return this.halfMoves >= 100 || this.isStalemate() || this.isInsufficientMaterial() || this.isThreefoldRepetition();
	        }
	    }, {
	        key: 'isInsufficientMaterial',
	        value: function isInsufficientMaterial() {
	            var pieceCount = {};
	            var totalPieceCount = 0;

	            var bishops = [];
	            var squareColor = 0;

	            for (var i = Move.SQUARES.a8; i <= Move.SQUARES.h1; i++) {
	                squareColor = (squareColor + 1) % 2;
	                if (i & 0x88) {
	                    i += 7;continue;
	                }

	                var piece = this.board[i];
	                if (piece.type !== PieceType.NONE) {
	                    pieceCount[piece.type] = piece.type in pieceCount ? pieceCount[piece.type] + 1 : 1;
	                    if (piece.type === PieceType.BISHOP) {
	                        bishops.push(squareColor);
	                    }
	                    totalPieceCount++;
	                }
	            }

	            // k vs. k
	            if (totalPieceCount === 2) {
	                return true;
	            }

	            // k vs. kn ... or ... k vs. kb
	            else if (totalPieceCount === 3 && (pieceCount[PieceType.BISHOP] === 1 || pieceCount[PieceType.KNIGHT] === 1)) {
	                    return true;
	                }

	                // kb vs. kb where any number of bishops are all on the same color
	                else if (totalPieceCount === pieceCount[PieceType.BISHOP] + 2) {
	                        var len = bishops.length;
	                        var sum = 0;
	                        for (var i = 0; i < len; i++) {
	                            sum += bishops[i];
	                        }
	                        if (sum === 0 || sum === len) {
	                            return true;
	                        }
	                    }

	            return false;
	        }
	    }, {
	        key: 'isThreefoldRepetition',
	        value: function isThreefoldRepetition() {
	            return Array.from(this.positionCount.values()).some(function (count) {
	                return count >= 3;
	            });
	        }
	    }, {
	        key: 'isGameOver',
	        value: function isGameOver() {
	            return this.halfMoves >= 100 || this.isCheckmate() || this.isStalemate() || this.isInsufficientMaterial() || this.isThreefoldRepetition();
	        }
	    }], [{
	        key: 'copyFrom',
	        value: function copyFrom(other /* BoardVariation object */) {
	            var _copy$castlingEligibility, _copy$kings;

	            var copy = Object.create(BoardVariation.prototype);

	            // Yes, copying things in Javascript is not straightforward.  http://stackoverflow.com/questions/14443357/primitive-types-reference-types-in-javascript

	            copy.id = BoardVariation.id++;
	            copy.parentVariation = other.parentVariation; // yes this should remain a pointer;  shouldn't be a full clone
	            copy.parentLastMoveIndex = other.parentLastMoveIndex;
	            copy.turn = other.turn;
	            copy.enPassantSquare = other.enPassantSquare;

	            copy.moveNumber = other.moveNumber;
	            copy.plyCount = other.plyCount;
	            copy.halfMoves = other.halfMoves;

	            copy.board = other.board.slice(0); // http://stackoverflow.com/questions/15722433/javascript-copy-array-to-new-array
	            copy.castlingEligibility = (_copy$castlingEligibility = {}, _defineProperty(_copy$castlingEligibility, Color.WHITE, other.castlingEligibility[Color.WHITE]), _defineProperty(_copy$castlingEligibility, Color.BLACK, other.castlingEligibility[Color.BLACK]), _copy$castlingEligibility);
	            copy.kings = (_copy$kings = {}, _defineProperty(_copy$kings, Color.WHITE, other.kings[Color.WHITE]), _defineProperty(_copy$kings, Color.BLACK, other.kings[Color.BLACK]), _copy$kings);
	            copy.moveHistory = other.moveHistory.slice(0);
	            copy.selectedMoveHistoryIndex = other.selectedMoveHistoryIndex;

	            copy.positionCount = new Map(other.positionCount);

	            copy.intraMoveAnnotationSlots = other.intraMoveAnnotationSlots.slice(0);

	            copy.eventLog = other.eventLog;

	            return copy;
	        }

	        // branching constructor:  we're forking our game tree by building a new BoardVariation from the given BoardVariation
	    }, {
	        key: 'createFromParentVariation',
	        value: function createFromParentVariation(parent /* BoardVariation object */) {
	            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	            options = Object.assign({}, {
	                isContinuation: false,
	                resetIdCounter: false,
	                skipUndoingCurrentMove: false
	            }, options);

	            var copy = BoardVariation.copyFrom(parent);

	            // if this is a PGN variations, then undo the previous move, by definition
	            if (!options.skipUndoingCurrentMove && !options.isContinuation) {
	                copy.undoCurrentMove();
	            }

	            if (options.resetIdCounter) {
	                BoardVariation.id = 0;
	            }

	            copy.id = BoardVariation.id++;
	            copy.parentLastMoveIndex = parent.selectedMoveHistoryIndex;
	            copy.parentVariation = parent;
	            copy.isContinuation = options.isContinuation;

	            // clear out the existing history
	            copy.moveHistory = [];
	            copy.selectedMoveHistoryIndex = -1;
	            copy.intraMoveAnnotationSlots = [];

	            return copy;
	        }
	    }, {
	        key: 'createFromFen',
	        value: function createFromFen(fen /* string */) /* EventLog.js object */{
	            var eventLog = arguments.length <= 1 || arguments[1] === undefined ? new EventLog() : arguments[1];

	            var variation = new BoardVariation(eventLog);
	            if (variation.loadFen(fen)) {
	                return variation;
	            } else {
	                return false;
	            }
	        }
	    }, {
	        key: '_file',
	        value: function _file(i) {
	            return i & 15;
	        }
	    }, {
	        key: '_rank',
	        value: function _rank(i) {
	            return i >> 4;
	        }
	    }, {
	        key: '_algebraic',
	        value: function _algebraic(i) {
	            var f = BoardVariation._file(i);
	            var r = BoardVariation._rank(i);
	            return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
	        }
	    }]);

	    return BoardVariation;
	})();

	;

	BoardVariation.id = 0;

	module.exports = BoardVariation;
	// castling eligibility flags
	// the 0x88 index of the white King's current location
	// integer, the new value of our selectedMoveHistoryIndex
	/* Game object from game.js */

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	// NOTE: tried having a Color class, with a corresponding ColorType class, and utility methods
	// on the Color class such as swap(), isWhite(), isBlack(), etc.  Similar to the Piece and PieceType
	// classes.  But doing so caused a performance hit (added ~1 sec to the Dirty PGN test)

	// NOTE: tried having Color.WHITE = true, and Color.BLACK = false, so as to simplify
	// color comparisons to e.g. "if (this.turn)" instead of "if (this.turn === Color.WHITE)", and
	// also simplify color swapping to "us = !them" instead of "us = them === Color.WHITE ? Color.Black : Color.WHITE").
	// But doing caused a performance hit (added ~300 ms to the Dirty PGN test)

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Color = function Color() {
	  _classCallCheck(this, Color);
	};

	Color.WHITE = 'w';
	Color.BLACK = 'b';
	Color.NONE = '~';

	module.exports = Color;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var EventLog = (function () {
	    function EventLog() {
	        _classCallCheck(this, EventLog);

	        this._events = [];
	        this._lastTimerSnapshot = Date.now();

	        this._events.push({
	            timer: this._lastTimerSnapshot,
	            delta: null,
	            event: 'EventLog initialized.'
	        });
	    }

	    _createClass(EventLog, [{
	        key: 'add',
	        value: function add(event) {
	            var delta = this._updateEventTimer();

	            this._events.push({
	                timer: this._lastTimerSnapshot,
	                delta: delta,
	                event: event
	            });
	        }
	    }, {
	        key: '_updateEventTimer',
	        value: function _updateEventTimer() {
	            var prev = this._lastTimerSnapshot;
	            this._lastTimerSnapshot = Date.now();
	            return this._lastTimerSnapshot - prev;
	        }
	    }]);

	    return EventLog;
	})();

	;

	module.exports = EventLog;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Fen = (function () {
	    function Fen() {
	        _classCallCheck(this, Fen);
	    }

	    _createClass(Fen, null, [{
	        key: 'validate',
	        value: function validate(fen /* string */) {
	            // 1st criterion: 6 space-separated fields?
	            var tokens = fen.split(/\s+/);
	            if (tokens.length !== 6) {
	                return { isValid: false, errorCode: 1, errorMessage: Fen.ERRORS[1] };
	            }

	            // 2nd criterion: move number field is a integer value > 0?
	            if (isNaN(tokens[5]) || parseInt(tokens[5], 10) <= 0) {
	                return { isValid: false, errorCode: 2, errorMessage: Fen.ERRORS[2] };
	            }

	            // 3rd criterion: half move counter is an integer >= 0?
	            if (isNaN(tokens[4]) || parseInt(tokens[4], 10) < 0) {
	                return { isValid: false, errorCode: 3, errorMessage: Fen.ERRORS[3] };
	            }

	            // 4th criterion: 4th field is a valid e.p.-string?
	            if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
	                return { isValid: false, errorCode: 4, errorMessage: Fen.ERRORS[4] };
	            }

	            // 5th criterion: 3th field is a valid castle-string?
	            if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
	                return { isValid: false, errorCode: 5, errorMessage: Fen.ERRORS[5] };
	            }

	            // 6th criterion: 2nd field is "w" (white) or "b" (black)?
	            if (!/^(w|b)$/.test(tokens[1])) {
	                return { isValid: false, errorCode: 6, errorMessage: Fen.ERRORS[6] };
	            }

	            // 7th criterion: 1st field contains 8 rows?
	            var rows = tokens[0].split('/');
	            if (rows.length !== 8) {
	                return { isValid: false, errorCode: 7, errorMessage: Fen.ERRORS[7] };
	            }

	            // 8th criterion: every row is valid?
	            for (var i = 0; i < rows.length; i++) {
	                // check for right sum of fields AND not two numbers in succession
	                var sumFields = 0;
	                var previousWasNumber = false;

	                for (var k = 0; k < rows[i].length; k++) {
	                    if (!isNaN(rows[i][k])) {
	                        if (previousWasNumber) {
	                            return { isValid: false, errorCode: 8, errorMessage: Fen.ERRORS[8] };
	                        }
	                        sumFields += parseInt(rows[i][k], 10);
	                        previousWasNumber = true;
	                    } else {
	                        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
	                            return { isValid: false, errorCode: 9, errorMessage: Fen.ERRORS[9] };
	                        }
	                        sumFields += 1;
	                        previousWasNumber = false;
	                    }
	                }
	                if (sumFields !== 8) {
	                    return { isValid: false, errorCode: 10, errorMessage: Fen.ERRORS[10] };
	                }
	            }

	            // everything is okay!
	            return { isValid: true, errorCode: 0, error: Fen.ERRORS[0] };
	        }
	    }]);

	    return Fen;
	})();

	;

	Fen.ERRORS = {
	    0: 'No errors.',
	    1: 'FEN string must contain six space-delimited fields.',
	    2: '6th field (move number) must be a positive integer.',
	    3: '5th field (half move counter) must be a non-negative integer.',
	    4: '4th field (en-passant square) is invalid.',
	    5: '3rd field (castling availability) is invalid.',
	    6: '2nd field (side to move) is invalid.',
	    7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
	    8: '1st field (piece positions) is invalid [consecutive numbers].',
	    9: '1st field (piece positions) is invalid [invalid piece].',
	    10: '1st field (piece positions) is invalid [row too large].'
	};

	Fen.DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
	Fen.DEFAULT_POSITION_FULL = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

	module.exports = Fen;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	var _Flags$DISPLAY;

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Flags = function Flags() {
	    _classCallCheck(this, Flags);
	};

	;

	Flags.NORMAL = 1;
	Flags.CAPTURE = 2;
	Flags.BIG_PAWN = 4; // a pawn moving two spaces
	Flags.EP_CAPTURE = 8;
	Flags.PROMOTION = 16;
	Flags.KSIDE_CASTLE = 32;
	Flags.QSIDE_CASTLE = 64;
	Flags.DISPLAY = (_Flags$DISPLAY = {}, _defineProperty(_Flags$DISPLAY, Flags.NORMAL, 'n'), _defineProperty(_Flags$DISPLAY, Flags.CAPTURE, 'c'), _defineProperty(_Flags$DISPLAY, Flags.BIG_PAWN, 'b'), _defineProperty(_Flags$DISPLAY, Flags.EP_CAPTURE, 'e'), _defineProperty(_Flags$DISPLAY, Flags.PROMOTION, 'p'), _defineProperty(_Flags$DISPLAY, Flags.KSIDE_CASTLE, 'k'), _defineProperty(_Flags$DISPLAY, Flags.QSIDE_CASTLE, 'q'), _Flags$DISPLAY);

	module.exports = Flags;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _Move$PAWN_OFFSETS, _Move$PIECE_OFFSETS, _Move$SHIFTS;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Color = __webpack_require__(3);
	var PieceType = __webpack_require__(8);
	var Piece = __webpack_require__(9);
	var Flags = __webpack_require__(6);

	// TODO 8.17.15 I'm thinking it might make more sense to just add MoveContext and also MoveMetadata
	// as member hash variables of this here class

	var Move = (function () {

	    // default constructor
	    //
	    // every Move object is meant to be full-fledged enough to be usable in all places for all needs.

	    function Move(options) {
	        _classCallCheck(this, Move);

	        var
	        // required
	        from = // int            -- bitwise flags describing annotative state about this move;  defaults to Flags.NORMAL

	        // BoardVariation -- if passed in, then caller is asking us to calculate the given move's SAN notation, e.g. "Rx7#"
	        options.from;
	        var // int            -- the 0x88 index for the departure square of this move
	        to = options.to;
	        var // int            -- the 0x88 index for the destination square of this move 
	        movedPiece = options.movedPiece;
	        var // Piece          -- the piece being moved

	        // optional      
	        capturedPiece = options.capturedPiece;
	        var // Piece          -- the piece, if any, at the destination square
	        promotionPiece = options.promotionPiece;
	        var // Piece          -- the piece being promoted to.
	        flags = options.flags;
	        var boardVariation = options.boardVariation;

	        if (!Move.isValidIndex(from) || !Move.isValidIndex(to)) {
	            throw new Error('illegal 0x88 index passed into new Move(): (from, to) = ' + from + ', ' + to);
	        }

	        if (!flags) {
	            flags = Flags.NORMAL;
	        }

	        if (promotionPiece) {
	            flags |= Flags.PROMOTION;
	        }

	        if (!capturedPiece && flags === Flags.EP_CAPTURE) {
	            capturedPiece = movedPiece.color === Color.WHITE ? Piece.BLACK_PAWN : Piece.WHITE_PAWN;
	        }

	        this.from = from;
	        this.to = to;
	        this.movedPiece = movedPiece;
	        this.capturedPiece = capturedPiece;
	        this.flags = flags;
	        this.promotionPiece = promotionPiece;
	        this.isWildcard = false;

	        this.algebraic = this.movedPiece + Move.SQUARES_LOOKUP[this.from] + "-" + Move.SQUARES_LOOKUP[this.to]; // e.g. "Nd2-d4", "kh7-h8", "Pa2-a4", "pa6-a5"

	        this.san = boardVariation ? Move.toSan(this, boardVariation) : undefined;
	    }

	    // copy constructor

	    _createClass(Move, [{
	        key: 'toString',
	        value: function toString() {
	            return this.san;
	        }
	    }], [{
	        key: 'copyFrom',
	        value: function copyFrom(other /* Move object */) {
	            var copy = Object.create(Move.prototype);

	            copy.from = other.from; // int
	            copy.to = other.to; // int
	            copy.movedPiece = other.movedPiece; // Piece, which is a frozen object, so it's safe to reuse
	            copy.capturedPiece = other.capturedPiece; // Piece, which is a frozen object, so it's safe to reuse
	            copy.flags = other.flags; // int
	            copy.san = other.san; // string
	            copy.promotionPiece = other.promotionPiece; // Piece, which is a frozen object, so it's safe to reuse
	            copy.isWildcard = other.isWildcard; // boolean

	            copy.algebraic = other.algebraic; // debugging move text, e.g. "Ke7-e8"

	            return copy;
	        }

	        // SAN constructor
	    }, {
	        key: 'createFromSan',
	        value: function createFromSan(sanText, /* string, e.g. "Rxa7" or "e8=Q#" */boardVariation /* BoardVariation object */) {
	            if (!sanText) {
	                return false;
	            }

	            sanText = sanText.trim().replace(/[+#?!=]+$/, '');
	            var moves = boardVariation._generateMoves({ calculateSan: true });

	            if (sanText === Move.WILDCARD_MOVE) {
	                return Move.createWildcardMove(boardVariation);
	            } else {
	                for (var i = 0, len = moves.length; i < len; i++) {
	                    // prefix match, so as to ignore move decorations, e.g. "Nf3+?!"
	                    if (moves[i].san.indexOf(sanText) === 0) {
	                        return moves[i];
	                    }
	                }
	            }

	            return false;
	        }

	        // Wildcard Move constructor
	    }, {
	        key: 'createWildcardMove',
	        value: function createWildcardMove(boardVariation /* BoardVariation object */) {
	            var moves = boardVariation._generateMoves();
	            if (moves.length == 0) {
	                return null;
	            } else {
	                // the move doesn't matter, so we just pick the first legal move we found
	                var move = moves[0];
	                move.isWildcard = true;
	                return move;
	            }
	        }
	    }, {
	        key: 'isValidIndex',
	        value: function isValidIndex(i /* an 0x88 board index value */) {
	            return 0 <= i && i <= 7 || 16 <= i && i <= 23 || 32 <= i && i <= 39 || 48 <= i && i <= 55 || 64 <= i && i <= 71 || 80 <= i && i <= 87 || 96 <= i && i <= 103 || 112 <= i && i <= 119;
	        }

	        // convert an already created Move object from its 0x88 coordinates to Standard Algebraic Notation (SAN)
	    }, {
	        key: 'toSan',
	        value: function toSan(move, /* Move object */
	        boardVariation /* BoardVariation object */
	        ) {
	            if (move.isWildcard) {
	                return Move.WILDCARD_MOVE;
	            }

	            var output = '';

	            if (move.flags & Flags.KSIDE_CASTLE) {
	                output = 'O-O';
	            } else if (move.flags & Flags.QSIDE_CASTLE) {
	                output = 'O-O-O';
	            } else {
	                var disambiguator = boardVariation.getDisambiguator(move);

	                if (move.movedPiece.type !== PieceType.PAWN) {
	                    output += move.movedPiece.type.toUpperCase() + disambiguator;
	                }

	                if (move.flags & (Flags.CAPTURE | Flags.EP_CAPTURE)) {
	                    if (move.movedPiece.type === PieceType.PAWN) {
	                        output += Move._algebraic(move.from)[0];
	                    }
	                    output += 'x';
	                }

	                output += Move._algebraic(move.to);

	                if (move.flags & Flags.PROMOTION) {
	                    output += '=' + move.promotionPiece.type.toUpperCase();
	                }
	            }

	            // TODO this futureMoves logic is duplicated in BoardVariation._generateMoves();
	            // might be good candidate for abstraction behind would-be-named MoveHistory object

	            // makeMove() below is destructive to all future moves ahead
	            // of our current move pointer, so we save a copy here
	            var futureMoves = boardVariation.moveHistory.slice(boardVariation.selectedMoveHistoryIndex + 1);

	            boardVariation.makeMove(move, null, {}, { updatePositionCount: false, isUserMove: false });
	            if (boardVariation.isCheck()) {
	                if (boardVariation.isCheckmate()) {
	                    output += '#';
	                } else {
	                    output += '+';
	                }
	            }

	            boardVariation.undoCurrentMove({ updatePositionCount: false });

	            // restore our previously saved future moves
	            boardVariation.moveHistory = boardVariation.moveHistory.concat(futureMoves);

	            return output;
	        }

	        // TODO:  duplicated code from BoardVariation.js
	    }, {
	        key: '_algebraic',
	        value: function _algebraic(i) {
	            var f = i & 15;
	            var r = i >> 4;
	            return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
	        }
	    }]);

	    return Move;
	})();

	;

	// https://chessprogramming.wikispaces.com/0x88
	// Note:  The values we use are flipped from the documented convention.
	//
	//             (octal)                              (decimal)
	//
	//    | a  b  c  d  e  f  g  h           | a   b   c   d   e   f   g   h
	//  ----------------------------       ------------------------------------
	//  8 | 00 01 02 03 04 05 06 07        8 | 0   1   2   3   4   5   6   7
	//  7 | 10 11 12 13 14 15 16 17        7 | 16  17  18  19  20  21  22  23
	//  6 | 20 21 22 23 24 25 26 27        6 | 32  33  34  35  36  37  38  39
	//  5 | 30 31 32 33 34 35 36 37        5 | 48  49  50  51  52  53  54  55
	//  4 | 40 41 42 43 44 45 46 47   ==   4 | 64  65  66  67  68  69  70  71
	//  3 | 50 51 52 53 54 55 56 57        3 | 80  81  82  83  84  85  86  87
	//  2 | 60 61 62 63 64 65 66 67        2 | 96  97  98  99  100 101 102 103
	//  1 | 70 71 72 73 74 75 76 77        1 | 112 113 114 115 116 117 118 119
	//
	Move.SQUARES = {
	    a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
	    a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
	    a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
	    a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
	    a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
	    a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
	    a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
	    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
	};

	Move.SQUARES_LOOKUP = {
	    0: 'a8', 1: 'b8', 2: 'c8', 3: 'd8', 4: 'e8', 5: 'f8', 6: 'g8', 7: 'h8',
	    16: 'a7', 17: 'b7', 18: 'c7', 19: 'd7', 20: 'e7', 21: 'f7', 22: 'g7', 23: 'h7',
	    32: 'a6', 33: 'b6', 34: 'c6', 35: 'd6', 36: 'e6', 37: 'f6', 38: 'g6', 39: 'h6',
	    48: 'a5', 49: 'b5', 50: 'c5', 51: 'd5', 52: 'e5', 53: 'f5', 54: 'g5', 55: 'h5',
	    64: 'a4', 65: 'b4', 66: 'c4', 67: 'd4', 68: 'e4', 69: 'f4', 70: 'g4', 71: 'h4',
	    80: 'a3', 81: 'b3', 82: 'c3', 83: 'd3', 84: 'e3', 85: 'f3', 86: 'g3', 87: 'h3',
	    96: 'a2', 97: 'b2', 98: 'c2', 99: 'd2', 100: 'e2', 101: 'f2', 102: 'g2', 103: 'h2',
	    112: 'a1', 113: 'b1', 114: 'c1', 115: 'd1', 116: 'e1', 117: 'f1', 118: 'g1', 119: 'h1'
	};

	Move.PAWN_OFFSETS = (_Move$PAWN_OFFSETS = {}, _defineProperty(_Move$PAWN_OFFSETS, Color.WHITE, [-16, -32, -17, -15]), _defineProperty(_Move$PAWN_OFFSETS, Color.BLACK, [16, 32, 17, 15]), _Move$PAWN_OFFSETS);

	Move.PIECE_OFFSETS = (_Move$PIECE_OFFSETS = {}, _defineProperty(_Move$PIECE_OFFSETS, PieceType.KNIGHT, [-18, -33, -31, -14, 18, 33, 31, 14]), _defineProperty(_Move$PIECE_OFFSETS, PieceType.BISHOP, [-17, -15, 17, 15]), _defineProperty(_Move$PIECE_OFFSETS, PieceType.ROOK, [-16, 1, 16, -1]), _defineProperty(_Move$PIECE_OFFSETS, PieceType.QUEEN, [-17, -16, -15, 1, 17, 16, 15, -1]), _defineProperty(_Move$PIECE_OFFSETS, PieceType.KING, [-17, -16, -15, 1, 17, 16, 15, -1]), _Move$PIECE_OFFSETS);

	// Move.{ATTACKS,RAYS,SHIFTS} are only used by BoardVariation.isAttacked(color, square)
	Move.ATTACKS = [20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0, 0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0, 24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0, 0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0, 20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0];
	Move.RAYS = [17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0, 0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0, 0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0, 0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0, -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17, 0];
	Move.SHIFTS = (_Move$SHIFTS = {}, _defineProperty(_Move$SHIFTS, PieceType.PAWN, 0), _defineProperty(_Move$SHIFTS, PieceType.KNIGHT, 1), _defineProperty(_Move$SHIFTS, PieceType.BISHOP, 2), _defineProperty(_Move$SHIFTS, PieceType.ROOK, 3), _defineProperty(_Move$SHIFTS, PieceType.QUEEN, 4), _defineProperty(_Move$SHIFTS, PieceType.KING, 5), _Move$SHIFTS);

	// technically, this is a NULL move, but I'm slightly deviating from the PGN standard
	// (http://www.enpassant.dk/chess/palview/manual/pgn.htm), because I'm treating a NULL
	// move as essentially a wildcard move:  "any move will do, so just pick the first legal
	// move you find".
	//
	Move.WILDCARD_MOVE = '--';

	module.exports = Move;

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var PieceType = function PieceType() {
	  _classCallCheck(this, PieceType);
	};

	;

	PieceType.NONE = '.';
	PieceType.PAWN = 'p';
	PieceType.KNIGHT = 'n';
	PieceType.BISHOP = 'b';
	PieceType.ROOK = 'r';
	PieceType.QUEEN = 'q';
	PieceType.KING = 'k';

	module.exports = PieceType;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _Piece$LOOKUP;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Color = __webpack_require__(3);
	var PieceType = __webpack_require__(8);

	var Piece = (function () {
	    function Piece(options) {
	        _classCallCheck(this, Piece);

	        this.type = options.type; // PieceType -- the type of piece, e.g. PAWN, KNIGHT, ROOK
	        this.color = options.color; // Color     -- WHITE or BLACK

	        this.symbol = this.color === Color.WHITE ? this.type.toUpperCase() : this.type;

	        Object.freeze(this); // immutability == sanity safeguard
	    }

	    _createClass(Piece, [{
	        key: 'toString',
	        value: function toString() {
	            return this.symbol;
	        }

	        // for more succinct console.log() output
	    }, {
	        key: 'inspect',
	        value: function inspect() {
	            return this.toString();
	        }
	    }], [{
	        key: 'forSymbol',
	        value: function forSymbol(symbol) {
	            return Piece.LOOKUP[symbol];
	        }
	    }]);

	    return Piece;
	})();

	;

	// set up our pool of reusable pieces;  http://en.wikipedia.org/wiki/Flyweight_pattern
	Piece.WHITE_PAWN = new Piece({ color: Color.WHITE, type: PieceType.PAWN });
	Piece.WHITE_KNIGHT = new Piece({ color: Color.WHITE, type: PieceType.KNIGHT });
	Piece.WHITE_BISHOP = new Piece({ color: Color.WHITE, type: PieceType.BISHOP });
	Piece.WHITE_ROOK = new Piece({ color: Color.WHITE, type: PieceType.ROOK });
	Piece.WHITE_QUEEN = new Piece({ color: Color.WHITE, type: PieceType.QUEEN });
	Piece.WHITE_KING = new Piece({ color: Color.WHITE, type: PieceType.KING });
	Piece.BLACK_PAWN = new Piece({ color: Color.BLACK, type: PieceType.PAWN });
	Piece.BLACK_KNIGHT = new Piece({ color: Color.BLACK, type: PieceType.KNIGHT });
	Piece.BLACK_BISHOP = new Piece({ color: Color.BLACK, type: PieceType.BISHOP });
	Piece.BLACK_ROOK = new Piece({ color: Color.BLACK, type: PieceType.ROOK });
	Piece.BLACK_QUEEN = new Piece({ color: Color.BLACK, type: PieceType.QUEEN });
	Piece.BLACK_KING = new Piece({ color: Color.BLACK, type: PieceType.KING });
	Piece.NONE = new Piece({ color: Color.NONE, type: PieceType.NONE });
	Piece.LOOKUP = (_Piece$LOOKUP = {}, _defineProperty(_Piece$LOOKUP, Piece.WHITE_PAWN, Piece.WHITE_PAWN), _defineProperty(_Piece$LOOKUP, Piece.WHITE_KNIGHT, Piece.WHITE_KNIGHT), _defineProperty(_Piece$LOOKUP, Piece.WHITE_BISHOP, Piece.WHITE_BISHOP), _defineProperty(_Piece$LOOKUP, Piece.WHITE_ROOK, Piece.WHITE_ROOK), _defineProperty(_Piece$LOOKUP, Piece.WHITE_QUEEN, Piece.WHITE_QUEEN), _defineProperty(_Piece$LOOKUP, Piece.WHITE_KING, Piece.WHITE_KING), _defineProperty(_Piece$LOOKUP, Piece.BLACK_PAWN, Piece.BLACK_PAWN), _defineProperty(_Piece$LOOKUP, Piece.BLACK_KNIGHT, Piece.BLACK_KNIGHT), _defineProperty(_Piece$LOOKUP, Piece.BLACK_BISHOP, Piece.BLACK_BISHOP), _defineProperty(_Piece$LOOKUP, Piece.BLACK_ROOK, Piece.BLACK_ROOK), _defineProperty(_Piece$LOOKUP, Piece.BLACK_QUEEN, Piece.BLACK_QUEEN), _defineProperty(_Piece$LOOKUP, Piece.BLACK_KING, Piece.BLACK_KING), _defineProperty(_Piece$LOOKUP, Piece.NONE, Piece.NONE), _Piece$LOOKUP);
	// TODO consider relaxing this to include enemy pieces, to support that edge-case puzzle from Sherlock Holmes Chess Mysteries book
	Piece.WHITE_PROMOTION_PIECES = [Piece.WHITE_QUEEN, Piece.WHITE_ROOK, Piece.WHITE_BISHOP, Piece.WHITE_KNIGHT];
	Piece.BLACK_PROMOTION_PIECES = [Piece.BLACK_QUEEN, Piece.BLACK_ROOK, Piece.BLACK_BISHOP, Piece.BLACK_KNIGHT];

	module.exports = Piece;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Color = __webpack_require__(3);
	var Flags = __webpack_require__(6);
	var Move = __webpack_require__(7);
	var PieceType = __webpack_require__(8);

	var MoveContext = (function () {

	    // default constructor

	    function MoveContext(options) {
	        var _castlingEligibility, _kings;

	        _classCallCheck(this, MoveContext);

	        this.move = options.move; // Move object from move.js

	        this.castlingEligibility = (_castlingEligibility = {}, _defineProperty(_castlingEligibility, Color.WHITE, options.castlingEligibility[Color.WHITE]), _defineProperty(_castlingEligibility, Color.BLACK, options.castlingEligibility[Color.BLACK]), _castlingEligibility);
	        this.kings = (_kings = {}, _defineProperty(_kings, Color.WHITE, options.kings[Color.WHITE]), _defineProperty(_kings, Color.BLACK, options.kings[Color.BLACK]), _kings);

	        this.turn = options.turn;
	        this.enPassantSquare = options.enPassantSquare;

	        this.moveNumber = options.moveNumber;
	        this.halfMoves = options.halfMoves;
	        this.plyCount = options.plyCount;

	        this.metadata = options.metadata;

	        // TODO these original members are now, or should be!, in this.metadata
	        // this.timeTakenToMove = options.timeTakenToMove;
	        // this.comment = options.comment;
	        // this.isPuzzleSolution = options.isPuzzleSolution;

	        this.childVariations = [];
	    }

	    _createClass(MoveContext, [{
	        key: 'toString',
	        value: function toString() {
	            return this.move.algebraic;
	        }

	        // for more succinct console.log() output
	    }, {
	        key: 'inspect',
	        value: function inspect() {
	            return this.toString();
	        }
	    }]);

	    return MoveContext;
	})();

	;

	module.exports = MoveContext;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var BoardVariation = __webpack_require__(2);
	var Color = __webpack_require__(3);
	var EventLog = __webpack_require__(4);
	var Fen = __webpack_require__(5);
	var Flags = __webpack_require__(6);
	var LinkedHashMap = __webpack_require__(12);
	var Move = __webpack_require__(7);
	var PieceType = __webpack_require__(8);

	var Game = (function () {
	    function Game() {
	        var fen = arguments.length <= 0 || arguments[0] === undefined ? Fen.DEFAULT_POSITION_FULL : arguments[0];
	        var pgnHeaderPairs = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

	        _classCallCheck(this, Game);

	        // EventLog for tracking all player interactions
	        this.eventLog = new EventLog();

	        // a chess's PGN header applies to all of its variations
	        this.header = new LinkedHashMap(pgnHeaderPairs);

	        // our board state information will always reside within the context of a given line of play, i.e. variation
	        if (fen) {
	            this.currentVariation = BoardVariation.createFromFen(fen, this.eventLog);

	            if (fen !== Fen.DEFAULT_POSITION_FULL) {
	                this.header.set('SetUp', '1');
	                this.header.set('FEN', fen);
	            }
	        } else {
	            this.currentVariation = new BoardVariation(this.eventLog);
	        }

	        // to store any continuations/variations
	        this.boardVariations = [this.currentVariation];
	    }

	    _createClass(Game, [{
	        key: 'toString',
	        value: function toString() {
	            var pgn = this.toPgn({
	                maxWidth: 0,
	                newlineChar: '\n',
	                showMoveCursor: true,
	                showHeaders: false
	            });

	            var lineSize = Math.max(80, Math.floor(pgn.length / 4));

	            var pgnLines = [];
	            for (var i = 0; i < pgn.length;) {
	                var start = i;
	                i += lineSize;
	                while (pgn.charAt(i) != ' ' && i < pgn.length) {
	                    i++;
	                }
	                pgnLines.push(pgn.substring(start, i));
	            }

	            var result = '';

	            var asciiLines = this.currentVariation.toString().split("\n");
	            var tallies = ' : (variations: ' + this.boardVariations.length + ', move history length: ' + this.currentVariation.moveHistory.length + ', selected index: ' + this.currentVariation.selectedMoveHistoryIndex + ')';
	            for (var i = 0; i < asciiLines.length; i++) {
	                result += asciiLines[i];

	                if (this.currentVariation.turn === Color.WHITE) {
	                    if (i == 9) result += tallies;
	                } else {
	                    if (i == 0) result += tallies;
	                }

	                if (i >= 2 && pgnLines.length > i - 2) result += '  ' + pgnLines[i - 2];
	                if (i == 7) result += '  ' + this.currentVariation.toFen();
	                result += '\n';
	            }
	            return result;
	        }
	    }, {
	        key: 'loadFen',
	        value: function loadFen(fen) {
	            var variation = BoardVariation.createFromFen(fen);
	            if (variation) {
	                this.currentVariation = variation;
	                this._updateSetup();
	                this.boardVariations = [variation];
	                return true;
	            } else {
	                return false;
	            }
	        }
	    }, {
	        key: 'makeMove',
	        value: function makeMove(move) {
	            var metadata = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	            metadata = Object.assign({}, {
	                comment: null, /* string */
	                timeTakenToMove: null, /* int */
	                isPuzzleSolution: null /* boolean */
	            }, metadata);

	            return this.currentVariation.makeMove(move, this, metadata);
	        }
	    }, {
	        key: 'makeMoveFromSan',
	        value: function makeMoveFromSan(san) {
	            var metadata = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	            metadata = Object.assign({}, {
	                comment: null, /* string */
	                timeTakenToMove: null, /* int */
	                isPuzzleSolution: null /* boolean */
	            }, metadata);

	            return this.currentVariation.makeMoveFromSan(san, this, metadata);
	        }
	    }, {
	        key: 'toPgn',
	        value: function toPgn() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	            options = Object.assign({}, {
	                maxWidth: 0,
	                newlineChar: '\n',
	                showMoveCursor: false,
	                showHeaders: true
	            }, options);

	            var result = [];

	            // add the PGN header information
	            if (options.showHeaders) {
	                for (var i = 0; i < this.header.length(); i++) {
	                    result.push('[' + this.header.getKeyAtPosition(i) + ' "' + this.header.getValueAtPosition(i) + '"]' + options.newlineChar);
	                }
	                if (this.header.length() > 0) {
	                    result.push(options.newlineChar);
	                }
	            }

	            var outermostVariation = this.boardVariations[0];
	            var moves = processVariation(outermostVariation, 1, this.currentVariation);

	            function processVariation(variation, pgnMoveNum, currentVariation) {
	                var moves = [];
	                var variationMoveString = '';
	                var justStartedVariation = false;
	                var justFinishedVariation = false;

	                // initial leading annotation slot
	                if (variation.intraMoveAnnotationSlots[0]) {
	                    moves = moves.concat(variation.intraMoveAnnotationSlots[0]);
	                }

	                for (var i = 0; i < variation.moveHistory.length; i++) {

	                    //
	                    // #1: process move
	                    //

	                    var moveContext = variation.moveHistory[i];

	                    justStartedVariation = i == 0;

	                    // if the position started with black to move, start PGN with 1. ...
	                    if (justStartedVariation && moveContext.move.movedPiece.color === Color.BLACK) {
	                        moves.push(pgnMoveNum + '...');
	                        pgnMoveNum++;
	                    } else if ((justStartedVariation || justFinishedVariation) && moveContext.move.movedPiece.color === Color.BLACK && !variation.isContinuation) {
	                        moves.push(pgnMoveNum - 1 + '...');
	                    } else if (moveContext.move.movedPiece.color === Color.WHITE) {
	                        moves.push(pgnMoveNum + '.');
	                        pgnMoveNum++;
	                    }

	                    moves.push(moveContext.move.isWildcard ? Move.WILDCARD_MOVE : moveContext.move.san);

	                    if (options.showMoveCursor) {
	                        var isCurrentlySelectedMove = variation === currentVariation && i === currentVariation.selectedMoveHistoryIndex;
	                        if (isCurrentlySelectedMove) {
	                            moves.push(' ^');
	                        }
	                    }

	                    //
	                    // #2: process annotations
	                    //

	                    if (variation.intraMoveAnnotationSlots[i + 1]) {
	                        moves = moves.concat(variation.intraMoveAnnotationSlots[i + 1]);
	                    }

	                    //
	                    // #3: process variations
	                    //

	                    justFinishedVariation = false;
	                    if (variation.moveHistory[i].childVariations.length > 0) {

	                        if (variation.intraMoveAnnotationSlots[i + 1]) {
	                            moves.concat(variation.intraMoveAnnotationSlots[i + 1]);
	                        }

	                        for (var j = 0; j < variation.moveHistory[i].childVariations.length; j++) {
	                            var childVariation = variation.moveHistory[i].childVariations[j];

	                            var variationMoves = processVariation(childVariation, pgnMoveNum - (childVariation.isContinuation ? 0 : 1), currentVariation);

	                            if (variationMoves.length == 0) {
	                                // an empty variation
	                                moves.push("()");
	                            } else {
	                                for (var k = 0; k < variationMoves.length; k++) {
	                                    variationMoveString = variationMoves[k];

	                                    if (k == 0) {
	                                        variationMoveString = '(' + (childVariation.isContinuation ? '* ' : '') + variationMoveString;
	                                    }
	                                    if (k == variationMoves.length - 1) {
	                                        variationMoveString = variationMoveString + ')';
	                                    }

	                                    moves.push(variationMoveString);
	                                }
	                            }

	                            justFinishedVariation = true;
	                        }
	                    }
	                }

	                return moves;
	            }

	            // is there a result?
	            var resultHeader = this.header.get('Result');
	            if (resultHeader) {
	                moves.push(resultHeader);
	            }

	            // history should be back to what is was before we started generating PGN, so join together moves
	            if (options.maxWidth === 0) {
	                return result.join('') + moves.join(' ');
	            }

	            // wrap the PGN output at maxWidth -- TODO, revisit whether you want to linewrap inside a move, e.g. for "1. e4" --> "1.\ne4"
	            var currentWidth = 0;
	            for (var i = 0; i < moves.length; i++) {
	                // if the current move will push past maxWidth
	                if (currentWidth + moves[i].length > options.maxWidth && i !== 0) {

	                    // don't end the line with whitespace
	                    if (result[result.length - 1] === ' ') {
	                        result.pop();
	                    }

	                    result.push(options.newlineChar);
	                    currentWidth = 0;
	                } else if (i !== 0) {
	                    result.push(' ');
	                    currentWidth++;
	                }
	                result.push(moves[i]);
	                currentWidth += moves[i].length;
	            }

	            return result.join('');
	        }
	    }, {
	        key: 'createContinuationFromSan',
	        value: function createContinuationFromSan(san /* string, e.g. "Rxa7" or "e8=Q#" */) {
	            this.eventLog.add('createContinuationFromSan(' + san + ')');

	            return this.createVariationFromSan(san, true, { shouldLog: false });
	        }
	    }, {
	        key: 'createVariationFromSan',
	        value: function createVariationFromSan(san, /* string, e.g. "Rxa7" or "e8=Q#" */isContinuation) {
	            var options = arguments.length <= 2 || arguments[2] === undefined ? {
	                shouldLog: true
	            } : arguments[2];

	            if (options.shouldLog) {
	                this.eventLog.add('createVariationFromSan(' + san + ', ' + isContinuation + ')');
	            }

	            if (san === null) {
	                return false;
	            }

	            if (isContinuation) {
	                if (this.currentVariation.selectedMoveHistoryIndex + 1 < this.currentVariation.moveHistory.length) {
	                    var _move = this.currentVariation.moveHistory[this.currentVariation.selectedMoveHistoryIndex + 1].move;
	                    if (_move.san === san) {
	                        return false; // Continuation not created.  New move already exists as the next move in the current move sequence.
	                    } else if (san === Move.WILDCARD_MOVE) {
	                            return false; // Continuation not created.  New wildcard move already exists as the next move in the current move sequence.
	                        }
	                }
	            } else {
	                    var _move2 = this.currentVariation.moveHistory[this.currentVariation.selectedMoveHistoryIndex].move;
	                    if (_move2.san === san) {
	                        return false; // Variation not created.  New move already exists as the next move in the current move sequence.
	                    } else if (san === Move.WILDCARD_MOVE) {
	                            return false; // Continuation not created.  New wildcard move already exists as the next move in the current move sequence.
	                        }
	                }

	            var innerVariation = BoardVariation.createFromParentVariation(this.currentVariation, { isContinuation: isContinuation });
	            this.boardVariations.push(innerVariation);

	            // take the variation we just started, and append it to the list of variations that start from its "parent" move.
	            this.currentVariation.moveHistory[this.currentVariation.selectedMoveHistoryIndex].childVariations.push(innerVariation);

	            // down we go, into our new variation
	            this.currentVariation = innerVariation;

	            var move = Move.createFromSan(san, this.currentVariation);

	            if (!move) {
	                // requested move isn't possible, so undo our attempt at creating a variation
	                this.currentVariation = this.currentVariation.parentVariation;
	                this.currentVariation.moveHistory[this.currentVariation.selectedMoveHistoryIndex].childVariations.pop();
	                this.boardVariations.pop();

	                return false;
	            }

	            this.currentVariation.makeMove(move, this);

	            return true;
	        }
	    }, {
	        key: 'history',
	        value: function history() {
	            var moveHistory = [];
	            var tempVariation = this.currentVariation;

	            for (var i = tempVariation.selectedMoveHistoryIndex; i >= 0; i--) {
	                moveHistory.push(tempVariation.moveHistory[i].move.isWildcard ? Move.WILDCARD_MOVE : tempVariation.moveHistory[i].move.san);
	            }

	            var parentLastMoveIndex = tempVariation.parentLastMoveIndex;
	            var isContinuation = tempVariation.isContinuation;
	            tempVariation = tempVariation.parentVariation;

	            while (tempVariation != null) {
	                var i = parentLastMoveIndex;
	                if (!isContinuation) {
	                    i--;
	                }

	                for (; i >= 0; i--) {
	                    moveHistory.push(tempVariation.moveHistory[i].isWildcard ? Move.WILDCARD_MOVE : tempVariation.moveHistory[i].move.san);
	                }

	                parentLastMoveIndex = tempVariation.parentLastMoveIndex;
	                isContinuation = tempVariation.isContinuation;
	                tempVariation = tempVariation.parentVariation;
	            }

	            return moveHistory.reverse();
	        }

	        // ---------------
	        // navigation APIs
	        // ---------------

	    }, {
	        key: 'ascendFromCurrentContinuation',
	        value: function ascendFromCurrentContinuation() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                shouldLog: true
	            } : arguments[0];

	            if (options.shouldLog) {
	                this.eventLog.add('ascendFromCurrentContinuation()');
	            }

	            if (this.currentVariation.parentVariation === null) {
	                // already at the topmost level;  nothing to do.
	                return false;
	            }

	            // this method differs from ascendFromCurrentVariation only here in this "- 1" offset
	            var selectedMoveIndex = this.currentVariation.parentLastMoveIndex - 1;
	            this.currentVariation = this.currentVariation.parentVariation;
	            this.currentVariation.selectedMoveIndex = selectedMoveIndex;

	            return this._selectMove(selectedMoveIndex);
	        }
	    }, {
	        key: 'ascendFromCurrentVariation',
	        value: function ascendFromCurrentVariation() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                shouldLog: true
	            } : arguments[0];

	            if (options.shouldLog) {
	                this.eventLog.add('ascendFromCurrentVariation()');
	            }

	            if (this.currentVariation.parentVariation === null) {
	                // already at the topmost level;  nothing to do.
	                return false;
	            }

	            var selectedMoveIndex = this.currentVariation.parentLastMoveIndex;
	            this.currentVariation = this.currentVariation.parentVariation;
	            this.currentVariation.selectedMoveIndex = selectedMoveIndex;

	            return true;
	        }
	    }, {
	        key: 'next',
	        value: function next() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                shouldLog: true
	            } : arguments[0];

	            return this.currentVariation.next(options);
	        }
	    }, {
	        key: 'prev',
	        value: function prev() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                shouldLog: true
	            } : arguments[0];

	            if (options.shouldLog) {
	                this.eventLog.add('prev()');
	            }

	            if (this.currentVariation.selectedMoveHistoryIndex === 0 && this.currentVariation.parentVariation) {
	                if (this.ascendFromCurrentContinuation({ shouldLog: false })) {
	                    return true;
	                } else {
	                    return false;
	                }
	            } else {
	                return this._selectMove(this.currentVariation.selectedMoveHistoryIndex - 1);
	            }
	        }
	    }, {
	        key: 'rewindToBeginning',
	        value: function rewindToBeginning() {
	            this.eventLog.add('rewindToBeginning()');
	            while (this.currentGame.prev({ shouldLog: false })) {}
	        }
	    }, {
	        key: 'replayToPlyNum',
	        value: function replayToPlyNum(n /* logical ply number, starting from 1 */) {
	            return this.currentVariation.replayToPlyNum(n); // TODO broken method logic;  game-level replay should unwind through multiple childVariations;
	            // think:  path from leaf to n ancestors up the tree
	        }
	    }, {
	        key: '_updateSetup',
	        value: function _updateSetup() {
	            if (this.currentVariation.moveHistory.length > 0) return;

	            var fen = this.currentVariation.toFen();

	            if (fen !== Fen.DEFAULT_POSITION) {
	                this.header.set('SetUp', '1');
	                this.header.set('FEN', fen);
	            } else {
	                this.header.remove('SetUp');
	                this.header.remove('FEN');
	            }
	        }
	    }, {
	        key: 'header',
	        value: function header() {
	            return this.header;
	        }
	    }, {
	        key: 'descendIntoContinuation',
	        value: function descendIntoContinuation() /* defaults to the first variation */{
	            var i = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

	            this.eventLog.add('descendIntoContinuation()');

	            if (this.currentVariation.moveHistory.length <= 0) {
	                return false;
	            }

	            var currentMoveContext = this.currentVariation.moveHistory[this.currentVariation.selectedMoveHistoryIndex];
	            if (currentMoveContext.childVariations.length <= 0) {
	                return false;
	            }
	            if (i < 0 || i > currentMoveContext.childVariations.length - 1) {
	                return false;
	            }
	            if (!currentMoveContext.childVariations[i].isContinuation) {
	                return false;
	            }

	            this.currentVariation = currentMoveContext.childVariations[i];
	            this.currentVariation.selectedMoveHistoryIndex = 0;

	            return this._selectMove(0);
	        }
	    }, {
	        key: 'descendIntoVariation',
	        value: function descendIntoVariation() /* defaults to the first variation */{
	            var i = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

	            this.eventLog.add('descendIntoVariation()');

	            if (this.currentVariation.moveHistory.length <= 0) {
	                return false;
	            }

	            var currentMoveContext = this.currentVariation.moveHistory[this.currentVariation.selectedMoveHistoryIndex];
	            if (currentMoveContext.childVariations.length <= 0) {
	                return false;
	            }
	            if (i < 0 || i > currentMoveContext.childVariations.length - 1) {
	                return false;
	            }
	            if (currentMoveContext.childVariations[i].isContinuation) {
	                return false;
	            }

	            this.currentVariation = currentMoveContext.childVariations[i];
	            this.currentVariation.selectedMoveHistoryIndex = 0;

	            return this._selectMove(0);
	        }

	        // --------------------------------------
	        // pass-through API methods, alphabetized
	        // --------------------------------------

	    }, {
	        key: '_selectMove',
	        value: function _selectMove(i) {
	            var options = arguments.length <= 1 || arguments[1] === undefined ? {
	                shouldLog: false
	            } : arguments[1];

	            return this.currentVariation._selectMove(i, options);
	        }
	    }, {
	        key: 'get',
	        value: function get(square /* string, e.g. 'a1' */) {
	            return this.currentVariation.get(square);
	        }
	    }, {
	        key: 'isCheck',
	        value: function isCheck() {
	            return this.currentVariation.isCheck();
	        }
	    }, {
	        key: 'isCheckmate',
	        value: function isCheckmate() {
	            return this.currentVariation.isCheckmate();
	        }
	    }, {
	        key: 'isDraw',
	        value: function isDraw() {
	            return this.currentVariation.isDraw();
	        }
	    }, {
	        key: 'isGameOver',
	        value: function isGameOver() {
	            return this.currentVariation.isGameOver();
	        }
	    }, {
	        key: 'isInsufficientMaterial',
	        value: function isInsufficientMaterial() {
	            return this.currentVariation.isInsufficientMaterial();
	        }
	    }, {
	        key: 'isStalemate',
	        value: function isStalemate() {
	            return this.currentVariation.isStalemate();
	        }
	    }, {
	        key: 'isThreefoldRepetition',
	        value: function isThreefoldRepetition() {
	            return this.currentVariation.isThreefoldRepetition();
	        }
	    }, {
	        key: 'moves',
	        value: function moves() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {
	                onlyAlgebraicSquares: false
	            } : arguments[0];

	            return this.currentVariation.moves(options);
	        }
	    }, {
	        key: 'put',
	        value: function put(piece, /* Piece, e.g. Piece.WHITE_ROOK */square /* string, e.g. 'h8' */) {
	            return this.currentVariation.put(piece, square);
	        }
	    }, {
	        key: 'remove',
	        value: function remove(square /* string, e.g. 'a1' */) {
	            var piece = this.currentVariation.remove(square);
	            this._updateSetup();

	            return piece;
	        }
	    }, {
	        key: 'toFen',
	        value: function toFen() {
	            return this.currentVariation.toFen();
	        }
	    }]);

	    return Game;
	})();

	;

	module.exports = Game;
	/* string, e.g. 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' */
	/* Move object from move.js */
	/* string, e.g. "Rxa7" or "e8=Q#" */

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	// a lightweight map class that preserves key insertion order;
	// needed for parsing and reconstructing PGN headers

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var LinkedHashMap = (function () {
	    function LinkedHashMap() {
	        var pairs = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

	        _classCallCheck(this, LinkedHashMap);

	        this._map = {};
	        this._keys = [];

	        this.addAll(pairs);
	    }

	    _createClass(LinkedHashMap, [{
	        key: 'addAll',
	        value: function addAll(pairs) {
	            for (var i = 0; i < pairs.length; i += 2) {
	                this.set(pairs[i], pairs[i + 1]);
	            }
	        }
	    }, {
	        key: 'clear',
	        value: function clear() {
	            this._map = {};
	            this._keys = [];
	        }
	    }, {
	        key: 'get',
	        value: function get(k) {
	            return this._map[k];
	        }
	    }, {
	        key: 'getKeyAtPosition',
	        value: function getKeyAtPosition(i) {
	            return this._keys[i];
	        }
	    }, {
	        key: 'getValueAtPosition',
	        value: function getValueAtPosition(i) {
	            return this._map[this._keys[i]];
	        }
	    }, {
	        key: 'length',
	        value: function length() {
	            return this._keys.length;
	        }
	    }, {
	        key: 'remove',
	        value: function remove(k) {
	            if (k in this._map) {
	                var i = this._keys.indexOf(k);
	                this._keys.splice(i, 1);
	                delete this._map[k];
	            }
	        }
	    }, {
	        key: 'set',
	        value: function set(k, v) {
	            if (!(k in this._map)) {
	                this._keys.push(k);
	            }
	            this._map[k] = v;
	        }
	    }, {
	        key: 'toString',
	        value: function toString() {
	            var _this = this;

	            return '{ ' + this._keys.map(function (key) {
	                return key + ': ' + _this._map[key];
	            }).join(', ') + ' }';
	        }
	    }]);

	    return LinkedHashMap;
	})();

	;

	module.exports = LinkedHashMap;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assert = __webpack_require__(14);

	var BoardVariation = __webpack_require__(2);
	var Color = __webpack_require__(3);
	var Flags = __webpack_require__(6);
	var Move = __webpack_require__(7);
	var Piece = __webpack_require__(9);
	var PieceType = __webpack_require__(8);

	suite('BoardVariation', function () {
	    setup(function () {});

	    suite("Threefold Repetition", function () {
	        [{
	            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
	            moves: ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8']
	        }, {
	            fen: '8/pp3p1k/2p2q1p/3r1P2/5R2/7P/P1P1QP2/7K b - - 2 30', // Fischer - Petrosian, Buenos Aires, 1971
	            moves: ['Qe5', 'Qh5', 'Qf6', 'Qe2', 'Re5', 'Qd3', 'Rd5', 'Qe2']
	        }].forEach(function (position) {
	            test(position.fen, function () {
	                var passed = true;
	                var variation = BoardVariation.createFromFen(position.fen);

	                for (var j = 0; j < position.moves.length; j++) {
	                    if (variation.isThreefoldRepetition()) {
	                        passed = false;
	                        break;
	                    }

	                    variation.makeMoveFromSan(position.moves[j]);
	                }

	                assert(passed && variation.isThreefoldRepetition() && variation.isDraw());
	            });
	        });
	    });

	    suite("Single Square Move Generation", function () {
	        var i = 1;
	        [{ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', square: 'e2', moves: ['e3', 'e4'] }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', square: 'e9', moves: [] }, // invalid square
	        { fen: 'rnbqk1nr/pppp1ppp/4p3/8/1b1P4/2N5/PPP1PPPP/R1BQKBNR w KQkq - 2 3', square: 'c3', moves: [] }, // pinned piece
	        { fen: '8/k7/8/8/8/8/7p/K7 b - - 0 1', square: 'h2', moves: ['h1=Q+', 'h1=R+', 'h1=B', 'h1=N'] }, // promotion
	        {
	            fen: 'r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2NP1N2/PPPBQPPP/R3K2R w KQ - 0 8',
	            square: 'e1',
	            moves: ['Kf1', 'Kd1', 'O-O', 'O-O-O']
	        }, // castling
	        {
	            fen: 'r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2NP1N2/PPPBQPPP/R3K2R w - - 0 8',
	            square: 'e1',
	            moves: ['Kf1', 'Kd1']
	        }, // no castling
	        { fen: '8/7K/8/8/1R6/k7/1R1p4/8 b - - 0 1', square: 'a3', moves: [] }, // trapped king
	        { fen: 'rnbqk2r/ppp1pp1p/5n1b/3p2pQ/1P2P3/B1N5/P1PP1PPP/R3KBNR b KQkq - 3 5', square: 'f1', moves: [] }, { fen: '5k1K/8/8/8/8/8/8/8 w - - 0 1', square: 'h8', moves: ['Kh7'] } // simple
	        ].forEach(function (position) {
	            test(i++, function () {
	                var variation = BoardVariation.createFromFen(position.fen);
	                var moves = variation._generateMoves({ onlyForSquare: position.square, calculateSan: true }).map(function (x) {
	                    return x.san;
	                });

	                var passed = position.moves.length == moves.length;

	                for (var j = 0; j < moves.length; j++) {
	                    passed = passed && moves[j] === position.moves[j];
	                }
	                assert(passed, "generated moves were " + moves + " instead of expected " + position.moves);
	            });
	        });
	    });

	    suite("Checkmate", function () {
	        var i = 1;
	        ['8/5r2/4K1q1/4p3/3k4/8/8/8 w - - 0 7', '4r2r/p6p/1pnN2p1/kQp5/3pPq2/3P4/PPP3PP/R5K1 b - - 0 2', 'r3k2r/ppp2p1p/2n1p1p1/8/2B2P1q/2NPb1n1/PP4PP/R2Q3K w kq - 0 8', '8/6R1/pp1r3p/6p1/P3R1Pk/1P4P1/7K/8 b - - 0 4'].forEach(function (fen) {
	            test(i++, function () {
	                return assert(BoardVariation.createFromFen(fen).isCheckmate());
	            });
	        });
	    });

	    suite("Stalemate", function () {
	        var i = 1;
	        ['1R6/8/8/8/8/8/7R/k6K b - - 0 1', '8/8/5k2/p4p1p/P4K1P/1r6/8/8 w - - 0 2'].forEach(function (fen) {
	            test(i++, function () {
	                return assert(BoardVariation.createFromFen(fen).isStalemate());
	            });
	        });
	    });

	    suite("Insufficient Material", function () {
	        var i = 1;
	        [{ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', draw: false }, { fen: '8/8/8/8/8/8/8/k6K w - - 0 1', draw: true }, { fen: '8/2p5/8/8/8/8/8/k6K w - - 0 1', draw: false }, { fen: '8/2N5/8/8/8/8/8/k6K w - - 0 1', draw: true }, { fen: '8/2b5/8/8/8/8/8/k6K w - - 0 1', draw: true }, { fen: '8/b7/3B4/8/8/8/8/k6K w - - 0 1', draw: true }, { fen: '8/b7/B7/8/8/8/8/k6K w - - 0 1', draw: false }, { fen: '8/b1B1b1B1/1b1B1b1B/8/8/8/8/1k5K w - - 0 1', draw: true }, { fen: '8/bB2b1B1/1b1B1b1B/8/8/8/8/1k5K w - - 0 1', draw: false }].forEach(function (position) {
	            test(i++, function () {
	                var variation = BoardVariation.createFromFen(position.fen);

	                if (position.draw) {
	                    assert(variation.isInsufficientMaterial() && variation.isDraw());
	                } else {
	                    assert(!variation.isInsufficientMaterial() && !variation.isInsufficientMaterial());
	                }
	            });
	        });
	    });

	    suite("FEN", function () {
	        [{ fen: '8/8/8/8/8/8/8/8 w - - 0 1', shouldPass: true }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', shouldPass: true }, { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', shouldPass: true }, { fen: '1nbqkbn1/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/1NBQKBN1 b - - 1 2', shouldPass: true }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN w KQkq - 0 1', shouldPass: false }, // incomplete FEN string
	        { fen: 'rnbqkbnr/pppppppp/9/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', shouldPass: false }, // bad digit (9)
	        { fen: '1nbqkbn1/pppp1ppX/8/4p3/4P3/8/PPPP1PPP/1NBQKBN1 b - - 1 2', shouldPass: false } // bad piece (X)
	        ].forEach(function (position) {
	            test(position.fen + ' (' + position.shouldPass + ')', function () {
	                var variation = BoardVariation.createFromFen(position.fen);

	                if (variation) {
	                    assert(variation.toFen() == position.fen);
	                } else {
	                    assert(!position.shouldPass);
	                }
	            });
	        });
	    });

	    suite("Algebraic Notation", function () {
	        [{ fen: '7k/3R4/3p2Q1/6Q1/2N1N3/8/8/3R3K w - - 0 1', // this position...
	            moves: ['Rd8#', 'Re7', 'Rf7', 'Rg7', 'Rh7#', 'R7xd6', 'Rc7', 'Rb7', 'Ra7', // ...should produce this list of moves via _generateMoves()
	            'Qf7', 'Qe8#', 'Qg7#', 'Qg8#', 'Qh7#', 'Q6h6#', 'Q6h5#', 'Q6f5', 'Q6f6#', 'Qe6', 'Qxd6', 'Q5f6#', 'Qe7', 'Qd8#', 'Q5h6#', 'Q5h5#', 'Qh4#', 'Qg4', 'Qg3', 'Qg2', 'Qg1', 'Qf4', 'Qe3', 'Qd2', 'Qc1', 'Q5f5', 'Qe5+', 'Qd5', 'Qc5', 'Qb5', 'Qa5', 'Na5', 'Nb6', 'Ncxd6', 'Ne5', 'Ne3', 'Ncd2', 'Nb2', 'Na3', 'Nc5', 'Nexd6', 'Nf6', 'Ng3', 'Nf2', 'Ned2', 'Nc3', 'Rd2', 'Rd3', 'Rd4', 'Rd5', 'R1xd6', 'Re1', 'Rf1', 'Rg1', 'Rc1', 'Rb1', 'Ra1', 'Kg2', 'Kh2', 'Kg1'] }, { fen: '1r3k2/P1P5/8/8/8/8/8/R3K2R w KQ - 0 1',
	            moves: ['a8=Q', 'a8=R', 'a8=B', 'a8=N', 'axb8=Q+', 'axb8=R+', 'axb8=B', 'axb8=N', 'c8=Q+', 'c8=R+', 'c8=B', 'c8=N', 'cxb8=Q+', 'cxb8=R+', 'cxb8=B', 'cxb8=N', 'Ra2', 'Ra3', 'Ra4', 'Ra5', 'Ra6', 'Rb1', 'Rc1', 'Rd1', 'Kd2', 'Ke2', 'Kf2', 'Kf1', 'Kd1', 'Rh2', 'Rh3', 'Rh4', 'Rh5', 'Rh6', 'Rh7', 'Rh8+', 'Rg1', 'Rf1+', 'O-O+', 'O-O-O'] }, { fen: '5rk1/8/8/8/8/8/2p5/R3K2R w KQ - 0 1',
	            moves: ['Ra2', 'Ra3', 'Ra4', 'Ra5', 'Ra6', 'Ra7', 'Ra8', 'Rb1', 'Rc1', 'Rd1', 'Kd2', 'Ke2', 'Rh2', 'Rh3', 'Rh4', 'Rh5', 'Rh6', 'Rh7', 'Rh8+', 'Rg1+', 'Rf1'] }, { fen: '5rk1/8/8/8/8/8/2p5/R3K2R b KQ - 0 1',
	            moves: ['Rf7', 'Rf6', 'Rf5', 'Rf4', 'Rf3', 'Rf2', 'Rf1+', 'Re8+', 'Rd8', 'Rc8', 'Rb8', 'Ra8', 'Kg7', 'Kf7', 'c1=Q+', 'c1=R+', 'c1=B', 'c1=N'] }, { fen: 'r3k2r/p2pqpb1/1n2pnp1/2pPN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R w KQkq c6 0 2',
	            moves: ['gxh3', 'Qxf6', 'Qxh3', 'Nxd7', 'Nxf7', 'Nxg6', 'dxc6', 'dxe6', 'Rg1', 'Rf1', 'Ke2', 'Kf1', 'Kd1', 'Rb1', 'Rc1', 'Rd1', 'g3', 'g4', 'Be3', 'Bf4', 'Bg5', 'Bh6', 'Bc1', 'b3', 'a3', 'a4', 'Qf4', 'Qf5', 'Qg4', 'Qh5', 'Qg3', 'Qe2', 'Qd1', 'Qe3', 'Qd3', 'Na4', 'Nb5', 'Ne2', 'Nd1', 'Nb1', 'Nc6', 'Ng4', 'Nd3', 'Nc4', 'd6', 'O-O', 'O-O-O'] }, { fen: 'k7/8/K7/8/3n3n/5R2/3n4/8 b - - 0 1',
	            moves: ['N2xf3', 'Nhxf3', 'Nd4xf3', 'N2b3', 'Nc4', 'Ne4', 'Nf1', 'Nb1', 'Nhf5', 'Ng6', 'Ng2', 'Nb5', 'Nc6', 'Ne6', 'Ndf5', 'Ne2', 'Nc2', 'N4b3', 'Kb8'] }].forEach(function (position) {
	            var variation = BoardVariation.createFromFen(position.fen);
	            var passed = true;

	            test(position.fen, function () {
	                var moves = variation._generateMoves({ calculateSan: true });
	                if (moves.length != position.moves.length) {
	                    passed = false;
	                } else {
	                    for (var j = 0; j < moves.length; j++) {
	                        if (position.moves.indexOf(moves[j].san) === -1) {
	                            passed = false;
	                            break;
	                        }
	                    }
	                }
	                assert(passed);
	            });
	        });
	    });

	    suite("Get/Put/Remove", function () {
	        [{ pieces: {
	                a7: Piece.WHITE_PAWN,
	                b7: Piece.BLACK_PAWN,
	                c7: Piece.WHITE_KNIGHT,
	                d7: Piece.BLACK_KNIGHT,
	                e7: Piece.WHITE_BISHOP,
	                f7: Piece.BLACK_BISHOP,
	                g7: Piece.WHITE_ROOK,
	                h7: Piece.BLACK_ROOK,
	                a6: Piece.WHITE_QUEEN,
	                b6: Piece.BLACK_QUEEN,
	                a4: Piece.WHITE_KING,
	                h4: Piece.BLACK_KING },
	            shouldPass: true }, { pieces: {
	                a7: new Object() }, // bad piece
	            shouldPass: false }, { pieces: {
	                j4: Piece.WHITE_PAWN }, // bad square
	            shouldPass: false }, { pieces: {
	                a7: Piece.BLACK_KING,
	                h2: Piece.WHITE_KING,
	                a8: Piece.BLACK_KING }, // disallow two kings (black)
	            shouldPass: false }, { pieces: {
	                a7: Piece.BLACK_KING,
	                h2: Piece.WHITE_KING,
	                h1: Piece.WHITE_KING }, // disallow two kings (white)
	            shouldPass: false }].forEach(function (position) {
	            test("position should " + (position.shouldPass ? "" : "not ") + "pass", function () {
	                var variation = new BoardVariation();
	                var passed = true;

	                // places the pieces
	                for (var square in position.pieces) {
	                    passed &= variation.put(position.pieces[square], square);
	                }

	                // iterate over every square to make sure get returns the proper piece values/color
	                Object.keys(Move.SQUARES).forEach(function (square) {
	                    var piece = variation.get(square);

	                    if (square in position.pieces) {
	                        if (position.pieces[square] !== piece) {
	                            passed = false;
	                        }
	                    } else {
	                        if (piece !== Piece.NONE) {
	                            passed = false;
	                        }
	                    }
	                });

	                if (passed) {
	                    // remove the pieces
	                    Object.keys(Move.SQUARES).forEach(function (square) {
	                        var piece = variation.remove(square);

	                        if (square in position.pieces) {
	                            if (position.pieces[square] !== piece) {
	                                passed = false;
	                            }
	                        } else {
	                            if (piece !== Piece.NONE) {
	                                passed = false;
	                            }
	                        }
	                    });

	                    assert(variation.toFen() === "8/8/8/8/8/8/8/8 w - - 0 1", "Board should be empty after having removed all previously placed pieces.");
	                }

	                assert(passed == position.shouldPass);
	            });
	        });

	        // allow two kings if overwriting the exact same square
	        test("position should pass", function () {
	            var variation = new BoardVariation();
	            var passed = variation.put(Piece.BLACK_KING, 'a7') && variation.put(Piece.WHITE_KING, 'h2') && variation.put(Piece.WHITE_KING, 'h2'); // duplicate placement is intentional

	            // iterate over every square to make sure get returns the proper piece values/color
	            for (var square in Move.SQUARES) {
	                var piece = variation.get(square);

	                if (square === 'a7' && piece !== Piece.BLACK_KING) {
	                    passed = false;
	                } else if (square === 'h2' && piece !== Piece.WHITE_KING) {
	                    passed = false;
	                } else if (square !== 'a7' && square !== 'h2' && piece !== Piece.NONE) {
	                    passed = false;
	                }
	            }

	            if (passed) {
	                // remove the pieces
	                for (var square in Move.SQUARES) {
	                    var piece = variation.remove(square);

	                    if (square === 'a7' && piece !== Piece.BLACK_KING) {
	                        passed = false;
	                    } else if (square === 'h2' && piece !== Piece.WHITE_KING) {
	                        passed = false;
	                    } else if (square !== 'a7' && square !== 'h2' && piece !== Piece.NONE) {
	                        passed = false;
	                    }
	                };

	                assert.equal(variation.toFen(), "8/8/8/8/8/8/8/8 w - - 0 1", "Board should be empty after having removed all previously placed pieces.");
	            }

	            assert(passed);
	        });
	    });

	    // test('#copyFrom', () => {
	    // TODO be anal retentive and mutate/test every property member
	    //     var variation = new BoardVariation();
	    //     variation.put(Piece.WHITE_ROOK, 'a1');

	    //     var copy = BoardVariation.copyFrom(variation);
	    //     variation.put(Piece.BLACK_ROOK, 'a1');

	    //    // console.log(variation);

	    //     assert(variation.board[112] !== copy.board[112]);
	    // });

	    test('#_applyMove', function () {
	        // lots of logic to test here;  refer to #_applyMove()'s internals...'
	    });

	    // test('#loadFen', () => {
	    //     //BoardVariation.createEmpty();
	    //     //BoardVariation.createFrom(fen);
	    //     //BoardVariation.createFrom(variation);

	    //     var variation = new BoardVariation();
	    //     variation.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
	    //    // console.log(variation);
	    // });

	    test('#makeMove - single Move object', function () {
	        var variation = new BoardVariation();

	        var fen = '3k2r1/7P/8/8/8/8/8/3K4 w - - 0 1';
	        variation.loadFen(fen);

	        variation.makeMove(new Move({
	            from: Move.SQUARES.d1,
	            to: Move.SQUARES.d2,
	            movedPiece: Piece.WHITE_KING
	        }));
	        variation.undoCurrentMove();

	        assert.equal(fen, variation.toFen(), "board did not return to starting position after making and undoing a single move");
	    });

	    test('#makeMove - attempt every single legal move', function () {
	        var variation = new BoardVariation();

	        var fen = '3k2r1/7P/8/8/8/8/8/3K4 w - - 0 1';
	        variation.loadFen(fen);

	        variation._generateMoves().forEach(function (move) {
	            variation.makeMove(move);
	            variation.undoCurrentMove();
	            assert.equal(fen, variation.toFen(), "board did not return to starting position after making and undoing a single move");
	        });
	    });
	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Originally from narwhal.js (http://narwhaljs.org)
	// Copyright (c) 2009 Thomas Robinson <280north.com>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	// when used in node, this will actually load the util module we depend on
	// versus loading the builtin util module as happens otherwise
	// this is a bug in node module loading as far as I am concerned
	'use strict';

	var util = __webpack_require__(15);

	var pSlice = Array.prototype.slice;
	var hasOwn = Object.prototype.hasOwnProperty;

	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	var assert = module.exports = ok;

	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })

	assert.AssertionError = function AssertionError(options) {
	  this.name = 'AssertionError';
	  this.actual = options.actual;
	  this.expected = options.expected;
	  this.operator = options.operator;
	  if (options.message) {
	    this.message = options.message;
	    this.generatedMessage = false;
	  } else {
	    this.message = getMessage(this);
	    this.generatedMessage = true;
	  }
	  var stackStartFunction = options.stackStartFunction || fail;

	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, stackStartFunction);
	  } else {
	    // non v8 browsers so we can have a stacktrace
	    var err = new Error();
	    if (err.stack) {
	      var out = err.stack;

	      // try to strip useless frames
	      var fn_name = stackStartFunction.name;
	      var idx = out.indexOf('\n' + fn_name);
	      if (idx >= 0) {
	        // once we have located the function frame
	        // we need to strip out everything before it (and its line)
	        var next_line = out.indexOf('\n', idx + 1);
	        out = out.substring(next_line + 1);
	      }

	      this.stack = out;
	    }
	  }
	};

	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);

	function replacer(key, value) {
	  if (util.isUndefined(value)) {
	    return '' + value;
	  }
	  if (util.isNumber(value) && !isFinite(value)) {
	    return value.toString();
	  }
	  if (util.isFunction(value) || util.isRegExp(value)) {
	    return value.toString();
	  }
	  return value;
	}

	function truncate(s, n) {
	  if (util.isString(s)) {
	    return s.length < n ? s : s.slice(0, n);
	  } else {
	    return s;
	  }
	}

	function getMessage(self) {
	  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' + self.operator + ' ' + truncate(JSON.stringify(self.expected, replacer), 128);
	}

	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.

	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function fail(actual, expected, message, operator, stackStartFunction) {
	  throw new assert.AssertionError({
	    message: message,
	    actual: actual,
	    expected: expected,
	    operator: operator,
	    stackStartFunction: stackStartFunction
	  });
	}

	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;

	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.

	function ok(value, message) {
	  if (!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;

	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);

	assert.equal = function equal(actual, expected, message) {
	  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};

	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);

	assert.notEqual = function notEqual(actual, expected, message) {
	  if (actual == expected) {
	    fail(actual, expected, message, '!=', assert.notEqual);
	  }
	};

	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);

	assert.deepEqual = function deepEqual(actual, expected, message) {
	  if (!_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
	  }
	};

	function _deepEqual(actual, expected) {
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;
	  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
	    if (actual.length != expected.length) return false;

	    for (var i = 0; i < actual.length; i++) {
	      if (actual[i] !== expected[i]) return false;
	    }

	    return true;

	    // 7.2. If the expected value is a Date object, the actual value is
	    // equivalent if it is also a Date object that refers to the same time.
	  } else if (util.isDate(actual) && util.isDate(expected)) {
	      return actual.getTime() === expected.getTime();

	      // 7.3 If the expected value is a RegExp object, the actual value is
	      // equivalent if it is also a RegExp object with the same source and
	      // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	    } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
	        return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;

	        // 7.4. Other pairs that do not both pass typeof value == 'object',
	        // equivalence is determined by ==.
	      } else if (!util.isObject(actual) && !util.isObject(expected)) {
	          return actual == expected;

	          // 7.5 For all other Object pairs, including Array objects, equivalence is
	          // determined by having the same number of owned properties (as verified
	          // with Object.prototype.hasOwnProperty.call), the same set of keys
	          // (although not necessarily the same order), equivalent values for every
	          // corresponding key, and an identical 'prototype' property. Note: this
	          // accounts for both named and indexed properties on Arrays.
	        } else {
	            return objEquiv(actual, expected);
	          }
	}

	function isArguments(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	}

	function objEquiv(a, b) {
	  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b)) return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  // if one is a primitive, the other must be same
	  if (util.isPrimitive(a) || util.isPrimitive(b)) {
	    return a === b;
	  }
	  var aIsArgs = isArguments(a),
	      bIsArgs = isArguments(b);
	  if (aIsArgs && !bIsArgs || !aIsArgs && bIsArgs) return false;
	  if (aIsArgs) {
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return _deepEqual(a, b);
	  }
	  var ka = objectKeys(a),
	      kb = objectKeys(b),
	      key,
	      i;
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length) return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i]) return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!_deepEqual(a[key], b[key])) return false;
	  }
	  return true;
	}

	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);

	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	  if (_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
	  }
	};

	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);

	assert.strictEqual = function strictEqual(actual, expected, message) {
	  if (actual !== expected) {
	    fail(actual, expected, message, '===', assert.strictEqual);
	  }
	};

	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	  if (actual === expected) {
	    fail(actual, expected, message, '!==', assert.notStrictEqual);
	  }
	};

	function expectedException(actual, expected) {
	  if (!actual || !expected) {
	    return false;
	  }

	  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
	    return expected.test(actual);
	  } else if (actual instanceof expected) {
	    return true;
	  } else if (expected.call({}, actual) === true) {
	    return true;
	  }

	  return false;
	}

	function _throws(shouldThrow, block, expected, message) {
	  var actual;

	  if (util.isString(expected)) {
	    message = expected;
	    expected = null;
	  }

	  try {
	    block();
	  } catch (e) {
	    actual = e;
	  }

	  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') + (message ? ' ' + message : '.');

	  if (shouldThrow && !actual) {
	    fail(actual, expected, 'Missing expected exception' + message);
	  }

	  if (!shouldThrow && expectedException(actual, expected)) {
	    fail(actual, expected, 'Got unwanted exception' + message);
	  }

	  if (shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual) {
	    throw actual;
	  }
	}

	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);

	assert.throws = function (block, /*optional*/error, /*optional*/message) {
	  _throws.apply(this, [true].concat(pSlice.call(arguments)));
	};

	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function (block, /*optional*/message) {
	  _throws.apply(this, [false].concat(pSlice.call(arguments)));
	};

	assert.ifError = function (err) {
	  if (err) {
	    throw err;
	  }
	};

	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    if (hasOwn.call(obj, key)) keys.push(key);
	  }
	  return keys;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	var formatRegExp = /%[sdj%]/g;
	exports.format = function (f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function (x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s':
	        return String(args[i++]);
	      case '%d':
	        return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};

	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function (fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function () {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};

	var debugs = {};
	var debugEnviron;
	exports.debuglog = function (set) {
	  if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function () {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function () {};
	    }
	  }
	  return debugs[set];
	};

	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;

	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold': [1, 22],
	  'italic': [3, 23],
	  'underline': [4, 24],
	  'inverse': [7, 27],
	  'white': [37, 39],
	  'grey': [90, 39],
	  'black': [30, 39],
	  'blue': [34, 39],
	  'cyan': [36, 39],
	  'green': [32, 39],
	  'magenta': [35, 39],
	  'red': [31, 39],
	  'yellow': [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};

	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str + '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}

	function stylizeNoColor(str, styleType) {
	  return str;
	}

	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function (val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}

	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect && value && isFunction(value.inspect) &&
	  // Filter out the util module, it's inspect function is special
	  value.inspect !== exports.inspect &&
	  // Also filter out any prototype objects using the circular check.
	  !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '',
	      array = false,
	      braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function (key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}

	function formatPrimitive(ctx, value) {
	  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value)) return ctx.stylize('' + value, 'number');
	  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value)) return ctx.stylize('null', 'null');
	}

	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}

	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function (key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
	    }
	  });
	  return output;
	}

	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function (line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function (line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}

	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function (prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || typeof arg === 'symbol' || // ES6 symbol
	  typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(17);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}

	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}

	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function () {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};

	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(18);

	exports._extend = function (origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(16)))

/***/ },
/* 16 */
/***/ function(module, exports) {

	// shim for using process in browser

	'use strict';

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object' && typeof arg.copy === 'function' && typeof arg.fill === 'function' && typeof arg.readUInt8 === 'function';
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function TempCtor() {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  };
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assert = __webpack_require__(14);

	var Chess = __webpack_require__(1);
	var Color = __webpack_require__(3);
	var Flags = __webpack_require__(6);
	var Move = __webpack_require__(7);
	var Piece = __webpack_require__(9);
	var PieceType = __webpack_require__(8);

	suite("PGN", function () {
	    var chess = undefined;

	    before(function () {
	        chess = new Chess();
	    });

	    beforeEach(function () {
	        chess.reset();
	    });

	    suite("#loadPgn()", function () {
	        [{
	            // regression test - broken PGN parser ended up with this:
	            // fen = rnbqk2r/pp1p1ppp/4pn2/1N6/1bPN4/8/PP2PPPP/R1BQKB1R b KQkq - 2 6

	            pgn: ['1. d4 Nf6 2. c4 e6 3. Nf3 c5 4. Nc3 cxd4 5. Nxd4 Bb4 6. Nb5'],
	            fen: 'rnbqk2r/pp1p1ppp/4pn2/1N6/1bP5/2N5/PP2PPPP/R1BQKB1R b KQkq - 2 6'
	        }, {
	            pgn: ['[Event "Reykjavik WCh"]', '[Site "Reykjavik WCh"]', '[Date "1972.01.07"]', '[EventDate "?"]', '[Round "6"]', '[Result "1-0"]', '[White "Robert James Fischer"]', '[Black "Boris Spassky"]', '[ECO "D59"]', '[WhiteElo "?"]', '[BlackElo "?"]', '[PlyCount "81"]', '', '1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4', 'b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5', '13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18.', 'Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8', '24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29.', 'Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2', 'Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6', 'Kg8 40. Bc4 Kh8 41. Qf4 1-0']
	        }, {
	            fen: '1n1Rkb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2K5 b k - 1 17',
	            pgn: ['[Event "Paris"]', '[Site "Paris"]', '[Date "1858.??.??"]', '[EventDate "?"]', '[Round "?"]', '[Result "1-0"]', '[White "Paul Morphy"]', '[Black "Duke Karl / Count Isouard"]', '[ECO "C41"]', '[WhiteElo "?"]', '[BlackElo "?"]', '[PlyCount "33"]', '', '1.e4 e5 2.Nf3 d6 3.d4 Bg4 {This is a weak move', 'already.--Fischer} 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7', '8.Nc3 c6 9.Bg5 {Black is in what\'s like a zugzwang position', 'here. He can\'t develop the [Queen\'s] knight because the pawn', 'is hanging, the bishop is blocked because of the', 'Queen.--Fischer} b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8', '13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0']
	        }, {
	            pgn: ['1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. Nxg4 Nxe4 7.', 'd3 Ng3 8. Bxf4 Nxh1 9. Qe2+ Qe7 10. Nf6+ Kd8 11. Bxc7+ Kxc7 12.', 'Nd5+ Kd8 13. Nxe7 Bxe7 14. Qg4 d6 15. Qf4 Rg8 16. Qxf7 Bxh4+ 17.', 'Kd2 Re8 18. Na3 Na6 19. Qh5 Bf6 20. Qxh1 Bxb2 21. Qh4+ Kd7 22. Rb1', 'Bxa3 23. Qa4+']
	        }, {
	            fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
	            pgn: ['1. e4 ( 1. d4 { Queen\'s pawn } d5 ( 1... Nf6 ) ) e5']
	        }, {
	            fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
	            pgn: ['1. e4 { King\'s pawn } ( 1. d4 ) 1... e5']
	        }, {
	            pgn: ['[Event "Testing advanced variations: nesting and siblings"]', '[Round "4"]', '', '1. d4 (1. c4 (1. b4 (1. a4 a5) 1... b5) 1... c5) (1. e4 (1. f4 (1.', 'g4 (1. h4 h5) 1... g5) 1... f5) 1... e5) 1... d5 (1... c5 (1... b5', '(1... a5))) (1... e5 (1... f5 (1... g5 2. g3) 2. f3) 2. e3) 2. e3', '(2. f3 f6) (2. g3 g6) (2. h3 h6) 2... e6']
	        }, {
	            fen: 'rnbqkb1r/ppp1pppp/5n2/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4',
	            pgn: ['[Event "Testing continuations"]', '[Round "9"]', '[SetUp "1"]', '[FEN "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2"]', '', '2. c4 dxc4 (* 3. e4 e5) 3. Nf3 Nf6', '(* 4. e3 Bg4) (3... b5 4. a4)']
	        }, {
	            pgn: ['[Event "4th London Chess Classic"]', '[Site "London ENG"]', '[Date "2012.12.04"]', '[Round "4.1"]', '[White "Carlsen,M"]', '[Black "Jones,G"]', '[Result "1-0"]', '[WhiteTitle "GM"]', '[BlackTitle "GM"]', '[WhiteElo "2848"]', '[BlackElo "2644"]', '[ECO "B53"]', '[Opening "Sicilian, Chekhover variation"]', '[WhiteFideId "1503014"]', '[BlackFideId "409561"]', '[EventDate "2012.12.01"]', '', '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Qxd4 a6 5. h3 Nc6 6. Qe3 g6 7. c4', 'Bg7 8. Be2 Nf6 9. Nc3 O-O 10. O-O Nd7 11. Rb1 a5 12. b3 Nc5 13.', 'Bb2 f5 14. exf5 Bxf5 15. Rbd1 a4 16. Ba3 Qa5 17. Nb5 axb3 18. axb3', 'Qxa3 19. Nxa3 Rxa3 20. Nd2 Bd4 21. Qg3 Be5 22. f4 Bf6 23. Bg4 Nd4', '24. Kh1 Bc2 25. Rde1 Kh8 26. Re3 h5 27. b4 h4 28. Qf2 Nd3 29. Qg1', 'Nf5 30. Bxf5 gxf5 31. Nf3 Rc3 32. c5 Bb3 33. Ne1 Bd4 34. Nxd3 dxc5', '35. Qf2 Rf7 36. Rc1 cxb4 37. Rxc3 bxc3 38. Qe1 1-0']
	            // TODO eventually add your ./test_games_to_validate.pgn
	        }, {
	            pgn: ['1. d4 d5 2. c4 dxc4 (* 3. e4 e5 { this is a continuation }) 3. Nf3', 'Nf6 (* 4. e3 Bg4 { another continuation }) (3... b5 4. a4', '{this is a variation})']
	        }, {
	            pgn: ["1. e4 (1. d4 { Queen\'s pawn } d5 ({ })) 1... e5"]
	        }].forEach(function (testCase, i) {
	            test(i + String.fromCharCode(97 + i), function () {
	                var newlineChar = '\n';

	                var result = chess.loadPgn(testCase.pgn.join(newlineChar), { newlineChar: newlineChar });

	                // some PGN's tests contain comments which are stripped during parsing,
	                // so we'll need compare the results of the load against a FEN string

	                assert(result, "loadPgn() method failed to parse.");

	                if ('fen' in testCase) {
	                    var outcomeFen = chess.toFen();
	                    assert.equal(testCase.fen, outcomeFen);
	                } else {
	                    var outcomePgn = chess.toPgn({ maxWidth: 65, newlineChar: newlineChar });
	                    var expectedPgn = testCase.pgn.join(newlineChar);
	                    assert.equal(expectedPgn, outcomePgn);
	                }
	            });
	        });

	        test("many nested variations", function () {
	            var pgn = '1. d4 (1. c4 (1. b4 (1. a4 a5) 1... b5) 1... c5) (1. e4 (1. f4 (1. g4 (1. h4 h5) 1... g5) 1... f5) 1... e5) 1... d5 (1... c5 (1... b5 (1... a5))) (1... e5 (1... f5 (1... g5 2. g3) 2. f3) 2. e3) 2. e3 (2. f3 f6) (2. g3 g6) (2. h3 h6) 2... e6';
	            chess.loadPgn(pgn);
	            assert.equal(chess.toPgn(), pgn, "PGN parser failed to reassemble the given PGN text");
	        });

	        test("many nested variations + headers", function () {
	            var expectedPgn = '[Event "Testing advanced variations: nesting and siblings"]\n[Round "1"]\n\n1. d4 (1. c4 (1. b4 (1. a4 a5) 1... b5) 1... c5) (1. e4 (1. f4 (1. g4 (1. h4 h5) 1... g5) 1... f5) 1... e5) 1... d5 (1... c5 (1... b5 (1... a5))) (1... e5 (1... f5 (1... g5 2. g3) 2. f3) 2. e3) 2. e3 (2. f3 f6) (2. g3 g6) (2. h3 h6) 2... e6';

	            chess.loadPgn('\n                [Event "Testing advanced variations: nesting and siblings"]\n                [Round "1"]\n\n                1. d4\n\n                    (1. c4\n                        (1. b4\n                            (1. a4 a5)\n                         1... b5)\n                     1... c5)\n\n                    (1. e4\n                        (1. f4\n                            (1. g4\n                                (1. h4 h5)\n                             1... g5)\n                         1... f5)\n                     1... e5)\n\n                1... d5\n\n                    (1... c5\n                        (1... b5\n                            (1... a5)\n                         )\n                    )\n\n                    (1... e5\n                        (1... f5\n                            (1... g5 2. g3)\n                         2. f3)\n                     2. e3)\n\n                2. e3\n                    (2. f3 f6)\n                    (2. g3 g6)\n                    (2. h3 h6)\n\n                2... e6\n            ');

	            assert.equal(expectedPgn, chess.toPgn(), "PGN parser failed to reassemble the given PGN text");
	        });

	        test("comments", function () {
	            var pgn = '[Event "2.f"][Site "Leningrad"][Date "1974.??.??"][Round "3"][White "Karpov, Anatoly"][Black "Spassky, Boris"][Result "1-0"][ECO "E91"][WhiteElo "2700"][BlackElo "2650"][Annotator "JvR"][PlyCount "109"][EventDate "1974.??.??"]\n\n1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 c5 7. O-O Bg4 $5 { Spassky chooses a sharp opening.} 8. d5 Nbd7 9. Bg5 a6 10. a4 Qc7 11. Qd2 Rae8 12. h3 Bxf3 13. Bxf3 e6 $5 14. b3 Kh8 15. Be3 Ng8 16. Be2 e5 $5 17. g4 Qd8 18. Kg2 Qh4 $5 {Black takes the initiative on the kingside.} 19. f3 ({ The tactical justification is} 19. Bg5 Bh6) 19... Bh6 $2 { Tal, Keres and Botvinnik condemn this provocative move} ({and prefer} 19... f5) 20. g5 Bg7 21. Bf2 Qf4 22. Be3 Qh4 23. Qe1 $1 Qxe1 24. Rfxe1 h6 25. h4 hxg5 $2 ({A defence line against an attack on the queenside creates} 25... Ra8 26. Reb1 Rfb8 27. b4 Bf8 28. bxc5 Nxc5) 26. hxg5 Ne7 27. a5 f6 28. Reb1 fxg5 29. b4 $1 Nf5 $5 30. Bxg5 $011 ({Keres analyses} 30. exf5 e4 31. Bd2 exf3+ 32. Bxf3 gxf5 { Black has counter-play.}) 30... Nd4 31. bxc5 Nxc5 32. Rb6 Bf6 33. Rh1+ $111 Kg7 34. Bh6+ Kg8 35. Bxf8 Rxf8 36. Rxd6 Kg7 37. Bd1 Be7 ({Tal mentions} 37... Bd8 38. Na4 Bc7 39. Nxc5 Bxd6 40. Nxb7 {and 41.c5. White wins.}) 38. Rb6 Bd8 39. Rb1 Rf7 40. Na4 Nd3 41. Nb6 g5 42. Nc8 Nc5 43. Nd6 Rd7 44. Nf5+ Nxf5 45. exf5 e4 46. fxe4 Nxe4 47. Ba4 Re7 48. Rbe1 Nc5 49. Rxe7+ Bxe7 50. Bc2 Bd8 51. Ra1 Kf6 52. d6 Nd7 53. Rb1 Ke5 54. Rd1 Kf4 55. Re1';
	            chess.loadPgn(pgn);
	            assert.equal(pgn, chess.toPgn(), "PGN parser failed to reassemble the given PGN text");
	        });
	    });

	    suite("#toPgn()", function () {
	        [{
	            moves: ['d4', 'd5', 'Nf3', 'Nc6', 'e3', 'e6', 'Bb5', 'g5', 'O-O', 'Qf6', 'Nc3', 'Bd7', 'Bxc6', 'Bxc6', 'Re1', 'O-O-O', 'a4', 'Bb4', 'a5', 'b5', 'axb6', 'axb6', 'Ra8+', 'Kd7', 'Ne5+', 'Kd6', 'Rxd8+', 'Qxd8', 'Nxf7+', 'Ke7', 'Nxd5+', 'Qxd5', 'c3', 'Kxf7', 'Qf3+', 'Qxf3', 'gxf3', 'Bxf3', 'cxb4', 'e5', 'dxe5', 'Ke6', 'b3', 'Kxe5', 'Bb2+', 'Ke4', 'Bxh8', 'Nf6', 'Bxf6', 'h5', 'Bxg5', 'Bg2', 'Kxg2', 'Kf5', 'Bh4', 'Kg4', 'Bg3', 'Kf5', 'e4+', 'Kg4', 'e5', 'h4', 'Bxh4', 'Kxh4', 'e6', 'c5', 'bxc5', 'bxc5', 'e7', 'c4', 'bxc4', 'Kg4', 'e8=Q', 'Kf5', 'Qe5+', 'Kg4', 'Re4#'],
	            header: ['White', 'Player1', 'Black', 'Player2', 'RandomAttribute', 'Value'],
	            maxWidth: 19,
	            newlineChar: "<br />",
	            pgn: '[White "Player1"]<br />[Black "Player2"]<br />[RandomAttribute "Value"]<br /><br />1. d4 d5 2. Nf3 Nc6<br />3. e3 e6 4. Bb5 g5<br />5. O-O Qf6 6. Nc3<br />Bd7 7. Bxc6 Bxc6 8.<br />Re1 O-O-O 9. a4 Bb4<br />10. a5 b5 11. axb6<br />axb6 12. Ra8+ Kd7<br />13. Ne5+ Kd6 14.<br />Rxd8+ Qxd8 15. Nxf7+<br />Ke7 16. Nxd5+ Qxd5<br />17. c3 Kxf7 18. Qf3+<br />Qxf3 19. gxf3 Bxf3<br />20. cxb4 e5 21. dxe5<br />Ke6 22. b3 Kxe5 23.<br />Bb2+ Ke4 24. Bxh8<br />Nf6 25. Bxf6 h5 26.<br />Bxg5 Bg2 27. Kxg2<br />Kf5 28. Bh4 Kg4 29.<br />Bg3 Kf5 30. e4+ Kg4<br />31. e5 h4 32. Bxh4<br />Kxh4 33. e6 c5 34.<br />bxc5 bxc5 35. e7 c4<br />36. bxc4 Kg4 37.<br />e8=Q Kf5 38. Qe5+<br />Kg4 39. Re4#',
	            fen: '8/8/8/4Q3/2P1R1k1/8/5PKP/8 b - - 4 39'
	        }, {
	            moves: ['c4', 'e6', 'Nf3', 'd5', 'd4', 'Nf6', 'Nc3', 'Be7', 'Bg5', 'O-O', 'e3', 'h6', 'Bh4', 'b6', 'cxd5', 'Nxd5', 'Bxe7', 'Qxe7', 'Nxd5', 'exd5', 'Rc1', 'Be6', 'Qa4', 'c5', 'Qa3', 'Rc8', 'Bb5', 'a6', 'dxc5', 'bxc5', 'O-O', 'Ra7', 'Be2', 'Nd7', 'Nd4', 'Qf8', 'Nxe6', 'fxe6', 'e4', 'd4', 'f4', 'Qe7', 'e5', 'Rb8', 'Bc4', 'Kh8', 'Qh3', 'Nf8', 'b3', 'a5', 'f5', 'exf5', 'Rxf5', 'Nh7', 'Rcf1', 'Qd8', 'Qg3', 'Re7', 'h4', 'Rbb7', 'e6', 'Rbc7', 'Qe5', 'Qe8', 'a4', 'Qd8', 'R1f2', 'Qe8', 'R2f3', 'Qd8', 'Bd3', 'Qe8', 'Qe4', 'Nf6', 'Rxf6', 'gxf6', 'Rxf6', 'Kg8', 'Bc4', 'Kh8', 'Qf4'],
	            header: ["Event", "Reykjavik WCh", "Site", "Reykjavik WCh", "Date", "1972.01.07", "EventDate", "?", "Round", "6", "Result", "1-0", "White", "Robert James Fischer", "Black", "Boris Spassky", "ECO", "D59", "WhiteElo", "?", "BlackElo", "?", "PlyCount", "81"],
	            maxWidth: 65,
	            pgn: '[Event "Reykjavik WCh"]\n[Site "Reykjavik WCh"]\n[Date "1972.01.07"]\n[EventDate "?"]\n[Round "6"]\n[Result "1-0"]\n[White "Robert James Fischer"]\n[Black "Boris Spassky"]\n[ECO "D59"]\n[WhiteElo "?"]\n[BlackElo "?"]\n[PlyCount "81"]\n\n1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4\nb6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5\n13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18.\nNd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8\n24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29.\nQg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2\nQe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6\nKg8 40. Bc4 Kh8 41. Qf4 1-0',
	            fen: '4q2k/2r1r3/4PR1p/p1p5/P1Bp1Q1P/1P6/6P1/6K1 b - - 4 41'
	        }, {
	            moves: ['f3', 'e5', 'g4', 'Qh4#'], // testing maxWidth being small and having no comments
	            header: [],
	            maxWidth: 1,
	            pgn: '1.\nf3\ne5\n2.\ng4\nQh4#',
	            fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3'
	        }, {
	            moves: ['Ba5', 'O-O', 'd6', 'd4'], // testing a non-starting position
	            header: [],
	            maxWidth: 20,
	            pgn: '[SetUp "1"]\n[FEN "r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq - 0 1"]\n\n1... Ba5 2. O-O d6 3.\nd4',
	            startingFen: 'r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq - 0 1',
	            fen: 'r1bqk1nr/ppp2ppp/2np4/b3p3/2BPP3/2P2N2/P4PPP/RNBQ1RK1 b kq d3 0 3'
	        }].forEach(function (testCase) {
	            test(testCase.fen, function () {
	                if (testCase.startingFen) {
	                    chess.loadFen(testCase.startingFen);
	                }
	                var errorMessage = "";
	                for (var j = 0; j < testCase.moves.length; j++) {
	                    if (chess.makeMoveFromSan(testCase.moves[j]) === null) {
	                        errorMessage = "move() did not accept " + testCase.moves[j] + " : ";
	                        break;
	                    }
	                }

	                chess.header().addAll(testCase.header);

	                var options = { maxWidth: testCase.maxWidth };
	                if (testCase.newlineChar) options.newlineChar = testCase.newlineChar;

	                assert.equal(testCase.pgn, chess.toPgn(options));
	                assert.equal(testCase.fen, chess.toFen());
	                assert(errorMessage.length == 0, errorMessage);
	            });
	        });
	    });

	    test('dirty pgn', function () {
	        var pgn = '[Event "Reykjavik WCh"]\n' + '[Site "Reykjavik WCh"]\n' + '[Date "1972.01.07"]\n' + '[EventDate "?"]\n' + '[Round "6"]\n' + '[Result "1-0"]\n' + '[White "Robert James Fischer"]\r\n' + '[Black "Boris Spassky"]\n' + '[ECO "D59"]\n' + '[WhiteElo "?"]\n' + '[BlackElo "?"]\n' + '[PlyCount "81"]\n' + '\r\n' + '1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6\n' + '7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6\n' + '12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7\n' + '17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7\r\n' + '22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5\n' + '27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7\n' + '32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8\n' + '37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0\n';

	        try {
	            chess.loadPgn(pgn, { newlineChar: '\r?\n' });
	            fail("loadPgn() failed to throw an exception");
	        } catch (error) {
	            assert.equal(error['message'], 'error when trying to apply the parsed PGN move ""');
	        }

	        try {
	            assert(chess.loadPgn(pgn));
	            fail("loadPgn() failed to throw an exception");
	        } catch (error) {
	            assert.equal(error['message'], 'error when trying to apply the parsed PGN move ""');
	        }

	        assert(chess.toPgn().match(/^\[\[/) === null);
	    });

	    test('PGN continuations', function () {
	        chess.makeMoveFromSan('e4');
	        chess.makeMoveFromSan('e5');
	        chess.createContinuationFromSan('a3');

	        var actual = chess.toPgn();
	        var expected = "1. e4 e5 (* 2. a3)";

	        assert(expected === actual, "pgn output:  expected " + expected + " but found " + actual);

	        var actual2 = chess.history();
	        var expected2 = ["e4", "e5", "a3"];

	        var same = actual2.length === expected2.length;

	        if (same) {
	            for (var i = 0; i < actual2.length; i++) {
	                same &= actual2[i] === expected2[i];
	            }
	        }
	        assert(same, "history output:  expected " + expected2 + " but found " + actual2);
	    });

	    test('PGN continuations and variations - avoiding duplicate moves', function () {
	        chess.makeMoveFromSan('e4');
	        chess.makeMoveFromSan('e5');
	        assert(false === chess.createVariationFromSan('e5'), "New variation with move 'e5' should have failed, as 'e5' was already the current move on the current variation.");

	        chess.prev();
	        assert(false === chess.createContinuationFromSan('e5'), "New continuation with move 'e5' should have failed, as 'e5' was already the next move on the current variation.");
	    });

	    test('PGN variation - implicit creation via move traversal then adding a new move', function () {
	        chess.makeMoveFromSan('e4');
	        chess.makeMoveFromSan('e5');

	        chess.prev();

	        chess.makeMoveFromSan('a6');
	        chess.makeMoveFromSan('Nf3');
	        chess.makeMoveFromSan('Nf6');

	        chess.createVariationFromSan('Nh6');

	        chess.makeMoveFromSan('b3');

	        var actual = chess.toPgn();
	        var expected = "1. e4 e5 (1... a6 2. Nf3 Nf6 (2... Nh6 3. b3))";

	        assert.equal(actual, expected);
	    });

	    test('PGN continuation - rejection of new continuation for invalid move', function () {
	        chess.makeMoveFromSan('e4');
	        chess.makeMoveFromSan('e5');
	        chess.makeMoveFromSan('a4');
	        chess.makeMoveFromSan('a6');

	        assert(chess.createContinuationFromSan('Rb2') === false, "New continuation for move 'Rb2' should have failed.");
	        assert(chess.createContinuationFromSan('Ra2'), "New continuation for move 'Ra2' should have succeeded.");

	        var actual = chess.toPgn();
	        var expected = "1. e4 e5 2. a4 a6 (* 3. Ra2)";

	        assert.equal(actual, expected);
	    });

	    suite("Make Move", function () {
	        [{
	            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
	            legal: true,
	            move: 'e4',
	            next: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
	        }, {
	            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
	            legal: false,
	            move: 'e5'
	        }, {
	            fen: '7k/3R4/3p2Q1/6Q1/2N1N3/8/8/3R3K w - - 0 1',
	            legal: true,
	            move: 'Rd8#',
	            next: '3R3k/8/3p2Q1/6Q1/2N1N3/8/8/3R3K b - - 1 1'
	        }, {
	            fen: 'rnbqkbnr/pp3ppp/2pp4/4pP2/4P3/8/PPPP2PP/RNBQKBNR w KQkq e6 0 1',
	            legal: true,
	            move: 'fxe6',
	            next: 'rnbqkbnr/pp3ppp/2ppP3/8/4P3/8/PPPP2PP/RNBQKBNR b KQkq - 0 1',
	            captured: Piece.BLACK_PAWN
	        }, {
	            fen: 'rnbqkbnr/pppp2pp/8/4p3/4Pp2/2PP4/PP3PPP/RNBQKBNR b KQkq e3 0 1',
	            legal: true,
	            move: 'fxe3',
	            next: 'rnbqkbnr/pppp2pp/8/4p3/8/2PPp3/PP3PPP/RNBQKBNR w KQkq - 0 2',
	            captured: Piece.WHITE_PAWN
	        }].forEach(function (position) {
	            test(position.fen + ' (' + position.move + ' ' + position.legal + ')', function () {

	                chess.loadFen(position.fen);
	                var result = chess.makeMoveFromSan(position.move);

	                if (position.legal) {
	                    assert(result);
	                    assert(chess.toFen() === position.next);
	                    if (position.captured) {
	                        assert.equal(result.move.capturedPiece, position.captured);
	                    }
	                } else {
	                    assert(!result);
	                }
	            });
	        });
	    });

	    suite('Regression Tests', function () {
	        test('castling flag reappearing', function () {
	            chess.loadFen('b3k2r/5p2/4p3/1p5p/6p1/2PR2P1/BP3qNP/6QK b k - 2 28');

	            chess.makeMove(new Move({
	                from: Move.SQUARES.a8,
	                to: Move.SQUARES.g2,
	                movedPiece: Piece.BLACK_BISHOP
	            }));

	            assert.equal(chess.toFen(), '4k2r/5p2/4p3/1p5p/6p1/2PR2P1/BP3qbP/6QK w k - 3 29');
	        });

	        test('placing more than one king', function () {
	            chess.loadFen('N3k3/8/8/8/8/8/5b2/4K3 w - - 0 1');
	            assert(chess.put(Piece.WHITE_KING, 'a1') === false);
	            chess.put(Piece.WHITE_QUEEN, 'a1');
	            chess.remove('a1');
	            assert.equal(chess.moves().join(' '), 'Kd2 Ke2 Kxf2 Kf1 Kd1');
	        });
	    });

	    // TODO(aaron) organize these remaining suites better;
	    suite('Move History Navigation', function () {
	        test('Simple cursor traversals of variations', function () {
	            chess.makeMoveFromSan('e4');
	            chess.makeMoveFromSan('e5');
	            chess.createVariationFromSan('a6');
	            chess.createVariationFromSan('a5');
	            chess.makeMoveFromSan('Nf3');
	            chess.makeMoveFromSan('Nf6');
	            chess.makeMoveFromSan('a3');
	            chess.makeMoveFromSan('b6');

	            var actual = chess.toPgn();
	            var expected = "1. e4 e5 (1... a6 (1... a5 2. Nf3 Nf6 3. a3 b6))";
	            assert.equal(actual, expected);

	            actual = chess.history();
	            expected = ["e4", "a5", "Nf3", "Nf6", "a3", "b6"];

	            var same = actual.length === expected.length;
	            if (same) {
	                for (var i = 0; i < actual.length; i++) {
	                    same &= actual[i] === expected[i];
	                }
	            }
	            assert(same, "history output:  expected " + expected + " but found " + actual);
	        });

	        test('Simple cursor traversals of mainline', function () {
	            chess.makeMoveFromSan('e4');
	            chess.makeMoveFromSan('e5');
	            assert(chess.history().length == 2);
	            chess.prev();
	            assert(chess.history().length == 1);
	            chess.makeMoveFromSan('e5');
	            assert(chess.history().length == 2);
	            chess.prev();
	            chess.prev();
	            assert(chess.history().length == 0);
	            chess.prev();
	            chess.prev();
	            chess.next();
	            chess.next();
	            assert(chess.history().length == 2);
	            assert(false === chess.next());
	        });
	    });

	    suite('regression test for coding bugs', function () {
	        test('regression test for coding bug -- failed to fully clone javascript map objects', function () {
	            chess.loadFen('rnbqkbnr/pppp1ppp/8/8/4p3/4PN2/PPPP1PPP/RNBQKB1R w KQkq - 0 3');
	            chess.makeMoveFromSan('Be2');
	            chess.makeMoveFromSan('a6');
	            chess.moves({ onlyForSquare: 'e1' });
	            chess.isThreefoldRepetition(); // no defect;  fen still allows castling
	            var fen1 = chess.toFen();
	            chess.isThreefoldRepetition(); // defect in code prior to bug fix;  fen incorrectly disallows castling....
	            var fen2 = chess.toFen();
	            assert(fen1 === fen2);
	        });
	    });

	    suite("History", function () {
	        test("History Test", function () {
	            var expectedFen = '4q2k/2r1r3/4PR1p/p1p5/P1Bp1Q1P/1P6/6P1/6K1 b - - 4 41';
	            var moves = ['c4', 'e6', 'Nf3', 'd5', 'd4', 'Nf6', 'Nc3', 'Be7', 'Bg5', 'O-O', 'e3', 'h6', 'Bh4', 'b6', 'cxd5', 'Nxd5', 'Bxe7', 'Qxe7', 'Nxd5', 'exd5', 'Rc1', 'Be6', 'Qa4', 'c5', 'Qa3', 'Rc8', 'Bb5', 'a6', 'dxc5', 'bxc5', 'O-O', 'Ra7', 'Be2', 'Nd7', 'Nd4', 'Qf8', 'Nxe6', 'fxe6', 'e4', 'd4', 'f4', 'Qe7', 'e5', 'Rb8', 'Bc4', 'Kh8', 'Qh3', 'Nf8', 'b3', 'a5', 'f5', 'exf5', 'Rxf5', 'Nh7', 'Rcf1', 'Qd8', 'Qg3', 'Re7', 'h4', 'Rbb7', 'e6', 'Rbc7', 'Qe5', 'Qe8', 'a4', 'Qd8', 'R1f2', 'Qe8', 'R2f3', 'Qd8', 'Bd3', 'Qe8', 'Qe4', 'Nf6', 'Rxf6', 'gxf6', 'Rxf6', 'Kg8', 'Bc4', 'Kh8', 'Qf4'];

	            for (var j = 0; j < moves.length; j++) {
	                chess.makeMoveFromSan(moves[j]);
	            }

	            var history = chess.history();

	            var actualFen = chess.toFen();
	            assert.equal(expectedFen, actualFen);
	            assert.equal(history.length, moves.length);
	            for (var j = 0; j < moves.length; j++) {
	                assert.equal(history[j], moves[j]);
	            }
	        });
	    });

	    suite("Timing", function () {
	        test("Timing Test #1", function () {
	            // TODO write a test that makes extensive use of the replay log....
	        });
	    });

	    suite("Wildcard Moves", function () {
	        test("1", function () {

	            chess.loadPgn("1. e4 -- 2. a3");

	            chess.createVariationFromSan('a4');
	            chess.prev();
	            chess.createVariationFromSan('b4');
	            chess.prev();
	            chess.createVariationFromSan('--');

	            assert.equal('1. e4  ^ -- 2. a3 (2. a4)', chess.toPgn({ showMoveCursor: true }));
	        });
	    });
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assert = __webpack_require__(14);

	var Fen = __webpack_require__(5);

	suite('FEN', function () {
	    suite('Validate', function () {
	        [{ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNRw KQkq - 0 1', errorCode: 1 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 x', errorCode: 2 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0', errorCode: 2 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 -1', errorCode: 2 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - x 1', errorCode: 3 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1', errorCode: 3 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e2 0 1', errorCode: 4 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e7 0 1', errorCode: 4 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq x 0 1', errorCode: 4 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQxkq - 0 1', errorCode: 5 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1', errorCode: 5 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR ? KQkq - 0 1', errorCode: 6 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP w KQkq - 0 1', errorCode: 7 }, { fen: 'rnbqkbnr/pppppppp/17/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', errorCode: 8 }, { fen: 'rnbqk?nr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', errorCode: 9 }, { fen: 'rnbqkbnr/pppppppp/7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', errorCode: 10 }, { fen: 'rnbqkbnr/p1p1p1p1p/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', errorCode: 10 }, { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', errorCode: 0 }, { fen: 'rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2', errorCode: 0 }, { fen: '3r2k1/p1q2pp1/2nr1n1p/2p1p3/4P2B/P1P2Q1P/B4PP1/1R2R1K1 b - - 3 20', errorCode: 0 }, { fen: 'r2q1rk1/3bbppp/p3pn2/1p1pB3/3P4/1QNBP3/PP3PPP/R4RK1 w - - 4 13', errorCode: 0 }, { fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 1 5', errorCode: 0 }, { fen: '1k1rr3/1p5p/p1Pp2q1/3nppp1/PB6/3P4/3Q1PPP/1R3RK1 b - - 0 28', errorCode: 0 }, { fen: 'r3r1k1/3n1pp1/2q1p2p/2p5/p1p2P2/P3P2P/1PQ2BP1/1R2R1K1 w - - 0 27', errorCode: 0 }, { fen: 'r3rbk1/1R3p1p/3Pq1p1/6B1/p6P/5Q2/5PP1/3R2K1 b - - 3 26', errorCode: 0 }, { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', errorCode: 0 }, { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', errorCode: 0 }, { fen: 'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5', errorCode: 0 }, { fen: 'r1b2rk1/4bppp/p1np4/q3p1P1/1p2P2P/4BP2/PPP1N1Q1/1K1R1B1R w - - 0 17', errorCode: 0 }, { fen: 'r2q1rk1/ppp1bppp/2np1nb1/4p3/P1B1P1P1/3P1N1P/1PP2P2/RNBQR1K1 w - - 1 10', errorCode: 0 }, { fen: 'r2qkb1r/pb1n1p2/4pP2/1ppP2B1/2p5/2N3P1/PP3P1P/R2QKB1R b KQkq - 0 13', errorCode: 0 }, { fen: '3k1b1r/p2n1p2/5P2/2pN4/P1p2B2/1p3qP1/1P2KP2/3R4 w - - 0 29', errorCode: 0 }, { fen: 'rnbq1rk1/1pp1ppbp/p2p1np1/8/2PPP3/2N1BP2/PP2N1PP/R2QKB1R b KQ - 1 7', errorCode: 0 }, { fen: 'rn1qkb1r/pb1p1ppp/1p2pn2/4P3/2Pp4/5NP1/PP1N1PBP/R1BQK2R b KQkq - 0 8', errorCode: 0 }, { fen: 'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', errorCode: 0 }, { fen: 'r1bq1rk1/pp2ppbp/3p1np1/8/3pPP2/3B4/PPPPN1PP/R1BQ1RK1 w - - 4 10', errorCode: 0 }, { fen: 'r1b3k1/5pbp/2N1p1p1/p6q/2p2P2/2P1B3/PPQ3PP/3R2K1 b - - 0 22', errorCode: 0 }, { fen: 'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3', errorCode: 0 }, { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq d3 0 4', errorCode: 0 }, { fen: 'r1bqk2r/ppp1bppp/2n5/3p4/3Pn3/3B1N2/PPP2PPP/RNBQ1RK1 w kq - 4 8', errorCode: 0 }, { fen: '4kb1r/1p3pp1/p3p3/4P1BN/1n1p1PPP/PR6/1P4r1/1KR5 b k - 0 24', errorCode: 0 }, { fen: 'r3kb1r/pbpp1ppp/1qp1n3/4P3/2P5/1N2Q3/PP1B1PPP/R3KB1R w KQkq - 7 13', errorCode: 0 }, { fen: 'r1b1r1k1/p4p1p/2pb2p1/3pn3/N7/4BP2/PPP2KPP/3RRB2 b - - 3 18', errorCode: 0 }, { fen: 'r1b2rk1/p2nqp1p/3P2p1/2p2p2/2B5/1PB3N1/P4PPP/R2Q2K1 b - - 0 18', errorCode: 0 }, { fen: 'rnb1k2r/1p3ppp/p3Pn2/8/3N2P1/2q1B3/P1P1BP1P/R2Q1K1R b kq - 1 12', errorCode: 0 }, { fen: 'rnb1k2r/1pq1bppp/p2ppn2/8/3NPP2/2N1B3/PPP1B1PP/R2QK2R w KQkq - 1 9', errorCode: 0 }, { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', errorCode: 0 }, { fen: '4r3/1pr3pk/p2p2q1/3Pppbp/8/1NPQ1PP1/PP2R2P/1K1R4 w - - 8 28', errorCode: 0 }, { fen: 'b2r3r/4kp2/p3p1p1/1p2P3/1P1n1P2/P1NB4/KP4P1/3R2R1 b - - 2 26', errorCode: 0 }, { fen: 'rnbqk2r/ppppppbp/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4', errorCode: 0 }, { fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', errorCode: 0 }, { fen: 'rn1q1rk1/pbp2pp1/1p3b1p/3p4/3P4/2NBPN2/PP3PPP/2RQK2R b K - 1 11', errorCode: 0 }, { fen: '2rq1rk1/pp1bppbp/3p1np1/8/2BNP3/2N1BP2/PPPQ2PP/1K1R3R b - - 0 13', errorCode: 0 }, { fen: 'r2qkb1r/1p1bpppp/p1np4/6B1/B3P1n1/2PQ1N2/PP3PPP/RN2R1K1 b kq - 0 10', errorCode: 0 }, { fen: 'r1bq1rk1/1p2npb1/p6p/3p2p1/3P3B/2N5/PP2BPPP/R2QR1K1 w - - 0 15', errorCode: 0 }, { fen: 'r3r1k1/pbq1bppp/4pnn1/2p1B1N1/2P2P2/1P1B2N1/P3Q1PP/4RRK1 b - - 4 17', errorCode: 0 }, { fen: '4k3/5p2/p1q1pbp1/1pr1P3/3n1P2/1B2B2Q/PP3P2/3R3K w - - 1 28', errorCode: 0 }, { fen: '2k4r/pp1r1p1p/8/2Pq1p2/1Pn2P2/PQ3NP1/3p1NKP/R7 b - - 0 28', errorCode: 0 }, { fen: 'rnbqkb1r/ppp2ppp/3p1n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 4', errorCode: 0 }, { fen: '3r1rk1/Qpp2p1p/7q/1P2P1p1/2B1Rn2/6NP/P4P1P/5RK1 b - - 0 22', errorCode: 0 }, { fen: 'rn2kb1r/2qp1ppp/b3pn2/2pP2B1/1pN1P3/5P2/PP4PP/R2QKBNR w KQkq - 4 11', errorCode: 0 }, { fen: 'r3k2r/pp1nbp1p/2p2pb1/3p4/3P3N/2N1P3/PP3PPP/R3KB1R w KQkq - 4 12', errorCode: 0 }, { fen: 'rn1qr1k1/pbppbppp/1p3n2/3P4/8/P1N1P1P1/1P2NPBP/R1BQK2R b KQ - 2 10', errorCode: 0 }, { fen: 'r1bqk2r/pp1nbppp/2p2n2/3p2B1/3P4/2N1PN2/PP3PPP/R2QKB1R w KQkq - 1 8', errorCode: 0 }, { fen: 'r1bqk2r/pppp1pp1/2n2n1p/8/1bPN3B/2N5/PP2PPPP/R2QKB1R b KQkq - 1 7', errorCode: 0 }, { fen: 'r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 4 6', errorCode: 0 }, { fen: 'r1b1kb1r/p2p1ppp/1qp1p3/3nP3/2P1NP2/8/PP4PP/R1BQKB1R b KQkq c3 0 10', errorCode: 0 }, { fen: '8/R7/2b5/3k2K1/P1p1r3/2B5/1P6/8 b - - 8 74', errorCode: 0 }, { fen: '2q5/5pk1/5p1p/4b3/1p1pP3/7P/1Pr3P1/R2Q1RK1 w - - 14 37', errorCode: 0 }, { fen: 'r4rk1/1bqnbppp/p2p4/1p2p3/3BPP2/P1NB4/1PP3PP/3RQR1K w - - 0 16', errorCode: 0 }, { fen: 'r1bqk2r/pp1n1ppp/2pbpn2/6N1/3P4/3B1N2/PPP2PPP/R1BQK2R w KQkq - 2 8', errorCode: 0 }, { fen: 'r1b1kb1r/pp3ppp/1qnppn2/8/2B1PB2/1NN5/PPP2PPP/R2QK2R b KQkq - 1 8', errorCode: 0 }, { fen: '1r3r1k/2q1n1pb/pn5p/1p2pP2/6B1/PPNRQ2P/2P1N1P1/3R3K b - - 0 28', errorCode: 0 }, { fen: 'rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq - 3 5', errorCode: 0 }, { fen: '2r3k1/5pp1/p2p3p/1p1Pp2P/5b2/8/qP1K2P1/3QRB1R w - - 0 26', errorCode: 0 }, { fen: '6k1/1Q3p2/2p1r3/B1Pn2p1/3P1b1p/5P1P/5P2/5K2 w - - 6 47', errorCode: 0 }, { fen: '8/k7/Pr2R3/7p/8/4n1P1/1r2p1P1/4R1K1 w - - 0 59', errorCode: 0 }, { fen: '8/3k4/1nbPp2p/1pK2np1/p7/PP1R1P2/2P4P/4R3 b - - 7 34', errorCode: 0 }, { fen: '4rbk1/rnR2p1p/pp2pnp1/3p4/3P4/1P2PB1P/P2BNPP1/R5K1 b - - 0 20', errorCode: 0 }, { fen: '5r2/6pk/8/p3P1p1/1R6/7Q/1Pr2P1K/2q5 b - - 2 48', errorCode: 0 }, { fen: '1br2rk1/2q2pp1/p3bnp1/1p1p4/8/1PN1PBPP/PB1Q1P2/R2R2K1 b - - 0 19', errorCode: 0 }, { fen: '4r1k1/b4p2/p4pp1/1p6/3p1N1P/1P2P1P1/P4P2/3R2K1 w - - 0 30', errorCode: 0 }, { fen: '3rk3/1Q4p1/p3p3/4RPqp/4p2P/P7/KPP5/8 b - h3 0 33', errorCode: 0 }, { fen: '6k1/1p1r1pp1/5qp1/p1pBP3/Pb3n2/1Q1RB2P/1P3PP1/6K1 b - - 0 28', errorCode: 0 }, { fen: '3r2k1/pp2bp2/1q4p1/3p1b1p/4PB1P/2P2PQ1/P2R2P1/3R2K1 w - - 1 28', errorCode: 0 }, { fen: '3r4/p1qn1pk1/1p1R3p/2P1pQpP/8/4B3/5PP1/6K1 w - - 0 35', errorCode: 0 }, { fen: 'rnb1k1nr/pp2q1pp/2pp4/4pp2/2PPP3/8/PP2NPPP/R1BQKB1R w KQkq f6 0 8', errorCode: 0 }, { fen: 'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', errorCode: 0 }, { fen: '4q1k1/6p1/p2rnpPp/1p2p3/7P/1BP5/PP3Q2/1K3R2 w - - 0 34', errorCode: 0 }, { fen: '3r2k1/p1q2pp1/1n2rn1p/1B2p3/P1p1P3/2P3BP/4QPP1/1R2R1K1 b - - 1 25', errorCode: 0 }, { fen: '8/p7/1b2BkR1/5P2/4K3/7r/P7/8 b - - 9 52', errorCode: 0 }, { fen: '2rq2k1/p4p1p/1p1prp2/1Ppb4/8/P1QPP1P1/1B3P1P/R3R1K1 w - - 2 20', errorCode: 0 }, { fen: '8/1pQ3bk/p2p1qp1/P2Pp2p/NP6/7P/5PP1/6K1 w - - 1 36', errorCode: 0 }, { fen: '8/1pQ3bk/p2p2p1/P2Pp2p/1P5P/2N3P1/2q2PK1/8 b - - 0 39', errorCode: 0 }, { fen: 'r1bq1rk1/pp2n1bp/2pp1np1/3PppN1/1PP1P3/2N2B2/P4PPP/R1BQR1K1 w - - 0 13', errorCode: 0 }, { fen: '1r4k1/5p2/3P2pp/p3Pp2/5q2/2Q2P1P/5P2/4R1K1 w - - 0 29', errorCode: 0 }, { fen: 'rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', errorCode: 0 }, { fen: 'R2qk2r/2p2ppp/1bnp1n2/1p2p3/3PP1b1/1BP2N2/1P3PPP/1NBQ1RK1 b k - 0 11', errorCode: 0 }, { fen: '6k1/4qp2/3p2p1/3Pp2p/7P/4Q1P1/5PBK/8 b - - 20 57', errorCode: 0 }, { fen: '3k4/r3q3/3p1p2/2pB4/P7/7P/6P1/1Q4K1 b - - 6 43', errorCode: 0 }, { fen: '5k2/1n4p1/2p2p2/p2q1B1P/P4PK1/6P1/1Q6/8 b - - 4 46', errorCode: 0 }, { fen: '6k1/pr2pb2/5pp1/1B1p4/P7/4QP2/1PP3Pq/2KR4 w - - 1 27', errorCode: 0 }, { fen: '1rbqk2r/2pp1ppp/2n2n2/1pb1p3/4P3/1BP2N2/1P1P1PPP/RNBQ1RK1 b k - 0 9', errorCode: 0 }, { fen: '6r1/2p5/pbpp1k1r/5b2/3P1N1p/1PP2N1P/P4R2/2K1R3 w - - 4 33', errorCode: 0 }, { fen: 'rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 2 2', errorCode: 0 }, { fen: 'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', errorCode: 0 }, { fen: '4b3/5p1k/r7/p3BNQp/4P1pP/1r1n4/1P3P1N/7K b - - 2 40', errorCode: 0 }, { fen: 'r2q1rk1/pb1p2pp/1p1bpnn1/5p2/2PP4/PPN1BP1P/2B1N1P1/1R1Q1R1K b - - 2 16', errorCode: 0 }, { fen: 'rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', errorCode: 0 }, { fen: '4rrk1/8/p1pR4/1p6/1PPKNq2/3P1p2/PB5n/R2Q4 b - - 6 40', errorCode: 0 }, { fen: 'r1bqk1nr/1p2bppp/p1np4/4p3/2P1P3/N1N5/PP3PPP/R1BQKB1R b KQkq - 1 8', errorCode: 0 }, { fen: 'r1bqk2r/pp2bppp/2n1p3/3n4/3P4/2NB1N2/PP3PPP/R1BQ1RK1 b kq - 3 9', errorCode: 0 }, { fen: 'r1bqkbnr/pppp2pp/2n5/1B2p3/3Pp3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 5', errorCode: 0 }, { fen: '2n1r3/p1k2pp1/B1p3b1/P7/5bP1/2N1B3/1P2KP2/2R5 b - - 4 25', errorCode: 0 }, { fen: 'r4rk1/2q3pp/4p3/p1Pn1p2/1p1P4/4PP2/1B1Q2PP/R3R1K1 w - - 0 22', errorCode: 0 }, { fen: '8/8/1p6/3b4/1P1k1p2/8/3KBP2/8 w - - 2 68', errorCode: 0 }, { fen: '2b2k2/1p5p/2p5/p1p1q3/2PbN3/1P5P/P5B1/3RR2K w - - 4 33', errorCode: 0 }, { fen: '1b6/5kp1/5p2/1b1p4/1P6/4PPq1/2Q2RNp/7K b - - 2 41', errorCode: 0 }, { fen: 'r3r1k1/p2nqpp1/bpp2n1p/3p4/B2P4/P1Q1PP2/1P2NBPP/R3K2R w KQ - 6 16', errorCode: 0 }, { fen: 'r3k2r/8/p4p2/3p2p1/4b3/2R2PP1/P6P/4R1K1 b kq - 0 27', errorCode: 0 }, { fen: 'r1rb2k1/5ppp/pqp5/3pPb2/QB1P4/2R2N2/P4PPP/2R3K1 b - - 7 23', errorCode: 0 }, { fen: '3r1r2/3P2pk/1p1R3p/1Bp2p2/6q1/4Q3/PP3P1P/7K w - - 4 30', errorCode: 0 }].forEach(function (position) {
	            test(position.fen, function () {
	                var result = Fen.validate(position.fen);
	                assert(result.errorCode === position.errorCode, 'unexpected FEN errorCode:  ' + result.errorCode);
	            });
	        });
	    });
	});

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assert = __webpack_require__(14);

	var Game = __webpack_require__(11);

	suite("Variations", function () {
	    test("#createFromParentVariation", function () {
	        var fen = '3k2r1/7P/8/8/8/8/8/3K4 w - - 0 1';
	        var game = new Game(fen);

	        game.makeMoveFromSan('Kd2');
	        game.makeMoveFromSan('Kd7');
	        game.prev();
	        game.makeMoveFromSan('Rg1');
	        game.makeMoveFromSan('h8=Q');
	    });

	    test("continuations and traversal", function () {
	        var game = new Game();

	        game.makeMoveFromSan('e4');
	        game.makeMoveFromSan('e5');
	        game.makeMoveFromSan('a4');
	        game.makeMoveFromSan('a6');
	        game.createContinuationFromSan('Ra2');
	        game.ascendFromCurrentVariation();
	        game.makeMoveFromSan('Ra2');

	        assert.equal(game.toPgn(), "1. e4 e5 2. a4 a6 (* 3. Ra2)");
	    });
	});

	suite("Move Traversal", function () {
	    test("make 4 moves, then rewind to beginning", function () {
	        var startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
	        var game = new Game(startingFen);

	        game.makeMoveFromSan('e4');
	        game.makeMoveFromSan('e5');
	        game.makeMoveFromSan('d4');
	        game.makeMoveFromSan('d5');

	        game.replayToPlyNum(0);

	        assert.equal(startingFen, game.toFen(), "board failed to rewind back to its starting position");
	    });

	    test("make 4 moves, rewind to beginning, then to end again ", function () {
	        var startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
	        var endingFen = 'rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3';

	        var game = new Game(startingFen);

	        game.makeMoveFromSan('e4');
	        game.makeMoveFromSan('e5');
	        game.makeMoveFromSan('d4');
	        game.makeMoveFromSan('d5');

	        assert.equal(endingFen, game.toFen(), "final board position was not as expected");

	        game.replayToPlyNum(0);

	        assert.equal(startingFen, game.toFen(), "board failed to rewind back to its starting position");

	        game.replayToPlyNum(4);

	        assert.equal(endingFen, game.toFen(), "board failed to advance to its ending position again");
	    });
	});

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assert = __webpack_require__(14);
	var LinkedHashMap = __webpack_require__(12);

	suite('LinkedHashMap', function () {
	    setup(function () {});

	    test('#addAll', function () {
	        var map = new LinkedHashMap();
	        map.addAll(['c', '1', 'b', '2', 'a', '3']);

	        assert(map.getKeyAtPosition(0) === 'c', "key at position did not match expected value");
	        assert(map.getKeyAtPosition(1) === 'b', "key at position did not match expected value");
	        assert(map.getKeyAtPosition(2) === 'a', "key at position did not match expected value");

	        map.remove('b');
	        assert(map.getKeyAtPosition(0) === 'c', "key at position did not match expected value");
	        assert(map.getKeyAtPosition(1) === 'a', "key at position did not match expected value");
	        assert(map.getKeyAtPosition(2) === undefined, "key at position did not match expected value");

	        assert(map.length() === 2, "map's length did not match expected value");

	        map.clear();
	        assert(map.length() === 0, "map's length did not match expected value");
	    });

	    test('#toString', function () {
	        var map = new LinkedHashMap();
	        map.addAll(['c', '1', 'b', '2', 'a', '3']);

	        assert.equal(map.toString(), '{ c: 1, b: 2, a: 3 }');
	    });
	});

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assert = __webpack_require__(14);

	var Color = __webpack_require__(3);
	var Flags = __webpack_require__(6);
	var Move = __webpack_require__(7);
	var Piece = __webpack_require__(9);
	var PieceType = __webpack_require__(8);

	suite('Move', function () {
	    test('#copyFrom', function () {
	        var move = new Move({
	            from: 1,
	            to: 2,
	            movedPiece: Piece.WHITE_PAWN,
	            capturedPiece: Piece.BLACK_QUEEN,
	            flags: Flags.NORMAL,

	            san: "axb8=Q",
	            promotionPiece: Piece.WHITE_QUEEN
	        });

	        var copy = Move.copyFrom(move);

	        assert(move.from === copy.from);
	        assert(move.to === copy.to);
	        assert(move.movedPiece === copy.movedPiece);
	        assert(move.capturedPiece === copy.capturedPiece);
	        assert(move.flags === copy.flags);
	        assert(move.san === copy.san);
	        assert(move.promotionPiece === copy.promotionPiece);
	        assert(move.isWildcard === copy.isWildcard);

	        copy.from = 3;
	        copy.to = 4;
	        copy.movedPiece = Piece.WHITE_BISHOP;
	        copy.capturedPiece = null;
	        copy.flags = Flags.CAPTURE;
	        copy.san = "Rxa7";
	        copy.promotionPiece = null;

	        assert(move.from !== copy.from);
	        assert(move.to !== copy.to);
	        assert(move.movedPiece !== copy.movedPiece);
	        assert(move.capturedPiece !== copy.capturedPiece);
	        assert(move.flags !== copy.flags);
	        assert(move.san !== copy.san);
	        assert(move.promotionPiece !== copy.promotionPiece);
	    });
	});

	// TODO more unit tests for Move class?

/***/ },
/* 24 */
/***/ function(module, exports) {

	"use strict";

	// TODO
	// const assert = require('assert');

/***/ },
/* 25 */
/***/ function(module, exports) {

	"use strict";

	// TODO
	// const assert = require('assert');

/***/ }
/******/ ]);