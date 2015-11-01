//= require jquery

'use strict';

var Chess = (function () {

    var _ = {
        BLACK: 'b',
        WHITE: 'w',

        EMPTY: -1,

        PAWN: 'p',
        KNIGHT: 'n',
        BISHOP: 'b',
        ROOK: 'r',
        QUEEN: 'q',
        KING: 'k',

        SYMBOLS: 'pnbrqkPNBRQK',

        DEFAULT_POSITION: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',

        PAWN_OFFSETS: {
            b: [16, 32, 17, 15],
            w: [-16, -32, -17, -15]
        },

        PIECE_OFFSETS: {
            n: [-18, -33, -31, -14,  18, 33, 31,  14],
            b: [-17, -15,  17,  15],
            r: [-16,   1,  16,  -1],
            q: [-17, -16, -15,   1,  17, 16, 15,  -1],
            k: [-17, -16, -15,   1,  17, 16, 15,  -1]
        },

        ATTACKS: [
            20, 0, 0, 0, 0, 0, 0,24, 0, 0, 0, 0, 0, 0,20, 0,
            0, 20, 0, 0, 0, 0, 0,24, 0, 0, 0, 0, 0,20, 0, 0,
            0,  0,20, 0, 0, 0, 0,24, 0, 0, 0, 0,20, 0, 0, 0,
            0,  0, 0,20, 0, 0, 0,24, 0, 0, 0,20, 0, 0, 0, 0,
            0,  0, 0, 0,20, 0, 0,24, 0, 0,20, 0, 0, 0, 0, 0,
            0,  0, 0, 0, 0,20, 2,24, 2,20, 0, 0, 0, 0, 0, 0,
            0,  0, 0, 0, 0, 2,53,56,53, 2, 0, 0, 0, 0, 0, 0,
            24,24,24,24,24,24,56, 0,56,24,24,24,24,24,24, 0,
            0,  0, 0, 0, 0, 2,53,56,53, 2, 0, 0, 0, 0, 0, 0,
            0,  0, 0, 0, 0,20, 2,24, 2,20, 0, 0, 0, 0, 0, 0,
            0,  0, 0, 0,20, 0, 0,24, 0, 0,20, 0, 0, 0, 0, 0,
            0,  0, 0,20, 0, 0, 0,24, 0, 0, 0,20, 0, 0, 0, 0,
            0,  0,20, 0, 0, 0, 0,24, 0, 0, 0, 0,20, 0, 0, 0,
            0, 20, 0, 0, 0, 0, 0,24, 0, 0, 0, 0, 0,20, 0, 0,
            20 ,0, 0, 0, 0, 0, 0,24, 0, 0, 0, 0, 0, 0,20, 0
        ],

        RAYS: [
            17, 0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
            0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
            0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
            0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
            0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
            0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
            0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
            1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
            0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
            0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
            0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
            0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
            0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
            0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
            -15,0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17, 0
        ],

        SHIFTS: { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 },

        FLAGS: {
            NORMAL: 'n',
            CAPTURE: 'c',
            BIG_PAWN: 'b',
            EP_CAPTURE: 'e',
            PROMOTION: 'p',
            KSIDE_CASTLE: 'k',
            QSIDE_CASTLE: 'q'
        },

        BITS: {
            NORMAL: 1,
            CAPTURE: 2,
            BIG_PAWN: 4,
            EP_CAPTURE: 8,
            PROMOTION: 16,
            KSIDE_CASTLE: 32,
            QSIDE_CASTLE: 64
        },

        RANK_1: 7,
        RANK_2: 6,
        RANK_7: 1,
        RANK_8: 0,

        SQUARES: {
            a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
            a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
            a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
            a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
            a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
            a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
            a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
            a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
        },

        SQUARES_INVERSE: {
              0:  'a8',   1: 'b8',   2: 'c8',   3: 'd8',   4: 'e8',   5: 'f8',   6: 'g8',   7: 'h8',
             16:  'a7',  17: 'b7',  18: 'c7',  19: 'd7',  20: 'e7',  21: 'f7',  22: 'g7',  23: 'h7',
             32:  'a6',  33: 'b6',  34: 'c6',  35: 'd6',  36: 'e6',  37: 'f6',  38: 'g6',  39: 'h6',
             48:  'a5',  49: 'b5',  50: 'c5',  51: 'd5',  52: 'e5',  53: 'f5',  54: 'g5',  55: 'h5',
             64:  'a4',  65: 'b4',  66: 'c4',  67: 'd4',  68: 'e4',  69: 'f4',  70: 'g4',  71: 'h4',
             80:  'a3',  81: 'b3',  82: 'c3',  83: 'd3',  84: 'e3',  85: 'f3',  86: 'g3',  87: 'h3',
             96:  'a2',  97: 'b2',  98: 'c2',  99: 'd2', 100: 'e2', 101: 'f2', 102: 'g2', 103: 'h2',
            112:  'a1', 113: 'b1', 114: 'c1', 115: 'd1', 116: 'e1', 117: 'f1', 118: 'g1', 119: 'h1',
        },

        // for converting p4wn.js' internal board representation into algebraic squares
        // http://chessprogramming.wikispaces.com/10x12+Board
        //   + 0123456789
        //   0 ##########
        //  10 ##########
        //  20 #RNBQKBNR#
        //  30 #PPPPPPPP#
        //  40 #........#
        //  50 #........#
        //  60 #........#
        //  70 #........#
        //  80 #pppppppp#
        //  90 #rnbqkbnr#
        // 100 ##########
        // 110 ##########
        EXTENDED_SQUARES_INVERSE: {
             91: 'a8', 92: 'b8', 93: 'c8', 94: 'd8', 95: 'e8', 96: 'f8', 97: 'g8', 98: 'h8',
             81: 'a7', 82: 'b7', 83: 'c7', 84: 'd7', 85: 'e7', 86: 'f7', 87: 'g7', 88: 'h7',
             71: 'a6', 72: 'b6', 73: 'c6', 74: 'd6', 75: 'e6', 76: 'f6', 77: 'g6', 78: 'h6',
             61: 'a5', 62: 'b5', 63: 'c5', 64: 'd5', 65: 'e5', 66: 'f5', 67: 'g5', 68: 'h5',
             51: 'a4', 52: 'b4', 53: 'c4', 54: 'd4', 55: 'e4', 56: 'f4', 57: 'g4', 58: 'h4',
             41: 'a3', 42: 'b3', 43: 'c3', 44: 'd3', 45: 'e3', 46: 'f3', 47: 'g3', 48: 'h3',
             31: 'a2', 32: 'b2', 33: 'c2', 34: 'd2', 35: 'e2', 36: 'f2', 37: 'g2', 38: 'h2',
             21: 'a1', 22: 'b1', 23: 'c1', 24: 'd1', 25: 'e1', 26: 'f1', 27: 'g1', 28: 'h1',
        },

        SQUARES_ARRAY: [
            'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
            'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
            'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
            'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
            'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
            'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
            'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
            'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
        ],

        ROOKS: {
            w: [{ square: 112, flag: 64 },   // SQUARES.a1, BITS.QSIDE_CASTLE
                { square: 119, flag: 32 }],  // SQUARES.h1, BITS.KSIDE_CASTLE
            b: [{ square:   0, flag: 64 },   // SQUARES.a8, BITS.QSIDE_CASTLE
                { square:   7, flag: 32 }]   // SQUARES.h8, BITS.KSIDE_CASTLE
        },

        POSSIBLE_RESULTS: ['1-0', '0-1', '1/2-1/2', '*'],

        PROMOTION_PIECES: ['q', 'r', 'b', 'n'],

        WILDCARD_MOVE: '--',  // technically, a NULL move, but I'm slightly deviating from the PGN standard (http://www.enpassant.dk/chess/palview/manual/pgn.htm),
                              // because I'm treating a NULL move as essentially a wildcard move:  "any move will do, so just pick the first legal move you find".  -Aaron 4.2.14

        WILDCARD_MOVE_OBJ: {
            is_wildcard: true
        },

        algebraic: function(i) {
            var f = _.file(i), r = _.rank(i);
            return 'abcdefgh'.substring(f,f+1) + '87654321'.substring(r,r+1);
        },
        clone: function(obj) {
            var dupe = (obj instanceof Array) ? [] : {};

            for (var property in obj) {
                if (typeof property === 'object') {
                    dupe[property] = clone(obj[property]);
                } else {
                    dupe[property] = obj[property];
                }
            }

            return dupe;
        },
        file: function(i) {
            return i & 15;
        },
        is_digit: function(c) {
            return '0123456789'.indexOf(c) !== -1;
        },
        mask: function(str) {
            return str.replace(/\\/g, '\\');
        },
        now: function() {
            return Math.floor(window.performance.now ? performance.now() : jQuery.now());
        },
        rank: function(i) {
            return i >> 4;
        },
        swap_color: function(c) {
            return c === _.WHITE ? _.BLACK : _.WHITE;
        },
        trim: function(str) {
            return str.replace(/^\s+|\s+$/g, '');
        },
        validate_fen: function(fen) {
            var errors = {
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

            /* 1st criterion: 6 space-separated fields? */
            var tokens = fen.split(/\s+/);
            if (tokens.length !== 6) {
                return {valid: false, error_number: 1, error: errors[1]};
            }

            /* 2nd criterion: move number field is a integer value > 0? */
            if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
                return {valid: false, error_number: 2, error: errors[2]};
            }

            /* 3rd criterion: half move counter is an integer >= 0? */
            if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
                return {valid: false, error_number: 3, error: errors[3]};
            }

            /* 4th criterion: 4th field is a valid e.p.-string? */
            if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
                return {valid: false, error_number: 4, error: errors[4]};
            }

            /* 5th criterion: 3th field is a valid castle-string? */
            if( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
                return {valid: false, error_number: 5, error: errors[5]};
            }

            /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
            if (!/^(w|b)$/.test(tokens[1])) {
                return {valid: false, error_number: 6, error: errors[6]};
            }

            /* 7th criterion: 1st field contains 8 rows? */
            var rows = tokens[0].split('/');
            if (rows.length !== 8) {
                return {valid: false, error_number: 7, error: errors[7]};
            }

            /* 8th criterion: every row is valid? */
            for (var i = 0; i < rows.length; i++) {
                /* check for right sum of fields AND not two numbers in succession */
                var sum_fields = 0;
                var previous_was_number = false;

                for (var k = 0; k < rows[i].length; k++) {
                    if (!isNaN(rows[i][k])) {
                        if (previous_was_number) {
                            return {valid: false, error_number: 8, error: errors[8]};
                        }
                        sum_fields += parseInt(rows[i][k], 10);
                        previous_was_number = true;
                    } else {
                        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
                            return {valid: false, error_number: 9, error: errors[9]};
                        }
                        sum_fields += 1;
                        previous_was_number = false;
                    }
                }
                if (sum_fields !== 8) {
                    return {valid: false, error_number: 10, error: errors[10]};
                }
            }

            // everything is okay!
            return {valid: true, error_number: 0, error: errors[0]};
        }
    }; // module-wide private constants and private utility functions (each one is stateless, and thus is defined here, top level)

    var Chess = (function () {
        var last_timer_snapshot = -1;
        var replay_log = [];

        function Chess(fen) {
            var game = new Game();
            this.games = [game];

            this.current_game = game
            this.current_game_num = 0;

            // if the user passes in a fen string, load it, else default to starting position
            if (typeof fen === 'undefined') {
                this.load_fen(_.DEFAULT_POSITION);
            } else {
                this.load_fen(fen);
            }
        }

        var Game = (function () {
            var LinkedHashMap = (function () {
                function LinkedHashMap() {
                    this._map = {};
                    this._keys = [];
                }
                LinkedHashMap.prototype.add_all = function(pairs) {
                    for (var i = 0; i < pairs.length; i += 2) {
                        if (typeof pairs[i] === 'string' &&
                            typeof pairs[i + 1] === 'string')
                        {
                            this.set(pairs[i], pairs[i+1]);
                        }
                    }
                }
                LinkedHashMap.prototype.clear = function() {
                    this._map = {};
                    this._keys = [];
                }
                LinkedHashMap.prototype.get = function(k) {
                    return this._map[k];
                }
                LinkedHashMap.prototype.getKeyAtPosition = function(i) {
                    return this._keys[i];
                }
                LinkedHashMap.prototype.getValueAtPosition = function(i) {
                    return this._map[ this._keys[i] ];
                }
                LinkedHashMap.prototype.length = function() {
                    return this._keys.length;
                }
                LinkedHashMap.prototype.remove = function(k) {
                    if (k in this._map) {
                        var i = jQuery.inArray(k, this._keys);
                        this._keys.splice(i,1);
                        delete this._map[k];
                    }
                }
                LinkedHashMap.prototype.set = function(k, v) {
                    if (! (k in this._map)) {
                        this._keys.push(k);
                    }
                    this._map[k] = v;
                }

                return LinkedHashMap;
            }());  // a lightweight map class that preserves key insertion order;  needed for parsing and reconstructing PGN headers

            function Game() {
                this.header = new LinkedHashMap();                                  // a chess's PGN header applies to all of its variations
                this.current_variation = new BoardVariation(null, 0, false, true);  // our board state information will always reside within the context of a given line of play, i.e. variation
                this.board_variations = [this.current_variation];                   // to store any continuations/variations
            }

            Game.prototype.parse_pgn = function(pgn_header_text, pgn_game_text, is_puzzle_solution) {
                function start_var(game, is_continuation) {
                    var parent_last_move_index = game.current_variation.moves.length-1;

                    var inner_variation = new BoardVariation(game.current_variation, parent_last_move_index, is_continuation, false);
                    game.board_variations.push(inner_variation);

                    // take the variation we just started, and append it to the list of child variations that start from its "parent" move.
                    game.current_variation.moves[parent_last_move_index].child_variations.push(inner_variation);

                    game.current_variation = inner_variation;
                }

                function close_var(game) {
                    game.current_variation = game.current_variation.parent;
                }

                var game = new Game();

                // parse pgn's header text
                var key, value, headers = pgn_header_text.split(new RegExp(_.mask('\n')));
                for (var i = 0; i < headers.length; i++) {
                    key   = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
                    value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\]$/,    '$1');
                    if (_.trim(key).length > 0) {
                        game.header.set(key, value);
                    }
                }

                // if the user passes in a fen string, load it, else default to starting position
                var fen = game.header.get('FEN');
                if (typeof fen === 'undefined') {
                    game.current_variation.load_fen(_.DEFAULT_POSITION);
                } else {
                    game.current_variation.load_fen(fen);

                }

                // parse pgn's chess text
                var start, end, move, ss_rep, comment, ss = pgn_game_text;

                //// convert empty variations into comments
                // while ((ss_rep = ss.replace(/\((([\?!+#\s]|\$\d+|{[^}]*})*)\)/g, ' $1 ')) !== ss) { ss = ss_rep; }
                // ss = ss.replace(/^\s/, '');
                // ss = ss.replace(/\s$/, '');

                for (start=0; start<ss.length; start++) {
                    switch (ss.charAt(start)) {
                        case ' ':
                        case '\b':
                        case '\f':
                        case '\n':
                        case '\r':
                        case '\t':
                            break;

                        case '{':
                            // TODO(aaron) am crudely parsing comments for now;  need to address leading vs trailing comments --
                            // to which move object do I associate them?
                            // also, need pgn() method to output comments.  Need to properly character escape said comment here, and also on output.
                            end = start+1;
                            while(ss.charAt(end) != '}') {
                                end++;
                            }
                            comment = ss.substring(start+1,end);  // TODO need to properly sanitize this input.
                            start = end;
                            break;
                        case '(':
                            var is_continuation = false;
                            if (ss.charAt(start+1) == '*') {
                                is_continuation = true;
                                start++;
                            }
                            start_var(game, is_continuation);
                            break;

                        case ')':
                            close_var(game);
                            break;

                        case '$':
                            // TODO(aaron): parse and persist NAGs;  currently, ignoring them for now.  http://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs
                            while(ss.charAt(start) != ' ') {
                                start++;
                            }
                            break;

                        // dont add "break;"
                        default:
                            for (var i=0; i<_.POSSIBLE_RESULTS.length; i++) {
                                if (ss.indexOf(_.POSSIBLE_RESULTS[i],start)==start) {
                                    if (game.current_variation === game.board_variations[0]) {
                                        end = ss.length;
                                    } else {
                                        end = start + _.POSSIBLE_RESULTS[i].length;
                                    }
                                    start = end;
                                    break;
                                }
                            }
                            if (start == ss.length) { break; }

                            var needle = game.current_variation.move_number.toString();

                            if (ss.indexOf(needle,start) == start) {
                                start += needle.length;
                                while (' .\n\r'.indexOf(ss.charAt(start)) != -1) { start++; }
                            }

                            if (ss.substr(start, 2) == _.WILDCARD_MOVE) {
                                game.current_variation.make_move(_.WILDCARD_MOVE_OBJ, comment, null, is_puzzle_solution);
                                end = start + 2;
                            } else if (ss.substr(start, 8) == "&lt;&gt;") {
                                game.current_variation.make_move(_.WILDCARD_MOVE_OBJ, comment, null, is_puzzle_solution);
                                end = start + 8;
                            } else {
                                if ((end = start + ss.substr(start).search(/[\s${;!?()]/)) < start) { end = ss.length; }

                                move = ss.substring(start,end);

                                var move_obj = game.current_variation.get_move_obj(move);

                                if (!move_obj) {  // malformed or impossible move
                                    return null;
                                }

                                var pretty_move = game.current_variation.make_pretty(move_obj);
                                move_obj.move_text = pretty_move.san;
                                game.current_variation.make_move(move_obj, comment, null, is_puzzle_solution);
                            }

                            comment = null;

                            if (ss.charAt(end) == ' ') { start = end; }
                            else { start = end - 1; }

                            break;
                    }
                }

                if (game.current_variation !== game.board_variations[0]) {
                    console.log("error: parse_pgn ended with one or more dangling variations that weren't closed off.");
                    while (game.current_variation !== game.board_variations[0]) { close_var(game); }
                }

                return game;
            };  // behold, an actual PGN parser and lexer, with full support for variations.

            return Game;
        }());

        var BoardVariation = (function () {
            var id = 0;

            function BoardVariation(parent_board_variation, parent_last_move_index, is_continuation, reset_id_counter) {
                if (reset_id_counter) {
                    id = 0;
                }

                this.id = id++;
                this.parent = parent_board_variation;
                this.parent_last_move_index = parent_last_move_index;
                this.is_continuation = is_continuation;

                if (parent_board_variation === null) {
                    this.board = new Array(128);
                    this.castling = {w: 0, b: 0};
                    this.ep_square = _.EMPTY;
                    this.kings = {w: _.EMPTY, b: _.EMPTY};
                    this.turn = _.WHITE;

                    this.half_moves = 0;   // half_moves != ply count, but the half_move_counter since last capture or pawn advancement
                    this.move_number = 1;  // logical move number;  needs to be continued from the parent BoardVariation
                    this.ply_count = 1;    // physical move number;  needs to be continued from the parent BoardVariation
                } else {  // needs to be continued from the parent's BoardVariation
                    var temp = jQuery.extend(true, {}, parent_board_variation);  // attempting to use this module's built-in clone(...) method fails here;  results in omission of one move history.

                    if (!is_continuation) {  // if this is a PGN variations, the undo previous move, by definition
                        temp.undo_move();
                    }

                    this.board = _.clone(temp.board);
                    this.castling = _.clone(temp.castling);
                    this.ep_square = temp.ep_square;
                    this.kings = _.clone(temp.kings);
                    this.turn = temp.turn;

                    this.half_moves = temp.half_moves;
                    this.move_number = temp.move_number;
                    this.ply_count = temp.ply_count;
                }
                this.moves = [];
                this.selected_move_index = -1;
            }

            BoardVariation.prototype.apply_move = function (move) {
                var us = this.turn;
                var them = _.swap_color(us);

                this.board[move.to] = this.board[move.from];
                this.board[move.from] = null;

                // if ep capture, remove the captured pawn
                if (move.flags & _.BITS.EP_CAPTURE) {
                    if (this.turn === _.BLACK) {
                        this.board[move.to - 16] = null;
                    } else {
                        this.board[move.to + 16] = null;
                    }
                }

                // if pawn promotion, replace with new piece
                if (move.flags & _.BITS.PROMOTION) {
                    this.board[move.to] = {type: move.promotion, color: us};
                }

                // if we moved the king
                if (this.board[move.to].type === _.KING) {
                    this.kings[this.board[move.to].color] = move.to;
                    // if we castled, move the rook next to the king
                    if (move.flags & _.BITS.KSIDE_CASTLE) {
                        var castling_to = move.to - 1;
                        var castling_from = move.to + 1;
                        this.board[castling_to] = this.board[castling_from];
                        this.board[castling_from] = null;
                    } else if (move.flags & _.BITS.QSIDE_CASTLE) {
                        var castling_to = move.to + 1;
                        var castling_from = move.to - 2;
                        this.board[castling_to] = this.board[castling_from];
                        this.board[castling_from] = null;
                    }
                    // turn off castling
                    this.castling[us] = '';
                }

                // turn off castling if we move a rook
                if (this.castling[us]) {
                    for (var i = 0, len = _.ROOKS[us].length; i < len; i++) {
                        if (move.from === _.ROOKS[us][i].square &&
                            this.castling[us] & _.ROOKS[us][i].flag) {
                            this.castling[us] ^= _.ROOKS[us][i].flag;
                            break;
                        }
                    }
                }

                // turn off castling if we capture a rook
                if (this.castling[them]) {
                    for (var i = 0, len = _.ROOKS[them].length; i < len; i++) {
                        if (move.to === _.ROOKS[them][i].square &&
                            this.castling[them] & _.ROOKS[them][i].flag) {
                            this.castling[them] ^= _.ROOKS[them][i].flag;
                            break;
                        }
                    }
                }

                // if big pawn move, update the en passant square
                if (move.flags & _.BITS.BIG_PAWN) {
                    if (this.turn === 'b') {
                        this.ep_square = move.to - 16;
                    } else {
                        this.ep_square = move.to + 16;
                    }
                } else {
                    this.ep_square = _.EMPTY;
                }

                // reset the 100 half-move counter if a pawn is moved or a piece is captured
                if (move.piece === _.PAWN) {
                    this.half_moves = 0;
                } else if (move.flags & (_.BITS.CAPTURE | _.BITS.EP_CAPTURE)) {
                    this.half_moves = 0;
                } else {
                    this.half_moves++;
                }
                if (this.turn === _.BLACK) {
                    this.move_number++;
                }
                this.turn = _.swap_color(this.turn);
            };
            BoardVariation.prototype.apply_undo_move = function (old) {
                var move = old.move;

                // NOTE(aaron,5.3.14) don't settle for "this.castling = old.castling" or
                // "this.kings = old.kings"... doing so doesn't copy the object, causing nasty
                // logic bugs and state corruption in some edge cases
                this.castling = { w: old.castling.w, b: old.castling.b };
                this.ep_square = old.ep_square;
                this.half_moves = old.half_moves;
                this.kings = { w: old.kings.w, b: old.kings.b };
                this.move_number = old.move_number;
                this.ply_number = old.ply_number;
                this.time_taken_to_move = old.time_taken_to_move;
                this.turn = old.turn;

                var us = this.turn;
                var them = _.swap_color(this.turn);

                this.board[move.from] = this.board[move.to];
                this.board[move.from].type = move.piece;  // to undo any promotions
                this.board[move.to] = null;

                if (move.flags & _.BITS.CAPTURE) {
                    this.board[move.to] = {type: move.captured, color: them};
                } else if (move.flags & _.BITS.EP_CAPTURE) {
                    var index;
                    if (us === _.BLACK) {
                        index = move.to - 16;
                    } else {
                        index = move.to + 16;
                    }
                    this.board[index] = {type: _.PAWN, color: them};
                }

                if (move.flags & (_.BITS.KSIDE_CASTLE | _.BITS.QSIDE_CASTLE)) {
                    var castling_to, castling_from;
                    if (move.flags & _.BITS.KSIDE_CASTLE) {
                        castling_to = move.to + 1;
                        castling_from = move.to - 1;
                    } else if (move.flags & _.BITS.QSIDE_CASTLE) {
                        castling_to = move.to - 2;
                        castling_from = move.to + 1;
                    }
                    this.board[castling_to] = this.board[castling_from];
                    this.board[castling_from] = null;
                }
                return move;
            };

            BoardVariation.prototype.ascii = function() {
                var s = '  +------------------------+\n';
                for (var i = _.SQUARES.a8; i <= _.SQUARES.h1; i++) {
                    // display the rank
                    if (_.file(i) === 0) {
                        s += ' ' + '87654321'[_.rank(i)] + ' |';
                    }

                    // empty piece
                    if (this.board[i] == null) {
                        s += ' . ';
                    } else {
                        var piece = this.board[i].type;
                        var color = this.board[i].color;
                        var symbol = (color === _.WHITE) ?
                            piece.toUpperCase() : piece.toLowerCase();
                        s += ' ' + symbol + ' ';
                    }

                    if ((i + 1) & 0x88) {
                        s += '|\n';
                        i += 8;
                    }
                }
                s += '   +------------------------+\n';
                s += '     a  b  c  d  e  f  g  h\n';

                return s;
            };
            BoardVariation.prototype.build_move = function(from, to, flags, promotion) {
                var move = {
                    color: this.turn,
                    from: from,
                    to: to,
                    flags: flags,
                    piece: this.board[from].type
                };

                if (promotion) {
                    move.flags |= _.BITS.PROMOTION;
                    move.promotion = promotion;
                }

                if (this.board[to]) {
                    move.captured = this.board[to].type;
                } else if (flags & _.BITS.EP_CAPTURE) {
                    move.captured = _.PAWN;
                }

                return move;
            }
            BoardVariation.prototype.fen = function() {
                var empty = 0;
                var fen = '';

                for (var i = _.SQUARES.a8; i <= _.SQUARES.h1; i++) {
                    if (this.board[i] == null) {
                        empty++;
                    } else {
                        if (empty > 0) {
                            fen += empty;
                            empty = 0;
                        }
                        var color = this.board[i].color;
                        var piece = this.board[i].type;

                        fen += (color === _.WHITE) ?
                            piece.toUpperCase() : piece.toLowerCase();
                    }

                    if ((i + 1) & 0x88) {
                        if (empty > 0) {
                            fen += empty;
                        }

                        if (i !== _.SQUARES.h1) {
                            fen += '/';
                        }

                        empty = 0;
                        i += 8;
                    }
                }

                var cflags = '';
                if (this.castling[_.WHITE] & _.BITS.KSIDE_CASTLE) { cflags += 'K'; }
                if (this.castling[_.WHITE] & _.BITS.QSIDE_CASTLE) { cflags += 'Q'; }
                if (this.castling[_.BLACK] & _.BITS.KSIDE_CASTLE) { cflags += 'k'; }
                if (this.castling[_.BLACK] & _.BITS.QSIDE_CASTLE) { cflags += 'q'; }

                /* do we have an empty castling flag? */
                cflags = cflags || '-';
                var epflags = (this.ep_square === _.EMPTY) ? '-' : _.algebraic(this.ep_square);

                return [fen, this.turn, cflags, epflags, this.half_moves, this.move_number].join(' ');
            };
            BoardVariation.prototype.generate_moves = function(options) {
                var moves = [];

                var add_move = function(from, to, flags) {
                    // if pawn promotion
                    if (this.board[from].type === _.PAWN &&
                        (_.rank(to) === _.RANK_8 || _.rank(to) === _.RANK_1)) {
                        for (var i = 0, len = _.PROMOTION_PIECES.length; i < len; i++) {
                            moves.push( this.build_move(from, to, flags, _.PROMOTION_PIECES[i]) );
                        }
                    } else {
                        moves.push( this.build_move(from, to, flags) );
                    }
                }

                var us = this.turn;
                var them = _.swap_color(this.turn);
                var second_rank = {b: _.RANK_7, w: _.RANK_2};

                var first_sq = _.SQUARES.a8;
                var last_sq = _.SQUARES.h1;
                var single_square = false;

                // do we want legal moves?
                var legal = (typeof options !== 'undefined' && 'legal' in options) ?
                    options.legal : true;

                // are we generating moves for a single square?
                if (typeof options !== 'undefined' && 'square' in options) {
                    if (options.square in _.SQUARES) {
                        first_sq = last_sq = _.SQUARES[options.square];
                        single_square = true;
                    } else {
                        return [];  // invalid square
                    }
                }

                for (i = first_sq; i <= last_sq; i++) {
                    if (i & 0x88) { i += 7; continue; }  // did we run off the end of the board?

                    var piece = this.board[i];
                    if (piece == null || piece.color !== us) {
                        continue;
                    }

                    if (piece.type === _.PAWN) {
                        // single square, non-capturing
                        var square = i + _.PAWN_OFFSETS[us][0];
                        if (this.board[square] == null) {
                            add_move.call(this, i, square, _.BITS.NORMAL);

                            // double square
                            square = i + _.PAWN_OFFSETS[us][1];
                            if (second_rank[us] === _.rank(i) && this.board[square] == null) {
                                add_move.call(this, i, square, _.BITS.BIG_PAWN);
                            }
                        }

                        // pawn captures
                        for (j = 2; j < 4; j++) {
                            square = i + _.PAWN_OFFSETS[us][j];
                            if (square & 0x88) continue;

                            if (this.board[square] != null &&
                                this.board[square].color === them) {
                                add_move.call(this, i, square, _.BITS.CAPTURE);
                            } else if (square === this.ep_square) {
                                add_move.call(this, i, this.ep_square, _.BITS.EP_CAPTURE);
                            }
                        }
                    } else {
                        for (var j = 0, len = _.PIECE_OFFSETS[piece.type].length; j < len; j++) {
                            var offset = _.PIECE_OFFSETS[piece.type][j];
                            square = i;

                            while (true) {
                                square += offset;
                                if (square & 0x88) break;

                                if (this.board[square] == null) {
                                    add_move.call(this, i, square, _.BITS.NORMAL);
                                } else {
                                    if (this.board[square].color === us) break;
                                    add_move.call(this, i, square, _.BITS.CAPTURE);
                                    break;
                                }

                                // break, if knight or king
                                if (piece.type === 'n' || piece.type === 'k') {
                                    break;
                                }
                            }
                        }
                    }
                }

                // check for castling if: a) we're generating all moves, or b) we're doing single square move generation on the king's square
                if ((!single_square) || last_sq === this.kings[us]) {
                    // king-side castling
                    if (this.castling[us] & _.BITS.KSIDE_CASTLE) {
                        var castling_from = this.kings[us];
                        var castling_to = castling_from + 2;

                        if (this.board[castling_from + 1] == null &&
                            this.board[castling_to]       == null &&
                            !this.is_attacked(them, this.kings[us]) &&
                            !this.is_attacked(them, castling_from + 1) &&
                            !this.is_attacked(them, castling_to)) {
                            add_move.call(this, this.kings[us] , castling_to, _.BITS.KSIDE_CASTLE);
                        }
                    }

                    // queen-side castling
                    if (this.castling[us] & _.BITS.QSIDE_CASTLE) {
                        var castling_from = this.kings[us];
                        var castling_to = castling_from - 2;

                        if (this.board[castling_from - 1] == null &&
                            this.board[castling_from - 2] == null &&
                            this.board[castling_from - 3] == null &&
                            !this.is_attacked(them, this.kings[us]) &&
                            !this.is_attacked(them, castling_from - 1) &&
                            !this.is_attacked(them, castling_to)) {
                            add_move.call(this, this.kings[us], castling_to, _.BITS.QSIDE_CASTLE);
                        }
                    }
                }

                // return all pseudo-legal moves (this includes moves that allow the king to be captured)
                if (!legal) {
                    return moves;
                }

                // filter out illegal moves
                var legal_moves = [];
                if (moves.length > 0) {
                    // make_move() below is destructive to all future moves ahead of our current move pointer, so we save a copy here
                    var future_moves = this.moves.slice(this.selected_move_index+1);

                    for (var i = 0, len = moves.length; i < len; i++) {
                        this.make_move(moves[i]);
                        if (!this.is_king_attacked(us)) {
                            legal_moves.push(moves[i]);
                        }
                        this.undo_move();
                    }

                    // restore our previously saved future moves
                    this.moves = this.moves.concat(future_moves);
                }

                return legal_moves;
            }
            BoardVariation.prototype.get = function(square) {
                var piece = this.board[_.SQUARES[square]];
                return (piece) ? {type: piece.type, color: piece.color} : null;
            }
            BoardVariation.prototype.get_disambiguator = function(move) {
                var moves = this.generate_moves();

                var from = move.from;
                var to = move.to;
                var piece = move.piece;

                var ambiguities = 0;
                var same_rank = 0;
                var same_file = 0;

                for (var i = 0, len = moves.length; i < len; i++) {
                    var ambig_from = moves[i].from;
                    var ambig_to = moves[i].to;
                    var ambig_piece = moves[i].piece;

                    // if a move of the same piece type ends on the same to square, we'll
                    // need to add a disambiguator to the algebraic notation
                    if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
                        ambiguities++;

                        if (_.rank(from) === _.rank(ambig_from)) {
                            same_rank++;
                        }

                        if (_.file(from) === _.file(ambig_from)) {
                            same_file++;
                        }
                    }
                }

                if (ambiguities > 0) {
                    // if there exists a similar moving piece on the same rank and file as
                    // the move in question, use the square as the disambiguator
                    if (same_rank > 0 && same_file > 0) {
                        return _.algebraic(from);
                    }
                    // if the moving piece rests on the same file, use the rank symbol as the
                    // disambiguator
                    else if (same_file > 0) {
                        return _.algebraic(from).charAt(1);
                    }
                    // else use the file symbol
                    else {
                        return _.algebraic(from).charAt(0);
                    }
                }

                return '';
            }  // this function is used to uniquely identify ambiguous moves
            BoardVariation.prototype.get_move_obj = function(move) {
                return this.move_from_san(_.trim(move));
            }
            BoardVariation.prototype.in_check = function() {
                return this.is_king_attacked(this.turn);
            }
            BoardVariation.prototype.in_checkmate = function() {
                return this.in_check() && this.generate_moves().length === 0;
            }
            BoardVariation.prototype.in_stalemate = function() {
                return !this.in_check() && this.generate_moves().length === 0;
            }
            BoardVariation.prototype.in_threefold_repetition = function() {
                // NOTE: while this function is fine for casual use, a better implementation would use a Zobrist key
                // (instead of FEN).  The Zobrist key would be maintained in the make_move/undo_move functions,
                // avoiding the costly operations that we do below.
                var moves = [];
                var positions = {};
                var repetition = false;

                var future_moves = this.moves.slice(this.selected_move_index+1);

                while (true) {
                    var move = this.undo_move2();  // TODO(aaron,4/9) previously was .undo_move()
                    if (!move) break;
                    moves.push(move);
                }

                while (true) {
                    // remove the last two fields in the FEN string, they're not needed when checking for draw by rep
                    var fen = this.fen().split(' ').slice(0,4).join(' ');

                    // has the position occurred three or move times
                    positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
                    if (positions[fen] >= 3) {
                        repetition = true;
                    }

                    if (!moves.length) {
                        break;
                    }

                    this.selected_move_index++;
                    var nextmove = moves.pop();

                    this.moves.push(nextmove);
                    this.apply_move(nextmove.move);

                    // this.make_move(moves.pop());  // TODO(aaron,4/9) at least one bug here;  make_move(...) is now (move, comment, time_taken_to_move, is_puzzle_solution)
                }

                if (this.selected_move_index >= 0) {
                    this.moves = this.moves.concat(future_moves);
                }

                return repetition;
            }
            BoardVariation.prototype.is_attacked = function(color, square) {
                for (var i = _.SQUARES.a8; i <= _.SQUARES.h1; i++) {
                    // did we run off the end of the board
                    if (i & 0x88) { i += 7; continue; }

                    // if empty square or wrong color
                    if (this.board[i] == null || this.board[i].color !== color) continue;

                    var piece = this.board[i];
                    var difference = i - square;
                    var index = difference + 119;

                    if (_.ATTACKS[index] & (1 << _.SHIFTS[piece.type])) {
                        if (piece.type === _.PAWN) {
                            if (difference > 0) {
                                if (piece.color === _.WHITE) return true;
                            } else {
                                if (piece.color === _.BLACK) return true;
                            }
                            continue;
                        }

                        // if the piece is a knight or a king
                        if (piece.type === 'n' || piece.type === 'k') return true;

                        var offset = _.RAYS[index];
                        var j = i + offset;

                        var blocked = false;
                        while (j !== square) {
                            if (this.board[j] != null) { blocked = true; break; }
                            j += offset;
                        }

                        if (!blocked) return true;
                    }
                }

                return false;
            }
            BoardVariation.prototype.is_king_attacked = function(color) {
                return this.is_attacked(_.swap_color(color), this.kings[color]);
            }
            BoardVariation.prototype.insufficient_material = function() {
                var pieces = {};
                var bishops = [];
                var num_pieces = 0;
                var sq_color = 0;

                for (var i = _.SQUARES.a8; i<= _.SQUARES.h1; i++) {
                    sq_color = (sq_color + 1) % 2;
                    if (i & 0x88) { i += 7; continue; }

                    var piece = this.board[i];
                    if (piece) {
                        pieces[piece.type] = (piece.type in pieces) ?
                            pieces[piece.type] + 1 : 1;
                        if (piece.type === _.BISHOP) {
                            bishops.push(sq_color);
                        }
                        num_pieces++;
                    }
                }

                // k vs. k
                if (num_pieces === 2) { return true; }

                // k vs. kn .... or .... k vs. kb
                else if (num_pieces === 3 && (pieces[_.BISHOP] === 1 ||
                    pieces[_.KNIGHT] === 1)) { return true; }

                // kb vs. kb where any number of bishops are all on the same color
                else if (num_pieces === pieces[_.BISHOP] + 2) {
                    var sum = 0;
                    var len = bishops.length;
                    for (var i = 0; i < len; i++) {
                        sum += bishops[i];
                    }
                    if (sum === 0 || sum === len) { return true; }
                }

                return false;
            }
            BoardVariation.prototype.load_fen = function(fen) {
                if (!_.validate_fen(fen).valid) {
                    return false;
                }

                var tokens = fen.split(/\s+/);
                var position = tokens[0];
                var square = 0;

                for (var i = 0; i < position.length; i++) {
                    var piece = position.charAt(i);

                    if (piece === '/') {
                        square += 8;
                    } else if ('0123456789'.indexOf(piece) !== -1) {  // if is digit...
                        square += parseInt(piece, 10);
                    } else {
                        var color = (piece < 'a') ? _.WHITE : _.BLACK;
                        this.put({type: piece.toLowerCase(), color: color}, _.algebraic(square));
                        square++;
                    }
                }

                this.turn = tokens[1];

                if (tokens[2].indexOf('K') > -1) {
                    this.castling.w |= _.BITS.KSIDE_CASTLE;
                }
                if (tokens[2].indexOf('Q') > -1) {
                    this.castling.w |= _.BITS.QSIDE_CASTLE;
                }
                if (tokens[2].indexOf('k') > -1) {
                    this.castling.b |= _.BITS.KSIDE_CASTLE;
                }
                if (tokens[2].indexOf('q') > -1) {
                    this.castling.b |= _.BITS.QSIDE_CASTLE;
                }

                this.ep_square = (tokens[3] === '-') ? _.EMPTY : _.SQUARES[tokens[3]];
                this.half_moves = parseInt(tokens[4], 10);
                this.move_number = parseInt(tokens[5], 10);
            };
            BoardVariation.prototype.make_move = function(move, comment, time_taken_to_move, is_puzzle_solution) {
                // TODO(Aaron, 4/3) need to hide time_taken_to_move parameter;  should not be exposed to caller;
                // instead perform internal calculation here;  replace time_taken with boolean flag, ... ???

                // if this is our first time seeing an unprocessed wildcard move, then "process" it by assigning it to the first legal move we can find
                if (move.is_wildcard && typeof move.move_text === 'undefined') {
                    var moves = this.generate_moves();
                    move = moves[0];
                    move.is_wildcard = true;
                }

                // TODO(aaron,4/7) add logic for updating the time_take_to_move of an existing move....
                // if it's an is_puzzle_solution == true move, and no previous timing value exists.... ???

                this.selected_move_index++;
                this.moves.splice(this.selected_move_index, 0, {  // insert our new move into moves[] after the current selected_move_index;  There's offset-by-one logic here.
                    castling: { b: this.castling.b, w: this.castling.w },
                    child_variations: [],
                    comment: comment,
                    ep_square: this.ep_square,
                    half_moves: this.half_moves,
                    is_puzzle_solution: is_puzzle_solution,
                    kings: { b: this.kings.b, w: this.kings.w },
                    move: move,
                    move_number: this.move_number,
                    ply_count: this.ply_count + this.selected_move_index,
                    time_taken_to_move: time_taken_to_move,
                    turn: this.turn,
                });

                // generate an ID for this move, one that is unique across the entire game tree.
                // format:  (({parent_variation's id}-)*)-{half_move_number}
                //
                // e.g.:  1. e4 {1} e5 {2} 2. d4 {3} d5 {4} (2... d6 {1-4} 3. c4 {1-5} (3. c3 {1-2-5}))
                //
                // TODO(aaron,4/2) I probably want to change this ID scheme from variation_ids to variation_index offset from child_variations;
                // will make tree traversal significantly easier.  although... what about when a variation is deleted?  hmmm....
                var move_id = '0-';
                var current = this;
                while (current.parent) {
                    move_id += current.id + '-';
                    current = current.parent;
                }
                move_id += this.ply_count + this.selected_move_index;

                this.moves[this.selected_move_index].move_id = move_id;

                this.apply_move(move);
            }
            BoardVariation.prototype.make_pretty = function(ugly_move) {
                var move = _.clone(ugly_move);

                if (move.is_wildcard) {
                    return move;
                }

                move.san = this.move_to_san(move);
                move.to = _.algebraic(move.to);
                move.from = _.algebraic(move.from);

                var flags = '';

                for (var flag in _.BITS) {
                    if (_.BITS[flag] & move.flags) {
                        flags += _.FLAGS[flag];
                    }
                }
                move.flags = flags;

                return move;
            } // pretty = external move object;
            BoardVariation.prototype.move_from_san = function(move) {
                if (!move) {
                    return null;
                }

                move = move.replace(/[+#?!=]+$/,'');
                var moves = this.generate_moves();
                for (var i = 0, len = moves.length; i < len; i++) {
                    // strip off any trailing move decorations: e.g Nf3+?!
                    if (move == this.move_to_san(moves[i]).replace(/[+#?!=]+$/,'')) {
                        return moves[i];
                    }
                }

                return null;
            }  // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
            BoardVariation.prototype.move_to_san = function(move) {
                    if (move === _.WILDCARD_MOVE) {
                        return move;
                    }

                    var output = '';

                    if (move.flags & _.BITS.KSIDE_CASTLE) {
                        output = 'O-O';
                    } else if (move.flags & _.BITS.QSIDE_CASTLE) {
                        output = 'O-O-O';
                    } else {
                        var disambiguator = this.get_disambiguator(move);

                        if (move.piece !== _.PAWN) {
                            output += move.piece.toUpperCase() + disambiguator;
                        }

                        if (move.flags & (_.BITS.CAPTURE | _.BITS.EP_CAPTURE)) {
                            if (move.piece === _.PAWN) {
                                output += _.algebraic(move.from)[0];
                            }
                            output += 'x';
                        }

                        output += _.algebraic(move.to);

                        if (move.flags & _.BITS.PROMOTION) {
                            output += '=' + move.promotion.toUpperCase();
                        }
                    }

                    var future_moves = this.moves.slice(this.selected_move_index+1);

                    this.make_move(move);
                    if (this.in_check()) {
                        if (this.in_checkmate()) {
                            output += '#';
                        } else {
                            output += '+';
                        }
                    }
                    this.undo_move();

                    this.moves = this.moves.concat(future_moves);

                    return output;
                }  // convert a move from 0x88 coordinates to Standard Algebraic Notation (SAN)
            BoardVariation.prototype.put = function(piece, square) {
                // check for valid piece object
                if (!('type' in piece && 'color' in piece)) {
                    return false;
                }

                // check for piece
                if (_.SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
                    return false;
                }

                // check for valid square
                if (!(square in _.SQUARES)) {
                    return false;
                }

                var sq = _.SQUARES[square];

                // don't let the user place more than one king
                if (piece.type == _.KING &&
                    !(this.kings[piece.color] == _.EMPTY || this.kings[piece.color] == sq)) {
                    return false;
                }

                this.board[sq] = {type: piece.type, color: piece.color};
                if (piece.type === _.KING) {
                    this.kings[piece.color] = sq;
                }

                return true;
            }
            BoardVariation.prototype.replay_to_move_num = function(n) {
                if (n > this.selected_move_index) {
                    this.selected_move_index++;
                    for (; this.selected_move_index <= n; this.selected_move_index++) {
                        var move = this.moves[this.selected_move_index].move;
                        this.apply_move(move);
                    }
                    this.selected_move_index--;
                } else if (n < this.selected_move_index) {
                    for (; n < this.selected_move_index; this.selected_move_index--) {
                        var move = this.moves[this.selected_move_index];
                        this.apply_undo_move(move);
                    }
                }

                return this.selected_move_index > -1 && this.selected_move_index < this.moves.length ? this.moves[this.selected_move_index] : null;
            };
            BoardVariation.prototype.remove = function(square) {
                var piece = this.get(square);
                this.board[_.SQUARES[square]] = null;
                if (piece && piece.type === _.KING) {
                    this.kings[piece.color] = _.EMPTY;
                }

                return piece;
            }
            BoardVariation.prototype.undo_move = function() {
                if (this.selected_move_index < 0) {
                    return false;
                }

                var old = this.moves[this.selected_move_index];
                this.moves.length = this.selected_move_index;
                this.selected_move_index--;

                return this.apply_undo_move(old);
            };
            BoardVariation.prototype.undo_move2 = function() {
                if (this.selected_move_index < 0) {
                    return false;
                }

                var old = this.moves[this.selected_move_index];
                this.moves.length = this.selected_move_index;
                this.selected_move_index--;

                return this.apply_undo_move(old) ? old : false;
            };   // TODO(aaron,4/9) terrible, terrible hack.  Need to clean up and reconcile with .undo_move();  Done because in_threefold_repetition() was operating on <move> subobject and not larger <moves[i]> object;  move metadata like child_variations was getting purged and reset
            return BoardVariation;
        }());

        // private helper methods
        var clear = function() {
            var game = new Game();
            this.games[this.current_game_num] = game;
            this.current_game = game;

            update_setup.call(this);
        }
        var load_fen = function(fen, shouldClear) {
            if (!_.validate_fen(fen).valid) {
                return false;
            }

            if (shouldClear) {
                clear.call(this);
            }

            this.current_game.current_variation.load_fen(fen);

            update_setup.call(this);

            return true;
        }
        var next = function(should_log) {
            if (should_log) {
                replay_log.push(_.now() + ': next()');
            }

            return select_move.call(this, this.current_game.current_variation.selected_move_index + 1, false);
        }
        var prev = function(should_log) {
            if (should_log) {
                replay_log.push(_.now() + ': prev()');
            }

            if (this.current_game.current_variation.selected_move_index == 0 && this.current_game.current_variation.parent) {
                if (this.ascend_from_current_continuation()) {
                    return true; // select_move.call(this, this.current_game.current_variation.selected_move_index - 1, false); // true; // prev.call(this, false);
                } else {
                    return false;
                }
            } else {
                return select_move.call(this, this.current_game.current_variation.selected_move_index - 1, false);
            }
        }
        var put = function(piece, square) {
            var success = this.current_game.current_variation.put(piece, square);
            if (success) {
                update_setup.call(this);
            }

            return success;
        }
        var select_move = function(i, should_log) {
            if (should_log) {
                replay_log.push(_.now() + ': select_move(' + i + ')');
            }

            // TODO(aaron) what should the sematnics of hti s API be?  Currently I am accepting physical move number only,
            // limited to the context of moves[] within the current variation.  Instead, should I accept logical move number,
            // with regard to the effective logical history of all moves[] (see history() output) from current_variation
            // all the way up to root origin's first move?  If so, this here method's array boundary logic check will have to
            // change;  as well as the replay apply_move() travseral logic
            if (this.current_game.current_variation.selected_move_index == i) {
                return true;  // already on requested move;  nothing to do.
            }

            if (i < -1 || i > this.current_game.current_variation.moves.length-1) {
                return false;
            }

            return this.current_game.current_variation.replay_to_move_num(i);
        }
        var update_setup = function() {
            if (this.current_game.current_variation.moves.length > 0) return;

            var fen = this.current_game.current_variation.fen();

            if (fen !== _.DEFAULT_POSITION) {
                this.current_game.header.set('SetUp', '1');
                this.current_game.header.set('FEN', fen);
            } else {
                this.current_game.header.remove('SetUp');
                this.current_game.header.remove('FEN');
            }
        }
        var update_move_timer = function() {
            var prev = last_timer_snapshot;
            last_timer_snapshot = _.now();
            return last_timer_snapshot - prev;
        }

        //
        // PUBLIC API
        //
        Chess.prototype.add_game = function(game) {
            if (!game) {
                game = new Game();
            }
            this.games.push(game);
        };
        Chess.prototype.ascend_from_current_continuation = function() {
            replay_log.push(_.now() + ': ascend_from_current_continuation()');

            if (this.current_game.current_variation.parent == null) {
                // already at the topmost level;  nothing to do.
                return false;
            }

            var selected_move_index = this.current_game.current_variation.parent_last_move_index - 1;
            this.current_game.current_variation = this.current_game.current_variation.parent;

            return select_move.call(this, selected_move_index, false);
        };
        Chess.prototype.ascend_from_current_variation = function() {
            replay_log.push(_.now() + ': ascend_from_current_variation()');

            if (this.current_game.current_variation.parent == null) {
                // already at the topmost level;  nothing to do.
                return false;
            }

            var selected_move_index = this.current_game.current_variation.parent_last_move_index;
            this.current_game.current_variation = this.current_game.current_variation.parent;
            this.current_game.current_variation.selected_move_index = selected_move_index;

            return true;
        };
        Chess.prototype.ascii = function() {
            return this.current_game.current_variation.ascii();
        };
        Chess.prototype.clear = function() {
            return clear.call(this);
        };
        Chess.prototype.convert_move_to_algebraic = function(move_obj) {
            // e.g. "Kd7" -> "e8-d7"
            return _.SQUARES_INVERSE[move_obj.move.from] + '-' + _.SQUARES_INVERSE[move_obj.move.to];
        };
        Chess.prototype.convert_square_to_algebraic = function(index) {
            return _.SQUARES_INVERSE[index];
        };
        Chess.prototype.convert_extended_square_to_algebraic = function(index) {
            return _.EXTENDED_SQUARES_INVERSE[index];
        };
        Chess.prototype.create_continuation = function(move) {
            replay_log.push(_.now() + ': create_continuation(' + move + ')');
            return this.create_variation(move, true);
        };
        Chess.prototype.create_variation = function(move, is_continuation) {
            var timing = update_move_timer();

            replay_log.push(_.now() + ": create_variation('" + move.move_text + "'," + is_continuation + ')');

            if (move == null) {
                return false;
            }

            if (is_continuation) {
                if (this.current_game.current_variation.selected_move_index + 1 < this.current_game.current_variation.moves.length
                    && this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index + 1].move.move_text == move)
                {
                    console.log("Continuation not created.  New move already exists as the next move in the current move sequence.");
                    return false;
                }
            } else {
                if (this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index].move.move_text == move)
                {
                    console.log("Variation not created.  New move already exists as the next move in the current move sequence.");
                    return false;
                }
            }

            var inner_variation = new BoardVariation(this.current_game.current_variation, this.current_game.current_variation.selected_move_index, is_continuation, false);
            this.current_game.board_variations.push(inner_variation);

            // take the variation we just started, and append it to the list of variations that start from its "parent" move.
            this.current_game.current_variation.moves[ this.current_game.current_variation.selected_move_index ].child_variations.push(inner_variation);

            this.current_game.current_variation = inner_variation;  // down we go, into our new variation

            var move_obj = (typeof move === 'string') ? this.current_game.current_variation.get_move_obj(move) : move;
            if (move_obj == null) {
                // requested move isn't possible, so undo our attempt at creating a variation
                this.current_game.current_variation = this.current_game.current_variation.parent;
                this.current_game.current_variation.moves[ this.current_game.current_variation.selected_move_index ].child_variations.pop();
                this.current_game.board_variations.pop();

                return false;
            }

            var pretty_move = this.current_game.current_variation.make_pretty(move_obj);
            move_obj.move_text = pretty_move.san;

            this.current_game.current_variation.make_move(move_obj, null, timing);

            return true;
        };
        Chess.prototype.current_game = function() {
            return this.current_game;
        };
        Chess.prototype.current_game_number = function() {
            return this.current_game_num;
        };
        Chess.prototype.current_move_number = function() {
            if (this.current_game.current_variation.moves.length <= 0) {
                return null;
            }
            return this.current_game.current_variation.selected_move_index;
        }; // TODO better name....  s/current move number/selected_move_index/  ??
        Chess.prototype.current_move = function() {
            if (this.current_game.current_variation.moves.length <= 0) {
                return null;
            }
            return this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index].move.move_text;
        };
        Chess.prototype.descend_into_continuation = function(i) {
            replay_log.push(_.now() + ': descend_into_continuation(' + i + ')');

            if (this.current_game.current_variation.selected_move_index == this.current_game.current_variation.moves.length - 1) {
                return false;
            }
            if (this.current_game.current_variation.moves.length <= 0) {
                return false;
            }
            if (typeof i === 'undefined') {
                i = 0;  // just go with the first variation, if any
            }

            var current_move_obj = this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index + 1];
            if (current_move_obj.child_variations.length <= 0) {
                return false;
            }
            if (i < 0 || i > current_move_obj.child_variations.length-1) {
                return false;
            }
            this.current_game.current_variation = current_move_obj.child_variations[i];
            this.current_game.current_variation.selected_move_index = 0;

            return select_move.call(this, 0, false);
        };
        Chess.prototype.descend_into_variation = function(i) {
            replay_log.push(_.now() + ': descend_into_variation(' + i + ')');

            if (this.current_game.current_variation.moves.length <= 0) {
                return false;
            }
            if (typeof i === 'undefined') {
                i = 0;  // just go with the first variation, if any
            }

            var current_move_obj = this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index];
            if (current_move_obj.child_variations.length <= 0) {
                return false;
            }
            if (i < 0 || i > current_move_obj.child_variations.length-1) {
                return false;
            }
            this.current_game.current_variation = current_move_obj.child_variations[i];
            this.current_game.current_variation.selected_move_index = 0;

            return select_move.call(this, 0, false);
        };
        Chess.prototype.fen = function() {
            return this.current_game.current_variation.fen();
        };
        Chess.prototype.get = function(square) {
            return this.current_game.current_variation.get(square);
        };
        Chess.prototype.header = function() {
            return this.current_game.header.add_all(arguments);
        };
        Chess.prototype.history = function() {
            var move_history = [];
            var temp_variation = this.current_game.current_variation;

            for(var i=temp_variation.selected_move_index; i>=0; i--) {
                move_history.push(temp_variation.moves[i].move.is_wildcard ? _.WILDCARD_MOVE : temp_variation.moves[i].move.move_text);
            }

            var parent_last_move_index = temp_variation.parent_last_move_index;
            var is_continuation = temp_variation.is_continuation;
            temp_variation = temp_variation.parent;

            while(temp_variation != null) {
                var i=parent_last_move_index;
                if (! is_continuation) {
                    i--;
                }

                for(; i>=0; i--) {
                    move_history.push(temp_variation.moves[i].is_wildcard ? _.WILDCARD_MOVE : temp_variation.moves[i].move.move_text);
                }

                parent_last_move_index = temp_variation.parent_last_move_index;
                is_continuation = temp_variation.is_continuation;
                temp_variation = temp_variation.parent;
            }

            return move_history.reverse();
        };
        Chess.prototype.in_check = function() {
            return this.current_game.current_variation.in_check();
        };
        Chess.prototype.in_checkmate = function() {
            return this.current_game.current_variation.in_checkmate();
        };
        Chess.prototype.in_draw = function() {
            return this.current_game.current_variation.half_moves >= 100
                || this.current_game.current_variation.in_stalemate()
                || this.current_game.current_variation.insufficient_material()
                || this.current_game.current_variation.in_threefold_repetition();
        };
        Chess.prototype.in_stalemate = function() {
            return this.current_game.current_variation.in_stalemate();
        };
        Chess.prototype.in_threefold_repetition = function() {
            return this.current_game.current_variation.in_threefold_repetition();
        };
        Chess.prototype.insufficient_material = function() {
            return this.current_game.current_variation.insufficient_material();
        };
        Chess.prototype.is_game_over = function () {
            return this.current_game.current_variation.half_moves >= 100
                || this.current_game.current_variation.in_checkmate()
                || this.current_game.current_variation.in_stalemate()
                || this.current_game.current_variation.insufficient_material()
                || this.current_game.current_variation.in_threefold_repetition();
        };
        Chess.prototype.load_fen = function (fen) {
            return load_fen.call(this, fen, true);
        };
        Chess.prototype.load_pgn = function(pgn, options) {

            var is_puzzle_solution = (typeof options === 'object' && typeof options.is_puzzle_solution === 'boolean') ? options.is_puzzle_solution : false;

            // reduce all newlines into \n for simplified parsing
            var newline_char = (typeof options === 'object' && typeof options.newline_char === 'string') ? options.newline_char : '\r?\n';
            var regex = new RegExp(_.mask(newline_char), 'g');
            pgn = pgn.replace(regex, '\n');

            function pgn_game_from_pgn_text(pgn_text) {
                var results = [];

                var head_match, prev_head, new_head, start_new, after_new, last_open, checked_game = "", number_of_games = 0, valid_head;
                var pgn_header_block_regex = /\s*(\[\s*\w+\s*"[^"]*"\s*\]\s*)+/;

                // fix_common_pgn_mistakes
                pgn_text = pgn_text.replace(/[\u00A0\u180E\u2000-\u200A\u202F\u205F\u3000]/g," "); // some spaces to plain space
                pgn_text = pgn_text.replace(/\u00BD/g,"1/2"); // "half fraction" to "1/2"
                pgn_text = pgn_text.replace(/[\u2010-\u2015]/g,"-"); // "hyphens" to "-"
                pgn_text = pgn_text.replace(/\u2024/g,"."); // "one dot leader" to "."
                pgn_text = pgn_text.replace(/[\u2025-\u2026]/g,"..."); // "two dot leader" and "ellipsis" to "..."
                pgn_text = pgn_text.replace(/\\"/g,"'"); // fix [Opening "Queen\"s Gambit"]

                // escape html entities
                pgn_text = pgn_text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

                // PGN standard: ignore lines starting with %
                pgn_text = pgn_text.replace(/(^|\n)%.*(\n|$)/g, "\n");

                if (pgn_header_block_regex.exec(pgn_text)) {
                    while (head_match = pgn_header_block_regex.exec(pgn_text)) {
                        new_head = head_match[0];
                        start_new = pgn_text.indexOf(new_head);
                        after_new = start_new + new_head.length;
                        if (prev_head) {
                            checked_game += pgn_text.slice(0, start_new);
                            valid_head = ((last_open = checked_game.lastIndexOf("{")) < 0) || (checked_game.lastIndexOf("}")) > last_open;
                            if (valid_head) {
                                results.push( { headerText: prev_head, gameText: checked_game } );
                                checked_game = "";
                            } else {
                                checked_game += new_head;
                            }
                        } else {
                            valid_head = true;
                        }
                        if (valid_head) {
                            prev_head = new_head;
                        }
                        pgn_text = pgn_text.slice(after_new);
                    }
                } else {
                    results.push( { headerText: "", gameText: pgn_text } );
                }

                if (prev_head) {
                    checked_game += pgn_text;
                    results.push( { headerText: prev_head, gameText: checked_game } );
                }

                return results;
            }

            var pairs = pgn_game_from_pgn_text(pgn);
            for(var i=0; i<pairs.length; i++) {
                var game = Game.prototype.parse_pgn(pairs[i].headerText, pairs[i].gameText, is_puzzle_solution);
                if (!game) {
                    return false;
                }
                this.add_game(game);
            }

            this.select_game( this.games.length-1 );  // select the game we just loaded...

            if (is_puzzle_solution) {
                while (prev.call(this, false)) {}  // rewind puzzle to beginning
                last_timer_snapshot = _.now();
            }

            return true;
        };
        Chess.prototype.move = function(move) {
            // e.g.: move('Nxb7'), move({ from: 'h7',  to :'h8', promotion: 'q' })

            // TODO(aaron, 4/2) move out of here as inline methods;  move to helper methods within Chess;
            var now = _.now();
            var log_move = function() {
                replay_log.push(now + ": move('" + move_obj.move_text + "')");
            };

            var move_obj = null;
            var moves = this.current_game.current_variation.generate_moves();

            if (typeof move === 'string') {
                if (move === _.WILDCARD_MOVE) {
                    move_obj = moves[0];
                    move_obj.is_wildcard = true;
                } else {
                    // convert the move string to a move object
                    for (var i = 0, len = moves.length; i < len; i++) {
                        if (move === this.current_game.current_variation.move_to_san(moves[i])) {
                            move_obj = moves[i];
                            break;
                        }
                    }
                }
            } else if (typeof move === 'object') {
                // convert the pretty move object to an ugly move object
                for (var i = 0, len = moves.length; i < len; i++) {
                    if (move.from === _.algebraic(moves[i].from) &&
                        move.to === _.algebraic(moves[i].to) &&
                        (!('promotion' in moves[i]) ||
                            move.promotion === moves[i].promotion)) {
                        move_obj = moves[i];
                        break;
                    }
                }
            }

            // failed to find move
            if (!move_obj) {
                var move_text = move.from + "-" + move.to;
                replay_log.push(_.now() + ": move('" + move_text + "') --> invalid move");
                console.log("Requested move proved invalid: " + move_text);
                return false;
            }

            // need to make a copy of move because we can't generate SAN after the move is made
            var pretty_move = this.current_game.current_variation.make_pretty(move_obj);
            move_obj.move_text = pretty_move.san;

            var next_index = this.current_game.current_variation.selected_move_index + 1
            if (next_index < this.current_game.current_variation.moves.length) {
                if (this.current_game.current_variation.moves[next_index].move.move_text === move_obj.move_text) {
                    console.log("New move already exists as the next move in the current move sequence.");
                    log_move();

                    // TODO(aaron,4/7) GAWK this is hacky;  if not just an ugly line of code (make shorter?)
                    // what's happening here;  i need to pass back whether or not the move just made was a "is_puzzle_solution" move
                    // that exists in the loaded PGN;  however, this here move() method doesn't reference stored moves[], instead it
                    // uses generate_moves()
                    if (next.call(this, false)) {
                        pretty_move.is_puzzle_solution = this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index].is_puzzle_solution;
                        return pretty_move;
                    } else {
                        return null;
                    }
                    // /TODO
                } else if (move_obj.is_wildcard && this.current_game.current_variation.moves[next_index].move.is_wildcard) {
                    console.log("New wildcard move already exists as the next move in the current move sequence.");
                    log_move();

                    // TODO(aaron,4/7) GAWK this is hacky;  if not just an ugly line of code (make shorter?)
                    // what's happening here;  i need to pass back whether or not the move just made was a "is_puzzle_solution" move
                    // that exists in the loaded PGN;  however, this here move() method doesn't reference stored moves[], instead it
                    // uses generate_moves()
                    if (next.call(this, false)) {
                        pretty_move.is_puzzle_solution = this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index].is_puzzle_solution;
                        return pretty_move;
                    } else {
                        return null;
                    }
                    // /TODO
                } else {
                    next.call(this, false) ? pretty_move : null;

                    // TODO(aaron,4/2) revisit this logic for variations *and* continuations;  it's currently
                    // not triggering when it should, for this test case:
                    // game = new Chess();  game.move('e4');  game.move('e5');  game.move('a4'); game.move('a6');
                    // game.create_continuation('Ra2');  game.ascend_from_current_variation();  game.move('Ra2');
                    // --> "1. e4 e5 2. a4 a6 (* 3. Ra2) 3. Ra2"

                    var child_variations = this.current_game.current_variation.moves[next_index].child_variations;
                    if (typeof child_variations !== 'undefined' && child_variations.length > 0) {
                        for (var i = 0; i < child_variations.length; i++) {
                            if (child_variations[i].moves[0].move.move_text === move_obj.move_text) {
                                console.log("New move already exists as the first move in child variation #" + i);

                                // TODO(aaron,4/7) GAWK this is hacky;  if not just an ugly line of code (make shorter?)
                                // what's happening here;  i need to pass back whether or not the move just made was a "is_puzzle_solution" move
                                // that exists in the loaded PGN;  however, this here move() method doesn't reference stored moves[], instead it
                                // uses generate_moves()
                                if (this.descend_into_variation(i)) {
                                    pretty_move.is_puzzle_solution = this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index].is_puzzle_solution;
                                    return pretty_move;
                                } else {
                                    return null;
                                }
                                // /TODO
                            }
                        }
                    }

                    // TODO(aaron,4/7) GAWK this is hacky;  if not just an ugly line of code (make shorter?)
                    // what's happening here;  i need to pass back whether or not the move just made was a "is_puzzle_solution" move
                    // that exists in the loaded PGN;  however, this here move() method doesn't reference stored moves[], instead it
                    // uses generate_moves()

                    // TODO(aaron,4/8)low prio bug;  your move logging is misleading;  logging produces e.g.
                    //    game = new Chess();  game.move('e4');  game.move('d5');  game.prev();  game.create_variation('g6', false);
                    // which makes for an impossible move sequence;  instead, what was really called (but not correctly logged) was:
                    //    game = new Chess();  game.move('e4');  game.move('d5');  game.prev();  game.move('g6');
                    if (this.create_variation(move_obj, false)) {
                        pretty_move.is_puzzle_solution = this.current_game.current_variation.moves[this.current_game.current_variation.selected_move_index].is_puzzle_solution;
                        return pretty_move;
                    } else {
                        return null;
                    }
                    // /TODO
                }
            }

            this.current_game.current_variation.make_move(move_obj, null, update_move_timer());

            // TODO(aaron,4/7) GAWK this is hacky;  if not just an ugly line of code (make shorter?)
            // what's happening here;  i need to pass back whether or not the move just made was a "is_puzzle_solution" move
            // that exists in the loaded PGN;  however, this here move() method doesn't reference stored moves[], instead it
            // uses generate_moves()
            var selected_move_index = this.current_game.current_variation.selected_move_index;
            pretty_move.is_puzzle_solution = this.current_game.current_variation.moves[selected_move_index].is_puzzle_solution;
            // /TODO

            // TODO(Aaron4/7) you have the same "GAWk this is hacky" code repeated 4 or 5 times!  See if you can avoid this.
            // Worst case pull out into separate written-once private method

            log_move();
            return pretty_move;
        };
        Chess.prototype.moves = function(options) {
            // The internal representation of a chess move is in 0x88 format, and not meant to be human-readable.
            // The code below converts the 0x88 square coordinates to algebraic coordinates.  It also prunes an
            // unnecessary move keys resulting from a verbose call.
            var ugly_moves = this.current_game.current_variation.generate_moves(options);
            var moves = [];

            var output_only_algebraic_squares = false;
            if (typeof options !== 'undefined' && 'output_only_algebraic_squares' in options && options.output_only_algebraic_squares) {
                output_only_algebraic_squares = true;
            }

            for (var i = 0, len = ugly_moves.length; i < len; i++) {

                //f does the user want a full move object (most likely not), or just SAN
                if (typeof options !== 'undefined' && 'verbose' in options && options.verbose) {
                    moves.push(this.current_game.current_variation.make_pretty(ugly_moves[i]));
                } else {
                    var move = this.current_game.current_variation.move_to_san(ugly_moves[i]);
                    if (output_only_algebraic_squares) {
                        move = move.replace(/[+#?!=]+$/,'');
                        if (move == 'O-O') {
                            move = this.current_game.current_variation.turn === 'w' ? 'g1' : 'g8';
                        } else if (move == 'O-O-O') {
                            move = this.current_game.current_variation.turn === 'w' ? 'c1' : 'c8';
                        } else {
                            move = move.substring(move.length - 2);
                        }
                    }

                    moves.push(move);
                }
            }

            return moves;
        };
        Chess.prototype.next = function() {
            return next.call(this, true);
        }
        Chess.prototype.perft = function(depth) {
            var moves = this.current_game.current_variation.generate_moves({legal: false});
            var nodes = 0;
            var color = this.current_game.current_variation.turn;

            for (var i = 0, len = moves.length; i < len; i++) {

                var future_moves = this.current_game.current_variation.moves.slice(this.current_game.current_variation.selected_move_index+1);

                this.current_game.current_variation.make_move(moves[i]);
                if (!this.current_game.current_variation.is_king_attacked(color)) {
                    if (depth - 1 > 0) {
                        var child_nodes = this.perft.call(this, depth - 1);
                        nodes += child_nodes;
                    } else {
                        nodes++;
                    }
                }
                this.current_game.current_variation.undo_move();

                this.current_game.current_variation.moves = this.current_game.current_variation.moves.concat(future_moves);
            }

            return nodes;
        };  // debugging utility
        Chess.prototype.fen = function() {
            return this.current_game.current_variation.fen();
        }
        Chess.prototype.pgn = function(options) {
            // using the specification from http://www.chessclub.com/help/PGN-spec
            // example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
            var newline = '\n';
            var max_width = 0;
            var include_move_ids = false;
            var show_selected_move = false;

            if (typeof options === 'object') {
                if (typeof options.newline_char === 'string') {
                    newline = options.newline_char;
                }
                if (typeof options.max_width === 'number') {
                    max_width = options.max_width;
                }
                if (typeof options.show_selected_move === 'boolean') {
                    show_selected_move = options.show_selected_move;
                }
            }

            var result = [];

            // add the PGN header information
            for(var i=0; i<this.current_game.header.length(); i++) {
                result.push('[' + this.current_game.header.getKeyAtPosition(i) + ' \"' + this.current_game.header.getValueAtPosition(i) + '\"]' + newline);
            }

            var outermost_variation = this.current_game.current_variation;
            while (outermost_variation.parent != null) {
                outermost_variation = outermost_variation.parent;
            }

            if (this.current_game.header.length() && outermost_variation.moves.length) {
                result.push(newline);
            }

            var moves = process_variation(outermost_variation, 1, this.current_game.current_variation);

            function process_variation(variation, pgn_move_number, current_variation) {
                var moves = [];
                var move_string = '';
                var variation_move_string = '';
                var just_started_variation = false;
                var just_finished_variation = false;

                for(var i=0; i<variation.moves.length; i++) {
                    var move_obj = variation.moves[i];
                    just_started_variation = (i == 0);

                    // if the position started with black to move, start PGN with 1. ...
                    if (just_started_variation && move_obj.move.color === 'b') {
                        move_string = pgn_move_number + '...';
                        pgn_move_number++;
                    } else if ((just_started_variation || just_finished_variation) && move_obj.move.color === 'b' && !variation.is_continuation) {
                        move_string = (pgn_move_number-1) + '...';
                    } else if (move_obj.move.color === 'w') {
                        // store the previous generated move_string if we have one
                        if (move_string.length) {
                            moves.push(move_string);
                        }
                        move_string = pgn_move_number + '.';
                        pgn_move_number++;
                    }

                    move_string += ' ';
                    var is_currently_selected_move = variation === current_variation && i === current_variation.selected_move_index;
                    if (show_selected_move && is_currently_selected_move) {
                        move_string += '<';
                    }
                    move_string +=  (move_obj.move.is_wildcard ? _.WILDCARD_MOVE : move_obj.move.move_text);
                    if (show_selected_move && is_currently_selected_move) {
                        move_string += '>';
                    }

                    if (move_obj.comment) {
                        move_string += ' {' + move_obj.comment + '}';  // TODO(Aaron) sanitize/html escape the output here?
                    }

                    just_finished_variation = false;
                    if (variation.moves[i].child_variations.length > 0) {
                        moves.push(move_string);
                        for(var j=0; j<variation.moves[i].child_variations.length; j++) {
                            var child_variation = variation.moves[i].child_variations[j];
                            var variation_moves = process_variation(child_variation, pgn_move_number - (child_variation.is_continuation ? 0 : 1), current_variation);

                            if (variation_moves.length == 0) {  // an empty variation
                                moves.push("()");
                            } else {
                                for(var k=0; k<variation_moves.length; k++) {
                                    variation_move_string = variation_moves[k];

                                    if (k == 0) {
                                        variation_move_string = '(' + (child_variation.is_continuation ? '* ' : '') + variation_move_string;
                                    }
                                    if (k == variation_moves.length-1) {
                                        variation_move_string = variation_move_string + ')';
                                    }

                                    moves.push(variation_move_string);
                                }
                            }

                            just_finished_variation = true;
                        }
                        move_string = '';
                    }
                }

                // are there any other leftover moves?
                if (move_string.length) {
                    moves.push(move_string);
                }

                return moves;
            }

            // is there a result?
            var result_header = this.current_game.header.get('Result');
            if (result_header) {
                moves.push(result_header);
            }
            // TODO(aaron,4/2) reinstate this?  Or omit altogether?
            // else {
            //    moves.push('*');  // PGN convention for termination of chess
            // }

            // history should be back to what is was before we started generating PGN, so join together moves
            if (max_width === 0) {
                return result.join('') + moves.join(' ');
            }

            // wrap the PGN output at max_width
            var current_width = 0;
            for (var i = 0; i < moves.length; i++) {
                // if the current move will push past max_width
                if (current_width + moves[i].length > max_width && i !== 0) {

                    // don't end the line with whitespace
                    if (result[result.length - 1] === ' ') {
                        result.pop();
                    }

                    result.push(newline);
                    current_width = 0;
                } else if (i !== 0) {
                    result.push(' ');
                    current_width++;
                }
                result.push(moves[i]);
                current_width += moves[i].length;
            }

            return result.join('');
        };
        Chess.prototype.prev = function() {
            return prev.call(this, true);
        }
        Chess.prototype.put = function(piece, square) {
            return put.call(this, piece, square);
        };
        Chess.prototype.remove = function(square) {
            var piece = this.current_game.current_variation.remove(square);
            update_setup.call(this);

            return piece;
        }
        Chess.prototype.rewind_to_beginning = function() {
            replay_log.push(_.now() + ': rewind_to_beginning()');
            while (prev.call(this, false)) {}
        }
        Chess.prototype.log = function() {
            return replay_log;
        }
        Chess.prototype.reset = function() {
            replay_log.push(_.now() + ': reset()');
            return load_fen.call(this, _.DEFAULT_POSITION, true);
        };
        Chess.prototype.select_game = function(i) {
            if (i < 0 || i >= this.games.length) {
                return false;
            }

            this.current_game = this.games[i];
            this.current_game_num = i;
            this.current_fen = this.current_game.current_variation.fen();

            return true;
        };
        Chess.prototype.select_move = function (i) {
            return select_move.call(this, i, true);
        };
        Chess.prototype.square_color = function(square) {
            if (square in _.SQUARES) {
                var sq_0x88 = _.SQUARES[square];
                return ((_.rank(sq_0x88) + _.file(sq_0x88)) % 2 === 0) ? 'light' : 'dark';
            }

            return null;
        };
        Chess.prototype.tree = function() {
            var process_variation = function(root) {
                var subtree = {};
                subtree.is_continuation = root.is_continuation;
                subtree.moves = [];

                for (var i=0; i<root.moves.length; i++) {
                    var node = {};
                    node.move = root.moves[i].move.move_text;
                    node.ply_count = root.moves[i].ply_count;
                    node.move_id = root.moves[i].move_id;
                    node.time_taken_to_move = root.moves[i].time_taken_to_move;

                    node.children = [];
                    if (root.moves[i].child_variations) {
                        for (var j=0; j<root.moves[i].child_variations.length; j++) {
                            node.children.push( process_variation(root.moves[i].child_variations[j]) );
                        }
                    }

                    subtree.moves.push(node);
                }

                return subtree;
            }

            return process_variation(this.current_game.board_variations[0]);
        };    // returns a javscript object of our game's full tree, including move ids and metadata (timing, number of visits, etc)  TODO(Aaron,4.13) do i still need this method?  supplanted by replay_log?
        Chess.prototype.turn = function() {
            return this.current_game.current_variation.turn;
        };
        Chess.prototype.validate_fen = function(fen) {
            return _.validate_fen(fen);
        };
        Chess.prototype.variations = function() {
            return (this.current_game.current_variation.moves.length > 0)
                ? this.current_game.current_variation.moves[ this.current_game.current_variation.selected_move_index ].child_variations
                : null
        };  // return the variations from the currently selected move

        return Chess;
    }());

    // PUBLIC CONSTANTS
    Chess.prototype.WHITE   = _.WHITE;
    Chess.prototype.BLACK   = _.BLACK;
    Chess.prototype.PAWN    = _.PAWN;
    Chess.prototype.KNIGHT  = _.KNIGHT;
    Chess.prototype.BISHOP  = _.BISHOP;
    Chess.prototype.ROOK    = _.ROOK;
    Chess.prototype.QUEEN   = _.QUEEN;
    Chess.prototype.KING    = _.KING;
    Chess.prototype.FLAGS   = _.FLAGS;
    Chess.prototype.SQUARES = _.SQUARES_ARRAY;

    return Chess;
}());

// export Chess object if using node or any other CommonJS compatible environment
if (typeof exports !== 'undefined') exports.Chess = Chess;

// export Chess object for any RequireJS compatible environment
if (typeof define !== 'undefined') define( function () { return Chess;  });