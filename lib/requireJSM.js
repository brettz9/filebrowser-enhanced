// Adapted from https://blog.mozilla.org/addons/2012/02/16/using-jsm-modules-in-the-sdk/
/*globals require, module */
var Cu = require('chrome').Cu;
/**
 * Imports a JS Module using Components.utils.import()
 * and returns the scope, similar to Jetpack require().
 *
 * @param targetScope {Object} (optional)
 *     If null, the scope will just be returned
 *     and *not* added to the global scope.
 *     If given, all functions/objects from the JSM will be
 *     imported directly in |targetScope|, so that you
 *     can do e.g.
 *       requireJSM("url", this)
 *       someFuncFromJSM();
 *     which will have the same effect as
 *       Components.utils.import("url");
 *       someFuncFromJSM();
 *     in normal Mozilla code, but the latter won't work in Jetpack code.
 */
function requireJSM(url, targetScope) { 'use strict';
  var scope = targetScope || {};
  Cu['import'](url, scope);
  return scope;
}
module.exports = requireJSM;
