/*globals self, jml*/
(function () {
    'use strict';

function l(msg) {
    console.log(msg);
}

// self.port.emit(name, jsonSerializableData);
// self.port.on/once/removeListener(name, function () {}); // self.on is used instead for built-in message listening

var on, emit, options;
if (window.location.href.indexOf('.') === -1) { // In a directory (regex should remove need for this once working)
    on = self.port.on;
    emit = self.port.emit;
    options = self.options;
    
    on('getFileURLFromNativePathResponse', function (fileURL) {
        window.location.href = fileURL;
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
        var h1 = document.querySelector('h1');
        while (h1.firstChild) {
            h1.removeChild(h1.firstChild);
        }
        h1.appendChild(document.createTextNode('Index of '));
        h1.appendChild(jml(
            'input', {
                type: 'text', id: 'pathBox', list: 'datalist', autocomplete: 'off', autofocus: 'autofocus',
                size: 100, value: result,
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
        var input = document.querySelector('#pathBox');
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
