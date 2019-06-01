import { EventEmitter2 as EventEmitter } from "eventemitter2";


//import all the diff loggers
import * as navigatorLogger from './loggers/navigator';
import logger, * as canvasLogger from './loggers/canvas';
import * as webglLogger from './loggers/webgl';
import * as screenLogger from './loggers/screen';
import * as webrtcLogger from './loggers/webrtc';
import * as audioLogger from './loggers/audio';
import * as workerLogger from './loggers/worker';
import * as fontLogger from './loggers/font';
import * as batteryLogger from './loggers/battery';
import {guid, getStackTrace} from './util'


export const loggers = [
    navigatorLogger,
    canvasLogger,
    webglLogger,
    screenLogger,
    webrtcLogger,
    audioLogger,
    workerLogger,
    fontLogger,
    batteryLogger,
]

//This script gets ran in every JS context BEFORE any other JS
export default function dfpm(self){
    //Check if we have ran before
    if(self.dfpmId) return;

    var dfpmId = guid()
    self.dfpmId = dfpmId

    var logDedupe = {}
    function log(event){
        var msg = JSON.stringify(event)
        if(logDedupe[msg]) return;
        logDedupe[msg] = true;
        if(typeof(event) == "object"){
            event.jsContextId = dfpmId;
            event.url = self.location && self.location.toString()
            event.stack = getStackTrace()
        }
        msg = JSON.stringify(event)
        dfpm.emitEvent(msg)
    }

    var emitter = new EventEmitter({wildcard:true, newListener:false})
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
    //ref https://blog.javascripting.com/2014/05/19/wrapping-the-dom-window-object/
    function overrideDocumentProto(document) {
        function doOverrideDocumentProto(old, name) {
            function value() {
                var element = old.apply(document, arguments);
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
            value.toString = old.toString.bind(old)
            Object.defineProperty(document.__proto__, name, {value});
        }
        doOverrideDocumentProto(document.__proto__.createElement, "createElement");
        doOverrideDocumentProto(document.__proto__.createElementNS, "createElementNS");
        doOverrideDocumentProto(document.__proto__.getElementById, "getElementById");
        doOverrideDocumentProto(document.__proto__.getElementsByName, "getElementsByName");
        doOverrideDocumentProto(document.__proto__.getElementsByClassName, "getElementsByClassName");
        doOverrideDocumentProto(document.__proto__.getElementsByTagName, "getElementsByTagName");
        doOverrideDocumentProto(document.__proto__.getElementsByTagNameNS, "getElementsByTagNameNS");
        doOverrideDocumentProto(document.__proto__.querySelector, "querySelector");
        doOverrideDocumentProto(document.__proto__.querySelectorAll, "querySelectorAll");
    }
    self.Document && overrideDocumentProto(self.document);

}
dfpm.emitEvent = console.log