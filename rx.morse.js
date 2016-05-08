/**
 * Created by aleksandar on 6/21/15.
 */

const qbf = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG 0123456789';
const sos = 'SOS';

const dit = '='; // dot
const dah = '==='; // dash

const ls = 'LS';
const ws = 'WS';
const cr = 'CR';

const s = '.'; // space
const sx3 = '...'; // letter space
const sx7 = '.......'; // word space
const sx20 = '......................'; // sentance space == new line


Rx.Observable.prototype.spacer = function (unit, sched) {

    var source = this,
        scheduler = sched || Rx.Scheduler.default;

    return Rx.Observable.create(function (observer) {

        var completed = false,
            error = false,
            last = null;

        return source.subscribe(
            // onNext
            function (x) {
                var time = scheduler.now();
                last = time;

                // send x
                scheduler.schedule(x, function(sched, x) {
                    if (!completed && !error) {
                        observer.onNext(x)
                    }
                });

                // schedule LS
                scheduler.scheduleFuture(sx3, 3 * unit * 1.05, function(sched, x) {
                    if (!error && last != null && time == last) {
                        observer.onNext(x);
                    }
                });

                // schedule WS
                scheduler.scheduleFuture(sx7, 7 * unit * 1.05, function(sched, x) {
                    if (!error && last != null && time == last) {
                        observer.onNext(x);
                    }
                });

                // schedule CR
                scheduler.scheduleFuture(sx20, 20 * unit * 1.05, function(sched, x) {
                    if (!error && last != null && time == last) {
                        observer.onNext(x);
                        if (completed) {
                            observer.onCompleted();
                        }
                    }
                });

            },
            // onError
            function (e) {
                scheduler.schedule(e, function(sched, x) {
                    if (!completed && !error) {
                        error = true;
                        observer.onError(e);
                    }
                });

            },
            // onComplete
            function () {
                scheduler.schedule(null, function(sched, x) {
                    if (!completed && !error && last == null) {
                        observer.onCompleted();
                    }

                    if (!completed && !error) {
                        completed = true;
                    }
                });

            }
        );


    });

};


var RxMorse;
RxMorse = (function () {

    var rxMorse = {};

    // -- public --

    rxMorse.init = function (props, padsel, tickersel, speakersel, textsel, buttonsel) {

        var err = '__err__';
        var top = '__top__';
        var morseIn = {

            // 0 level
            '__top__': {'===': 'T', '=': 'E'}, // _top_

            // I level
            'T': {'===': 'M', '=': 'N'},
            'E': {'===': 'A', '=': 'I'},

            // II level
            'M': {'===': 'O', '=': 'G'},
            'N': {'===': 'K', '=': 'D'},
            'A': {'===': 'W', '=': 'R'},
            'I': {'===': 'U', '=': 'S'},

            // III level
            'O': {'===': 'CH', '=': 'Ö'},
            'G': {'===': 'Q', '=': 'Z'},
            'K': {'===': 'Y', '=': 'C'},
            'D': {'===': 'X', '=': 'B'},
            'W': {'===': 'J', '=': 'P'},
            'R': {'===': 'Ä', '=': 'L'},
            'U': {'===': 'Ü', '=': 'F'},
            'S': {'===': 'V', '=': 'H'},

            // IV level
            'CH': {'===': '0', '=': '9'},
            'Ö': {'===': err, '=': '8'},
            'Q': {'===': 'Ñ', '=': 'Ĝ'},
            'Z': {'===': err /*'_Z'*/, '=': '7'},
            'Y': {'===': err, '=': 'Ĥ'},
            'C': {'===': err /*'_C'*/, '=': 'Ç'},
            'X': {'===': err, '=': '/'},
            'B': {'===': '=', '=': '6'},
            'J': {'===': '1', '=': 'Ĵ'},
            'P': {'===': 'Á', '=': 'Þ'},
            'Ä': {'===': err, '=': '+'},
            'L': {'===': 'È', '=': err},
            'Ü': {'===': '2', '=': 'Đ'},
            'F': {'===': err, '=': 'É'},
            'V': {'===': '3', '=': 'Ŝ'},
            'H': {'===': '4', '=': '5'},

            // V level
            'Đ': {'===': '?', '=': '_'}


        };

        var morseOut = {

            'A': [dit, dah],
            'B': [dah, dit, dit, dit],
            'C': [dah, dit, dah, dit],
            'D': [dah, dit, dit],
            'E': [dit],
            'F': [dit, dit, dah, dit],
            'G': [dah, dah, dit],
            'H': [dit, dit, dit, dit],
            'I': [dit, dit],
            'J': [dit, dah, dah, dah],
            'K': [dah, dit, dah],
            'L': [dit, dah, dit, dit],
            'M': [dah, dah],
            'N': [dah, dit],
            'O': [dah, dah, dah],
            'P': [dit, dah, dah, dit],
            'Q': [dah, dah, dit, dah],
            'R': [dit, dah, dit],
            'S': [dit, dit, dit],
            'T': [dah],
            'U': [dit, dit, dah],
            'V': [dit, dit, dit, dah],
            'W': [dit, dah, dah],
            'X': [dah, dit, dit, dah],
            'Y': [dah, dit, dah, dah],
            'Z': [dah, dah, dit, dit],

            '1': [dit, dah, dah, dah, dah],
            '2': [dit, dit, dah, dah, dah],
            '3': [dit, dit, dit, dah, dah],
            '4': [dit, dit, dit, dit, dah],
            '5': [dit, dit, dit, dit, dit],
            '6': [dah, dit, dit, dit, dit],
            '7': [dah, dah, dit, dit, dit],
            '8': [dah, dah, dah, dit, dit],
            '9': [dah, dah, dah, dah, dit],
            '0': [dah, dah, dah, dah, dah],

            '?': [dit, dit, dah, dah, dit, dah]

        };

        var unit = 150; // ~ 18 wpm  (T = 1200 / W)

        var pad = document.getElementById(padsel);
        var ticker = document.getElementById(tickersel);
        var speaker = document.getElementById(speakersel);
        var button = document.getElementById(buttonsel);
        var text = document.getElementById(textsel);


        // event sources
        var mousedown = Rx.Observable.fromEvent(pad, 'mousedown')
            .filter(function (e) { return e.button == 0 });

        var mouseup = Rx.Observable.fromEvent(pad, 'mouseup')
            .filter(function (e) { return e.button == 0 });

        var keydown = Rx.Observable.fromEvent(document, 'keydown')
            .filter(function (e) { return e.which == 32 && e.target != button && e.target != text; });

        var keyup = Rx.Observable.fromEvent(document, 'keyup')
            .filter(function (e) { return e.which == 32 && e.target != button && e.target != text; });

        var texts = Rx.Observable.fromEvent(text, 'keypress')
            .filter(function (e) {return e.which == 13; })
            .map(function (e) {
                var s = e.target.value;
                e.target.value = "";
                return s.toUpperCase();
            });

        var clicks = Rx.Observable.fromEvent(button, 'click')
            .map(function (e) {
                return sos;
            });


        var mouse = Rx.Observable.merge(mousedown, mouseup)
            .do(function (e) {
                e.preventDefault()
            })
            .map(function (e) {
                return e.type
            })
            .distinctUntilChanged();


        var keyboard = Rx.Observable.merge(keydown, keyup)
            .do(function (e) {
                e.preventDefault()
            })
            .map(function (e) {
                return e.type
            })
            .distinctUntilChanged();

        var textsandclicks = Rx.Observable.merge(texts, clicks);
        var flatten = textsandclicks
            .delay(500)
            .concatMap(function (x) {
                return Rx.Observable.from(x + "\n"); // add new line
            });

        var robot = flatten
            .concatMap(function (x) {
                if (x in morseOut) {
                    return Rx.Observable.from(morseOut[x].concat(sx3)); // add letter space
                } else if (x == ' ') { // handle space
                    return Rx.Observable.just(sx7);
                } else if (x == '\n') { // handle new line
                    return Rx.Observable.just(sx20);
                } else {
                    return Rx.Observable.from(morseOut['?'].concat(sx3));
                }
            })
            .concatMap(function (x) {
                switch (x) {
                    case dit:
                        return Rx.Observable.concat(
                            Rx.Observable.just("robotdown"),
                            Rx.Observable.just("robotup").delay(1 * unit),
                            Rx.Observable.empty().delay(1 * unit)
                        );
                    case dah:
                        return Rx.Observable.concat(
                            Rx.Observable.just("robotdown"),
                            Rx.Observable.just("robotup").delay(3 * unit),
                            Rx.Observable.empty().delay(1 * unit)
                        );
                    case sx3:
                        return Rx.Observable.empty().delay(3 * unit);
                    case sx7:
                        return Rx.Observable.empty().delay(7 * unit);
                    case sx20:
                        return Rx.Observable.empty().delay(20 * unit);
                    default:
                        return Rx.Observable.throw(new Error('***'));
                }
            });

        var inputs = Rx.Observable.merge(mouse, keyboard, robot);

        var spacer = inputs.spacer(unit);

        var source = Rx.Observable.merge(spacer)
            .map(function (a) {
                switch (a) {
                    case 'robotdown':
                    case 'keydown':
                    case 'mousedown':
                        return 'down';
                    case 'keyup':
                    case 'robotup':
                    case 'mouseup':
                        return 'up';
                    case sx3:
                        return ls;
                    case sx7:
                        return ws;
                    case sx20:
                        return cr;
                    default:
                        console.log(a);
                        throw new Error('!');
                }
            }).publish();

        source.subscribe(function (x) {
            if (x == 'down') {
                speaker.currentTime = 0;
                speaker.volume = 1;
                speaker.play();
            } else if (x == 'up') {
                speaker.pause()
            }
        });

        var symbols = source.timeInterval()
            .map(function (e) {
                if (e.value == 'up') {
                    if (e.interval < 1.5 * unit) {
                        return dit;
                    } else /*if (e.interval >= 1.5 * unit)*/ {
                        return dah;
                    }
                } else if (e.value == 'down') {
                    return null;
                } else if (e.value == ls) {
                    return ls;
                } else if (e.value == ws) {
                    return ws;
                } else if (e.value == cr) {
                    return cr;
                } else {
                    console.log('unhandled: ' + e.value);
                }
            }).filter(function (x) {
                return x != null;
            });


        var out = symbols.scan(
            function (acc, x, i, source) {

                switch (x) {
                    default:
                        throw new Error("Could not handle: " + x);
                    case ls:
                        return {action: 'out', state: acc.state}; // output state and reset state machine in next step
                    case ws:
                        return {action: 'out', state: ' '}; // output space and reset ...
                    case cr:
                        return {action: 'out', state: "\n"}; // carriage return and reset ...

                    case dit:
                    case dah:
                        var key = (acc.action == 'out' ? top : acc.state);
                        var node = morseIn[key];

                        var state = (node == undefined ? err : node[x]);

                        return {action: 'wait', state: state};

                }
            },
            {action: 'wait', state: top}
        ).filter(function (x) {
                return x.action == 'out'
            })
            .map(function (x) {
                return x.state
            });



        var subscription4 = source.subscribe(
            function (x) {
                if (x == 'down') {
                    pad.style.backgroundColor = 'navy';
                } else if (x == 'up') {
                    pad.style.backgroundColor = 'lavender';
                }
            }
        );


        var subscription5 = out.subscribe(
          function (x) {
              ticker.innerHTML += (x == "\n" ? '<br/>' : x);
          }
        );

        source.connect();


    };

    function subjectize(observable, unit) {
        var subject = new Rx.Subject();
        var last = null;
        var completed = false;

        observable.subscribe(
            function (x) {
                //console.log(x);
                subject.onNext(x);
                last = x.timestamp;

                if (x.value.endsWith('up')) {

                    xmod3 = {
                        value: ls,
                        timestamp: x.timestamp
                    };

                    Rx.Observable.just(xmod3)
                        .delay(3 * unit *.9)
                        .subscribe(
                        function (x1) {
                            if (x1.timestamp == last) {
                                //last = null;
                                x1.__timestamp = Date.now();
                                //console.log(x1);
                                subject.onNext(x1);
                                if (completed) {
                                    subject.onCompleted();
                                }
                            }
                        }
                    );

                    xmod7 = {
                        value: ws,
                        timestamp: x.timestamp
                    };

                    Rx.Observable.just(xmod7)
                        .delay(7 * unit)
                        .subscribe(
                        function (x1) {
                            if (x1.timestamp == last) {
                                //last = null;
                                x1.__timestamp = Date.now();
                                //console.log(x1);
                                subject.onNext(x1);
                                if (completed) {
                                    subject.onCompleted();
                                }
                            }
                        }
                    );

                    xmod20 = {
                        value: cr,
                        timestamp: x.timestamp
                    };

                    Rx.Observable.just(xmod20)
                        .delay(20 * unit)
                        .subscribe(
                        function (x1) {
                            if (x1.timestamp == last) {
                                //last = null;
                                x1.__timestamp = Date.now();
                                //console.log(x1);
                                subject.onNext(x1);
                                if (completed) {
                                    subject.onCompleted();
                                }
                            }
                        }
                    );


                }


            },
            function (e) {
                subject.onError();
            },
            function () {
                if (completed == false && last == null) {
                    subject.onCompleted();
                } else {
                    completed = true;
                }
            }
        );
        return subject;
    }


    return rxMorse;
})();
