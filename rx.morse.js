/**
 * Created by aleksandar on 6/21/15.
 */


Rx.Observable.prototype.timeoutContinue = function(dueTime, element, predicate, scheduler) {
    Rx.Scheduler.isScheduler(scheduler) || (scheduler = Rx.Scheduler.default);

    var source = this;

    return new Rx.AnonymousObservable(function (observer){
        var id = 0;
        var switched = false;
        var timer = new Rx.SerialDisposable();
        var original = new Rx.SingleAssignmentDisposable();

        function createTimer() {
            var myId = id;

            timer.setDisposable(scheduler.scheduleFuture(element, dueTime, function() {
                if (id === myId) {
                    observer.onNext(element);
                    createTimer();
                }
            }))

        }

        original.setDisposable(source.subscribe(
            function (x) {
                if (!switched) {
                    id++;
                    observer.onNext(x);
                    if (predicate(x)) {
                        createTimer();
                    }
                }

            },

            function (e) {
                if (!switched) {
                    id++;
                    observer.onError(e);
                }

            },

            function () {
                if (!switched) {
                    id++;
                    observer.onComplete();
                }

            }

        ));

        return new Rx.CompositeDisposable(original, timer);

    }, source);
};

var RxMorse;
RxMorse = (function () {

    var rxMorse = {};

    // -- public --

    rxMorse.init = function (props, padsel, tickersel) {

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


        var keyboardSubject = new Rx.Subject();
        var keyboardLast = null;

        keyboard.subscribe(
            function (x) {
                keyboardSubject.onNext(x);
                xmod = {
                    timestamp: x.timestamp,
                    value: x.value + '*'
                };
                keyboardLast = x.timestamp;

                Rx.Observable.just(xmod)
                    .delay(3*unit)
                    .subscribe(
                        function (x1) {
                            if (x1.timestamp == keyboardLast) {
                                keyboardSubject.onNext(x1);
                            }
                        }
                    )
            },
            function (e) { keyboardSubject.onError(); },
            function () { keyboardSubject.onCompleted() }
        );

        var mouseSubject = new Rx.Subject();
        var mouseLast = null;

        mouse.subscribe(
            function (x) {
                mouseSubject.onNext(x);
                xmod = {
                    timestamp: x.timestamp,
                    value: x.value + '*'
                };
                mouseLast = x.timestamp;

                Rx.Observable.just(xmod)
                    .delay(3*unit)
                    .subscribe(
                    function (x1) {
                        if (x1.timestamp == mouseLast) {
                            mouseSubject.onNext(x1);
                        }
                    }
                )
            },
            function (e) { mouseSubject.onError(); },
            function () { mouseSubject.onCompleted() }
        );

        var source = Rx.Observable.merge(mouseSubject, keyboardSubject)
            .filter(function (x) {
                return x.value != 'keyup*' && x.value != 'mouseup*';
            })
            .map(function (a) {

                var typ;

                switch (a.value) {
                    case 'keydown':
                    case 'mousedown':
                        typ = 'down'; break;
                    case 'keyup':
                    case 'mouseup':
                        typ = 'up'; break;
                    //case 'keyup*':
                    case 'keydown*':
                    //case 'mouseup*':
                    case 'mousedown*':
                        typ = 'up'; break;
                    default:
                        typ = 'forgetaboutit'
                }

                return typ;
            })
            .distinctUntilChanged()
            .timeInterval();

        var symbols = source.filter(function (e) {return e.type != ''}).map(function (e) {
           if (e.type == 'down') {
               if (e.duration < unit) {
                   return '=';
               } else if (e.duration >= unit) {
                   return '===';
               }
           } else if (e.type == '.') {
               if (e.duration  < 3*unit) {
                   return '.';
               } else if (e.duration >= 3*unit && e.duration < 7*unit) {
                   return '...';
               } else if (e.duration >= 7*unit && e.duration < 20*unit){
                   return '.......';
               } else {
                   return '...........';
               }
           } else if (e.type == '!') {
               return '.';
           }
        });

        var end = '';
        var huffman = {
            // 0 level
             '' : { '===' : 'T', '=' : 'E'},

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
            // @todo .. clean up previos levels to confirm to ITU M.1677 : International Morse code
            // @todo .. fill V level table
            // @todo .. add 1.1.3 Punctuation marks and miscellaneous signs

        };

        var transformed = Rx.Observable.concat(
            Rx.Observable.fromArray(['']),
            symbols
        );


        var out = transformed.scan(
                function (acc, x) {
                    switch (x){
                        case '' :
                        case 'e' :
                        case '.' :
                            return acc;

                        case '...':
                        case '.......':
                        case '..........':
                            return '';


                        case '=':
                        case '===' :
                            var a = huffman[acc];
                            return (a != undefined ? a[x] : '');
                    }
                }
        );


        //var toContinue = transformed.timeoutContinue(3*unit, 't');

        //var subscription1 = Rx.Observable.zipArray(transformed, out).subscribe(
        //    function (x) {
        //        console.log(x)
        //    }
        //);
        var subscription2 = source.subscribe(function (e) {
           console.log(e.interval + " // "  + e.value)
        });

        //var subscription2 = symbols.subscribe(
        //    function (x) {
        //        ticker.innerHTML += (x == '..........' ? "<br/>" : x + ", ") ;
        //    }
        //);


        //


    };

    return rxMorse;
})();
