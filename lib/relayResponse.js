// relayResponse.js - filebrowser-enhanced's module
// author: brettz9
/*globals module */

(function (undefined) {
function l(msg) {
    console.log(msg);
}

// Todo: Return improvements to other relayResponse.js files
function emit (worker, method, privilegedAPI) {
//l('emitting:' + method);
//l('mstr:' + this[method]);
    var privAPI = privilegedAPI ? [privilegedAPI] : [];
    function sendResponse (result) {
        worker.port.emit(method + 'Response', result);
    }
    var result = this[method].apply(this, privAPI.concat([].slice.call(arguments, 3)).concat(
        worker.port.emit.bind(worker.port), worker.port.on.bind(worker.port), worker, sendResponse
    ));
    if (result !== undefined) { // Allow method to handle
        worker.port.emit(method + 'Response', result);
        return;
    }
}

function _relayResponse (worker, privilegedAPI) {
    var method;
    for (method in this) {
//        if (this.hasOwnProperty(method)) { // Doesn't work on modules
            try {
                worker.port.on(method, emit.bind(this, worker, method, privilegedAPI));
            }
            catch(e) {
                console.log('Error:' + e);
            }
//        }
    }
}

// We might also accept the "this" object instead of requiring it to be bound
module.exports = function (privilegedAPI) {
    var that = this;
    return function relayResponse (worker) {
        _relayResponse.call(that, worker, privilegedAPI);
    };
};

/*
Should work but requires specification of method (as opposed to just invoking with or without an argument):
function relayResponse (worker) {
    _relayResponse.call(this, worker);
}
// Can use this to bind onto it an object that allows (privileged) access to code shared within main.js
function multipleRelayResponse (privilegedAPI, worker) {
    _relayResponse.call(this, worker, privilegedAPI);
}
exports.simple = relayResponse;
exports.privileged = multipleRelayResponse;
*/

}());
