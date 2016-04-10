/*
 *     Copyright (c) 2008-2016 CoNWeT Lab., Universidad Politécnica de Madrid
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

/* global StyledElements */


(function (se, utils) {

    "use strict";

    // ==================================================================================
    // CLASS DEFINITION
    // ==================================================================================

    /**
     * Create a new instance of class ObjectWithEvents
     * @name StyledElements.ObjectWithEvents
     * @since 0.5
     *
     * @constructor
     *
     * @param {String[]} names List of event names to handle
     */
    se.ObjectWithEvents = function ObjectWithEvents(names) {
        this.events = {};

        (Array.isArray(names) ? names : []).forEach(function (name) {
            this.events[name] = new se.Event(this);
        }, this);
    };

    /**
     * @lends StyledElements.ObjectWithEvents.prototype
     */
    se.ObjectWithEvents.prototype = {

        /**
         * Remove an event handler from one or more existing events.
         * @since 0.6
         *
         * @param {String} [names]
         *      Optional. One or more space-separated event names. If not
         *      provided, this method will be applied to all the events.
         * @param {Function} [handler]
         *      Optional. An event handler previously attached. If not
         *      provided, all the event handlers registered for the affected
         *      events will be removed
         * @returns {StyledElements.ObjectWithEvents}
         *      The instance on which the member is called.
         */
        off: function off(names, handler) {
            return this.removeEventListener(names, handler);
        },

        /**
         * Attach an event handler for one or more existing events.
         * @since 0.6
         *
         * @param {String} names
         *      One or more space-separated event names.
         * @param {Function} handler
         *      An event handler to execute when the event is triggered.
         * @returns {StyledElements.ObjectWithEvents}
         *      The instance on which the member is called.
         */
        on: function on(names, handler) {
            return this.addEventListener(names, handler);
        },

        /**
         * Execute all event handlers attached for the existing event.
         * @since 0.6
         *
         * @param {String} name
         *      A string containing a existing event.
         * @returns {StyledElements.ObjectWithEvents}
         *      The instance on which the member is called.
         */
        trigger: function trigger(name) {
            var event = getEvent.call(this, name);

            event.trigger.apply(event, [this].concat(Array.prototype.slice.call(arguments, 1)));

            return this;
        },

        /**
         * Attach an event handler for a given event.
         * @since 0.5
         *
         * @param {String} name
         *      Event name
         * @param {Function} handler
         *      An event handler to execute when the event is triggered
         * @returns {StyledElements.ObjectWithEvents}
         *      The instance on which the member is called
         */
        addEventListener: function addEventListener(names, handler) {

            checkNames(names).forEach(function (name) {
                getEvent.call(this, name).addEventListener(handler);
            }, this);

            return this;
        },

        /**
         * Remove all event handlers for a given event
         * @since 0.5
         *
         * @param {String} name
         *      event name
         * @returns {StyledElements.ObjectWithEvents}
         *      The instance on which the member is called
         */
        clearEvent: function clearEvent(names) {
            names = typeof names !== 'string' ? Object.keys(this.events) : checkNames(names);

            names.forEach(function (name) {
                getEvent.call(this, name).clear();
            }, this);

            return this;
        },

        /**
         * @deprecated since version 0.6
         */
        destroy: function destroy() {
            return this;
        },

        /**
         * Remove an event handler from an event
         * @since 0.5
         *
         * @param {String} name
         *      Event name
         * @param {Function} handler
         *      A previously attached event
         * @returns {StyledElements.ObjectWithEvents}
         *      The instance on which the member is called
         */
        removeEventListener: function removeEventListener(names, handler) {

            checkNames(names).forEach(function (name) {
                getEvent.call(this, name).removeEventListener(handler);
            }, this);

            return this;
        }

    };

    var checkNames = function checkNames(value) {

        if (typeof value !== 'string' || !value.trim().length) {
            throw new TypeError("The parameter 'names' must be a non-empty string");
        }

        return value.trim().split(/\s+/);
    };

    var getEvent = function getEvent(name) {

        if (!(name in this.events)) {
            throw new Error(utils.interpolate("The event '%(name)s' must be registered", {
                name: name
            }));
        }

        return this.events[name];
    };

})(StyledElements, StyledElements.Utils);
