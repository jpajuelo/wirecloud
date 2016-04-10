/*
 *     Copyright (c) 2016 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of Wirecloud Platform.
 *
 *     Wirecloud Platform is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     Wirecloud is distributed in the hope that it will be useful, but WITHOUT
 *     ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *     FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public
 *     License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with Wirecloud Platform.  If not, see
 *     <http://www.gnu.org/licenses/>.
 *
 */

/* jshint jasmine:true */
/* globals StyledElements */

(function () {

    "use strict";

    describe("Styled ObjectWithEvents", function () {
        var dom = null;

        beforeEach(function () {
            dom = document.createElement('div');
            document.body.appendChild(dom);
        });

        afterEach(function () {
            if (dom != null) {
                dom.remove();
                dom = null;
            }
        });

        it("should create an instance with no options", function () {
            var element = new StyledElements.ObjectWithEvents();

            expect(Object.keys(element.events)).toEqual([]);
        });

        it("should dispatch an event", function () {
            var element = new StyledElements.ObjectWithEvents(['click']);
            var callback = jasmine.createSpy('callback');

            element.addEventListener('click', callback);
            element.trigger('click');
            expect(callback).toHaveBeenCalled();
        });

        it("should throw an exception when an empty event is given", function () {
            var element = new StyledElements.ObjectWithEvents();

            expect(element.addEventListener.bind(element, "")).toThrowError(TypeError);
        });

        it("should throw an exception when an handler is attached to non-existent event", function () {
            var element = new StyledElements.ObjectWithEvents(['click']);

            expect(element.addEventListener.bind(element, "mouseenter")).toThrowError(Error);
        });

        it("should remove an event handler attached", function () {
            var element = new StyledElements.ObjectWithEvents(['click']);
            var callback = jasmine.createSpy('callback');

            element.addEventListener('click', callback);
            element.removeEventListener('click', callback);
            element.trigger('click');
            expect(callback).not.toHaveBeenCalled();
        });

        it("should clear an event", function () {
            var element = new StyledElements.ObjectWithEvents(['click']);
            var callback1 = jasmine.createSpy('callback1');
            var callback2 = jasmine.createSpy('callback2');

            element.addEventListener('click', callback1);
            element.addEventListener('click', callback2);
            element.clearEvent('click');

            element.trigger('click');
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });

        it("should clear all the events", function () {
            var element = new StyledElements.ObjectWithEvents(['click', 'mouseenter']);
            var callback1 = jasmine.createSpy('callback1');
            var callback2 = jasmine.createSpy('callback2');

            element.addEventListener('click', callback1);
            element.addEventListener('mouseenter', callback2);
            element.clearEvent();

            element.trigger('click');
            element.trigger('mouseenter');
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });
    });

})();
