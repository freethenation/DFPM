//This file adds the ability to log navigator access

export function logger(self, emitter){
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
        Reflect.defineProperty(self, 'navigator', {
            get:function(){ return proxy },
            set:function(val){ /* meh */ },
        })
    }
}

export const metadata = {
    category:"navigator",
    icon:"fa-font",
    title:"Navigator Object",
    desc:"The JavaScript navigator object is used for browser detection, connection information, plugins, etc.",
    moreInfo:"https://browserleaks.com/javascript",
    priority:10,
}