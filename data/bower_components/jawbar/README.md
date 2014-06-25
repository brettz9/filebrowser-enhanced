# JawBar

A Vanilla JavaScript implementation of Firefox's "Awesome Bar".

HTML5's `<datalist>` element, while a step up from nothing, does not
allow to user input to vary from what gets shown in the drop-down.
I thought the original project by Lewis Linn White Jr. was quite a
good start and I hope more features can be added (see below).

# Installation

1. For the styles (currently non-existent, but I plan to move them from
out of the JavaScript), add this:
```html
<link href="styles/demo.css" rel="stylesheet" type="text/css" />
```
1. Add this for JavaScript:
```html
<script src="../src/jawbar.js"></script>
```

<!--
# Todos

1. 
-->
# API

## Constructor

The first argument to the constructor is a CSS selector of a textbox
you wish to convert into an awesome bar.

```javascript
var bar = new JawBar('#myid');
```
```html
<input type="text" id="myid"/>
```

An optional second argument can be provided to set the options. (See
the `add()` method.)

## Methods

- `object.add(options)`: Adds a new item to the awesome bar. `options` is a JavaScript object containing the text you want to add, among other things.
- `object.position()`: Attempts to position a hidden `div` for your awesome bar. You shouldn't need to call this, but if you alter your element's positions, you may have to.
- `object.show()`: Makes the `div` visible. Effectively shows the results of the search.
- `object.hide()`: Hides the `div`. Effectively hides your search results.
- `object.remove(index)`: Removes the item at index `index`. If `index` is not provided, removes all items.

### Add() Method

The `add()` method currently supports (and requires) the following options to be passed to it:

- `text`: The text that will appear in the awesome bar.
- `subtext`: The text that will appear in smaller, italicized letters under the text.
- `icon`: The icon to display beside the item. Should be 16x16 pixels.
- `searchValue`: The text that is actually searched when typing in the awesome bar.
- `displayValue`: The text that will actually appear in the awesome bar when you click an item.

An array of such objects may also be provided for multiple simultaneous additions.

# Credits

Original code from http://www.codeproject.com/Articles/27079/JavaScript-Awesome-Bar
