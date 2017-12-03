#!/usr/bin/env node
const CDP = require('chrome-remote-interface')
const program = require('commander')
const spawn = require('child_process').spawn
const EventEmitter = require('eventemitter2').EventEmitter2
const rp = require('request-promise-native')

console.debug = function(){}

//load script we are going to inject
const injectedScriptSource = require('fs')
    .readFileSync(__dirname+"/dist/inject.js")
    .toString();

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
    });
}
module.exports.guid = guid;

function sleep(milliseconds){
    return new Promise((resolve, reject)=>setTimeout(resolve, milliseconds))
}
module.exports.sleep = sleep;

function flipTheSwitch({host, port, debug, runChrome}){
    var chrome = null;
    if(runChrome){
        console.log('launching chrome')
        process.chdir(__dirname)
        var cmd = runChrome=='true'?'chromium-browser':runChrome
        chrome = spawn(cmd.split(/\s/g)[0], ['--remote-debugging-port=9222'].concat(cmd.split(/\s/g).slice(1)))
        chrome.on('exit', ()=>{
            console.log('chrome has closed')
            process.exit(0)
        })
        function shutdownChrome(){
            chrome.kill('SIGTERM')
        }
        process.on('exit', shutdownChrome)
        process.on('SIGQUIT', shutdownChrome)
        process.on('SIGINT', shutdownChrome)
        process.on('SIGTERM', shutdownChrome)
    }
    //we just connect to the first valid target
    return CDP.List({host, port})
    .then((targets)=>{
        var target = targets
            .filter((target)=>target.url.indexOf('http')===0)
            .filter((target)=>target.type=='page')
            [0]
        return setupScriptFirstStatementEvent(target, debug)
    }).catch((err)=>{
        if(err.code != "ECONNREFUSED") throw err;
        console.log('Could not connect to chrome...')
        return new Promise((resolve, reject)=>setTimeout(resolve, 500))
            .then(flipTheSwitch.bind(null, {host, port, debug})) //NOTE: retries do not relaunch chrome!
    })
}
module.exports.flipTheSwitch = flipTheSwitch

function setupScriptFirstStatementEvent(target, debug){
    var client;
    return CDP({target}).then((c)=>{
        client = c;
        if(debug){
            console.debug = console.log
            client._ws.on('message', console.debug.bind(null, "---RECV---"))
            var oldSend = client._ws.send;
            client._ws.send = function(msg){
                console.debug("---SEND---", msg)
                oldSend.apply(this, Array.from(arguments))
            }
        }
        function onEvent(eventName, handler){
            client.on(eventName, function(){console.debug(eventName, arguments[0])})
            client.on(eventName, handler.bind(null, client))
        }
        onEvent('Debugger.paused', onDebuggerPaused)
        onEvent('Console.messageAdded', onConsoleMessageAdded)
        return Promise.all([
            client.Debugger.enable(),
            client.Console.enable(),
            client.Page.enable(),
        ])
    }).then(()=>client.DOMDebugger.setInstrumentationBreakpoint({eventName: "scriptFirstStatement"})
        .catch((err)=>console.error('could not set breakpoint for beltsander', err))
    )
    .then(()=>client)
}

function navigateToUrl(client, url, timeout){
    timeout = timeout || 30*1000
    return Promise.race([
        client.Page.stopLoading()
            .then(()=>{
                return Promise.all([
                    client.Page.navigate({url:url}),
                    new Promise((resolve, reject)=>{
                        client.once('Page.domContentEventFired', resolve)
                    })
                ])
            })
        ,new Promise((resolve, reject)=>{
            setTimeout(reject.bind(null, {message:'request timed out'}), timeout);
        })
    ])
}
module.exports.navigateToUrl = navigateToUrl


var chromeId = guid()
var eventEmitter = new EventEmitter({wildcard:true, newListener:false});
module.exports.eventEmitter = eventEmitter;
function onConsoleMessageAdded(client, {message:{source, level, text}}){
    try{
        var obj = JSON.parse(text)
        obj.chromeSessionId = chromeId;
        eventEmitter.emit(obj.level, obj)
    }catch(err){
        //console.log(text)
    }
}
function onDebuggerPaused(client, {callFrames, reason, data}){
    return Promise.all(callFrames.map((frame)=>{
        var rootScope = frame.scopeChain[frame.scopeChain.length-1]
        if(rootScope.type !== 'global' && rootScope.object.className !== 'Window'){
            throw `Unknown scope type:${rootScope.type} className:${rootScope.object.className}`
        }
        //console.log('injecting script', JSON.stringify(frame.callFrameId))
        return injectScript(client, frame.callFrameId);
    }))
    .then(()=>client.Debugger.resume())

}
function injectScript(client, callFrameId){
    return client.Debugger.evaluateOnCallFrame({
        callFrameId:callFrameId,
        expression:injectedScriptSource+`; dfpm(self);`,
        includeCommandLineAPI:false,
        silent:false,
        returnByValue:false,
        generatePreview:false,
        throwOnSideEffect:false
    }).then(({result,exceptionDetails})=>{
        exceptionDetails && console.error('error injecting', exceptionDetails);
    }).catch((err)=>{
        console.error('could not inject', err);
    })
}

async function postJson(url, obj){
    try {
        await rp({
            method: 'POST',
            uri: url,
            body: obj,
            json: true
        })
    } catch (error) {
        if(error) console.error(error)
        throw error;
    }
}

async function main(program){
    console.log('Starting up dfpm...')
    //handle logging
    eventEmitter.on("*",(obj)=>console.log(JSON.stringify(obj)))
    var logs = [];
    if(program.webhook) eventEmitter.on("*",logs.push.bind(logs))
    //run it
    client = await flipTheSwitch(program)
    console.log('dfpm running...')
    await sleep(5*1000) //safty
    while(program.urls && program.urls.length){
        var url = program.urls.shift();
        console.log('navigating to '+url)
        await navigateToUrl(client, url, 45*1000)
        await sleep(10*1000) //make sure there is enough time to allow js to run
    }
    if(program.webhook){
        async function sendLogs(){
            if(!logs.length) return; //nothing to send
            console.log('posting logs to '+program.webhook)
            await postJson(program.webhook, logs)
            logs = []
        }
        await sendLogs()
        process.on('exit', sendLogs) //XXX: will this actually work?
        process.on('SIGQUIT', sendLogs)
        process.on('SIGINT', sendLogs)
        process.on('SIGTERM', sendLogs)
        setInterval(sendLogs, 30*1000) //periodically send events
    }

    if(program.exit){
        console.log('Exiting because of --exit flag')
        process.exit(0)
    }
}

if (require.main === module) {
  function getEnvArg(argName, defaultVal){
    return process.env['DFPM_'+argName.toUpperCase()] || defaultVal;
  }
  program
    .version('0.1.0')
    .arguments('[urls...]')
    .description('Logs access to sensitive APIs that may allow a user to be fingerprinted. Optionally takes a list of urls to visit to test for fingerprinting.')
    .option('--debug <debug>', 'enable debug logging', Boolean, getEnvArg('debug', false))
    .option('--exit <exit>', 'exit after visiting specified urls.', Boolean, getEnvArg('exit', false))
    .option('--runChrome <runChrome>', 'launch and manage chrome. Pass chrome executable path', String, getEnvArg('runChrome', null))
    .option('--webhook <webhook>', 'in addition to logging to standard out, post the events as JSON to the specified webhook url')
    .parse(process.argv);
  program.urls = program.args
  main(program)
}
