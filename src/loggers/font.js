// This file adds the ability to log font fingerprinting
// This is def not 100% and can easy be worked around
// Tested on a few diff fingerprint lib https://browserleaks.com/fonts

export function logger(self, emitter){
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

export const metadata = {
    category:"font",
    icon:"fa-font",
    title:"Font Fingerprinting",
    desc:"What fonts you have, and how they are drawn.",
    moreInfo:"https://browserleaks.com/fonts",
    priority:1,
}