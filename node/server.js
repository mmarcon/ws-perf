/*
 * Copyright (C) 2012 Massimiliano Marcon

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:

 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs'),
    privateKey = fs.readFileSync('pem/key.pem').toString(),
    certificate = fs.readFileSync('pem/certificate.pem').toString(),
    express = require('express'),
    app = process.env.PRODUCTION ? express.createServer() : express.createServer({key: privateKey, cert: certificate}),
    path = require('path'),
    WS = require('ws').Server,
    mongoose = require('mongoose'),
    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

var DataStore = (function(){
    var init, store, connection, TestSuiteModel;

    init = function(mongoose, isProduction, connectionString) {
        console.log('Connecting to Mongo [isProduction: ' + isProduction + ']');
        if (isProduction) {
            connection = mongoose.connect(connectionString);
        }
        else {
            connection = mongoose.connect('mongodb://localhost/wsperf');
        }

        var Schema = mongoose.Schema;
        var TestSuite = new Schema({
            id: {type:String, index:true},
            tests: {}
        });
        TestSuiteModel = mongoose.model('WSPerfTestSuite', TestSuite);
    };

    store = function(id, tests) {
        var testSuite = new TestSuiteModel();
        testSuite.id = id;
        testSuite.tests = tests;
        testSuite.markModified('tests');
        testSuite.save();
    };

    computeAverageResults = function(id, callback) {
        TestSuiteModel.find({id:id}, function(err, docs){
            var counter = 0, result = {}, tests;
            docs.forEach(function(value){
                var t, s;
                counter ++;
                result.id = value.get('id');
                tests = value.get('tests');
                for (t in tests) {
                    if (tests.hasOwnProperty(t)) {
                        result[t] = result[t] || {};
                        for (s in tests[t]) {
                            result[t][s] = result[t][s] || {};
                            result[t][s].time = ((typeof result[t][s].time === 'number') ? result[t][s].time * (counter-1) + tests[t][s].time : tests[t][s].time) / counter;
                        }
                    }
                }
            });
            if (typeof callback === 'function'){
                callback.call(result, result);
            }
        });
    };


    return{
        init: init,
        store: store,
        computeAverageResults: computeAverageResults
    };
})();

var generateTestId = function(){
        return 'test-' + Math.random().toFixed(3).replace(/\./, '') + '-' + Math.sqrt(Date.now()).toString().replace(/^\d+\./, '');
    },
    buildPayload = function(bytes){
        var randomstring = '',i,rnum;
        bytes = bytes || 1024;
        for (i=0; i<bytes; i++) {
            rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    };

app.use(express.bodyParser());
app.listen(8000);
app.use(express.static(path.normalize(__dirname + '/web/')));

DataStore.init(mongoose, process.env.PRODUCTION, process.env.MONGO);

app.all('/test/new', function(request, response){
    var hostname = request.headers.host, test, id = generateTestId();
    test = {
        url: 'https://' + hostname + '/test/' + id,
        id: id
    };
    response.send(test);
});

app.get('/test/test-:id', function(request, response){
    response.sendfile(path.normalize(__dirname + '/web/index.html'));
});

app.post('/test/test-:id/save', function(request, response){
    //console.log(request.body);
    DataStore.store(request.params.id, request.body);
    computeAverageResults(request.params.id, function(avg){
        response.send({status: 'OK', avg: avg});
    });
});

app.get('/test/test-:id/results', function(request, response){
    response.sendfile(path.normalize(__dirname + '/web/index.html'));
});

app.all('/helper/xhr', function(request, response){
    var size, time;
    if (request.body) {
        if (request.body.p) {
            size = parseInt(request.body.p, 10);
            response.send(buildPayload(size));
        }
        else if (request.body.t) {
            time = request.body.t;
            console.log('echo: ' + time);
            response.send({t:time});
        }
    }
    else {
        response.send('ACK');
    }
});

var wss = new WS({server: app});
wss.on('connection', function(ws) {
    console.log('WS Connected');
    ws.on('message', function(message) {
        var size, arr, time;
        if ((arr = message.match(/payload-request\?p=(\d+)/))) {
            size = parseInt(arr[1], 10);
            ws.send(buildPayload(size));
        } else if ((arr = message.match(/echo\?t=(\d+)/))) {
            time = arr[1];
            //console.log('echo: ' + time);
            ws.send(time);
        } else {
            console.log(Buffer.byteLength(message, 'utf-8') + " bytes");
            ws.send('ACK');
        }
    });
});