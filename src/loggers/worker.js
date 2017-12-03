//Logs if web workers or service workers are used. Not really an issue for fingerprinting but
// gives you a non window JS contex which might avoid other dfpm depending on hook used to run dfpm

export function logger(self, emitter){

    function emit(event){
        event = Object.assign({
            method: 'apply',
            level: 'info',
            category: 'worker',
        }, event)
        emitter.emit(event.level, event);
    }

    if(self.ServiceWorkerContainer){
        ServiceWorkerContainer.prototype.register = new Proxy(self.ServiceWorkerContainer.prototype.register, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.ServiceWorkerContainer.prototype.register'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

    if(self.Worker){
        self.Worker =  new Proxy(self.Worker, {
            construct:function(target, argumentsList, newTarget){
                emit({path:'self.Worker', method:'construct'})
                return Reflect.construct(target, argumentsList, newTarget)
            }
        })
    }
}

export const metadata = {
    category:"worker",
    icon:"fa-cog",
    title:"Worker APIs",
    desc:"Can be used to work around fingerprint blockers.",
    moreInfo:"https://aarontgrogg.com/blog/2015/07/20/the-difference-between-service-workers-web-workers-and-websockets/",
    priority:100,
}