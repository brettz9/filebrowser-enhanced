/*globals self*/
(function () {'use strict';

self.on('context', function (node) {
    return (/^file:/).test(node.href);
});

self.on('click', function (node, data) {
    self.postMessage(node.href);
});

}());
