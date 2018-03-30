/**
 * Instruments the window.navigator.getBattery & window.BatteryManager.
 * In general this logger assumes checking the charging state is ok and checking any other state is fingerprinting
 * @param {Object} self the global JavaScript object. For example the browser's window object or the webworker's self object
 * @param {EventEmitter} emitter an event emitter that should be used to emit fingerprinting attempts.
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
export const metadata = {
    category: "battery",
    icon: "fa-battery-half",
    title: "Battery Status",
    desc: "The battery status object can be used as a short term identifier across domains.",
    moreInfo: "https://blog.lukaszolejnik.com/battery-status-readout-as-a-privacy-risk/",
    priority: 10,
}