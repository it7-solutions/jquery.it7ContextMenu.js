/**
 *
 * jquery.it7ContextMenu.js
 * @summary Context menu jQuery plugin
 * @see https://github.com/it7-solutions/jquery.it7ContextMenu.js
 *
 * @version: 1.0.0
 * @author ANEKHERo.SyS aka Kolodyazhni Andrew
 *
 * @licence MIT License http://www.opensource.org/licenses/mit-license
 *
 * @requires jQuery jQuery v1.8.2
 * @requires _ underscore.js v1.4.2
 */
;(function ($, _) {


    /* Variables */
    var run = false;
    var popupClass = 'it7ContextMenuPopUp';
    var popupSelector = '.' + popupClass;
    var itemSelector = popupSelector + ' [data-name]';
    var defaultOptions = {
        // Static generate menu data
        menu: undefined,
        // Method for dynamic generate menu data
        getMenu: undefined,
        // Menu popup underscore-template
        popUpTemplate: '<ul data-key="<%= key %>"><% _.each(menu.items, function(i){ %><li data-name="<%-i.name%>"><a><%-i.text%></a></li><% }) %></ul>',
        // Error message style (!) Work for all menu instances
        // 0 - hide
        // 1 - show native alert
        errorMessage: 1,
        // Run-time variables
        runtime: {
            // click event
            event: undefined,
            // click event element
            element: undefined,
            // current menu
            menu: undefined
        }
    };
    var o = {};


    /* Methods */
    function it7ContextMenu(options) {
        var key = options.selector;
        // If options have selector
        // - init or update options
        if (key) {
            // If selector already present
            // - expand current options
            if (o[key]) {
                $.extend(o[key], options);
            }
            // If new selector
            // - save options
            // - set listener for selector
            else {
                o[key] = $.extend({}, defaultOptions, o[key], options);
                $(document).on('click', key, function (e) {
                    e.preventDefault();
                    showPopup(o[key], this, e);
                });
            }
        }
        // If options without selector
        // - update default options
        else {
            $.extend(defaultOptions, options);
        }


        // First run - set listeners
        if (!run) {
            run = !run;
            // Listener for menu items
            $(document).on('click', itemSelector, function () {
                // Find menu key in DOM
                var key = $(this).closest('[data-key]').data('key');
                // Find menu options by key
                var data = o[key];
                // Find menu item name
                var itemName = $(this).data('name');
                itemName || (itemName = $(this).closest('[data-name]').data('name'));
                // Find menu item options
                var itemMenu= _.find(data.runtime.menu.items, function (i) {
                    return i.name == itemName;
                });
                // Find callback for menu item
                var itemCallback = itemMenu ? itemMenu.onClick : undefined;
                // If menu item not have callback
                // - use menu callback
                if (!_.isFunction(itemCallback)) {
                    itemCallback = data.onClick;
                }
                // If callback method correct
                // - call callback
                if (_.isFunction(itemCallback)) {
                    // If callback return false
                    // - hide popup
                    if (itemCallback(data.runtime.element, itemName) !== false) {
                        hidePopup();
                    }
                }
                // If callback not found
                // - show error
                else {
                    showError('Cannot find action for selector "' + data.selector + '"');
                }
            });

            // Listener for mouse out
            jQuery(document).on('mouseleave', popupSelector, function(){
                hidePopup();
            });
        }
    }

    /**
     * Show popup with menu items
     *
     * @param data
     * @param element
     * @param event
     */
    function showPopup(data, element, event) {
        hidePopup();
        data.runtime.element = element;
        data.runtime.event = event;
        var status = getMenu(data, element, event, function (menu) {
            prepareMenu(data, menu);
            renderMenu(data, menu, event);
        });
        if (!status) {
            showError('Cannot find menu definition for selector "' + data.selector + '"');
        }
    }

    /**
     * Hide popup
     */
    function hidePopup() {
        $(popupSelector).remove();
    }

    /**
     * Get menu from user options
     * - and return by callback
     *
     * Theoretically possible to use asynchronous requests - not tested
     *
     * @param data
     * @param element
     * @param event
     * @param callback
     * @returns {boolean}
     */
    function getMenu(data, element, event, callback) {
        // If defined static menu data
        // - return by callback
        if (_.isObject(data.menu)) {
            callback(data.menu);
            return true;
        }
        // If defined method for dynamic menu data
        // - get menu data by method
        // - and return by callback
        else if (_.isFunction(data.getMenu)) {
            data.getMenu(function (menu) {
                callback(menu);
            }, element, event);
            return true;
        }
        // Else return error flag
        return false;
    }

    /**
     * Prepare menu
     *
     * If menu item not have name
     * - named
     *
     * If in menu item not defined callback метод - show error
     *
     * @param data
     * @param menu
     */
    function prepareMenu(data, menu) {
        data.runtime.menu = menu;
        _.each(data.runtime.menu.items, function(i, k){
            if(!i.name){
                i.name = k + "_" + Math.random();
                if(!_.isFunction(i.onClick)){
                    showError('For selector "' + data.selector + '" found item without name and onClick callback.');
                }
            }
        });
    }

    /**
     * - Render menu template
     * - Create HTML-element and append to DOM
     *
     * @param data
     * @param menu
     * @param event
     */
    function renderMenu(data, menu, event) {
        // Render underscore template
        var html = _.template(data.popUpTemplate)({
            key: data.selector,
            menu: menu
        });
        // Create element
        var $popup = $('<div>').addClass(popupClass).append(html);
        // Append to DOM
        jQuery('body').append($popup);
        // Positioning
        $popup.css({
            position: 'absolute',
            left: event.pageX - 15,
            top: event.pageY - 15
        });
    }

    /**
     * Show error Message
     *
     * @param message
     */
    function showError(message) {
        if(defaultOptions.errorMessage){
            alert('Javascript runtime error: ' + message);
        }
    }


    /* Register plugin in jQuery namespace */
    $.it7ContextMenu = it7ContextMenu;

})(jQuery, _);
