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
        for (var key in arg) {
        	if (!o[key]) {
        		o[key] = arg[key];
        	}
        }
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

// Event hub.
Hub = o(Component);
Hub.send = function(type, event, milliseconds) {
	var hub = this;
	if (typeof milliseconds == 'number') {
		setTimeout(function() {hub.updateView(type, event);}, milliseconds);
	} else {
		this.updateView(type, event);
	}
};