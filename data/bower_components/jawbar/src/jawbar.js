/*globals document, window*/
/*jslint vars:true*/
(function () {'use strict';

function l (s) {console.log(s);}

// http://stackoverflow.com/a/16211222/271577
function visible_in_container(p, e) {
    var z = p.getBoundingClientRect();
    var r = e.getBoundingClientRect();
    // Check style visiblilty and off-limits
    return (!e.style.opacity || e.style.opacity > 0) && e.style.display !== 'none' &&
           e.style.visibility !== 'hidden' &&
           !(r.top > z.bottom || r.bottom < z.top ||
             r.left > z.right || r.right < z.left);
}
function JawBar(sel, options) {
    this.parent = typeof sel === 'string' ? document.querySelector(sel) : sel;
    this.init();
    this.hide();
    if (options) {
        this.add(options);
    }
}

JawBar.prototype._showScrollAndHover = function(child) {
    this.show();
    if (child) {
        child.scrollIntoView();
        this._hoverItem({target: child});
    }
};
JawBar.prototype._getPrevVisibleItem = function() {
    this._showScrollAndHover(this._getNextVisibleItem(true)); // We double up since page up will otherwise only show the bottom-most item just out of view
    return this._getNextVisibleItem(true);
};
JawBar.prototype._getNextVisibleItem = function(backwards) {
    var div = this.html.div;
    var items = [].slice.call(div.children);
    if (backwards) {
        items.reverse();
    }
    return items.find(function (item, i) {
        if (this.prevHover) {
            if (item === this.prevHover) {
                this._unHoverItem({target: this.prevHover});
            }
            return;
        }
        return !item.classList.contains('jawbar-menuitem-removed') && !visible_in_container(div, item); // Try to get next child out of scroll view; otherwise, all is in view
    }, this) || (backwards ? this._getFirstVisibleItem() : this._getLastVisibleItem());
};

JawBar.prototype._getLastVisibleItem = function() {
    return this._getFirstVisibleItem(true);
};
JawBar.prototype._getFirstVisibleItem = function(backwards) {
    var items = [].slice.call(this.html.div.children);
    var oldHover = this.prevHover;
    if (backwards) {
        items.reverse();
    }
    return items.find(function (item) {
        return !item.classList.contains('jawbar-menuitem-removed');
    }, this) || oldHover;
};

JawBar.prototype._getPrevDisplayedItem = function() {
    return this._getNextDisplayedItem(true);
};
JawBar.prototype._getNextDisplayedItem = function(backwards) {
    var items = [].slice.call(this.html.div.children);
    var oldHover = this.prevHover;
    if (backwards) {
        items.reverse();
    }
    return items.find(function (item) {
        if (this.prevHover) {
            if (item === this.prevHover) {
                this._unHoverItem({target: this.prevHover});
            }
            return;
        }
        return !item.classList.contains('jawbar-menuitem-removed') && !item.classList.contains('jawbar-menuitem-hover');
    }, this) || oldHover;
};
JawBar.prototype._enterAndSelect = function (elem) {
    this.hide();
    var val = this.parent.value = elem.dataset.jawbarDisplayValue;
    this.parent.select();
    if (this.selectChanged) {
        this.selectChanged(val);
    }
};
JawBar.prototype.init = function() {
    var that = this;

    this.html = {};

    // Combo Div.  Container for the options
    var div = this.html.div = document.createElement('div');
    div.className = 'jawbar-optionContainer';

    // Set our styles, positioning, etc.
    // The text box we are converting
    this.parent.style.position = 'relative';
    this.parent.setAttribute('autocomplete', 'off');

    // Create a button for dropdown
    var button = this.html.button = document.createElement('input');
    button.type = 'button';
    button.className = 'jawbar-dropdownButton';

    button.addEventListener('click', function() {
        if (that.visible) {
            that.hide();
        }
        else {
            that.parent.focus();
            that.show();
        }
    });
    
    this.position();
    
    function keyNavigation (e) {
        var child;
        switch (e.keyCode) {
            case 27: // Escape key
                that.hide();
                return;
            case 35: // End of page
                that._showScrollAndHover(that._getLastVisibleItem());
                return;
            case 36: // Home
                that._showScrollAndHover(that._getFirstVisibleItem());
                return;
            case 38: // Up arrow
                that._showScrollAndHover(that._getPrevDisplayedItem());
                return;
            case 40: // Down arrow
                that._showScrollAndHover(that._getNextDisplayedItem());
                return;
            case 33: // Page up
                that._showScrollAndHover(that._getPrevVisibleItem());
                return;
            case 34: // Page down
                that._showScrollAndHover(that._getNextVisibleItem());
                return;
            case 13: // Enter
                if (that.prevHover) {
                    that._enterAndSelect(that.prevHover);
                    return;
                }
                break;
            case 9: case 16: // Tab or shift-tab
                return;
            default:
                // alert(e.keyCode);
                break;
        }
        that.findMatch(e);
    }


    div.addEventListener('keyup', keyNavigation);
    this.parent.addEventListener('keyup', keyNavigation);

    div.addEventListener('click', function (e) {
        that.hide();
    });

    document.body.appendChild(button);
    document.body.appendChild(div);
};

JawBar.prototype.position = function() {
    // Querying the CSSOM for the base style only works if CSS is beneath directory!
    var divStyle = this.html.div.style;
    divStyle.height = 200 + 'px';
    divStyle.width = this.parent.offsetWidth + 'px';
    divStyle.top = this.parent.offsetTop + this.parent.offsetHeight + 'px';
    divStyle.left = this.parent.offsetLeft + 'px';
    var buttonStyle = this.html.button.style;
    buttonStyle.height = this.parent.offsetHeight + 'px';
    buttonStyle.top = this.parent.offsetTop + 'px';
    buttonStyle.left = this.parent.offsetLeft + this.parent.offsetWidth - 15 + 'px';
    return this;
};

JawBar.prototype.show = function() {
    this.html.div.classList.toggle('jawbar-hidden', false);
    this.visible = true;
    return this;
};

JawBar.prototype.add = function(options) {
    if (typeof options.length === 'number') {
        options.forEach(function (option) {
            this.add(option);
        }, this);
        return this;
    }
    var that = this;
    var item = document.createElement('div');
    item.className = 'jawbar-menuitem';
    item.addEventListener('mouseover', this._hoverItem.bind(this));
    item.addEventListener('mouseout', this._unHoverItem.bind(this));
    var imageDiv = document.createElement('div');
    imageDiv.className = 'jawbar-imageContainer';
    var image = document.createElement('img');
    image.className = 'jawbar-menuitem-icon';
    var text = document.createElement('div');
    text.className = 'jawbar-menuitem-text';
    var subText = document.createElement('div');
    subText.className = 'jawbar-menuitem-subText';

    item.dataset.jawbarDisplayValue = options.displayValue;
    item.dataset.jawbarSearchValue = options.searchValue;

    image.src = options.icon;
    text.appendChild(document.createTextNode(options.text));
    subText.appendChild(document.createTextNode(options.subtext));
    imageDiv.appendChild(image);
    item.appendChild(imageDiv);
    item.appendChild(text);
    item.appendChild(subText);
    item.addEventListener('click', function (e) {
        that._enterAndSelect(item);
    });
    this.html.div.appendChild(item);
    imageDiv.style.height = item.offsetHeight - 10 + 'px';
    return this;
};

JawBar.prototype.hide = function () {
    this.visible = false;
    this.html.div.classList.toggle('jawbar-hidden', true);
    return this;
};

JawBar.prototype.findMatch = function (e) {
    var i, l;
    if (!this.visible) {
        this.show();
    }
    var items = this.html.div.children;
    for (i = 0, l = items.length; i < l; i++) {
        items[i].classList.toggle('jawbar-menuitem-removed', items[i].dataset.jawbarSearchValue.indexOf(this.parent.value) === -1);
    }
};

JawBar.prototype.remove = function(index) {
    var div = this.html.div;
    if (typeof index === 'number') {
        div.removeChild(div.childNodes[index]);
        return this;
    }
    while(this.html.div.firstChild) {
        div.removeChild(div.firstChild);
    }
    return this;
};

// See also jawbar.css on why we can't move these to CSS
/*
function simulateHover (elem) {
    // None of these approaches are working to detect and/or
    //  apply the hover rules from CSS (at least in Firefox), so
    //  we set the styles dynamically:
    // elem.pseudo = 'hover';
    // alert(document.styleSheets[0].cssRules);
    // var ev = new MouseEvent('mouseover');
    // elem.dispatchEvent(ev);
    // elem.style.cssText = window.getComputedStyle(elem, ':hover').cssText;
    elem.style.color = '#ffffff';
    elem.style.backgroundColor = '#0099ff';
    elem.scrollIntoView();
}
simulateHover(div.lastElementChild);
*/
JawBar.prototype._hoverItem = function (e) {
    var target = e.currentTarget || e.target;
    if (this.prevHover) {
        this.prevHover.classList.toggle('jawbar-menuitem-hover', false);
    }
    target.classList.toggle('jawbar-menuitem-hover', true);
    this.prevHover = target;
};
JawBar.prototype._unHoverItem = function (e) {
    var target = e.currentTarget || e.target;
    if (this.prevHover) {
        this.prevHover.classList.toggle('jawbar-menuitem-hover', false);
        this.prevHover = null;
    }
    else {
        target.classList.toggle('jawbar-menuitem-hover', false);
    }
};

window.JawBar = JawBar;

}());
