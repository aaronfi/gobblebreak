$(window).load(function() {
    FastClick.attach(document.body);

    // handle broken Facebook oauth redirection mangling:  http://stackoverflow.com/a/7297873/39529
    if (window.location.hash &&
        (window.location.hash === '#_=_' || window.location.hash.indexOf('NaN') !== -1)) {
        window.location.hash = '';
        $('meta[property="og:url"]').prop('content', window.location.href);
    }

    var game = new Game({ htmlAnchor: window.location.hash });

    //
    // helper functions
    //

    var parseClockSecondsToDisplay = function() {
        var min = Math.floor(game.clockSeconds / 60);
        var sec = game.clockSeconds - (min * 60);
        if (sec < 10) {
            sec = '0' + sec;
        }
        return min + ':' + sec;
    };
    var drawWordCompletionProgressBar = function() {
        var timer = setInterval(function() {
            if (game.answers[game.minWordLength]) {
                var numAnswers = game.answers[game.minWordLength].length;
                if (numAnswers > 999) {
                    var thousands = Math.floor(numAnswers / 1000);
                    numAnswers = thousands + ',' + (numAnswers - (thousands * 1000));
                }
                $('#progressBarRight').text(numAnswers + ' words total').fadeIn();

                var numGuesses = game.correctGuesses.size;
                var result = numGuesses;
                if (result > 999) {
                    var thousands = Math.floor(result / 1000);
                    result = thousands + ',' + (result - (thousands * 1000));
                }
                result += ' word';
                if (numGuesses !== 1) {
                    result += 's';
                }
                result += ' found, ';
                var score = game.scoreGuesses();
                result += score + ' point';
                if (score !== 1) {
                    result += 's';
                }

                $('#progressBarLeft').text(result);
                $('#progressBar').attr({ value: numGuesses, max: numAnswers });

                clearInterval(timer);
            }
        }, 250);
    };
    var drawBoard = function() {
        $(".square").css({
            'font-size': (game.size * 0.5) + 'px',
            'width': game.size + 'px',
            'height': game.size + 'px',
            'border-width': game.size < 45 ? '1px' : '1mm'
        });
        $(".outer-square").css({
            'font-size': (game.size * 0.5) + 'px',
            'width': game.size + 'px',
            'height': game.size + 'px',
            'border-width': game.size < 45 ? '1px' : '1mm',
            'padding': (game.size * 0.2) + 'px'
        });

        $('#canvas').width( $('#board').width() - 1);
        $('#canvas').height( $('#board').height() - 1);
        // for some reason, these two commands are necessary;  otherwise the resize triangle can end up misaligned.
        // $('#resizable').css('height', '');
        //$('#resizable').css('width', '');

        window.location.hash = game.toHtmlAnchor();
        $('meta[property="og:url"]').prop('content', window.location.href + window.location.hash);
    };
    var centerBoard = function() {
        $('#resizable').position({
            my: 'bottom',
            at: 'center',
            of: '#topContainer'
        }).css({'top': '0'});
    };
    var refreshBoard = function() {
        $('#board').html(game.toHtml());
        drawBoard();
        swipeHandler();
        window.location.hash = game.toHtmlAnchor();
        $('meta[property="og:url"]').prop('content', window.location.href + window.location.hash);
    };
    var numShuffleAttempts = 0;
    var onShuffleBoardCallback = function() {
        numShuffleAttempts++;

        if (game.maxWords > 0 || game.minWords > 0) {
            if (numShuffleAttempts < 30) {
                var numAnswers = game.answers[game.minWordLength] ? game.answers[game.minWordLength].length : 0;

                if (numAnswers < game.minWords) {
                    var delta = game.minWords - numAnswers;
                    $('#stdout').text('Shuffle #' + numShuffleAttempts + ' failed, ' + delta + ' too few word' + (delta !== 1 ? 's' : ''));
                    shuffleBoard();
                } else if (game.maxWords > 0 && numAnswers > game.maxWords) {
                    var delta = numAnswers - game.maxWords;
                    $('#stdout').text('Shuffle #' + numShuffleAttempts + ' failed, ' + delta + ' too many word' + (delta !== 1 ? 's' : ''));
                    shuffleBoard();
                } else {
                    $('#stdout').text('');
                }
            } else {
                $('#stdout').text('Gave up after ' + numShuffleAttempts + ' shuffle attempts.  Try again, or relax your shuffle criteria.');
                numShuffleAttempts = 0;
            }
        } else {
            $('#stdout').text('');
            numShuffleAttempts = 0;
        }

        refreshBoard();
    };
    var minWordLengthCallback = function() {
        var minlength = $('#minwordlength').val();
        game.minWordLength = Number(minlength);
        refreshBoard();
        window.location.hash = game.toHtmlAnchor();
        $('meta[property="og:url"]').prop('content', window.location.href + window.location.hash);
    };

    var endGame = function(delay) {
        clearInterval(interval);
        $('#timer').val('0:00');
        $('.square span').css('color', 'black');
        setTimeout(function () {
            $('#timer').val(originalClockValue);
            $('#timer').prop('disabled', false);
            $('#pauseButton').hide();
            $('#pauseButton').text('Pause');
            $('#endButton').hide();
            $('#shuffleButton').show();
            $('#startButton').show();
        }, delay);
        var score = game.scoreGuesses();
        $('#stdout').text('Final score: ' + score + ' point' + (score !== 1 ? 's' :''));
        showMissedAnswers();
        isGameInProgress = false;
        isPaused = false;
        game.endGame();
        $('.navbar-fixed-top').addClass('flash-lightblue');
        setTimeout(function () {
            $('.navbar-fixed-top').removeClass('flash-lightblue');
        }, 1500);

        // send back our game session event log
        jQuery.ajax({
            type: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
            },
            url: '/game_sessions',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ 'game_url': game.toHtmlAnchor(), 'event_log': game.eventLog }),
            success: function(json) { }
        });

    };
    var resetClock = function() {
        isGameInProgress = false;
        $('#timer').val(parseClockSecondsToDisplay());
        $('#pauseButton').hide();
        $('#endButton').hide();
        $('#shuffleButton').show();
        $('#startButton').show();
    };

    var shuffleBoard = function() {
        if (isGameInProgress) {
            return;
        }

        var x = $('#sizex').val();
        var y = $('#sizey').val();
        if (x !== game.x || y !== game.y) {
            game.resize({ x: x, y: y, onShuffleBoardCallback: onShuffleBoardCallback });
            refreshBoard();
            drawWordCompletionProgressBar();
            resetClock();
        }
        $('#guesses').empty().removeClass('final-reveal');
    };
    var swipeHandler = function() {
        $(function() {
            var isMouseDown = false;
            var prevId;

            // mousedown === touchstart
            // mousemove === touchmove
            // mouseup === touchend

            $(document).on('touchmove', function(e) {
                e.preventDefault();
            });

            $('.outer-square').bind('touchmove', function(event) {
                var myLocation = event.originalEvent.changedTouches[0];
                var realTarget = document.elementFromPoint(myLocation.clientX, myLocation.clientY);
                $(realTarget).trigger('mousemove');
                return false;  // prevent text selection
            });

            $('.outer-square').bind('touchstart mousedown', function(event) {
                if (isPaused) return;
                isMouseDown = true;
                if (!isGameInProgress) {
                    $('#startButton').click();  // auto-start the game upon first swiped word
                }
                $(this).addClass('highlighted-starting-letter visited');
                var id = $(this).find('span').data('squareId');
                word.push(id);
                prevId = id;

                $('#stdout').text(game.letters[id] === '.' ? 'qu' : game.letters[id]);
                return false;  // prevent text selection
            });

            $('.square').bind('mousemove', function(event) {
                if (isPaused) return;
                var id = $(this).find('span').data('squareId');
                if (isMouseDown) {
                    if ($(this).parent().hasClass('visited')) {
                        if (id === word[word.length - 2]) {  // undo move
                            var mostRecentMove = word.pop();
                            var mostRecentMoveId = '#sq' + mostRecentMove;
                            $(mostRecentMoveId).parent().parent().parent().removeClass('visited highlighted');

                            var offset = $('#stdout').text().slice(-2) === 'qu' ? -2 : -1;
                            $('#stdout').text($('#stdout').text().slice(0, offset));
                            prevId = word[word.length - 1];
                        }
                    } else if (game.board[prevId].indexOf(id) !== -1) {
                        $(this).parent().addClass('highlighted visited');
                        word.push(id);
                        prevId = id;
                        $('#stdout').append(game.letters[id] === '.' ? 'qu' : game.letters[id]);
                    }
                }
            }).bind("selectstart", function() {
                return false;
            });

            $(document).bind('mouseup touchend', function() {
                if (isPaused) return;
                isMouseDown = false;

                if (isGameInProgress) {  // make sure a word-drag that started before the timer expired, but didn't conclude until after the timer expired, is not alloewd in as a socre
                    if (word.length >= game.minWordLength) {
                        var results = game.submitWord(word);
                        var formedWord = results[0];
                        var resultCode = results[1];

                        if (formedWord && resultCode !== ':duplicate' && resultCode !== ':impossible') {
                            var newGuess = $('#newGuess').clone(false);
                            newGuess.removeAttr('id');

                            if (resultCode === ':correct') {
                                newGuess.addClass('correct-guess').find('span:first-child').text(game.scoreGuess(formedWord));
                                newGuess.addClass('flash-lightgreen');
                                newGuess.removeClass('hidden');
                            } else {
                                if ($('#showIncorrectGuesses').prop('checked')) {
                                    newGuess.removeClass('hidden');
                                    newGuess.addClass('flash-lightgray');
                                };
                                newGuess.addClass('incorrect-guess');
                            }
                            newGuess.find('span:last-child').text(formedWord);
                            newGuess.prependTo('#guesses');

                            setTimeout(function () {
                                newGuess.removeClass('flash-lightgreen flash-lightgray');
                            }, 3000);
                        }

                        var numAnswers = game.answers[game.minWordLength] ? game.answers[game.minWordLength].length : 0;
                        drawWordCompletionProgressBar();
                    } else if (word.length > 1) {
                        $('#minwordlength').addClass('flash-red');
                        $('#minwordlength').prev().addClass('flash-red');
                        setTimeout(function () {
                            $('#minwordlength').removeClass('flash-red');
                            $('#minwordlength').prev().removeClass('flash-red');
                        }, 750);
                    }
                }

                $('.outer-square').removeClass('highlighted highlighted-starting-letter visited');
                word = [];
            });
        });
    };

    //
    // init Game object and then render it
    //
    var word = [];
    $('#board').html(game.toHtml());
    swipeHandler();
    drawBoard();
    centerBoard();
    $('#resizable').css({ 'opacity': 1.00 });

    $('#sizex').val(game.x);
    $('#sizey').val(game.y);
    $('#minwords').val(game.minWords);
    $('#maxwords').val(game.maxWords === 0 ? 'any' : game.maxWords);
    $('#minwordlength').val(game.minWordLength);
    $('#timer').val(parseClockSecondsToDisplay());
    var boardBorderWidth = parseInt($('#board').css('borderLeftWidth'), 10) + 'px';
    $('#canvas').css({ 'margin-top': boardBorderWidth, 'margin-left': boardBorderWidth });

    //
    // snazzy keyboard controls
    //

    var incr_x = function() {
        $('#sizex').val(parseInt($('#sizex').val(), 10) + 1);
        shuffleBoard();
    };
    var decr_x = function() {
        $('#sizex').val(Math.max(1, parseInt($('#sizex').val(), 10) - 1));
        shuffleBoard();
    }
    var incr_y = function() {
        $('#sizey').val(parseInt($('#sizey').val(), 10) + 1);
        shuffleBoard();
    };
    var decr_y = function() {
        $('#sizey').val(Math.max(1, parseInt($('#sizey').val(), 10) - 1));
        shuffleBoard();
    }

    // global key binding
    $(window).bind('keydown', function(e) {
        switch (e.keyCode) {
            case 13:  // enter key
                e.preventDefault();
                if (!isGameInProgress) {
                    $('#startButton').click();  // auto-start game upon first move
                }
                e.stopPropagation();
                break;
            case 32:  // space bar
                e.preventDefault();
                shuffleBoard();
                e.stopPropagation();
                break;
            case 37:
                e.preventDefault();
                decr_x();
                shuffleBoard();
                centerBoard();
                e.stopPropagation();
                break;
            case 38:
                e.preventDefault();
                decr_y();
                shuffleBoard();
                centerBoard();
                e.stopPropagation();
                break;
            case 39:
                e.preventDefault();
                incr_x();
                shuffleBoard();
                centerBoard();
                e.stopPropagation();
                break;
            case 40:
                e.preventDefault();
                incr_y();
                shuffleBoard();
                centerBoard();
                e.stopPropagation();
                break;
            default:
                break;
        }
    });

    // board size input fields -- up/down arrows only
    $('#sizex').bind('keydown', function(e) {
        switch (e.keyCode) {
            case 13:  // enter key
            case 32:  // space bar
            case 37:
            case 39:
                e.preventDefault();
                e.stopPropagation();
                break;
            case 38:
                e.preventDefault();
                incr_x();
                e.stopPropagation();
                break;
            case 40:
                e.preventDefault();
                decr_x();
                e.stopPropagation();
                break;
            default:
                break;
        }
    });
    $('#sizex').change(function() {
        shuffleBoard();
        centerBoard();
    });
    $('#sizey').bind('keydown', function(e) {
        switch (e.keyCode) {
            case 13:  // enter key
            case 32:  // space bar
            case 37:
            case 39:
                e.preventDefault();
                e.stopPropagation();
                break;
            case 38:
                e.preventDefault();
                incr_y();
                e.stopPropagation();
                break;
            case 40:
                e.preventDefault();
                decr_y();
                e.stopPropagation();
                break;
            default:
                break;
        }
    });
    $('#sizey').change(function() {
        shuffleBoard();
        centerBoard();
    });

    // min/max words slider and input fields -- up/down arrows only
    var isSliding = false;
    var minMaxWordsSlider_maxValue = 1000;
    var minMaxWordsSlider = $('#minMaxWordsSlider')
        .slider({
            min: 0,
            max: minMaxWordsSlider_maxValue,
            range: true,
            tooltip: 'hide',
            value: [game.minWords, game.maxWords === 0 ? minMaxWordsSlider_maxValue : game.maxWords]
        }).on('slide', function(e) {
            $('#minwords').val(e.value[0]);
            $('#maxwords').val(e.value[1] === minMaxWordsSlider_maxValue ? 'any' : e.value[1]);
        }).on('slideStart', function() {
            isSliding = true;
        }).on('slideStop', function() {
            isSliding = false;
            game.minWords = Number($('#minwords').val());
            var max = $('#maxwords').val();
            game.maxWords = max === 'any' ? 0 : Number(max);
            window.location.hash = game.toHtmlAnchor();
            $('meta[property="og:url"]').prop('content', window.location.href + window.location.hash);
        });

    $('#minwords').change(function() {
        if (!isSliding) {
            var min = Number($(this).val());
            var max = Number($('#maxwords').val());
            if (min > max) {
                var temp = min;
                min = max;
                max = temp;
                $('#minwords').val(min);
                $('#maxwords').val(max);
            }
            minMaxWordsSlider.slider('setValue', [min, max]);
            game.minWords = Number($('#minwords').val());
            var max = $('#maxwords').val();
            game.maxWords = max === 'any' ? 0 : Number(max);
            window.location.hash = game.toHtmlAnchor();
            $('meta[property="og:url"]').prop('content', window.location.href + window.location.hash);
        }
    });
    $('#maxwords').change(function() {
        if (!isSliding) {
            var min = Number($('#minwords').val());
            var max = Number($(this).val());
            if (max === minMaxWordsSlider_maxValue) {
                $('#maxwords').val('any');
            } else if (min > max) {
                var temp = min;
                min = max;
                max = temp;
                $('#minwords').val(min);
                $('#maxwords').val(max);
            }
            minMaxWordsSlider.slider('setValue', [min, max]);
            game.minWords = Number($('#minwords').val());
            var max = $('#maxwords').val();
            game.maxWords = max === 'any' ? 0 : Number(max);
            window.location.hash = game.toHtmlAnchor();
            $('meta[property="og:url"]').prop('content', window.location.href + window.location.hash);
        }
    });
    var decr_min = function() {
        var min = Math.max(0, parseInt($('#minwords').val(), 10) - 1);
        var max = Number($('#maxwords').val());
        $('#minwords').val(min);
        minMaxWordsSlider.slider('setValue', [min, max]);
    }
    var incr_min = function() {
        var min = Math.max(0, parseInt($('#minwords').val(), 10) + 1);
        var max = Number($('#maxwords').val());
        $('#minwords').val(min);
        minMaxWordsSlider.slider('setValue', [min, max]);
    }
    var decr_max = function() {
        var min = Number($('#minwords').val());
        var max = Math.max(0, parseInt($('#maxwords').val(), 10) - 1);
        $('#maxwords').val(max);
        minMaxWordsSlider.slider('setValue', [min, max]);
    }
    var incr_max = function() {
        var min = Number($('#minwords').val());
        var max = Math.max(0, parseInt($('#maxwords').val(), 10) + 1);
        $('#maxwords').val(max);
        minMaxWordsSlider.slider('setValue', [min, max]);
    }
    $('#minwords').bind('keydown', function(e) {
        switch (e.keyCode) {
            case 13:  // enter key
            case 32:  // space bar
            case 37:
            case 39:
                e.preventDefault();
                e.stopPropagation();
                break;
            case 38:
                e.preventDefault();
                incr_min();
                e.stopPropagation();
                break;
            case 40:
                e.preventDefault();
                decr_min();
                e.stopPropagation();
                break;
            default:
                break;
        }
    });
    $('#maxwords').bind('keydown', function(e) {
        switch (e.keyCode) {
            case 13:  // enter key
            case 32:  // space bar
            case 37:
            case 39:
                e.preventDefault();
                e.stopPropagation();
                break;
            case 38:
                e.preventDefault();
                incr_max();
                e.stopPropagation();
                break;
            case 40:
                e.preventDefault();
                decr_max();
                e.stopPropagation();
                break;
            default:
                break;
        }
    });

    // minwordlength input
    var decr_minlength = function() {
        var minlength = Math.max(2, parseInt($('#minwordlength').val(), 10) - 1);
        $('#minwordlength').val(minlength);
        minWordLengthCallback();
    };
    var incr_minlength = function() {
        var minlength = Math.max(2, parseInt($('#minwordlength').val(), 10) + 1);
        $('#minwordlength').val(minlength);
        minWordLengthCallback();
    };
    $('#minwordlength').bind('keydown', function(e) {
        switch (e.keyCode) {
            case 13:  // enter key
            case 32:  // space bar
            case 37:
            case 39:
                e.preventDefault();
                e.stopPropagation();
                break;
            case 38:
                e.preventDefault();
                incr_minlength();
                e.stopPropagation();
                break;
            case 40:
                e.preventDefault();
                decr_minlength();
                e.stopPropagation();
                break;
            default:
                break;
        }
    });
    $('#minwordlength').change(minWordLengthCallback);

    $('#timer').bind('keydown', function(e) {
        switch (e.keyCode) {
            case 13:  // enter key
            case 32:  // space bar
            case 37:
            case 39:
            case 38:
            case 40:
                e.stopPropagation();
                break;
            default:
                break;
        }
    });

    $('#startButton').bind('keydown', function(e) {
        switch (e.keyCode) {
            case 13:  // enter key
            case 32:  // space bar
                e.stopPropagation();
                break;
            default:
                break;
        }
    });

    // game progression bar
    drawWordCompletionProgressBar();

    $('#showProgressBar').change(function() {
        if (this.checked) {
            $('#progressBarRow').css({ 'visibility': '' });
        } else {
            $('#progressBarRow').css({ 'visibility': 'hidden' });
        }
    });

    $('#showIncorrectGuesses').change(function() {
        if (this.checked) {
            $('.incorrect-guess').fadeTo("fast", 1.00, function() {
                $(this).slideDown("slow", function() {
                    $(this).show();
                })
            });
        } else {
            $('.incorrect-guess').fadeTo("fast", 0.00, function() {
                $(this).slideUp("fast", function() {
                    $(this).hide();
                });
            });
        }
    });

    // Shuffle button
    $('#shuffleButton').click(function() {
        shuffleBoard();
        $('#shuffleButton').tooltip('hide');
    });
    $('#shuffleButton').tooltip();

    $('#sizexy').tooltip();

    $('#timer').change(function() {
        game.clockSeconds = Number( parseTimer() );
        $('#timer').val( parseClockSecondsToDisplay() );
        window.location.hash = game.toHtmlAnchor();
        $('meta[property="og:url"]').prop('content', window.location.href + window.location.hash);
    });

    //
    // game clock
    //
    var showMissedAnswers = function() {
        game.missedAnswers().forEach(function(answer) {
            var missedAnswer = $('#newGuess').clone(false);
            missedAnswer.removeAttr('id');
            missedAnswer.removeClass('hidden');
            missedAnswer.find('span:first-child').text(game.scoreGuess(answer));
            missedAnswer.find('span:last-child').text(answer);
            $('#guesses').append(missedAnswer);
        });

        $('#guesses li').detach().sort(function(a,b) {
            var a_text = $(a).find('span:last-child').text();
            var b_text = $(b).find('span:last-child').text();
            if (a_text.length !== b_text.length) {
                return b_text.length - a_text.length;
            } else {
                return $(a).find('span:last-child').text().localeCompare($(b).find('span:last-child').text());
            }
        }).appendTo('#guesses');
        $('#guesses').addClass('final-reveal');
    };
    var interval, originalClockValue;
    var startTimer = function(duration, display) {
        originalClockValue = $('#timer').val();

        var timer = (function(start) {
            return function () {
                // get the number of seconds that have elapsed since startTimer() was called
                var diff = duration - (((Date.now() - start) / 1000) | 0);

                // does the same job as parseInt truncates the float
                var minutes = (diff / 60) | 0;
                var seconds = (diff % 60) | 0;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                display.val(minutes + ":" + seconds);

                if (diff <= 0) {  // game has ended...
                    endGame(1500);
                }
            }
        })(Date.now());

        interval = setInterval(timer, 1000);
    };
    var parseTimer = function() {
        var val = $('#timer').val();
        if (val.indexOf(':') !== -1) {
            var parts = val.split(':');
            return Number(parts[0])*60 + Number(parts[1]);
        } else {
            return Number(val);
        }
    };

    // Start/Pause/End buttons
    var isGameInProgress = false;
    $('#startButton').tooltip();
    $('#startButton').click(function() {
        $('#startButton').tooltip('hide');

        if (!isGameInProgress) {
            $('#guesses').empty();
            isGameInProgress = true;
            game.startGame();
            $('#stdout').text('');
            $('#shuffleButton').hide();
            $('#startButton').hide();
            $('#pauseButton').show();
            $('#endButton').show();
            $('#timer').prop('disabled', true);
            $('#timer').addClass('flash-green');
            $('#timer').prev().addClass('flash-green');
            setTimeout(function () {
                $('#timer').removeClass('flash-green');
                $('#timer').prev().removeClass('flash-green');
            }, 5000);
            startTimer(parseTimer(), $('#timer'));
        }
    });

    var isPaused = false;
    $('#pauseButton').click(function() {
        if (isPaused) {
            isPaused = false;
            $('.square span').css('color', 'black');
            $('#pauseButton').text('Pause');
            startTimer(parseTimer(), $('#timer'));
        } else {
            isPaused = true;
            $('.square span').css('color', 'transparent');
            $('#pauseButton').text('Resume');
            clearInterval(interval);
        }
    });

    $('#endButton').click(function() {
        endGame(0);
    });

    //
    // initialize board resizing
    //

    var canvas = document.getElementById('canvas');
    $('#resizable').resizable({
        start: function(event, ui) {
            $('#board').css({ 'border-color': 'blue' });
            $('.resizable-arrow i').css({ 'color': 'blue' });
        },
        resize: function(event, ui) {
            $('#board').css({ 'border-color': 'blue' });
            $('.resizable-arrow i').css({ 'color': 'blue' });

            $('.board-column').css({ 'height': $('#board').height(), 'width': $('#board').width() });

            game.size = Math.round(Math.min(ui.size.height, ui.size.width) / (1.7 * Math.max(game.x, game.y)));
            drawBoard();

            //canvas.width = $('#resizable').width();
            //canvas.height = $('#resizable').height();
        },
        stop: function(event, ui) {
            $('#board').css({ 'border-color': 'transparent' });
            $('.resizable-arrow i').css({ 'color': 'white' });
            window.location.hash = game.toHtmlAnchor();
            $('meta[property="og:url"]').prop('content', window.location.href + window.location.hash);
        },
        aspectRatio: true,
        handles: "nw, se"
    });
    $('#resizable .ui-icon-gripsmall-diagonal-se')
        .addClass('resizable-arrow')  // slight stylistic change, adding a better "click-drag" icon
        .removeClass('ui-icon-gripsmall-diagonal-se ui-resizable-handle ui-resizable-se ui-icon')
        .append('<i class="fa fa-arrows-alt"></i>');
    $('#resizable .fa-arrows-alt')
        .hover(
            function() {
                $('#board').css({ 'border-color': 'blue' });
                $(this).css({ 'color': 'blue' });
            },
            function() {
                $('#board').css({ 'border-color': 'transparent' });
                $(this).css({ 'color': 'white' });
            }
        )
        .mousedown(function() {
            $('#board').css({ 'border-color': 'blue' });
            $(this).css({ 'color': 'blue' });
        })
        .mouseup(function() {
            $('#board').css({ 'border-color': 'transparent' });
            $(this).css({ 'color': 'white' });
        });

    //
    // initialize board dragging
    //

    $('#resizable').draggable({
        handle: 'i.fa-arrows',
        zIndex: 100,
        // containment: '#topContainer',
        start: function() {
            $('#board').css({ 'border-color': 'green' });
            $('#board i').css({ 'color': 'green' });
        },
        stop: function() {
            $('#board').css({ 'border-color': 'transparent' });
            $('#board i').css({ 'color': 'white' });
        }
    });
    $('#resizable .fa-arrows')
        .hover(
            function() {
                $('#board').css({ 'border-color': 'green' });
                $(this).css({ 'color': 'green' });
            },
            function() {
                $('#board').css({ 'border-color': 'transparent' });
                $(this).css({ 'color': 'white' });
            }
        );



    $(window).focus();
});
