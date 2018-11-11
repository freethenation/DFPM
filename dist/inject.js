window["dfpm"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["default"] = dfpm;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_eventemitter2__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_eventemitter2___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_eventemitter2__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__loggers_navigator__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__loggers_canvas__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__loggers_webgl__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__loggers_screen__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__loggers_webrtc__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__loggers_audio__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__loggers_worker__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__loggers_font__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__loggers_battery__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__util__ = __webpack_require__(12);



//import all the diff loggers












const loggers = [
    __WEBPACK_IMPORTED_MODULE_1__loggers_navigator__,
    __WEBPACK_IMPORTED_MODULE_2__loggers_canvas__,
    __WEBPACK_IMPORTED_MODULE_3__loggers_webgl__,
    __WEBPACK_IMPORTED_MODULE_4__loggers_screen__,
    __WEBPACK_IMPORTED_MODULE_5__loggers_webrtc__,
    __WEBPACK_IMPORTED_MODULE_6__loggers_audio__,
    __WEBPACK_IMPORTED_MODULE_7__loggers_worker__,
    __WEBPACK_IMPORTED_MODULE_8__loggers_font__,
    __WEBPACK_IMPORTED_MODULE_9__loggers_battery__,
]
/* harmony export (immutable) */ __webpack_exports__["loggers"] = loggers;


//This script gets ran in every JS context BEFORE any other JS
function dfpm(self){
    //Check if we have ran before
    if(self.dfpmId) return;

    var dfpmId = Object(__WEBPACK_IMPORTED_MODULE_10__util__["b" /* guid */])()
    self.dfpmId = dfpmId

    var logDedupe = {}
    function log(event){
        if(typeof(event) == "object"){
            event.jsContextId = dfpmId;
            event.url = self.location && self.location.toString()
            event.stack = Object(__WEBPACK_IMPORTED_MODULE_10__util__["a" /* getStackTrace */])()
        }
        var msg = JSON.stringify(event)
        if(logDedupe[msg]) return;
        logDedupe[msg] = true;
        dfpm.emitEvent(msg)
    }

    var emitter = new __WEBPACK_IMPORTED_MODULE_0_eventemitter2__["EventEmitter2"]({wildcard:true, newListener:false})
    log(`info injecting...`)
    loggers.forEach((logger)=>{
        logger.logger(self, emitter)
    })
    emitter.on('*', log)

    //--------------------------------------------------
    //It is possible to create an iframe and then never run script in it (so our break point wont fire)
    //Iframes give you a clean JS context so we dirty them up lazyly
    //--------------------------------------------------
    //util function to dfpm iframes created in this manner
    var iframeCache = new WeakMap()
    function inject(element) {
        if(iframeCache.has(element)) return; //some sites hit this code constantly and it is CPU intensive
        if (element.tagName.toUpperCase() === "IFRAME" && element.contentWindow) {
            iframeCache.set(element, true)
            try {
                var hasAccess = element.contentWindow.HTMLCanvasElement;
            } catch (e) { return /* nothing we can do */ }
            dfpm(element.contentWindow);
        }
    }
    //overrideDocumentProto so you can't get a clean iframe
    function overrideDocumentProto(root) {
        function doOverrideDocumentProto(old, name) {
            //root.prototype[storedObjectPrefix + name] = old;
            Object.defineProperty(root.prototype, name,
                {
                    value: function () {
                        var element = old.apply(this, arguments);
                        if (!element) return element;
                        var eleType = Object.prototype.toString.call(element)
                        if(eleType == "[object HTMLCollection]" || eleType == "[object NodeList]"){
                            for (var i = 0; i < element.length; ++i) {
                                var ele = element[i]
                                if(Object.prototype.toString.call(ele)=="[object HTMLIFrameElement]") inject(ele);
                            }
                        } else if (eleType == "[object HTMLIFrameElement]"){
                            inject(element);
                        }
                        return element;
                    }
                }
            );
        }
        doOverrideDocumentProto(root.prototype.createElement, "createElement");
        doOverrideDocumentProto(root.prototype.createElementNS, "createElementNS");
        doOverrideDocumentProto(root.prototype.getElementById, "getElementById");
        doOverrideDocumentProto(root.prototype.getElementsByName, "getElementsByName");
        doOverrideDocumentProto(root.prototype.getElementsByClassName, "getElementsByClassName");
        doOverrideDocumentProto(root.prototype.getElementsByTagName, "getElementsByTagName");
        doOverrideDocumentProto(root.prototype.getElementsByTagNameNS, "getElementsByTagNameNS");
        doOverrideDocumentProto(root.prototype.querySelector, "querySelector");
        doOverrideDocumentProto(root.prototype.querySelectorAll, "querySelectorAll");
    }
    self.Document && overrideDocumentProto(self.Document);

}
dfpm.emitEvent = console.log

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      this._maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;

      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    } else {
      this._maxListeners = defaultMaxListeners;
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. ' + count + ' listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: ' + eventName + '.';
    }

    if(typeof process !== 'undefined' && process.emitWarning){
      var e = new Error(errorMsg);
      e.name = 'MaxListenersExceededWarning';
      e.emitter = this;
      e.count = count;
      process.emitWarning(e);
    } else {
      console.error(errorMsg);

      if (console.trace){
        console.trace();
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }
  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name !== undefined) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (
            !tree._listeners.warned &&
            this._maxListeners > 0 &&
            tree._listeners.length > this._maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.event = '';


  EventEmitter.prototype.once = function(event, fn) {
    return this._once(event, fn, false);
  };

  EventEmitter.prototype.prependOnceListener = function(event, fn) {
    return this._once(event, fn, true);
  };

  EventEmitter.prototype._once = function(event, fn, prepend) {
    this._many(event, 1, fn, prepend);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    return this._many(event, ttl, fn, false);
  }

  EventEmitter.prototype.prependMany = function(event, ttl, fn) {
    return this._many(event, ttl, fn, true);
  }

  EventEmitter.prototype._many = function(event, ttl, fn, prepend) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      return fn.apply(this, arguments);
    }

    listener._origin = fn;

    this._on(event, listener, prepend);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();
      if (al > 3) {
        args = new Array(al);
        for (j = 0; j < al; j++) args[j] = arguments[j];
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    var promises= [];

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all) {
      if (al > 3) {
        args = new Array(al);
        for (j = 1; j < al; j++) args[j] = arguments[j];
      }
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, args));
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      handler = handler.slice();
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener) {
    return this._on(type, listener, false);
  };

  EventEmitter.prototype.prependListener = function(type, listener) {
    return this._on(type, listener, true);
  };

  EventEmitter.prototype.onAny = function(fn) {
    return this._onAny(fn, false);
  };

  EventEmitter.prototype.prependAny = function(fn) {
    return this._onAny(fn, true);
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype._onAny = function(fn, prepend){
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    if(prepend){
      this._all.unshift(fn);
    }else{
      this._all.push(fn);
    }

    return this;
  }

  EventEmitter.prototype._on = function(type, listener, prepend) {
    if (typeof type === 'function') {
      this._onAny(type, listener);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just add
      if(prepend){
        this._events[type].unshift(listener);
      }else{
        this._events[type].push(listener);
      }

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._maxListeners > 0 &&
        this._events[type].length > this._maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return this;
  }

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }

        this.emit("removeListener", type, listener);

        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }

        this.emit("removeListener", type, listener);
      }
    }

    function recursivelyGarbageCollect(root) {
      if (root === undefined) {
        return;
      }
      var keys = Object.keys(root);
      for (var i in keys) {
        var key = keys[i];
        var obj = root[key];
        if ((obj instanceof Function) || (typeof obj !== "object") || (obj === null))
          continue;
        if (Object.keys(obj).length > 0) {
          recursivelyGarbageCollect(root[key]);
        }
        if (Object.keys(obj).length === 0) {
          delete root[key];
        }
      }
    }
    recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++)
        this.emit("removeListenerAny", fns[i]);
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.eventNames = function(){
    return Object.keys(this._events);
  }

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (true) {
     // AMD. Register as an anonymous module.
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
      return EventEmitter;
    }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
//This file adds the ability to log navigator access

function logger(self, emitter){
    if(self.navigator){
        var origNavigator = self.navigator
        let proxy = new Proxy(self.navigator, {
            get: function(target, propertyKey, receiver){
                emitter.emit('event', {
                    method: 'get',
                    path: `self.navigator.${propertyKey}`,
                    level: 'info',
                    category: 'navigator',
                })
                var ret = origNavigator[propertyKey]
                if(typeof(ret)=='function'){
                    ret = ret.bind(origNavigator)
                }
                return ret;
            },
        });
        if(self.clientInformation){
            Reflect.defineProperty(self, 'clientInformation', {
                get:function(){ return proxy },
                set:function(val){ /* meh */ },
            })
        }
        Reflect.defineProperty(self, 'navigator', {
            get:function(){ return proxy },
            set:function(val){ /* meh */ },
        })
    }

    if(self.navigator.connection){
        var origConn = self.navigator.connection
        let proxyConn = new Proxy(self.navigator.connection, {
            get: function(target, propertyKey, receiver){
                emitter.emit('event', {
                    method: 'get',
                    path: `self.navigator.connection.${propertyKey}`,
                    level: 'info',
                    category: 'navigator',
                })
                var ret = origConn[propertyKey]
                if(typeof(ret)=='function'){
                    ret = ret.bind(origConn)
                }
                return ret;
            }
        })
        Reflect.defineProperty(self.navigator, 'connection', {
            get:function(){ return proxyConn },
            set:function(val){ /* meh */ },
        })
    }
}

const metadata = {
    category:"navigator",
    icon:"fa-font",
    title:"Navigator Object",
    desc:"The JavaScript navigator object is used for browser detection, connection information, plugins, etc.",
    moreInfo:"https://browserleaks.com/javascript",
    priority:10,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
//This file adds the ability to log canvas access & fingerprinting

//XXX: log all canvas method calls

function logger(self, emitter){

    function emit(event){
        event = Object.assign({
            method: 'apply',
            level: 'warning',
            category: 'canvas',
        }, event)
        emitter.emit(event.level, event);
    }

    if(self.CanvasRenderingContext2D){
        self.CanvasRenderingContext2D.prototype.fillText = new Proxy(self.CanvasRenderingContext2D.prototype.fillText, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.CanvasRenderingContext2D.prototype.fillText'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
        self.CanvasRenderingContext2D.prototype.strokeText = new Proxy(self.CanvasRenderingContext2D.prototype.strokeText, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.CanvasRenderingContext2D.prototype.strokeText'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
        self.CanvasRenderingContext2D.prototype.getImageData = new Proxy(self.CanvasRenderingContext2D.prototype.getImageData, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.CanvasRenderingContext2D.prototype.getImageData'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }
    if(self.HTMLCanvasElement){
        self.HTMLCanvasElement.prototype.toBlob = new Proxy(self.HTMLCanvasElement.prototype.toBlob, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.HTMLCanvasElement.prototype.toBlob', level:'danger'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
        self.HTMLCanvasElement.prototype.toDataURL = new Proxy(self.HTMLCanvasElement.prototype.toDataURL, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.HTMLCanvasElement.prototype.toDataURL', level:'danger'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

}

const metadata = {
    category:"canvas",
    icon:"fa-paint-brush",
    title:"Canvas Fingerprinting",
    desc:"Draws a hidden image which varies depending on OS and hardware.",
    moreInfo:"https://browserleaks.com/canvas",
    priority:1,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
//This file adds the ability to log webgl access & fingerprinting

//XXX: toDataUrl is used for both canvas and webgl... is there a way to figure out which one we are using
//XXX: break out getExtension to include passed params

function logger(self, emitter){

    function logFunctionCall(fnName, proto, path){
        var fn = proto[fnName]
        proto[fnName] = new Proxy(fn, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method: 'apply',
                    level:({
                        readPixels:'danger',
                    })[fnName]||'warning',
                    category:'webgl',
                    path: path
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

    if(self.WebGL2RenderingContext){
        let reverseParamDict = {}
        Reflect.ownKeys(self.WebGL2RenderingContext.prototype).forEach((key)=>{
            if(typeof(key)==="symbol") return; //ignore symbols
            if(key==="getParameter") return; //implemented below for better logging
            if(key==="getExtension") return; //implemented below for better logging
            try{
                var val = self.WebGL2RenderingContext.prototype[key]
                var type = typeof(val)
            } catch(err){ return; }
            if(type==="function")
                logFunctionCall(key, self.WebGL2RenderingContext.prototype, 'self.WebGL2RenderingContext.prototype.'+key)
            else if(type==="number")
                reverseParamDict[val] = key
        })
        self.WebGL2RenderingContext.prototype.getParameter = new Proxy(self.WebGL2RenderingContext.prototype.getParameter, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method: 'apply',
                    level:'warning',
                    category:'webgl',
                    path: `self.WebGL2RenderingContext.prototype.getParameter(${reverseParamDict[args[0]]||args[0]})`
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
        self.WebGL2RenderingContext.prototype.getExtension = new Proxy(self.WebGL2RenderingContext.prototype.getExtension, {
            apply:function(target, thisArgument, args){
                var level = "info"
                if(args[0]=="WEBGL_debug_renderer_info") level="danger";
                emitter.emit('event', {
                    method: 'apply',
                    level:level,
                    category:'webgl',
                    path: `self.WebGL2RenderingContext.prototype.getExtension(${args[0]})`
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }
    if(self.WebGLRenderingContext){
        let reverseParamDict = {}
        Reflect.ownKeys(self.WebGLRenderingContext.prototype).forEach((key)=>{
            if(typeof(key)==="symbol") return; //ignore symbols
            if(key==="getParameter") return; //implemented below for better logging
            if(key==="getExtension") return; //implemented below for better logging
            try{
                var val = self.WebGLRenderingContext.prototype[key]
                var type = typeof(val)
            } catch(err){ return; }
            if(type==="function")
                logFunctionCall(key, self.WebGLRenderingContext.prototype, 'self.WebGLRenderingContext.prototype.'+key)
            else if(type==="number")
                reverseParamDict[val] = key
        })
        self.WebGLRenderingContext.prototype.getParameter = new Proxy(self.WebGLRenderingContext.prototype.getParameter, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method: 'apply',
                    level:'warning',
                    category:'webgl',
                    path: `self.WebGLRenderingContext.prototype.getParameter(${reverseParamDict[args[0]]||args[0]})`
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
        self.WebGLRenderingContext.prototype.getExtension = new Proxy(self.WebGLRenderingContext.prototype.getExtension, {
            apply:function(target, thisArgument, args){
                var level = "info"
                if(args[0]=="WEBGL_debug_renderer_info") level="danger";
                emitter.emit('event', {
                    method: 'apply',
                    level:level,
                    category:'webgl',
                    path: `self.WebGLRenderingContext.prototype.getExtension(${args[0]})`
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

}

const metadata = {
    category:"webgl",
    icon:"fa-globe",
    title:"WebGL Fingerprinting",
    desc:"Draws a hidden image which varies depending on OS and hardware.",
    moreInfo:"https://browserleaks.com/webgl",
    priority:1,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
//This file adds the ability to log window.screen access

function logger(self, emitter){
    if(self.screen){
        let proxy = new Proxy(self.screen, {
            get: function(target, propertyKey, receiver){
                emitter.emit('event', {
                    method: 'get',
                    path: `self.screen.${propertyKey}`,
                    level: 'info',
                    category: 'screen',
                })
                return Reflect.get(target, propertyKey, target)
            }
        });
        Reflect.defineProperty(self, 'screen', {
            get:function(){ return proxy },
            set:function(val){ /* meh */ },
        })
    }
}

const metadata = {
    category:"screen",
    icon:"fa-desktop",
    title:"Screen Properties",
    desc:"Screen resolution & color depth provide a few more bits of identifying information.",
    moreInfo:"https://browserleaks.com/javascript",
    priority:5,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
//This file adds the ability to log webrtc which can get your local ip :(

function logger(self, emitter){

    function logFunctionCall(fnName, proto, path){
        var fn = proto[fnName]
        proto[fnName] = new Proxy(fn, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method: 'apply',
                    level:({
                        enumerateDevices:'danger',
                        getSupportedConstraints:'danger',
                    })[fnName]||'warning',
                    category:'webrtc',
                    path: path
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

    if(self.MediaDevices){
        Reflect.ownKeys(self.MediaDevices.prototype).forEach((key)=>{
            if(typeof(key)==="symbol") return; //ignore symbols
            try{
                var val = self.MediaDevices.prototype[key]
                var type = typeof(val)
            } catch(err){ return; }
            if(type==="function")
                logFunctionCall(key, self.MediaDevices.prototype, 'self.MediaDevices.prototype.'+key)
        })
    }

    if(self.RTCPeerConnection){
        //override constructor
        self.RTCPeerConnection = new Proxy(self.RTCPeerConnection, {
            construct:function(target, argumentsList, newTarget){
                emitter.emit('event', {
                    method:'construct',
                    level:'danger',
                    category:'webrtc',
                    path: 'self.RTCPeerConnection'
                })
                var ret = Reflect.construct(target, argumentsList, newTarget)
                //onicecandidate is danger per https://github.com/diafygi/webrtc-ips/blob/master/index.html
                var value = null
                Object.defineProperty(ret, 'onicecandidate', {
                    get: function(){
                        emitter.emit('event', { method:'set', level:'danger', category:'webrtc', path: 'self.RTCPeerConnection.onicecandidate' })
                        return value;
                    },
                    set:function(val){
                        emitter.emit('event', { method:'get', level:'danger', category:'webrtc', path: 'self.RTCPeerConnection.onicecandidate' })
                        value = val
                    }
                })
                return ret;
            }
        })
        //override method prototypes
        Reflect.ownKeys(self.RTCPeerConnection.prototype).forEach((key)=>{
            if(typeof(key)==="symbol") return; //ignore symbols
            try{
                var val = self.RTCPeerConnection.prototype[key]
                var type = typeof(val)
            } catch(err){ return; }
            if(type==="function")
                logFunctionCall(key, self.RTCPeerConnection.prototype, 'self.RTCPeerConnection.prototype.'+key)
        })
    }

    if(navigator.getUserMedia){
        navigator.getUserMedia = new Proxy(navigator.getUserMedia, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method:'apply',
                    level:'warning',
                    category:'webrtc',
                    path:'navigator.getUserMedia'
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

}

const metadata = {
    category:"webrtc",
    icon:"fa-video-camera",
    title:"WebRTC Fingerprinting",
    desc:"Can get your local ip address and information about attached webcams & microphones.",
    moreInfo:"https://browserleaks.com/webrtc",
    priority:1,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
//This file adds the ability to log audio fingerprinting
//Tested on https://audiofingerprint.openwpm.com/

function logger(self, emitter){

    if(self.AudioContext){
        self.AudioContext = new Proxy(self.AudioContext, {
            construct:function(target, argumentsList, newTarget){
                emitter.emit('event', {
                    method:'construct',
                    level:'danger',
                    category:'audio',
                    path:'self.AudioContext'
                })
                var ret = Reflect.construct(target, argumentsList, newTarget)
                return new Proxy(ret, {
                    get: function(target, propertyKey, receiver){
                        emitter.emit('event', {
                            method:'get',
                            level:'info',
                            category:'audio',
                            path:'self.AudioContext.'+propertyKey.toString()
                        })
                        var value = ret[propertyKey];
                        if(typeof(value) === "function")
                            return value.bind(ret)
                        return value
                    }
                })
            }
        })

    }
}

const metadata = {
    category:"audio",
    icon:"fa-headphones",
    title:"Audio Fingerprint",
    desc:"An audio fingerprint is a property of your machine's audio stack.",
    moreInfo:"https://audiofingerprint.openwpm.com/",
    priority:1,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
//Logs if web workers or service workers are used. Not really an issue for fingerprinting but
// gives you a non window JS contex which might avoid other dfpm depending on hook used to run dfpm

function logger(self, emitter){

    function emit(event){
        event = Object.assign({
            method: 'apply',
            level: 'info',
            category: 'worker',
        }, event)
        emitter.emit(event.level, event);
    }

    if(self.ServiceWorkerContainer){
        ServiceWorkerContainer.prototype.register = new Proxy(self.ServiceWorkerContainer.prototype.register, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.ServiceWorkerContainer.prototype.register'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

    if(self.Worker){
        self.Worker =  new Proxy(self.Worker, {
            construct:function(target, argumentsList, newTarget){
                emit({path:'self.Worker', method:'construct'})
                return Reflect.construct(target, argumentsList, newTarget)
            }
        })
    }
}

const metadata = {
    category:"worker",
    icon:"fa-cog",
    title:"Worker APIs",
    desc:"Can be used to work around fingerprint blockers.",
    moreInfo:"https://aarontgrogg.com/blog/2015/07/20/the-difference-between-service-workers-web-workers-and-websockets/",
    priority:100,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
// This file adds the ability to log font fingerprinting
// This is def not 100% and can easy be worked around
// Tested on a few diff fingerprint lib https://browserleaks.com/fonts

function logger(self, emitter){
    var desc = Reflect.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    var origGet = desc.get
    var fonts = new Set()
    desc.get = function(){
        var font = this.style.fontFamily
        if(font){
            fonts.add(font)
            var level;
            if(fonts.size < 5) return
            else if(fonts.size < 10) level = 'warning'
            else level = 'danger'
            emitter.emit('event', {
                method: 'get',
                path: 'HTMLElement.prototype.offsetWidth',
                level: level,
                category: 'font',
                font: font,
            })
        }
        return origGet.call(this)
    }
    Reflect.defineProperty(HTMLElement.prototype, 'offsetWidth', desc)
}

const metadata = {
    category:"font",
    icon:"fa-font",
    title:"Font Fingerprinting",
    desc:"What fonts you have, and how they are drawn.",
    moreInfo:"https://browserleaks.com/fonts",
    priority:1,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["logger"] = logger;
/**
 * Instruments the window.navigator.getBattery & window.BatteryManager.
 * In general this logger assumes checking the charging state is ok and checking any other state is fingerprinting
 * @param {Object} self the global JavaScript object. For example the browser's window object or the webworker's self object
 * @param {EventEmitter} emitter an event emitter that should be used to emit fingerprinting attempts.
 */
function logger(self, emitter) {

    /**
     * Emits a a fingerprinting event so it will be shown in the DFPM extension and CLI
     * @param {string} path the path you would use to access the property/method from the global object.
     *              For example `self.navigator` or `self.WebGL2RenderingContext.prototype.drawElements` (instance method)
     * @param {string} method the Reflect method which most closely describes the operation being logged.
     *              See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect
     *              You probably wont 'get' or 'apply' depending on if it is a property or method respectively
     * @param {string} level an indication of how important/dangerous the fingerprinting event is. There are 3 levels:
     *              "info": non critical or particularly worrisome
     *              "warning": you might have been fingerprinted
     *              "danger": you have for sure been fingerprinted!
     */
    function emitEvent(path, method, level){
        emitter.emit('event', {
            method: method,
            path: path,
            level: level,
            category: metadata.category,
        })
    }

    if(self.navigator && self.navigator.getBattery){
        var fn = self.navigator.getBattery;
        self.navigator.getBattery = new Proxy(fn, {
            apply:function(target, thisArgument, args){
                emitEvent(`self.navigator.getBattery`, 'apply', 'info')
                return Reflect.apply(target, thisArgument, args).then(function(battery){
                    return new Proxy(battery, {
                        get: function(target, propertyKey, receiver){
                            var level = ({
                                'charging':'info',
                                'removeEventListener':'info',
                                'then':'none',
                                'addEventListener':'none',
                            })[propertyKey] || 'warning'
                            if(level != 'none'){
                                emitEvent('self.navigator.getBattery.'+propertyKey, 'get', level)
                            }
                            var ret = battery[propertyKey]
                            if(typeof(ret)=='function'){
                                ret = ret.bind(battery)
                            }
                            return ret;
                        }
                    })
                })
            }
        })
    }

    if(self.navigator && self.BatteryManager){
        var fn = self.BatteryManager.prototype.addEventListener;
        self.BatteryManager.prototype.addEventListener = new Proxy(fn, {
            apply:function(target, thisArgument, args){
                emitEvent(`self.BatteryManager.prototype.addEventListener("${args[0]}")`, 'apply',
                    (args[0]+'').toLowerCase()=='chargingchange'?'info':'warning')
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }
}

/**
 * The metadata object controls how your logger will be displayed inf the DFPM extension and command line tool
 * @property {string} category the category for your logger used to group your events. Should be unique to your logging module.
 * @property {string} icon the font awesome icon associated with your logger. Choose one from http://fontawesome.io/icons/
 * @property {string} title a short title for the fingerprinting detected by your logger
 * @property {string} desc A short description of the fingerprinting detected by your logger
 * @property {string} moreInfo A url with a full description of your logger's fingerprinting technique
 * @property {number} priority Used to sort loggers in the left hand panel of the DFPM extension
 */
const metadata = {
    category: "battery",
    icon: "fa-battery-half",
    title: "Battery Status",
    desc: "The battery status object can be used as a short term identifier across domains.",
    moreInfo: "https://blog.lukaszolejnik.com/battery-status-readout-as-a-privacy-risk/",
    priority: 10,
}
/* harmony export (immutable) */ __webpack_exports__["metadata"] = metadata;


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = guid;
/* harmony export (immutable) */ __webpack_exports__["a"] = getStackTrace;
//just a bunch of utility functions

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
    });
}

var myError = Error //Some sites override error... copy it off XXX: In general need a better approach to issues like this
function getStackTrace(Error, error){
    error = error || new myError()
    var stack = parseV8OrIE(error)
    var index = stack.findIndex((frame)=>frame.fileName && frame.fileName.indexOf('http')!==-1)
    return stack.slice(index)
}

//Taken from stacktrace.js
//https://github.com/stacktracejs/stacktrace.js/blob/89214a1866da9eb9fb25054d64a65dea06e302dc/dist/stacktrace.js#L52
var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
function parseV8OrIE(error) {
    var filtered = error.stack.split('\n').filter(function(line) {
        return !!line.match(CHROME_IE_STACK_REGEXP);
    }, this);

    return filtered.map(function(line) {
        if (line.indexOf('(eval ') > -1) {
            // Throw away eval information until we implement stacktrace.js/stackframe#8
            line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
        }
        var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
        var locationParts = extractLocation(tokens.pop());
        var functionName = tokens.join(' ') || undefined;
        var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

        return {
            functionName: functionName,
            fileName: fileName,
            lineNumber: locationParts[1],
            columnNumber: locationParts[2],
            //source: line
        };
    }, this);
}
function extractLocation(urlLike) {
    // Fail-fast but return locations like "(native)"
    if (urlLike.indexOf(':') === -1) {
        return [urlLike];
    }

    var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
    var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
    return [parts[1], parts[2] || undefined, parts[3] || undefined];
}


/***/ })
/******/ ])["default"];