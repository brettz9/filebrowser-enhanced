/*globals self */
window.addEventListener('click', function(e) {'use strict';

    if (e.button === 2 || (e.button === 0 && e.shiftKey === true)) {
        self.port.emit('copyDirectoryPath');
        e.preventDefault();
    }

}, true);
