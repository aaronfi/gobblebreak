'use strict';

const assert = require("assert");
const Boggle = require('./../src/boggle');

suite("Boggle", () => {
	suite("neighbor adjacency generation", () => {
		test("4x4", () => {
			const game = new Boggle({ x: 4, y: 4, letters: 'doesnotmatter' });
			assert.deepEqual(game.board,
				[ [ 1, 4, 5 ],
				  [ 0, 2, 4, 5, 6 ],
				  [ 1, 3, 5, 6, 7 ],
				  [ 2, 6, 7 ],
				  [ 0, 1, 5, 8, 9 ],
				  [ 0, 1, 2, 4, 6, 8, 9, 10 ],
				  [ 1, 2, 3, 5, 7, 9, 10, 11 ],
				  [ 2, 3, 6, 10, 11 ],
				  [ 4, 5, 9, 12, 13 ],
				  [ 4, 5, 6, 8, 10, 12, 13, 14 ],
				  [ 5, 6, 7, 9, 11, 13, 14, 15 ],
				  [ 6, 7, 10, 14, 15 ],
				  [ 8, 9, 13 ],
				  [ 8, 9, 10, 12, 14 ],
				  [ 9, 10, 11, 13, 15 ],
				  [ 10, 11, 14 ] ]
			);
		});
		test("5x5", () => {
			const game = new Boggle({ x: 5, y: 5, letters: 'doesnotmatter' });
			assert.deepEqual(game.board,
				[ [ 1, 5, 6 ],
				  [ 0, 2, 5, 6, 7 ],
				  [ 1, 3, 6, 7, 8 ],
				  [ 2, 4, 7, 8, 9 ],
				  [ 3, 8, 9 ],
				  [ 0, 1, 6, 10, 11 ],
				  [ 0, 1, 2, 5, 7, 10, 11, 12 ],
				  [ 1, 2, 3, 6, 8, 11, 12, 13 ],
				  [ 2, 3, 4, 7, 9, 12, 13, 14 ],
				  [ 3, 4, 8, 13, 14 ],
				  [ 5, 6, 11, 15, 16 ],
				  [ 5, 6, 7, 10, 12, 15, 16, 17 ],
				  [ 6, 7, 8, 11, 13, 16, 17, 18 ],
				  [ 7, 8, 9, 12, 14, 17, 18, 19 ],
				  [ 8, 9, 13, 18, 19 ],
				  [ 10, 11, 16, 20, 21 ],
				  [ 10, 11, 12, 15, 17, 20, 21, 22 ],
				  [ 11, 12, 13, 16, 18, 21, 22, 23 ],
				  [ 12, 13, 14, 17, 19, 22, 23, 24 ],
				  [ 13, 14, 18, 23, 24 ],
				  [ 15, 16, 21 ],
				  [ 15, 16, 17, 20, 22 ],
				  [ 16, 17, 18, 21, 23 ],
				  [ 17, 18, 19, 22, 24 ],
				  [ 18, 19, 23 ] ]
			);
		});
		test("1x5", () => {
			const game = new Boggle({ x: 1, y: 5, letters: 'doesnotmatter' });
			assert.deepEqual(game.board,
				[ [ 1 ], 
				  [ 0, 2 ],
				  [ 1, 3 ], 
				  [ 2, 4 ], 
				  [ 3 ] ]
			);
		});
		test("5x1", () => {
			const game = new Boggle({ x: 5, y: 1, letters: 'doesnotmatter' });
			assert.deepEqual(game.board,
				[ [ 1 ], 
				  [ 0, 2 ],
				  [ 1, 3 ], 
				  [ 2, 4 ], 
				  [ 3 ] ]
			);
		});
		test("2x3", () => {
			const game = new Boggle({ x: 2, y: 3, letters: 'doesnotmatter' });
			assert.deepEqual(game.board,
				[ [ 1, 2, 3 ],
				  [ 0, 2, 3 ],
				  [ 0, 1, 3, 4, 5 ],
				  [ 0, 1, 2, 4, 5 ],
				  [ 2, 3, 5 ],
				  [ 2, 3, 4 ] ]
			);
		});	
	});

	suite("word range enforcement", () => {
		test("10-50", () => {
			const game = new Boggle({ x: 2, y: 2, minWords: 10, maxWords: 50, minWordLength: 4 });
		});
	});

	suite("solver", () => {		
	    test("4x4", () => {
	        const game = new Boggle();

	        // d g h i 
	        // k l p s 
	        // y e u t 
	        // e o r n
	        assert.deepEqual(
	        	game.solve('dghiklpsyeuteorn')[3],
	            ['eel', 'eer', 'eld', 'eye', 'eyer', 'glee', 'glut', 'hip', 'hipe', 'hiper',
				 'his', 'hist', 'ist', 'kep', 'kepi', 'kept', 'kern', 'lee', 'leu', 'lust',
				 'lut', 'lye', 'nul', 'nut', 'oer', 'ort', 'our', 'oust', 'out', 'oyer', 'pee',
				 'per', 'pern', 'pert', 'phi', 'pist', 'plus', 'ply', 'plyer', 'pst', 'pun', 'pur',
				 'put', 'ree', 'rel', 'rely', 'rep', 'reps', 'roe', 'run', 'rush', 'rust', 'rut',
				 'shi', 'ship', 'sip', 'sipe', 'siper', 'spun', 'spur', 'spurn', 'sput', 'stre',
				 'stree', 'strey', 'stroy', 'sue', 'suer', 'suld', 'sulk', 'sulker', 'sulky', 'sun',
				 'sur', 'tree', 'trek', 'trey', 'troy', 'tsun', 'tue', 'tule', 'tun', 'tur', 'turn',
				 'ule', 'urn', 'ush', 'ust', 'yee', 'yeo', 'yep', 'yer', 'yern', 'yor', 'you', 'youp',
				 'your', 'yourn']);

	        assert.deepEqual(game.solve('cat.............')[3], ['cat']);
			assert.deepEqual(game.solve('.cat............')[3], ['cat']);
			assert.deepEqual(game.solve('..cat...........')[3], undefined);
			assert.deepEqual(game.solve('...cat..........')[3], undefined);
			assert.deepEqual(game.solve('....cat.........')[3], ['cat']);
			assert.deepEqual(game.solve('.....cat........')[3], ['cat']);
			assert.deepEqual(game.solve('......cat.......')[3], undefined);
			assert.deepEqual(game.solve('.......cat......')[3], undefined);
			assert.deepEqual(game.solve('........cat.....')[3], ['cat']);
			assert.deepEqual(game.solve('.........cat....')[3], ['cat']);
			assert.deepEqual(game.solve('..........cat...')[3], undefined);
			assert.deepEqual(game.solve('...........cat..')[3], undefined);
			assert.deepEqual(game.solve('............cat.')[3], ['cat']);
			assert.deepEqual(game.solve('.............cat')[3], ['cat']);
		})

		test("5x5", () => {
			const game = new Boggle({ x: 5, y: 5 });
			// TODO
			// console.log(game.toString());
		});

		test("25x32", () => {
			const game = new Boggle({ x: 25, y: 32, letters: 'iwkeceeoelheereoamcgodecwtetstdeavtoprfdheorctalnysofplhmunguoemsehdetceabseswfpnlibdttnsaawoerdescaeihttnuemeelclvosbyosfettcilnalrkaatyotcoailnergfesealarutnlklynhthrcclteobarhoaseehnuimonhoklfatsyeevsgfnprrdidrd.ptnecyfepucaneheydctcsootnouosbteonnlcwfhtphieclumrmeegeetseeufidgstayrmtercohreaniitflcyoshronshthdhsrehrrlpediypnimeiusmtadfwklelyhtlrorlodemicaytovuufgadmeenotcdinuurnoyahpesnedenynewitygdrtvchuoaceeaonpervhticayerdeueerdcoshhahsapeanbeeadllewgecelllodeasinflpakhsyiadtiihwytrgrhaitfteeesviaoibxfhmpaufenhgcccrwtevrarrselaisntfspeosenastanpeseoghewuwasaoekeeirtfyehucienreaasfahorrerbairrshagidgloeaetoesugthtceuarallhilrvdaestwoaosdatptsascrsatettcsentisaamefailiuvdfpidvragoohhmnsnneiindltudnirwhghhwsnlthduhhhdgsedefoenortcsoiooetchtctiametimopidoheirhvmedhifhralitnciahnffetsgii' });
			assert.equal(game.answers[3].length, 6207);

			console.log(game.toString());
			console.log('\n');
		});
	});

	suite("user session", () => {
		test("session #1", () => {
			const game = new Boggle({ x: 4, y: 4, letters: 'etobecisea.snard' });

 		    //  0  1  2  3
 		    //  4  5  6  7
 		    //  8  9 10 11
 		    // 12 13 14 15
 			game.submitWord([0,1,6,10]);
 			game.submitWord([1,5,9,10,12]);
 			game.submitWord([0,1,6,10]);
 			game.submitWord([9,5,8]);

 			// TODO add maxScore to game metadata;  
 			// now that I think about it, add a metadata member object...
 			// game.answers.forEach(answer => { game.guesses.add(answer) });
 			assert.equal(game.eventLog.size, 5);
 			assert.equal(game.guesses.size, 2)
 			assert.equal(game.scoreGuesses(), 1);

 			console.log(game.toString());
 			console.log(game.eventLog);	
			console.log('\n');
		});
	});

	// TODO suite for testing various scoring policies

	// TODO suite for testing different randomization policies

	// TODO suite for testing Qu vs Q
});
