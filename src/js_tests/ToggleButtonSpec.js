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

    describe("Styled ToggleButton", function () {
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
            var element = new StyledElements.ToggleButton();

            expect(element.wrapperElement.className).toEqual("se-btn");
            expect(element.active).toBeFalsy();
        });

        it("should change the state when the element is clicked", function () {
            var element = new StyledElements.ToggleButton();

            element.click();
            expect(element.active).toBeTruthy();
            element.click();
            expect(element.active).toBeFalsy();
        });

        it("can dispatch the click event when the element is enabled", function () {
            var element = new StyledElements.ToggleButton();
            var callback = jasmine.createSpy('callback');

            element.on('click', callback);
            element.click();
            expect(callback).toHaveBeenCalled();
        });

        it("cannot dispatch the click event when the element is disabled", function () {
            var element = new StyledElements.ToggleButton();
            var callback = jasmine.createSpy('callback');

            element.on('click', callback);
            element.disable();
            element.click();
            expect(callback).not.toHaveBeenCalled();
        });

        it("should change the state and also the text when a checked text is given", function () {
            var element = new StyledElements.ToggleButton({
                text: "test",
                checkedText: "active"
            });

            element.click();
            expect(element.wrapperElement.textContent).toEqual("active");
            element.wrapperElement.click();
            expect(element.wrapperElement.textContent).toEqual("test");
        });
    });

})();
