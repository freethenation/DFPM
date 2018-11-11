import { logger } from "./loggers/screen";

//just a bunch of utility functions

export function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
    });
}

var myError = Error //Some sites override error... copy it off XXX: In general need a better approach to issues like this
export function getStackTrace(Error, error){
    try{
        error = error || new myError()
        var stack = parseV8OrIE(error)
        var index = stack.findIndex((frame)=>frame.fileName && frame.fileName.indexOf('http')!==-1)
        return stack.slice(index)
    } catch(err){
        return null
    }
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
