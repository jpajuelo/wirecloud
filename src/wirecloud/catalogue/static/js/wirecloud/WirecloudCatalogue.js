/*
 *     (C) Copyright 2012 Universidad Politécnica de Madrid
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

/*global CatalogueResource, gettext, interpolate, LayoutManagerFactory, LogManagerFactory, OpManagerFactory, ShowcaseFactory, Wirecloud, Template, URIs*/

(function () {

    "use strict";

    var WirecloudCatalogue, _onSearchSuccess, _onSearchError, deleteSuccessCallback, deleteErrorCallback, check_upload_iframe_result;

    _onSearchSuccess = function _onSearchSuccess(transport) {
        var preferred_versions, i, data, key, raw_data, resources, resource;

        raw_data = JSON.parse(transport.responseText);
        if (raw_data.resources) {
            preferred_versions = Wirecloud.utils.CookieManager.readCookie('preferred_versions', true);
            if (preferred_versions === null) {
                preferred_versions = {};
            }

            resources = [];

            for (i = 0; i < raw_data.resources.length; i += 1) {
                resource = new CatalogueResource(raw_data.resources[i]);
                resources.push(resource);
                key = resource.getVendor() + '/' + resource.getName();
                if (key in preferred_versions) {
                    resource.changeVersion(preferred_versions[key]);
                }
            }

            data = {
                'resources': resources,
                'preferred_versions': preferred_versions,
                'current_page': this.options.starting_page,
                'total_count': parseInt(raw_data.items, 10)
            };

            this.onSuccess(data, data);
        }
    };

    _onSearchError = function _onSearchError(transport) {
        this.onError();
    };

    deleteSuccessCallback = function deleteSuccessCallback(transport) {
        this.onSuccess();
    };

    deleteErrorCallback = function deleteErrorCallback(transport, e) {
        var msg, logManager;

        logManager = LogManagerFactory.getInstance();
        msg = logManager.formatError(gettext("Error deleting resource: %(errorMsg)s."), transport, e);

        logManager.log(msg);

        this.onError(msg);
    };

    check_upload_iframe_result = function check_upload_iframe_result() {
        var doc, logManager, msg;

        if (this.iframe.contentDocument) {
            doc = this.iframe.contentDocument;
        } else if (this.iframe.contentWindow) {
            doc = this.iframe.contentWindow.document;
        } else {
            doc = window.frames[this.iframe.id].document;
        }

        if (doc.location.href === 'about:blank') {
            return;
        }

        if (doc.location.href.search("error") >= 0) {
            logManager = LogManagerFactory.getInstance();
            msg = gettext("The resource could not be added to the catalogue: %(errorMsg)s.");
            msg = interpolate(msg, {errorMsg: doc.body.textContent}, true);
            logManager.log(msg);

            if (typeof this.onFailure === 'function') {
                this.onFailure(msg);
            }
        } else if (typeof this.onSuccess === 'function') {
            if (typeof this.onSuccess === 'function') {
                this.onSuccess();
            }
        }
    };

    /*************************************************************************/
    WirecloudCatalogue = function WirecloudCatalogue(options) {

        Object.defineProperty(this, 'name', {'value': options.name});
        Object.defineProperty(this, 'permissions', {'value': options.permissions});

        if (options.url == null) {
            options.url = Wirecloud.URLs.LOCAL_REPOSITORY;
        } else if (options.url[options.url.length - 1] !== '/') {
            options.url += '/';
        }

        this.view_all_template = new Template(options.url + URIs.GET_POST_RESOURCES + '/#{starting_page}/#{resources_per_page}');
        this.simple_search_template = new Template(options.url + URIs.GET_RESOURCES_SIMPLE_SEARCH + '/simple_or/#{starting_page}/#{resources_per_page}');

        Object.defineProperty(this, 'RESOURCE_ENTRY', {
            value: new Template(options.url + 'catalogue/resource/#{vendor}/#{name}/#{version}')
        });
        Object.defineProperty(this, 'RESOURCE_COLLECTION', {value: options.url + 'catalogue/resources'});
    };

    WirecloudCatalogue.prototype.isAllow = function isAllow(action) {
        if (action in this.permissions) {
            return this.permissions[action];
        } else {
            return false;
        }
    };

    WirecloudCatalogue.prototype.search = function search(onSuccess, onError, options) {
        var params, url, context;

        params = {
            'search_criteria': options.search_criteria,
            'search_boolean': options.search_boolean,
            'scope': options.scope
        };
        if (options.order_by !== '') {
            params.orderby = options.order_by;
        }

        context = {
            'options': options,
            'onSuccess': onSuccess,
            'onError': onError
        };

        if (options.search_criteria.strip() === '') {
            url = this.view_all_template.evaluate({'starting_page': options.starting_page, 'resources_per_page': options.resources_per_page});
        } else {
            url = this.simple_search_template.evaluate({'starting_page': options.starting_page, 'resources_per_page': options.resources_per_page});
        }
        Wirecloud.io.makeRequest(url, {
            method: 'GET',
            parameters: params,
            onSuccess: _onSearchSuccess.bind(context),
            onFailure: _onSearchError.bind(context)
        });
    };

    WirecloudCatalogue.prototype.addResourceFromURL = function addResourceFromURL(url, options) {
        if (typeof options != 'object') {
            options = {};
        }

        Wirecloud.io.makeRequest(this.RESOURCE_COLLECTION, {
            method: 'POST',
            parameters: {'template_uri': url, packaged: !!options.packaged, force_create: !!options.forceCreate},
            onSuccess: function (transport) {
                if (typeof options.onSuccess === 'function') {
                    options.onSuccess();
                }
            }.bind(this),
            onFailure: function (transport) {
                var msg = LogManagerFactory.getInstance().formatError(gettext("Error adding resource from URL: %(errorMsg)s."), transport);
                LogManagerFactory.getInstance().log(msg);

                if (typeof options.onFailure === 'function') {
                    options.onFailure(msg);
                }
            },
            onComplete: function () {
                if (typeof options.onComplete === 'function') {
                    options.onComplete();
                }
            }
        });
    };

    WirecloudCatalogue.prototype.deleteResource = function deleteResource(resource, onSuccess, onError) {
        var url, context;

        url = this.RESOURCE_ENTRY.evaluate({
            vendor: resource.getVendor(),
            name: resource.getName(),
            version: resource.getVersion().text
        });

        context = {
            catalogue: this,
            resource: resource,
            onSuccess: onSuccess,
            onError: onError
        };

        // Send request to delete de widget
        Wirecloud.io.makeRequest(url, {
            method: 'DELETE',
            onSuccess: deleteSuccessCallback.bind(context),
            onFailure: deleteErrorCallback.bind(context),
            onException: deleteErrorCallback.bind(context)
        });
    };

    WirecloudCatalogue.prototype.buildUploadIframe = function buildUploadIframe(iframe_id, onSuccess, onFailure) {
        var context, iframe;

        iframe = document.createElement('iframe');
        iframe.frameborder = 0;
        iframe.style.cssText = 'display:none;';
        iframe.id = iframe.name = iframe_id;

        context = {
            catalogue: this,
            iframe: iframe,
            onSuccess: onSuccess,
            onFailure: onFailure
        };

        iframe.onload = check_upload_iframe_result.bind(context);

        return iframe;
    };

    Wirecloud.WirecloudCatalogue = WirecloudCatalogue;
})();
