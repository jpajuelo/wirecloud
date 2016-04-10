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

    describe("Styled Fragment", function () {
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
            var element = new StyledElements.Fragment();

            expect(element instanceof StyledElements.StyledElement).toBeTruthy();
            expect(element.wrapperElement).toBeNull();
            expect(element.children).toEqual([]);
        });

        it("should append an array of elements specified by the constructor", function () {
            var element = new StyledElements.Fragment(["test", "second"]);

            expect(element.children.length).toEqual(2);
            expect(element.children[0] instanceof window.Text).toBeTruthy();
            expect(element.children[0].textContent).toEqual("test");
            expect(element.children[1] instanceof window.Text).toBeTruthy();
            expect(element.children[1].textContent).toEqual("second");
        });

        it("should append a plain text specified by the constructor", function () {
            var element = new StyledElements.Fragment("test");

            expect(element.children.length).toEqual(1);
            expect(element.children[0] instanceof window.Text).toBeTruthy();
            expect(element.children[0].textContent).toEqual("test");
        });

        it("should append a HTML string specified by the constructor", function () {
            var element = new StyledElements.Fragment("<strong>test<strong>");

            expect(element.children.length).toEqual(1);
            expect(element.children[0] instanceof window.HTMLElement).toBeTruthy();
            expect(element.children[0].tagName).toEqual("STRONG");
            expect(element.children[0].textContent).toEqual("test");
        });

        it("should append the children of a Fragment specified by the constructor", function () {
            var element1 = new StyledElements.Fragment("test");
            var element2 = new StyledElements.Fragment(element1);

            expect(element2.children.length).toEqual(1);
            expect(element2.children[0]).toBe(element1.children[0]);
        });

        it("should not append an empty string specified by the constructor", function () {
            var element = new StyledElements.Fragment("");

            expect(element.children.length).toEqual(0);
        });

        it("should append the children to a HTMLElement", function () {
            var element = new StyledElements.Fragment(["test", "second"]);
            element.appendTo(dom);

            expect(dom.childNodes[0]).toBe(element.children[0]);
            expect(dom.childNodes[1]).toBe(element.children[1]);
            expect(dom.textContent).toEqual("testsecond");
        });

        it("should not throw an exception when the element is repainted with no-repaint children", function () {
            var element = new StyledElements.Fragment("test");

            expect(element.repaint.bind(element)).not.toThrow();
        });
    });

})();
