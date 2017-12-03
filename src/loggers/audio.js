//This file adds the ability to log audio fingerprinting
//Tested on https://audiofingerprint.openwpm.com/

export function logger(self, emitter){

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

export const metadata = {
    category:"audio",
    icon:"fa-headphones",
    title:"Audio Fingerprint",
    desc:"An audio fingerprint is a property of your machine's audio stack.",
    moreInfo:"https://audiofingerprint.openwpm.com/",
    priority:1,
}