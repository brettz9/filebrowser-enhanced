/*globals document, window*/
(function () {'use strict';

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
    var that = this;
    this.parent = typeof sel === 'string' ? document.querySelector(sel) : sel;
    this.init();
    this.hide();
    if (options) {
        this.add(options);
    }
}

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

    // Holding container for the button and option container
    var holder = this.html.holder = document.createElement('div');
    holder.appendChild(this.html.button);
    holder.appendChild(this.html.div);

    holder.addEventListener('click', function() {
        if (that.visible) {
            that.hide();
        }
        else {
            that.show();
        }
    });
    
    this.position();
    
    var container = document.createElement('div');
    var div = this.html.div;
    container.appendChild(this.parent);
    container.appendChild(this.html.holder);
    container.addEventListener('keyup', function(e) {
        switch (e.keyCode) {
            case 27: // Escape key
                that.hide();
                return;
            case 35: // End of page
                that.show();
                var child = div.lastElementChild;
                child.scrollIntoView();
                that._hoverItem({target: child});
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
                return;
            case 36: // Home
                that.show();
                var child = div.firstElementChild;
                child.scrollIntoView();
                that._hoverItem({target: child});
                return;
            case 38: // Up arrow
                that.show();
                var child = (that.prevHover && (that.prevHover.previousElementSibling || div.firstElementChild)) || div.firstElementChild;
                child.scrollIntoView();
                that._hoverItem({target: child});
                return;
            case 40: // Down arrow
                that.show();
                var child = (that.prevHover && (that.prevHover.nextElementSibling || div.lastElementChild)) || div.firstElementChild;
                child.scrollIntoView();
                that._hoverItem({target: child});
                return;
            case 33: // Page up
                that.show();
                var child = that.prevHover || div.firstElementChild;
                while (child && visible_in_container(div, child)) { // Try to get next child out of scroll view; otherwise, all is in view
                    child = child.previousElementSibling;
                }
                if (!child) {
                    child = div.firstElementChild;
                }
                child.scrollIntoView();
                that._hoverItem({target: child});
                return;
            case 34: // Page down
                that.show();
                var child = that.prevHover || div.firstElementChild;
                while (child && visible_in_container(div, child)) { // Try to get next child out of scroll view; otherwise, all is in view
                    child = child.nextElementSibling;
                }
                if (!child) {
                    child = div.lastElementChild;
                }
                child.scrollIntoView();
                that._hoverItem({target: child});
                return;
            case 13: // Enter
                if (that.prevHover) {
                    that.parent.value = that.prevHover.dataset.jawbarDisplayValue
                    that.parent.select();
                    that.hide();
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
    });
    document.addEventListener('click', function (e) {
        if (e.target === that.html.button) {
            that.parent.focus();
        }
        else {
            that.hide();
        }
    });
    document.body.appendChild(container);
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
    item.addEventListener('click', function () {
        that.parent.value = item.dataset.jawbarDisplayValue;
        that.parent.select();
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
    if (!this.visible) {
        this.show();
    }
    var items = this.html.div.children;
    for (var i = 0, l = items.length; i < l; i++) {
        if (items[i].dataset.jawbarSearchValue.indexOf(this.parent.value) > -1) {
            items[i].classList.toggle('jawbar-menuitem-removed', false);
        }
        else {
            items[i].classList.toggle('jawbar-menuitem-removed', true);
        }
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

// See jawbar.css on why we can't move these to CSS
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
