/*
 *     Copyright (c) 2012-2016 CoNWeT Lab., Universidad Politécnica de Madrid
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

/*globals StyledElements */


(function (se, utils) {

    "use strict";

    // ==================================================================================
    // CLASS DEFINITION
    // ==================================================================================

    /**
     * Creates a new instance of class ToggleButton.
     * @name StyledElements.ToggleButton
     * @since 0.5
     *
     * @constructor
     * @extends {StyledElements.Button}
     *
     * @param {Object} [options]
     * @property {Boolean} [options.initiallyChecked=false]
     */
    se.ToggleButton = function ToggleButton(options) {
        this.superClass(options);
        options = utils.merge(utils.clone(defaults), options);

        if (options.checkedIcon == null) {
            options.checkedIcon = options.icon;
        }

        if (options.checkedText == null) {
            options.checkedText = options.text;
        }

        this._icon = options.icon;
        this._checkedIcon = options.checkedIcon;

        this._text = options.text;
        this._checkedText = options.checkedText;

        // define properties

        var _active = false;

        Object.defineProperties(this, {
            /**
             * @memberof StyledElements.ToggleButton#
             * @since 0.5
             *
             * @type {!Boolean}
             */
            active: {
                get: function get() {
                    return _active;
                },
                set: function set(active) {
                    _active = set_active.call(this, _active, !!active);
                }
            }
        });

        // set up properties

        this.active = options.initiallyChecked;
    };

    // ==================================================================================
    // PUBLIC MEMBERS
    // ==================================================================================

    utils.inherit(se.ToggleButton, se.Button, /** @lends StyledElements.ToggleButton.prototype */{

        _clickCallback: function _clickCallback(event) {
            event.stopPropagation();
            this.click();
        },

        /**
         * @returns {StyledElements.ToggleButton}
         *     The instance on which the member is called.
         */
        click: function click() {

            if (this.enabled) {
                this.active = !this.active;
                this.trigger('click');
            }

            return this;
        }

    });

    // ==================================================================================
    // PRIVATE MEMBERS
    // ==================================================================================

    var defaults = {
        initiallyChecked: false
    };

    var set_active = function set_active(active, newActive) {

        if (active !== newActive) {
            active = newActive;
            this.toggleClassName('active', active);

            if (this.icon) {
                this.icon.src = active ? this._checkedIcon : this._icon;
            }

            if (this.label) {
                this.label.textContent = active ? this._checkedText : this._text;
            }
        }

        return active;
    };

})(StyledElements, StyledElements.Utils);
