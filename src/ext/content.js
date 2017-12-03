import dfpmInjectLib from 'raw-loader!../../dist/inject.js'
import {guid} from '../util'
import {callJsonRpc} from './messaging'

const eventDivId = guid()

function dispatchEvent(eventDivId, data){
    var div = document.getElementById(eventDivId);
    div.innerText = data
    var event = document.createEvent('Event');
    event.initEvent(eventDivId, true, true);
    div.dispatchEvent(event);
}

const script = [
    dfpmInjectLib,
    `dfpm.emitEvent = (${dispatchEvent.toString()}).bind(null, "${eventDivId}")`,
    'dfpm(self);',
].join('\n')

function evalScript(actualCode){
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head||document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
}

function createEventDiv(eventDivId, callback){
    var div = document.createElement("div");
    div.style.display = "none"
    div.id = eventDivId
    document.getElementsByTagName('html')[0].appendChild(div)
    div.addEventListener(eventDivId, function(){
        var data = JSON.parse(div.textContent)
        callback(data)
    })
}

//inject the script, listen for events, and send events to background page when we get them
createEventDiv(eventDivId, function(evt){
    if(!evt.category) return; //ignore evts if they don't have a category
    callJsonRpc(null, "contentPageEvent", evt)
})
evalScript(script)
