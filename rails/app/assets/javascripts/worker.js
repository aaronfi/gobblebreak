onmessage = function(e) {
    console.log('worker called: ' + e);

    importScripts('/assets/gobble.js');

    var game = new Foo({ x: e.data[0], y: e.data[1], letters: e.data[2] });
    postMessage(game.solve());
}