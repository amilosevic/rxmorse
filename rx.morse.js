/**
 * Created by aleksandar on 6/21/15.
 */

const qbf = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG 0123456789';
const sos = 'SOS';

const dit = '='; // dot
const dah = '==='; // dash
const ss = 'SS';
const ls = 'LS';
const ws = 'WS';
const cr = 'CR';


const _top_ = '*';

const s = '.'; // space
const sss = '...'; // letter space
const sssssss = '.......'; // word space


var RxMorse;
RxMorse = (function () {

    var rxMorse = {};

    // -- public --

    function subjectize(observable, unit) {
        var subject = new Rx.Subject();
        var last = null;
        var completed = false;

        observable.subscribe(
            function (x) {
                last = x.timestamp;

                if (x.value.endsWith('up')) {

                    xmod3 = {
                        value: ls,
                        timestamp: x.timestamp
                    };

                    Rx.Observable.just(xmod3)
                        .delay(3 * unit * 0.9)
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
                        .delay(7 * unit * 0.9)
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

    rxMorse.init = function (props, padsel, tickersel) {

        var end = '';
        var huffmanIn = {
            // 0 level
            '*' : { '===' : 'T', '=' : 'E'}, // _top_

            // I level
            'T' : { '===' : 'M', '=' : 'N'},
            'E' : { '===' : 'A', '=' : 'I'},

            // II level
            'M' : { '===' : 'O', '=' : 'G'},
            'N' : { '===' : 'K', '=' : 'D'},
            'A' : { '===' : 'W', '=' : 'R'},
            'I' : { '===' : 'U', '=' : 'S'},

            // III level
            'O' : { '===' :'CH', '=' : 'Ö'},
            'G' : { '===' : 'Q', '=' : 'Z'},
            'K' : { '===' : 'Y', '=' : 'C'},
            'D' : { '===' : 'X', '=' : 'B'},
            'W' : { '===' : 'J', '=' : 'P'},
            'R' : { '===' : 'Ä', '=' : 'L'},
            'U' : { '===' : 'Ü', '=' : 'F'},
            'S' : { '===' : 'V', '=' : 'H'},

            // IV level
            'CH': { '===' : '0', '=' : '9'},
            'Ö' : { '===' : end, '=' : '8'},
            'Q' : { '===' : 'Ñ', '=' : 'Ĝ'},
            'Z' : { '===' :'_Z', '=' : '7'},
            'Y' : { '===' : end, '=' : 'Ĥ'},
            'C' : { '===' :'_C', '=' : 'Ç'},
            'X' : { '===' : end, '=' : '/'},
            'B' : { '===' : '=', '=' : '6'},
            'J' : { '===' : '1', '=' : 'Ĵ'},
            'P' : { '===' : 'Á', '=' : 'Þ'},
            'Ä' : { '===' : end, '=' : '+'},
            'L' : { '===' : 'È', '=' : end},
            'Ü' : { '===' : '2', '=' : 'Đ'},
            'F' : { '===' : end, '=' : 'É'},
            'V' : { '===' : '3', '=' : 'Ŝ'},
            'H' : { '===' : '4', '=' : '5'}//,

            // V level
            // @todo .. clean up previous levels to confirm to ITU M.1677 : International Morse code
            // @todo .. fill V level table
            // @todo .. add 1.1.3 Punctuation marks and miscellaneous signs

        };

        var huffmanOut = {

            'A' : [dit, dah],
            'B' : [dah, dit, dit, dit],
            'C' : [dah, dit, dah, dit],
            'D' : [dah, dit, dit],
            'E' : [dit],
            'F' : [dit, dit, dah, dit],
            'G' : [dah, dah, dit],
            'H' : [dit, dit, dit, dit],
            'I' : [dit, dit],
            'J' : [dit, dah, dah, dah],
            'K' : [dah, dit, dah],
            'L' : [dit, dah, dit, dit],
            'M' : [dah, dah],
            'N' : [dah, dit],
            'O' : [dah, dah, dah],
            'P' : [dit, dah, dah, dit],
            'Q' : [dah, dah, dit, dah],
            'R' : [dit, dah, dit],
            'S' : [dit, dit, dit],
            'T' : [dah],
            'U' : [dit, dit, dah],
            'V' : [dit, dit, dit, dah],
            'W' : [dit, dah, dah],
            'X' : [dah, dit, dit, dah],
            'Y' : [dah, dit, dah, dah],
            'Z' : [dah, dah, dit, dit],

            '1' : [dit, dah, dah, dah, dah],
            '2' : [dit, dit, dah, dah, dah],
            '3' : [dit, dit, dit, dah, dah],
            '4' : [dit, dit, dit, dit, dah],
            '5' : [dit, dit, dit, dit, dit],
            '6' : [dah, dit, dit, dit, dit],
            '7' : [dah, dah, dit, dit, dit],
            '8' : [dah, dah, dah, dit, dit],
            '9' : [dah, dah, dah, dah, dit],
            '0' : [dah, dah, dah, dah, dah],

            ' ' : [sssssss]
        };

        var unit = 130;

        var pad = document.getElementById(padsel);
        var ticker = document.getElementById(tickersel);

        // event sources
        var mousedown = Rx.Observable.fromEvent(pad, 'mousedown').filter(function (e) {return e.button == 0});
        var mouseup = Rx.Observable.fromEvent(pad, 'mouseup').filter(function (e) {return e.button == 0});
        var keydown = Rx.Observable.fromEvent(document, 'keydown').filter(function (e) {return e.which == 32; });
        var keyup = Rx.Observable.fromEvent(document, 'keyup').filter(function (e) {return e.which == 32;});



        var mouse = Rx.Observable.merge(mousedown, mouseup)
            .do(function(e) {e.preventDefault()})
            .map(function(e) {return e.type})
            .distinctUntilChanged()
            .timestamp();


        var keyboard = Rx.Observable.merge(keydown, keyup)
            .do(function(e) {e.preventDefault()})
            .map(function(e) {return e.type})
            .distinctUntilChanged()
            .timestamp();

        var robot = Rx.Observable
            .from(qbf).delay(1000)
            .concatMap(function (x) {
                if (x in huffmanOut) {
                    return Rx.Observable.from(huffmanOut[x].concat(sss));
                } else {
                    return Rx.Observable.throw(new Error('** ' + x ));
                }
            })
            .concatMap(function (x) {
                switch (x) {
                    case dit:
                        return Rx.Observable.concat(
                            Rx.Observable.just("robotdown"),
                            Rx.Observable.just("robotup").delay(1*unit),
                            Rx.Observable.empty().delay(1*unit)
                        );
                    case dah:
                        return Rx.Observable.concat(
                            Rx.Observable.just("robotdown"),
                            Rx.Observable.just("robotup").delay(3*unit),
                            Rx.Observable.empty().delay(1*unit)
                        );
                    case sss:
                        return Rx.Observable.empty().delay(3*unit);
                    case sssssss:
                        return Rx.Observable.empty().delay(7*unit);
                    default:
                        return Rx.Observable.throw(new Error('***'));
                }
            })
            .timestamp();

        //robot.subscribe(
        //    function (x) { console.log(x); },
        //    function (e) { console.log("Error: " + e)},
        //    function () { console.log('Complete'); }
        //);

        var inputs = Rx.Observable.merge(mouse, keyboard, robot);

        var spacer = subjectize(inputs, unit);

        var merged = Rx.Observable.merge(inputs, spacer)
        var source = merged
            .map(function (a) {

                var typ;

                switch (a.value) {
                    case 'robotdown':
                    case 'keydown':
                    case 'mousedown':
                        typ = 'down'; break;
                    case 'keyup':
                    case 'robotup':
                    case 'mouseup':
                        typ = 'up'; break;
                    case ls:
                    case ws:
                        typ = a.value; break;

                    default:
                        typ = 'forgetaboutit'
                }

                return typ;
            }).distinctUntilChanged();

        var symbols = source.timeInterval()
            .map(function (e) {
                //console.log("-->" + e.interval + " // " + e.value);
                if (e.value == 'up') {
                    if (e.interval < 1.5 * unit) {
                        return dit;
                    } else if (e.interval >= 1.5 * unit) {
                        return dah;
                    }
                } else if (e.value == 'down') {
                    return '.';
                } else if (e.value == ls) {
                    return ls;
                } else if (e.value == ws) {
                    return ws;
                } else {
                    console.log('unhandled: ' + e.value);
                }
            }).filter(function (x) {return x != '.'});


        var transformed = Rx.Observable.concat(
            symbols
        );

        var out = transformed.scan(
                function (acc, x, i, source) {

                    switch (x){
                        default:
                        case ss:
                            throw new Error("Could not handle: " + x);
                        case ls:
                            return {action : 'out', state : acc.state}; // reset state machine
                        case ws:
                            return {action : 'out', state : ' '}; // space
                        case cr:
                            return {action : 'out', state : "\n"}; // carrige return

                        case dit:
                        case dah:
                            var key;
                            if (acc.action == 'out') {
                                key = _top_;
                            } else {
                                key = acc.state;
                            }

                            var a = huffmanIn[key];
                            if (a == undefined) {
                                return {action : 'out', state: _top_ }
                            }

                            return {action: 'wait', state: a[x]};

                    }
                },
            {action: 'wait', state: _top_}
        ).filter(function (x) {return x.action == 'out'})
            .map(function (x) {return x.state});


        //var subscription1 = Rx.Observable.zipArray(transformed, out).subscribe(
        //    function (x) {
        //        console.log(x)
        //    }
        //);

        //var subscription2 = keyboardSubject.subscribe(function (e) {
        //   console.log(e.timestamp + " // " + e.value);
        //});

        //var subscription2 = source.timestamp().subscribe(function (e) {
        //    console.log('source: ' + e.timestamp + " // " + e.value);
        //});

        //var subscription3 = symbols.timestamp().subscribe(
        //    function (x) { console.log('symbols: ' + x.timestamp + " // " + x.value); },
        //    function (e) { console.log('error: ' + e)},
        //    function () { console.log('onCompleted')}
        //);
        var subscription3 = out.subscribe(
            function (x) { console.log('out:' + x); },
            function (e) { console.log('error: ' + e)},
            function () { console.log('onCompleted')}
        );

        var subscription4 = source.subscribe(
            function (x) {
                if (x == 'down') {
                    pad.style.backgroundColor = 'navy';
                } else if (x == 'up') {
                    pad.style.backgroundColor = 'lavender';
                }
            }
        );


        //


    };

    return rxMorse;
})();
