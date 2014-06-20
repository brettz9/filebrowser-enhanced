/*globals self, jml*/
/*jslint vars:true*/
(function () {
    'use strict';

function l(msg) {
    console.log(msg);
}
function $ (sel) {
    return document.querySelector(sel);
}

var gTable = document.getElementsByTagName('table')[0];
if (!gTable) { // Exit as we don't want to continue inside a rendered file
    return;
}
var i,
    headCells = gTable.tHead.rows[0].cells,
    gTBody = gTable.tBodies[0],
    cellLinks = gTBody.querySelectorAll('td > a');

function getParam(name) {
    name = name.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<\>\|\:])/g, '\\$1');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'), // Todo: encodeURIComponent?
        results = regex.exec(location.search);
    return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' ')); // todo: + replace needed here?
}

var sort = getParam('sort');
var asc = getParam('asc');
asc = asc !== 'false';

var avoidDouble = false;

// Todo: add query string also to directory links!
function rowAction (i) {
    return function (e) {
        if (!avoidDouble) { // && (sort !== String(i))) { // || asc !== Boolean(asc))) {
            asc = !asc;
            window.location.assign(window.location.href.replace(/\?.*$/, '') + '?sort=' + i + '&asc=' + asc);
        }
    };
}

// We need to wait for DOMContentLoaded since the content script loads before the page script,
//  and we need to first ensure the header links are added by the page script.
document.addEventListener('DOMContentLoaded', function() {
    if (sort) {
        var queryString = '?sort=' + sort + '&asc=' + asc;
        var up = $('.up');
        if (up) { // Not present at top level
            up.href += queryString;
        }
        Array.slice(cellLinks).forEach(function (cellLink) {
            if (cellLink.href.slice(-1) === '/') { // Add current sorting to directory paths
                cellLink.href += queryString;
            }
        });
        
        if (asc === false) {
            avoidDouble = true;
            headCells[sort].click();
            avoidDouble = false;
        }
        headCells[sort].click();
    }

    for (i = headCells.length - 1; i >= 0; i--) {
        headCells[i].addEventListener('click', rowAction(i), true);
    }

});

// self.port.emit(name, jsonSerializableData);
// self.port.on/once/removeListener(name, function () {}); // self.on is used instead for built-in message listening

var on, emit, options;
if (window.location.href.indexOf('.') === -1) { // In a directory (regex should remove need for this once working)
    on = self.port.on;
    emit = self.port.emit;
    options = self.options;
    
    on('selectInput', function () {
        $('#pathBox').select();
        $('#pathBox').focus();
    });
    on('getFileURLFromNativePathResponse', function (fileURL) {
        window.location.href = fileURL;
    });
    on('dirPickResult', function (data) {
        if (data.path) {
            emit('getFileURLFromNativePath', data.path);
        }
    });
    on('autocompleteValuesResponse', function (data) {
        var datalist = document.getElementById(data.listID);
        while (datalist.firstChild) {
            datalist.removeChild(datalist.firstChild);
        }
        data.optValues.forEach(function (optValue) {
            var option = jml('option', {
                // text: optValue,
                value: optValue
            });
            datalist.appendChild(option);
        });
    });
    on('getNativePathFromFileURLResponse', function (result) {
        var h1 = $('h1');
        while (h1.firstChild) {
            h1.removeChild(h1.firstChild);
        }
        h1.appendChild(document.createTextNode('Index of '));
        h1.appendChild(jml(
            'input', {
                type: 'text', id: 'pathBox', list: 'datalist', autocomplete: 'off', autofocus: 'autofocus',
                size: 95, value: result,
                $on: {
                    change: function (e) {
                        on('pathExistsResponse', function (pathExists) {
                            if (pathExists) {
                                emit('getFileURLFromNativePath', e.target.value);
                            }
                        });
                        emit('pathExists', e.target.value);
                    },
                    input: function (e) {
                        emit('autocompleteValues', {
                            value: e.target.value,
                            listID: e.target.getAttribute('list')
                        });
                    }
                }
            },
            'datalist', {id: 'datalist'},
            'button', {$on: {click: function () {
                emit('dirPick', {dirPath: $('#pathBox').value, i: '1'});
            }}}, [
                'Browse\u2026'
            ],
            'input', {
                    type: 'button',
                    style: 'border: none; margin-left: 5px; background-color: transparent; width: 25px; background-repeat: no-repeat; '+
                            'background-size: 20px 20px; '+
                            'background-image: url("' + options.folderImage + '");',
                    $on: {click: function () {
                        emit('reveal', result);
                    }}
                }, null
        ));
        var input = $('#pathBox');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    });
    emit('getNativePathFromFileURL', document.baseURI);

    /*window.addEventListener('click', function (e) {
        var el;
        if (e.button === 2) {
            el = e.target;
            emit('getNativePathFromFileURL', [el.href]);
        }
    });*/
}

}());
