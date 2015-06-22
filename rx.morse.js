/**
 * Created by aleksandar on 6/21/15.
 */


Rx.Observable.prototype.timeoutContinue = function(dueTime, element, predicate, scheduler) {
    Rx.Scheduler.isScheduler(scheduler) || (scheduler = Rx.Scheduler.timeout);

    var source = this, schedulerMethod = dueTime instanceof Date ?
        'scheduleWithAbsolute' :
        'scheduleWithRelative';

    return new Rx.AnonymousObservable(function (observer){
        var id = 0;
        var switched = false;
        var timer = new Rx.SerialDisposable();
        var original = new Rx.SingleAssignmentDisposable();

        function createTimer() {
            var myId = id;

            timer.setDisposable(scheduler[schedulerMethod](dueTime, function() {
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
        var mousedown = Rx.Observable.fromEvent(pad, 'mousedown').filter(function (e) {return e.button == 0});

        var mouseup = Rx.Observable.fromEvent(pad, 'mouseup').filter(function (e) {return e.button == 0});
        var keydown = Rx.Observable.fromEvent(document, 'keydown').filter(function (e) {return e.which == 32; });


        var keyup = Rx.Observable.fromEvent(document, 'keyup').filter(function (e) {return e.which == 32;});

        var mouse = Rx.Observable.merge(mousedown, mouseup)
            .do(function(e) {e.preventDefault()})
            .map(function(e) {return e.type})
            .distinctUntilChanged()
            .timeoutContinue(unit, 'timeout', function(x) {return x == 'mouseup'})
            .timeInterval();


        var keyboard = Rx.Observable.merge(keydown, keyup)
            .do(function(e) {e.preventDefault()})
            .map(function(e) {return e.type})
            .distinctUntilChanged()
            .timeoutContinue(unit, 'timeout', function(x) {return x == 'keyup'})
            .timeInterval();

        var source = Rx.Observable.merge(mouse, keyboard)
            .map(function (a) {

                var typ;

                switch (a.value) {
                    case 'keydown':
                    case 'mousedown':
                        typ = '='; break;
                    case 'keyup':
                    case 'mouseup':
                        typ = ''; break;
                    case 'timeout':
                        typ = '!';

                }

                return {
                    duration : a.interval,
                    type: typ
                }
            });

        var symbols = source.filter(function (e) {return e.type != ''}).map(function (e) {
           if (e.type == '=') {
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
           console.log(e)
        });

        var subscription2 = symbols.subscribe(
            function (x) {
                ticker.innerHTML += (x == '..........' ? "<br/>" : x) ;
            }
        );


        //


    };

    return rxMorse;
})();
