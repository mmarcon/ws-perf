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

 
describe('Controller', function(){
	var WSPERF = window.WSPERF;
	var C = WSPERF.Controller;
	describe('Notifies Subscribers for route changes', function(){
		beforeEach(function() {
			C.reset();
		});
		it('Subscribes for a route', function(){
			C.subscribe(/\/hello/, function(){});
			expect(C.subscribers()).toBe(1);
		});
		it('Subscribes for a route with a wrong callback parameter', function(){
			C.subscribe(/\/hello/, 'foo');
			expect(C.subscribers()).toBe(0);
		});
		it('Subscribes for a route and gets notified as expected', function(){
			var spy = jasmine.createSpy('Route subscription callback');
			C.subscribe(/\/hello/, spy);
			expect(C.subscribers()).toBe(1);
			C.open('/hello');
			expect(spy).toHaveBeenCalledWith('/hello', []);
		});
		it('Subscribes for a route and gets notified as expected when the path is after the hash', function(){
			var spy = jasmine.createSpy('Route subscription callback');
			C.subscribe(/\/hello/, spy);
			expect(C.subscribers()).toBe(1);
			C.open('#/hello');
			expect(spy).toHaveBeenCalledWith('/hello', []);
		});
		it('Subscribes for a route and gets notified as expected with parameters', function(){
			var spy = jasmine.createSpy('Route subscription callback');
			C.subscribe(/\/hello-(\d+)$/, spy);
			expect(C.subscribers()).toBe(1);
			C.open('/hello-123456');
			expect(spy).toHaveBeenCalledWith('/hello', ['123456']);
		});
	});
});