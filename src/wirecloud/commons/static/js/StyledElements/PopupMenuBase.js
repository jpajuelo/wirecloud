/*
 *     Copyright (c) 2011-2015 CoNWeT Lab., Universidad Politécnica de Madrid
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

/*global StyledElements, Wirecloud*/

(function (se, utils) {

    "use strict";

    var POPUP_POSITIONS = ['left-bottom', 'right-bottom', 'top-left', 'top-right', 'bottom-right', 'bottom-left'];
    Object.freeze(POPUP_POSITIONS);

    var DEFAULT_PLACEMENT = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
    Object.freeze(DEFAULT_PLACEMENT);


    var setPosition = function setPosition(refPosition, placement) {
        var i = 0;
        for (i = 0; i < POPUP_POSITIONS.length; i++) {
            this.wrapperElement.classList.remove('se-popup-menu-' + POPUP_POSITIONS[i]);
        }

        this.wrapperElement.classList.add('se-popup-menu-' + placement);
        switch (placement) {
        case 'left-bottom':
            this.wrapperElement.style.left = (refPosition.left - this.wrapperElement.offsetWidth + 1) + "px";
            this.wrapperElement.style.top = (refPosition.top - 1) + "px";
            break;
        case 'right-bottom':
            this.wrapperElement.style.left = (refPosition.right - 1) + "px";
            this.wrapperElement.style.top = (refPosition.top - 1) + "px";
            break;
        case 'top-left':
            this.wrapperElement.style.top = (refPosition.top - this.wrapperElement.offsetHeight + 1) + "px";
            this.wrapperElement.style.left = refPosition.left + "px";
            break;
        case 'top-right':
            this.wrapperElement.style.top = (refPosition.top - this.wrapperElement.offsetHeight + 1) + "px";
            this.wrapperElement.style.left = (refPosition.right - this.wrapperElement.offsetWidth) + "px";
            break;
        case 'bottom-right':
            this.wrapperElement.style.top = (refPosition.bottom - 1) + "px";
            this.wrapperElement.style.left = (refPosition.right - this.wrapperElement.offsetWidth) + "px";
            break;
        default:
        case 'bottom-left':
            this.wrapperElement.style.top = (refPosition.bottom - 1) + "px";
            this.wrapperElement.style.left = refPosition.left + "px";
            break;
        }
    };

    var standsOut = function standsOut() {
        var parent_box = this.wrapperElement.parentElement.getBoundingClientRect();
        var element_box = this.wrapperElement.getBoundingClientRect();

        var visible_width = element_box.width - Math.max(element_box.right - parent_box.right, 0) - Math.max(parent_box.left - element_box.left, 0);
        var visible_height = element_box.height - Math.max(element_box.bottom - parent_box.bottom, 0) - Math.max(parent_box.top - element_box.top, 0);
        var element_area = element_box.width * element_box.height;
        var visible_area = visible_width * visible_height;
        return element_area - visible_area;
    };

    var fixPosition = function fixPosition(refPosition, weights, placements) {
        var best_weight = Math.min.apply(Math, weights);
        var index = weights.indexOf(best_weight);
        var placement = placements[index];

        setPosition.call(this, refPosition, placement);

        var parent_box = this.wrapperElement.parentElement.getBoundingClientRect();
        var element_box = this.wrapperElement.getBoundingClientRect();

        if (element_box.bottom > parent_box.bottom) {
            this.wrapperElement.style.top = "";
            this.wrapperElement.style.bottom = "10px";
            element_box = this.wrapperElement.getBoundingClientRect();
        }

        if (element_box.top < parent_box.top) {
            this.wrapperElement.style.top = "10px";
        }
    };

    /**
     * @abstract
     */
    var PopupMenuBase = function PopupMenuBase(options) {
        var defaultOptions = {
            oneActiveAtLeast: false,
            placement: null,
            useRefElementWidth: false
        };
        options = StyledElements.Utils.merge(defaultOptions, options);

        if (options.extending) {
            return;
        }

        StyledElements.ObjectWithEvents.call(this, ['itemOver', 'visibilityChange']);

        this.wrapperElement = document.createElement('div');
        this.wrapperElement.className = 'se-popup-menu hidden';
        this._context = null;
        if ('position' in options) {
            // Backwards compatibility
            if (Array.isArray(options.position)) {
                this._placement = options.position;
            } else if (typeof options.position === 'string') {
                this._placement = [options.placement];
            } else {
                this._placement = DEFAULT_PLACEMENT;
            }
        } else {
            if (Array.isArray(options.placement)) {
                this._placement = options.placement;
            } else if (typeof options.placement === 'string') {
                this._placement = [options.placement];
            } else {
                this._placement = DEFAULT_PLACEMENT;
            }
        }

        Object.defineProperties(this, {
            firstSelectableChild: {get: property_firstSelectableChild_get},
            hidden: {get: property_hidden_get},
            lastSelectableChild: {get: property_lastSelectableChild_get},
            oneActiveAtLeast: {value: options.oneActiveAtLeast},
            useRefElementWidth: {value:options.useRefElementWidth}
        });

        this._items = [];
        this._dynamicItems = [];
        this._submenus = [];
        this._menuItemCallback = this._menuItemCallback.bind(this);

        this._menuItem_onactivate_bound = menuItem_onactivate.bind(this);
        this._menuItem_ondeactivate_bound = menuItem_ondeactivate.bind(this);
    };
    PopupMenuBase.prototype = new StyledElements.ObjectWithEvents();

    PopupMenuBase.prototype._append = function _append(child, where) {
        if (child instanceof StyledElements.MenuItem) {
            child.addEventListener('click', this._menuItemCallback);
            child.on('mouseenter focus', this._menuItem_onactivate_bound);
            child.on('mouseleave blur', this._menuItem_ondeactivate_bound);
        } else if (child instanceof StyledElements.SubMenuItem) {
            child.addEventListener('click', this._menuItemCallback);
            child.menuItem.on('mouseenter focus', this._menuItem_onactivate_bound);
            child.menuItem.on('mouseleave blur', this._menuItem_ondeactivate_bound);
            child._setParentPopupMenu(this);
        } else if (child instanceof StyledElements.DynamicMenuItems || child instanceof StyledElements.Separator) {
            // nothing to do
        } else if (child != null) {
            throw new TypeError('Invalid chlid element');
        } else {
            throw new TypeError('The new child element is null');
        }
        where.push(child);
    };

    PopupMenuBase.prototype.append = function append(child) {
        this._append(child, this._items);
    };

    PopupMenuBase.prototype.appendSeparator = function appendSeparator() {
        this.append(new StyledElements.Separator());
    };

    /**
     * Remove all child nodes from the wrapperElement.
     * @version 0.6.1
     *
     * @returns {PopupMenuBase}
     *      The instance on which the member is called.
     */
    PopupMenuBase.prototype.clear = function clear() {
        var i;

        if (!this.hidden) {
            hideContent.call(this);
        }

        this._items = [];

        return this;
    };

    PopupMenuBase.prototype.setContext = function setContext(context) {
        this._context = context;
    };

    PopupMenuBase.prototype._menuItemCallback = function _menuItemCallback(menuItem) {
        if (!menuItem.hasClassName("submenu")) {
            this.hide();
        }

        if (typeof menuItem.run === 'function') {
            menuItem.run(this._context, menuItem.context);
        }
    };

    PopupMenuBase.prototype.isVisible = function isVisible() {
        return !this.hidden;
    };

    /**
     * [TODO: hasActiveChild description]
     *
     * @since 0.6.2
     *
     * @return {Boolean} - [TODO: description]
     */
    PopupMenuBase.prototype.hasActiveChild = function hasActiveChild() {
        return !this.hidden && this._activeMenuItem != null;
    };

    /**
     * [TODO: selectActiveChild description]
     *
     * @since 0.6.2
     *
     * @return {StyledElement.PopupMenuBase} - The instance on which the member is called.
     */
    PopupMenuBase.prototype.selectActiveChild = function selectActiveChild() {

        if (this.hasActiveChild()) {
            this._activeMenuItem.select();
        }

        return this;
    };

    PopupMenuBase.prototype.show = function show(refPosition) {
        var i, j, item, generatedItems, generatedItem;

        if (this.isVisible()) {
            return; // This Popup Menu is already visible => nothing to do
        }

        this._selectableChildren = [];
        this._activeMenuItem = null;

        for (i = 0; i < this._items.length; i += 1) {
            item = this._items[i];
            if (item instanceof StyledElements.DynamicMenuItems) {
                generatedItems = item.build(this._context);
                for (j = 0; j < generatedItems.length; j += 1) {
                    generatedItem = generatedItems[j];

                    this._append(generatedItem, this._dynamicItems);

                    if (generatedItem instanceof StyledElements.MenuItem || generatedItem instanceof StyledElements.Separator) {
                        generatedItem.insertInto(this.wrapperElement);
                        if (generatedItem instanceof StyledElements.MenuItem && generatedItem.selectable) {
                            this._selectableChildren.push(generatedItem);
                        }
                    } else if (generatedItem instanceof StyledElements.SubMenuItem) {
                        generatedItem._getMenuItem().insertInto(this.wrapperElement);
                        this._selectableChildren.push(generatedItem.menuItem);
                    }
                }
            } else if (item instanceof StyledElements.MenuItem || item instanceof StyledElements.Separator) {
                item.insertInto(this.wrapperElement);

                if (item instanceof StyledElements.MenuItem && item.selectable) {
                    this._selectableChildren.push(item);
                }
            } else if (item instanceof StyledElements.SubMenuItem) {
                item._getMenuItem().insertInto(this.wrapperElement);
                this._submenus.push(item);
                this._selectableChildren.push(item.menuItem);
            } else {
                this.wrapperElement.appendChild(item);
            }
        }

        if ((this._selectableChildren.length > 0) && this.oneActiveAtLeast) {
            activateMenuItem.call(this, this._selectableChildren[0]);
        }

        this.wrapperElement.classList.remove('hidden');
        try {
            window.parent.document.body.appendChild(this.wrapperElement);
        } catch (e) {
            document.body.appendChild(this.wrapperElement);
        }
        Wirecloud.UserInterfaceManager._registerPopup(this);
        this.events.visibilityChange.dispatch(this);

        if (!('left' in refPosition) && 'x' in refPosition && 'y' in refPosition) {

            this.wrapperElement.style.top = refPosition.y + "px";
            this.wrapperElement.style.left = refPosition.x + "px";
        } else {
            i = 0;
            var weights = [];
            do {
                setPosition.call(this, refPosition, this._placement[i]);
                weights.push(standsOut.call(this));
                i += 1;
            } while (weights[i - 1] > 0 && i < this._placement.length);

            if (weights[i - 1] > 0) {
                fixPosition.call(this, refPosition, weights, this._placement);
            }
        }

        if (this.useRefElementWidth) {
            this.wrapperElement.style.width = refPosition.width + "px";
        }

        this.wrapperElement.style.display = 'block';
    };

    PopupMenuBase.prototype.moveCursorDown = function moveCursorDown() {
        var index;

        if (!this.hasSelectableChildren()) {
            return this;
        }

        if (this._activeMenuItem != null) {
            this._activeMenuItem.deactivate();
            index = this._selectableChildren.indexOf(this._activeMenuItem);

            if (index !== (this._selectableChildren.length - 1)) {
                this._activeMenuItem = this._selectableChildren[index + 1];
            } else {
                this._activeMenuItem = this._selectableChildren[0];
            }
        } else {
            this._activeMenuItem = this._selectableChildren[0];
        }

        this._activeMenuItem.activate();
        this.trigger('itemOver', this._activeMenuItem);

        return this;
    };

    PopupMenuBase.prototype.moveCursorUp = function moveCursorUp() {
        var index;

        if (!this.hasSelectableChildren()) {
            return this;
        }

        if (this._activeMenuItem != null) {
            this._activeMenuItem.deactivate();
            index = this._selectableChildren.indexOf(this._activeMenuItem);

            if (index !== 0) {
                this._activeMenuItem = this._selectableChildren[index - 1];
            } else {
                this._activeMenuItem = this._selectableChildren[(this._selectableChildren.length - 1)];
            }
        } else {
            this._activeMenuItem = this._selectableChildren[(this._selectableChildren.length - 1)];
        }

        this._activeMenuItem.activate();
        this.trigger('itemOver', this._activeMenuItem);

        return this;
    };

    PopupMenuBase.prototype.hide = function hide() {

        if (this.hidden) {
            return this;
        }

        this.wrapperElement.classList.add("hidden");
        this.wrapperElement.style.bottom = "";
        hideContent.call(this);

        utils.removeFromParent(this.wrapperElement);
        Wirecloud.UserInterfaceManager._unregisterPopup(this);

        return this.trigger('visibilityChange');
    };

    PopupMenuBase.prototype.destroy = function destroy() {
        var i, item;

        this.hide();
        for (i = 0; i < this._items.length; i += 1) {
            item = this._items[i];
            if (item instanceof StyledElements.MenuItem) {
                item.destroy();
            }
        }
        this._items = null;
        this._menuItemCallback = null;
        this._context = null;

        StyledElements.StyledElement.prototype.destroy.call(this);
    };

    /**
     * [TODO: hasSelectableChildren description]
     *
     * @since 0.6.2
     *
     * @returns {Boolean} - [TODO: description]
     */
    PopupMenuBase.prototype.hasSelectableChildren = function hasSelectableChildren() {
        return !this.hidden && (this._selectableChildren.length > 0);
    };

    // ==================================================================================
    // PRIVATE MEMBERS
    // ==================================================================================

    var property_firstSelectableChild_get = function property_firstSelectableChild_get() {
        return this.hasSelectableChildren() ? this._selectableChildren[0] : null;
    };

    var property_lastSelectableChild_get = function property_lastSelectableChild_get() {
        return this.hasSelectableChildren() ? this._selectableChildren[this._selectableChildren.length - 1] : null;
    };

    var property_hidden_get = function property_hidden_get() {
        return !utils.XML.isElement(this.wrapperElement.parentNode);
    };

    var activateMenuItem = function activateMenuItem(menuItem) {
        this._activeMenuItem = menuItem.activate();
        this.trigger('itemOver', menuItem);
    };

    var hideContent = function hideContent() {
        var i, item;

        for (i = this._submenus.length - 1; i >= 0; i--) {
            this._submenus[i].hide();
            this._submenus.splice(i, 1);
        }

        for (i = this._dynamicItems.length - 1; i >= 0; i--) {
            item = this._dynamicItems[i];

            if (item instanceof se.SubMenuItem) {
                item.hide();
            }

            item.destroy();
            this._dynamicItems.splice(i, 1);
        }

        this._selectableChildren = [];
        this._activeMenuItem = null;

        this.wrapperElement.innerHTML = "";
    };

    var menuItem_onactivate = function menuItem_onactivate(menuItem) {
        var i;

        for (i = 0; i < this._selectableChildren.length; i++) {
            this._selectableChildren[i].deactivate();
        }

        activateMenuItem.call(this, menuItem);
    };

    var menuItem_ondeactivate = function menuItem_ondeactivate(menuItem) {

        if (this.oneActiveAtLeast) {
            if (this._activeMenuItem !== menuItem) {
                menuItem.deactivate();
            }
        } else {
            if (this._activeMenuItem === menuItem) {
                this._activeMenuItem = null;
            }
            menuItem.deactivate();
        }
    };

    StyledElements.PopupMenuBase = PopupMenuBase;

})(StyledElements, StyledElements.Utils);
