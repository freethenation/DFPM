//This file adds the ability to log window.screen access

export function logger(self, emitter){
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

export const metadata = {
    category:"screen",
    icon:"fa-desktop",
    title:"Screen Properties",
    desc:"Screen resolution & color depth provide a few more bits of identifying information.",
    moreInfo:"https://browserleaks.com/javascript",
    priority:5,
}