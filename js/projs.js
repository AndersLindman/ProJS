/*** ProJS - Prototype JavaScript framework. License and copyright free. ***/

// Method for creating and adding elements.
function c(tag, parent, className, text) {
	var element;
	if (typeof tag == 'string') {
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

// Method for creating objects from prototype objects.
function o(prototype) {
	var o = Object.create(prototype);
	for (var i = 1; i < arguments.length; i++) {
		var arg = arguments[i];
		for ( var key in arg) {
			if (!o[key]) {
				o[key] = arg[key];
			}
		}
	}
	if (typeof Asserted != 'undefined' && Asserted.isPrototypeOf(o) &&
			prototype != Asserted) {
		if (!o.assertedPrototypes) {
			o.assertedPrototypes = [];
		}
		o.assertedPrototypes.push(prototype);
	}
	if (o.constructor) {
		o.constructor();
	}
	return o;
}

// Component prototype object.
// Method on() adds an event listener.
// Method off() removes an event listener.
// Method updateView() calls event listeners.
Component = {};
Component.on = function(type, listener) {
	if (!this.listeners) {
		this.listeners = {};
	}
	if (!this.listeners[type]) {
		this.listeners[type] = [];
	}
	this.listeners[type].push(listener);
};
Component.off = function(type, listener) {
	if (!this.listeners) {
		return;
	}
	if (typeof type == 'string') {
		var l = this.listeners[type];
		if (!l) {
			return;
		}
		var i = l.indexOf(listener);
		if (i != -1) {
			l.splice(i, 1);
		}
	} else {
		listener = type;
		for (type in this.listeners) {
			l = this.listeners[type];
			i = l.indexOf(listener);
			if (i != -1) {
				l.splice(i, 1);
			}
		}
	}
};
Component.updateView = function(type, event) {
	if (!this.listeners) {
		return;
	}
	var listeners = this.listeners[type];
	if (listeners) {
		for (var i = 0; i < listeners.length; i++) {
			var listener = listeners[i];
			if (listener) {
				listener(event);
			}
		}
	}
};

// Assertion registry.
Assert = {};
Assert.registry = {};
Assert.ERROR_ARGUMENT_NOT_ARRAY =
		'Arguments to Assert.register() must be arrays. ';
Assert.ERROR_INVALID_ARGUMENT =
		'Arguments must have the form [eventType, assertedObject, assertionType]. ';
Assert.ERROR_INVALID_EVENT_TYPE =
		'First value in argument must be event type as a string. ';
Assert.ERROR_UPPER_CASE_EVENT_TYPE_NAME =
		'Upper case letters not allowed in event type names. ';
Assert.ERROR_INVALID_EVENT_TYPE_NAME =
		'Event type names can only contain a-z, 0-9 or dash (-), ' +
		'must start with a letter, not end with a dash and only ' +
		'one dash allowed between words. ';
Assert.ERROR_NOT_ASSERTED_OBJECT =
		'Second value in argument must have Asserted as prototype. ';
Assert.ERROR_INVALID_ASSERTION_TYPE =
		'Third value (assertion type) in argument must be a string ' +
		'of either \'sends\', \'receives\' or \'io\'. ';
Assert.ERROR_ALREADY_REGISTERED = 'Duplicated registration. ';
Assert.isValidAssertionType = function(type) {
	return type == 'sends' || type == 'receives' || type == 'io';
};
Assert.register = function() {
	for (var i = 0; i < arguments.length; i++) {
		var argument = arguments[i];
		if (Object.prototype.toString.call(argument) != '[object Array]') {
			throw Assert.ERROR_ARGUMENT_NOT_ARRAY + 'Invalid argument: ' +
					argument;
		}
		if (argument.length != 3) {
			throw Assert.ERROR_INVALID_ARGUMENT + 'Invalid array: ' + argument;
		}
		if (typeof argument[0] != 'string') {
			throw Assert.ERROR_INVALID_EVENT_TYPE + argument[0];
		}
		if (/[A-Z]/.test(argument[0])) {
			throw Assert.ERROR_UPPER_CASE_EVENT_TYPE_NAME +
					'Invalid event type name: ' + argument[0];
		}
		if (!(/^[a-z](-?[a-z0-9])*[^-]?$/.test(argument[0]))) {
			throw Assert.ERROR_INVALID_EVENT_TYPE_NAME +
					'Invalid event type name: ' + argument[0];
		}
		if (!Asserted.isPrototypeOf(argument[1])) {
			throw Assert.ERROR_NOT_ASSERTED_OBJECT +
					'The argument is not an asserted object: ' + argument[1];
		}
		if (typeof argument[2] != 'string' ||
				!Assert.isValidAssertionType(argument[2])) {
			throw Assert.ERROR_INVALID_ASSERTION_TYPE +
					'Invalid assertion type: \'' + argument[2] + '\'';
		}
		var eventType = argument[0];
		var assertedObject = argument[1];
		var assertionType = argument[2];
		if (Assert.isRegistered(eventType, assertedObject)) {
			throw Assert.ERROR_ALREADY_REGISTERED + 'Event type ' + eventType +
					' is already registered as \'' +
					Assert.getAssertionType(eventType, assertedObject) +
					'\' for asserted object: ' + assertedObject;
		}
		var registryEntry = {
			assertedObject : assertedObject,
			assertionType : assertionType
		};
		var entryList = Assert.registry[eventType];
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
	var entryList = Assert.registry[eventType];
	if (!entryList) {
		return undefined;
	}
	for (var i = 0; i < entryList.length; i++) {
		var registryEntry = entryList[i];
		if (registryEntry.assertedObject == assertedObject) {
			return registryEntry.assertionType;
		}
	}
	return undefined;
};

// Asserted object prototype.
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
	function isTypeValid(assertedObject) {
		var type = Assert.getAssertionType(eventType, assertedObject);
		if (type == 'io' || type == assertionType) {
			return true;
		}
	}
	if (isTypeValid(this)) {
		return true;
	}
	var prototypeList = this.assertedPrototypes;
	if (!prototypeList) {
		return false;
	}
	for (var i = 0; i < prototypeList.length; i++) {
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
				'\' or \'io\' not registered for event type \'' + eventType +
				'\' and asserted object: ' + this;
	}
};
Asserted.send = function(type, event, milliseconds) {
	this.isAsserted();
	this.isRegistered(type, 'sends');
	if (typeof event == 'number') {
		milliseconds = event;
	}
	if (typeof milliseconds == 'number') {
		setTimeout(function() {
			Asserted.updateView(type, event);
		}, milliseconds);
	} else {
		Asserted.updateView(type, event);
	}
};
Asserted.receive = function(type, listener, milliseconds) {
	this.isAsserted();
	this.isRegistered(type, 'receives');
	if (typeof milliseconds == 'number') {
		setTimeout(function() {
			Asserted.on(type, listener);
		}, milliseconds);
	} else {
		Asserted.on(type, listener);
	}
};
Asserted.disconnect = function(type, listener, milliseconds) {
	this.isAsserted();
	this.isRegistered(type, 'receives');
	if (typeof milliseconds == 'number') {
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