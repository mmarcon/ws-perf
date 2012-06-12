//Mobile Safari
window.addEventListener("load",function(){setTimeout(function(){window.scrollTo(0, 1);},0);});
(function(window){
    'use strict';
    var W = window.WSPERF = {},$;
    $ = function(selector,all){
        var ret, d = document;
        $.emptyElement = d.createElement('div');
        if(all) {
            ret = d.querySelectorAll(selector);
        }
        else {
            ret = d.querySelector(selector);
            if (!ret) {
                //Return a fake element so I don't have to bother
                //checking if the result is undefined
                ret = $.emptyElement;
            }
        }
        return ret;
    };

    W.BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
            this.OS = this.searchString(this.dataOS) || "an unknown OS";
        },
        searchString: function (data) {
            for (var i=0;i<data.length;i++) {
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            },
            {   string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            },
            {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            },
            {
                prop: window.opera,
                identity: "Opera",
                versionSearch: "Version"
            },
            {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            },
            {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            },
            {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            },
            {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            },
            {       // for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            },
            {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            },
            {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            },
            {       // for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS : [
            {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            },
            {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            },
            {
               string: navigator.userAgent,
               subString: "iPhone",
               identity: "iPhone/iPod"
            },
            {
               string: navigator.platform,
               subString: "iPad",
               identity: "iPad"
            },
            {
               string: navigator.platform,
               subString: "iPhone",
               identity: "iPhone"
            },
            {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }
        ]

    };


    W.progress = function(message){
        var node = W.progress.node || $('.test-progress'),
        p = document.createElement('p');
        p.innerHTML = message;
        node.appendChild(p);
    };

    W.Controller = (function(){
        var _path = '/',
            _subscribers = [],
            open,
            subscribe,
            reset,
            subscribers,
            _publish,
            _default = function(){};
        open = function(path) {
            _path = path.replace(/^#/,'');
            _publish(_path);
        };

        _publish = function(path) {
            var i, m, somethingMatched = false;
            for (i=0;i<_subscribers.length;i++) {
                m = path.match(_subscribers[i].matcher);
                if (m) {
                    m.shift();
                    _subscribers[i].callback.apply(null, [path, m]);
                    somethingMatched = true;
                }
            }
            if (!somethingMatched) {
                _default.apply(null, [path]);
            }
        };

        subscribe = function(matcher, callback, isDefault) {
            if (typeof callback === 'function') {
                _subscribers.push({matcher: matcher, callback: callback});
                if (isDefault) {
                    _default = callback;
                }
            }
        };

        reset = function() {
            _path = '/';
            _subscribers.length = 0;
        };

        subscribers = function() {
            return _subscribers.length;
        };

        return {
            open: open,
            subscribe: subscribe,
            reset: reset,
            subscribers: subscribers
        };
    })();
    W.Templater = (function(){
        var templates = {},
        init, use;
        init = function(){
            var templateELements = $('.template', true);
            Array.prototype.forEach.call(templateELements, function(e){
                templates[e.id] = {content: e.innerHTML, destination: e.dataset.destination};
            });
        };

        use = function(template, data, callback){
            var t = templates[template],s,el;
            //In case data was skipped and the callback
            //is passed instead...
            if (typeof data === 'function') {
                callback = data;
                data = null;
            }
            data = data || {};
            if (t) {
                s = window.tmpl(t.content,data);
                el = document.querySelector(t.destination);
                el.innerHTML = s;
                if(typeof callback === 'function') {
                    callback.call(null, null);
                }
            }
        };
        init();
        return {
            use: use
        };
    })();
    W.TestSuite = (function(){
        var tests = [], run, getResults, _buildPayload, FNS = {}, Test,
        _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz',
        report = {};

        _buildPayload = function(bytes){
            var randomstring = '',i,rnum;
            bytes = bytes || 1024;
            for (i=0; i<bytes; i++) {
                rnum = Math.floor(Math.random() * _chars.length);
                randomstring += _chars.substring(rnum,rnum+1);
            }
            return randomstring;
        };

        Test = function(payload) {
            this.start = -1;
            this.end = -1;
            this.errors = 0;
            this.close = 0;
            this.done = false;
            this.payload = payload;
            this.info = {};
        };

        Test.prototype.run = function(ondone){
            var ws, onopen, onmessage, onclose, onerror, that = this;
            onopen = function(){
                //Let's get started with the first test
                that.start = Date.now();
                ws.send(that.payload);
            };
            onmessage = function(e){
                that.end = Date.now();
                that.done = true;
                //@todo: figure this out:
                //Mobile Safari iOS 5 fails at opening other sockets if close on
                //the first one is invoked immediately.
                //ws.close();
                setTimeout(function(){
                    ws.close();
                }, 1000);
                if (typeof ondone === 'function') {
                    ondone.call(that, that.getStats());
                }
            };
            onclose = function(p1,p2){
                that.end = Date.now();
                that.close += 1;
                that.info.close = [p1,p2];
                if (typeof ondone === 'function' && that.done === false) {
                    ondone.call(that, that.getStats());
                }
            };
            onerror = function(){
                that.end = Date.now();
                that.error += 1;
                if (typeof ondone === 'function') {
                    ondone.call(that, that.getStats());
                }
            };
            //@fix: this fixes the weird behavior safari has with
            //secure websockets and certificates signed by non trusted
            //authorities. Temporary fix is using non secure connection.
            if (W.BrowserDetect.browser === 'Safari') {
                ws = new WebSocket('ws://' + window.location.host);
            }
            else {
                ws = new WebSocket('wss://' + window.location.host);
            }
            ws.onopen = onopen;
            ws.onmessage = onmessage;
            ws.onclose = onclose;
            ws.onerror = onerror;
        };

        Test.prototype.runXHR = function(ondone){
            var xhr, onloadstart, onload, onclose, onerror, that = this;
            onloadstart = function(){
                //Let's get started with the first test
                that.start = Date.now();
            };
            onload = function(){
                that.end = Date.now();
                that.done = true;
                if (typeof ondone === 'function') {
                    ondone.call(that, that.getStats());
                }
            };
            onerror = function(){
                that.end = Date.now();
                that.error += 1;
                if (typeof ondone === 'function') {
                    ondone.call(that, that.getStats());
                }
            };

            xhr = new XMLHttpRequest();
            xhr.open('POST', '/helper/xhr');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onloadstart = onloadstart;
            xhr.onload = onload;
            xhr.onerror = onerror;
            xhr.send(JSON.stringify({p:that.payload}));
        };

        Test.prototype.getStats = function(){
            var stats = {};
            stats.time = this.end - this.start;
            stats.errors = this.errors > 0;
            stats.close = this.close > 0;
            stats.done = this.done;
            //stats.debug = this.end + '-' + this.start;
            return stats;
        };

        tests.push(function(alldone){
            var ts, small = _buildPayload(1), //Basically no payload
                medium = _buildPayload(1*1024), //1KB
                large = _buildPayload(1*1024*512); //0.5MB
            report.outbandwidth = {};

            W.progress('Testing Websocket upload with small payload');
            ts = new Test(small);
            ts.run(function(stats){
                report.outbandwidth.small = stats;
                W.progress('Testing Websocket upload with medium payload');
                var tm = new Test(medium);
                tm.run(function(stats){
                    report.outbandwidth.medium = stats;
                    W.progress('Testing Websocket upload with large payload');
                    var tl = new Test(large);
                    tl.run(function(stats){
                        report.outbandwidth.large = stats;
                        if(typeof alldone === 'function') {
                            alldone.call(null, report);
                        }
                    });
                });
            });
        });

        tests.push(function(alldone){
            var ts, small = 'payload-request?p=1', //Basically no payload
                medium = 'payload-request?p=1024', //1KB
                large = 'payload-request?p=524288'; //0.5MB
            report.inbandwidth = {};

            W.progress('Testing Websocket download with small payload');
            ts = new Test(small);
            ts.run(function(stats){
                report.inbandwidth.small = stats;
                W.progress('Testing Websocket download with medium payload');
                var tm = new Test(medium);
                tm.run(function(stats){
                    report.inbandwidth.medium = stats;
                    W.progress('Testing Websocket download with large payload');
                    var tl = new Test(large);
                    tl.run(function(stats){
                        report.inbandwidth.large = stats;
                        if(typeof alldone === 'function') {
                            alldone.call(null, report);
                        }
                    });
                });
            });
        });

        tests.push(function(alldone){
            var ts, small = _buildPayload(1), //Basically no payload
                medium = _buildPayload(1*1024), //1KB
                large = _buildPayload(1*1024*512); //0.5MB
            report.xhroutbandwidth = {};

            W.progress('Testing XHR upload with small payload');
            ts = new Test(small);
            ts.runXHR(function(stats){
                report.xhroutbandwidth.small = stats;
                W.progress('Testing XHR upload with medium payload');
                var tm = new Test(medium);
                tm.runXHR(function(stats){
                    report.xhroutbandwidth.medium = stats;
                    W.progress('Testing XHR upload with large payload');
                    var tl = new Test(large);
                    tl.runXHR(function(stats){
                        report.xhroutbandwidth.large = stats;
                        if(typeof alldone === 'function') {
                            alldone.call(null, report);
                        }
                    });
                });
            });
        });

        tests.push(function(alldone){
            var ts, small = '1', //Basically no payload
                medium = '1024', //1KB
                large = '524288'; //0.5MB
            report.xhrinbandwidth = {};

            W.progress('Testing XHR download with small payload');
            ts = new Test(small);
            ts.runXHR(function(stats){
                report.xhrinbandwidth.small = stats;
                W.progress('Testing XHR download with medium payload');
                var tm = new Test(medium);
                tm.runXHR(function(stats){
                    report.xhrinbandwidth.medium = stats;
                    W.progress('Testing XHR download with large payload');
                    var tl = new Test(large);
                    tl.runXHR(function(stats){
                        report.xhrinbandwidth.large = stats;
                        if(typeof alldone === 'function') {
                            alldone.call(null, report);
                        }
                    });
                });
            });
        });

        run = function(ondone){
            var next = function(){
                var fn = tests.shift();
                if (fn) {fn(next);}
                else if(typeof ondone === 'function') {
                    ondone.call(null, W.TestSuite.getResults());
                }
            };
            next();
        };
        getResults = function(){
            report.browser = {
                string: W.BrowserDetect.browser + '-' + W.BrowserDetect.version + '-' + W.BrowserDetect.OS,
                browser: W.BrowserDetect.browser,
                version: W.BrowserDetect.version,
                os: W.BrowserDetect.OS
            };
            return report;
        };

        return {
            run: run,
            getResults: getResults
        };
    })();

    W.attachEventHandlers = function(){
        var createTest = function(e){
            e.preventDefault();
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/test/new');
            xhr.addEventListener('readystatechange', function(xhrp){
                if (this.readyState === 4) {
                    var test = JSON.parse(this.responseText);
                    W.Templater.use('test', {TEST_ID:test.id || '', TEST_URL:test.url || ''}, W.attachEventHandlers);
                }
            });
            xhr.send(null);
            
        },
        runTest = function(e){
            e.preventDefault();
            var testId = this.dataset.test;
            W.Templater.use('runner', {TEST_ID: testId}, W.attachEventHandlers);
            W.TestSuite.run(function(results){
                var seeResultsLink = $('.see-test-results');
                $('.loader').style.visibility = 'hidden';
                W.progress('DONE!');
                //At least for now pass results over using the data attribute in the link
                seeResultsLink.dataset.results = JSON.stringify(results);
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/test/' + testId + '/save');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.addEventListener('readystatechange', function(xhrp){
                    if (this.readyState === 4) {
                        var result = JSON.parse(this.responseText);
                        if (result.status === 'OK') {
                            seeResultsLink.dataset.avg = JSON.stringify(result.avg);
                        }
                        else {
                            seeResultsLink.dataset.avg = 'unavailable';
                        }
                        seeResultsLink.style.visibility = 'visible';
                    }
                });
                xhr.send(JSON.stringify(results));
            });
        },
        showResults = function(e){
            e.preventDefault();
            if (!this.dataset || !this.dataset.results) return;
            W.Templater.use('result', W.attachEventHandlers);
            var results = JSON.parse(this.dataset.results),
                avg = this.dataset.avg === 'unavailable' ? false : JSON.parse(this.dataset.avg),
                chart = $('#raphael'),
                r = Raphael(chart, chart.offsetWidth, chart.offsetHeight),
                data, bars;

            //Draw

            data = [
                [results.outbandwidth.small.time, results.outbandwidth.medium.time, results.outbandwidth.large.time],
                [avg.outbandwidth.small.time, avg.outbandwidth.medium.time, avg.outbandwidth.large.time],
                [results.inbandwidth.small.time, results.inbandwidth.medium.time, results.inbandwidth.large.time],
                [avg.inbandwidth.small.time, avg.inbandwidth.medium.time, avg.inbandwidth.large.time],
                [results.xhroutbandwidth.small.time, results.xhroutbandwidth.medium.time, results.xhroutbandwidth.large.time],
                [avg.xhroutbandwidth.small.time, avg.xhroutbandwidth.medium.time, avg.xhroutbandwidth.large.time],
                [results.xhrinbandwidth.small.time, results.xhrinbandwidth.medium.time, results.xhrinbandwidth.large.time],
                [avg.xhrinbandwidth.small.time, avg.xhrinbandwidth.medium.time, avg.xhrinbandwidth.large.time]
            ];

            bars = r.barchart(0, 0, chart.offsetWidth, chart.offsetHeight, data, {legendcolor:'#fff'});
            bars.label();
        };
        $('.create-test').addEventListener('click', createTest, true);
        $('.run-test').addEventListener('click', runTest, true);
        $('.see-test-results').addEventListener('click', showResults, true);
    };

    window.addEventListener('load', function(){
        W.BrowserDetect.init();
        W.Controller.subscribe(/\/$/, function(){
            W.Templater.use('home', W.attachEventHandlers);
        });
        W.Controller.subscribe(/\/test\/(test-\d+-\d+)$/, function(path, matches){
            W.Templater.use('test', {TEST_ID:matches[0], TEST_URL:window.location}, W.attachEventHandlers);
        });
        W.Controller.subscribe(/\/404/, function(){
            W.Templater.use('not-found', W.attachEventHandlers);
        }, true);
        W.Controller.open(window.location.pathname);

        //@todo: Load raphael asynchronously

    });
})(window);