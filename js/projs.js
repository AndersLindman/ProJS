/**
 * ProJS - Prototype JavaScript framework. License and copyright free.
 */

(function (ns) {
    'use strict';

    var Assert = null, Asserted = null, Component = null, Server = null, App = null;

    /**
     * Method for creating and adding elements.
     * @param {string/object} tag
     * @param (object) parent
     * @param (string) className
     * @param (string) text
     * @return {object}
     */
    function c(tag, parent, className, text) {
        var element;
        if (typeof tag === 'string') {
            element = document.createElement(tag);
        } else if (tag.element) {
            element = tag.element;
        } else {
            element = tag;
        }
        if (className) {
            element.className = className;
        }
        if (text) {
            element.innerHTML = text;
        }
        if (parent) {
            parent.appendChild(element);
        }
        return element;
    }

    /**
     * Method for creating objects from prototype objects.
     * @param {object} prototype
     * @return {object} constructed object
     */
    function o(prototype) {
        var i = 0, arg = null, key = null, obj = Object.create(prototype);

        for (i = 1; i < arguments.length; i++) {
            arg = arguments[i];
            for (key in arg) {
                if (arg.hasOwnProperty(key)) {
                    if (!obj[key]) {
                        obj[key] = arg[key];
                    }
                }
            }
        }
        if (Asserted && Asserted.isPrototypeOf(obj) && prototype !== Asserted) {
            if (!obj.assertedPrototypes) {
                obj.assertedPrototypes = [];
            }
            obj.assertedPrototypes.push(prototype);
        }
        if (obj.constructor) {
            obj.constructor();
        }
        return obj;
    }

    /**
     * Component prototype object.
     */
    Component = {};

    /**
     * Adds an event listener.
     * @param {string} type
     * @param {function} listener
     */
    Component.on = function(type, listener) {
        if (!this.listeners) {
            this.listeners = {};
        }
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(listener);
    };

    /**
     * Removes an event listener.
     * @param {string} type
     * @param {function} listener
     */
    Component.off = function(type, listener) {
        var l = null, i = 0, typeName = '';

        if (!this.listeners) {
            return;
        }
        if (typeof type === 'string') {
            l = this.listeners[type];
            if (!l) {
                return;
            }
            i = l.indexOf(listener);
            if (i !== -1) {
                l.splice(i, 1);
            }
        } else {
            listener = type;
            for (typeName in this.listeners) {
                if (this.listeners.hasOwnProperty(typeName)) {
                    l = this.listeners[typeName];
                    i = l.indexOf(listener);
                    if (i !== -1) {
                        l.splice(i, 1);
                    }
                }
            }
        }
    };

    /**
     * Calls event listeners.
     * @param {string} type
     * @param {object} event
     */
    Component.updateView = function(type, event) {
        var i = 0, listener = null, listeners = null;

        if (!this.listeners) {
            return;
        }
        listeners = this.listeners[type];
        if (listeners) {
            for (i = 0; i < listeners.length; i++) {
                listener = listeners[i];
                if (listener) {
                    listener(event);
                }
            }
        }
    };

    /**
     * Asserted object prototype.
     */
    Asserted = o(Component);
    Asserted.ERROR_ASSERTED_NOT_PROTOTYPE = 'Object must have Asserted as prototype. ';
    Asserted.ERROR_IS_NOT_ASSERTED_PROTOTYPE = 'Only prototype Asserted can call: ';
    Asserted.ERROR_ASSERTION_NOT_REGISTERED = 'Assertion not registered. ';
    Asserted.ERROR_INVALID_ASSERTION_TYPE = 'Invalid assertion type: ';

    Asserted.isAsserted = function() {
        if (!Asserted.isPrototypeOf(this)) {
            throw Asserted.ERROR_ASSERTED_NOT_PROTOTYPE + 'Invalid object: ' + this;
        }
    };

    Asserted.isAssertedPrototype = function(method) {
        if (Asserted.isPrototypeOf(this)) {
            throw Asserted.ERROR_IS_NOT_ASSERTED_PROTOTYPE + method;
        }
    };

    Asserted.isEventTypeRegistered = function(eventType, assertionType) {
        var i = 0, prototypeList = null;

        function isTypeValid(assertedObject) {
            var type = Assert.getAssertionType(eventType, assertedObject);
            if (type === 'io' || type === assertionType) {
                return true;
            }
        }
        if (isTypeValid(this)) {
            return true;
        }
        prototypeList = this.assertedPrototypes;
        if (!prototypeList) {
            return false;
        }
        for (i = 0; i < prototypeList.length; i++) {
            if (isTypeValid(prototypeList[i])) {
                return true;
            }
        }
        return false;
    };

    Asserted.isRegistered = function(eventType, assertionType) {
        if (!Assert.isValidAssertionType(assertionType)) {
            throw Asserted.ERROR_INVALID_ASSERTION_TYPE + '\'' + assertionType +
                    '\' for asserted object: ' + this;
        }
        if (!this.isEventTypeRegistered(eventType, assertionType)) {
            throw Asserted.ERROR_ASSERTION_NOT_REGISTERED + 'Assertion type \'' +
                    assertionType +
                    '\' or \'io\' not registered for event type \'' +
                    eventType + '\' and asserted object: ' + this;
        }
    };

    /**
     * Sends event to asserted listeners.
     * @param {string} type
     * @param {object} event
     * @param {number} milliseconds
     */
    Asserted.send = function(type, event, milliseconds) {
        this.isAsserted();
        this.isRegistered(type, 'sends');
        if (typeof milliseconds === 'number') {
            setTimeout(function() {
                Asserted.updateView(type, event);
            }, milliseconds);
        } else {
            Asserted.updateView(type, event);
        }
    };

    /**
     * Receives events from asserted objects.
     * @param {string} type
     * @param {function} listener
     * @param {number} milliseconds
     */
    Asserted.receive = function(type, listener, milliseconds) {
        this.isAsserted();
        this.isRegistered(type, 'receives');
        if (typeof milliseconds === 'number') {
            setTimeout(function() {
                Asserted.on(type, listener);
            }, milliseconds);
        } else {
            Asserted.on(type, listener);
        }
    };

    /**
     * Removes the specified event listener.
     * @param {string} type
     * @param {function} listener
     * @param {number} milliseconds
     */
    Asserted.disconnect = function(type, listener, milliseconds) {
        this.isAsserted();
        this.isRegistered(type, 'receives');
        if (typeof milliseconds === 'number') {
            setTimeout(function() {
                Asserted.off(type, listener);
            }, milliseconds);
        } else {
            Asserted.off(type, listener);
        }
    };

    Asserted.on = function(type, listener) {
        this.isAssertedPrototype('on()');
        Component.on.call(this, type, listener);
    };

    Asserted.off = function(type, listener) {
        this.isAssertedPrototype('off()');
        Component.off.call(this, type, listener);
    };

    Asserted.updateView = function(type, event) {
        this.isAssertedPrototype('updateView()');
        Component.updateView.call(this, type, event);
    };

    /**
     * Assertion registry.
     */
    Assert = {};
    Assert.registry = {};
    Assert.ERROR_ARGUMENT_NOT_ARRAY = 'Arguments to Assert.register() must be arrays. ';
    Assert.ERROR_INVALID_ARGUMENT = 'Arguments must have the form [eventType, assertedObject, assertionType]. ';
    Assert.ERROR_INVALID_EVENT_TYPE = 'First value in argument must be event type as a string. ';
    Assert.ERROR_UPPER_CASE_EVENT_TYPE_NAME = 'Upper case letters not allowed in event type names. ';
    Assert.ERROR_INVALID_EVENT_TYPE_NAME = 'Event type names can only contain a-z, 0-9 or dash (-), ' +
            'must start with a letter, not end with a dash and only ' +
            'one dash allowed between words. ';
    Assert.ERROR_NOT_ASSERTED_OBJECT = 'Second value in argument must have Asserted as prototype. ';
    Assert.ERROR_INVALID_ASSERTION_TYPE = 'Third value (assertion type) in argument must be a string ' +
            'of either \'sends\', \'receives\' or \'io\'. ';
    Assert.ERROR_ALREADY_REGISTERED = 'Duplicated registration. ';

    Assert.isValidAssertionType = function(type) {
        return type === 'sends' || type === 'receives' || type === 'io';
    };

    /**
     * Registers events for asserted objects.
     * @param {object[string,object,string]...} arguments
     */
    Assert.register = function() {
        var i = 0, argument = null, eventType = null, assertedObject = null, assertionType = null, registryEntry = null, entryList = null;

        for (i = 0; i < arguments.length; i++) {
            argument = arguments[i];
            if (Object.prototype.toString.call(argument) !== '[object Array]') {
                throw Assert.ERROR_ARGUMENT_NOT_ARRAY + 'Invalid argument: ' + argument;
            }
            if (argument.length !== 3) {
                throw Assert.ERROR_INVALID_ARGUMENT + 'Invalid array: ' + argument;
            }
            if (typeof argument[0] !== 'string') {
                throw Assert.ERROR_INVALID_EVENT_TYPE + argument[0];
            }
            if (/[A-Z]/.test(argument[0])) {
                throw Assert.ERROR_UPPER_CASE_EVENT_TYPE_NAME +
                        'Invalid event type name: ' + argument[0];
            }
            if (!(/^[a-z](-?[a-z0-9]+)*$/.test(argument[0]))) {
                throw Assert.ERROR_INVALID_EVENT_TYPE_NAME +
                        'Invalid event type name: ' + argument[0];
            }
            if (!Asserted.isPrototypeOf(argument[1])) {
                throw Assert.ERROR_NOT_ASSERTED_OBJECT +
                        'The argument is not an asserted object: ' +
                        argument[1];
            }
            if (typeof argument[2] !== 'string' ||
                    !Assert.isValidAssertionType(argument[2])) {
                throw Assert.ERROR_INVALID_ASSERTION_TYPE +
                        'Invalid assertion type: \'' + argument[2] + '\'';
            }
            eventType = argument[0];
            assertedObject = argument[1];
            assertionType = argument[2];
            if (Assert.isRegistered(eventType, assertedObject)) {
                throw Assert.ERROR_ALREADY_REGISTERED + 'Event type ' +
                        eventType + ' is already registered as \'' +
                        Assert.getAssertionType(eventType, assertedObject) +
                        '\' for asserted object: ' + assertedObject;
            }
            registryEntry = {
                assertedObject : assertedObject,
                assertionType : assertionType
            };
            entryList = Assert.registry[eventType];
            if (!entryList) {
                entryList = [];
                this.registry[eventType] = entryList;
            }
            entryList.push(registryEntry);
        }
    };

    Assert.isRegistered = function(eventType, assertedObject) {
        return !!Assert.getAssertionType(eventType, assertedObject);
    };

    Assert.getAssertionType = function(eventType, assertedObject) {
        var i = 0, entryList = null, registryEntry = null;

        entryList = Assert.registry[eventType];
        if (!entryList) {
            return undefined;
        }
        for (i = 0; i < entryList.length; i++) {
            registryEntry = entryList[i];
            if (registryEntry.assertedObject === assertedObject) {
                return registryEntry.assertionType;
            }
        }
        return undefined;
    };

    /**
     * Event server.
     */
    Server = o(Asserted);
    
    Server.ajax = function(type, event) {
        var asserted = null, xmlhttp = null, errorType = null;

        if (!this.uri) {
            throw 'Server URI for AJAX calls missing.';
        }
        asserted = this;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            errorType = type + '-error';
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    var response = JSON.parse(xmlhttp.responseText);
                    if (response.error) {
                        asserted.send(errorType, {
                            status : xmlhttp.status,
                            text : response.error
                        });
                    } else {
                        asserted.send(response.type, response.value);
                    }
                } else {
                    asserted.send(errorType, {
                        status : xmlhttp.status,
                        text : xmlhttp.responseText
                    });
                }
            }
        };
        xmlhttp.open('POST', asserted.uri, true);
        xmlhttp.setRequestHeader("Content-Type",
                "application/x-www-form-urlencoded;charset=utf-8");
        xmlhttp.send('type=' + type + '&value=' + JSON.stringify(event));
    };
    
    /**
     * Redirects the specified event to external server.
     * @param {string} type
     */
    Server.connect = function(type) {
        var asserted = this;
        this.receive(type, function(event) {
            asserted.ajax(type, event);
        });
    };

    /**
     * App container.
     */
    App = o(Asserted);
    
    App.constructor = function() {
        this.objects = [];
        if (!this.element) {
            this.element = c('div', document.body, 'app');
        }
    };
    
    /**
     * Adds the specified object to the app.
     * {object} object
     */
    App.add = function(object) {
        if (object.element || object.nodeType) {
            this.objects.push(c(object, this.element));
        } else {
            this.objects.push(object);
        }
    };

    /**
     * Export to namespace.
     */
    ns.c = c;
    ns.o = o;
    ns.Assert = Assert;
    ns.Asserted = Asserted;
    ns.Component = Component;
    ns.Server = Server;
    ns.App = App;

}(this));