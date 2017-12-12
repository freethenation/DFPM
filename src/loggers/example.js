/*******
 * This is an example logger module that simply logs all access to the browser's navigator object
 * A logger module should export a logger function and a metadata object.
 * It should not throw errors if ran on unexpected contexts (exp webworker)
 */

/**
 * Instruments the logging of a fingerprinting technique. This function will be called before any other
 * JavaScript on the page (with the exception of other code in DFPM).
 * @param {Object} self the global JavaScript object. For example the browser's window object or the webworker's self object
 * @param {EventEmitter} emitter an event emitter that should be used to emit fingerprinting attempts.
 *                                  More info: https://nodejs.org/api/events.html#events_class_eventemitter
 */
export function logger(self, emitter) {

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


    if (self.navigator) {
        let proxy = new Proxy(self.navigator, {
            get: function (target, propertyKey, receiver) {
                //an event should be emitted everytime the user is fingerprinted/inspected
                emitEvent(`self.navigator.${propertyKey}`, 'get', 'info')
            },
        });
        Reflect.defineProperty(self, 'navigator', {
            get: function () { return proxy },
            set: function (val) { /* meh */ },
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
export const metadata = {
    category: "example",
    title: "Short Example Title",
    desc: "A longer description shown below the title. Should still be shortish.",
    moreInfo: "https://example.com/link-with-a-long-description",
    priority: 10,
}