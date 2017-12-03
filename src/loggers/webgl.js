//This file adds the ability to log webgl access & fingerprinting

//XXX: toDataUrl is used for both canvas and webgl... is there a way to figure out which one we are using
//XXX: break out getExtension to include passed params

export function logger(self, emitter){

    function logFunctionCall(fnName, proto, path){
        var fn = proto[fnName]
        proto[fnName] = new Proxy(fn, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method: 'apply',
                    level:({
                        readPixels:'danger',
                    })[fnName]||'warning',
                    category:'webgl',
                    path: path
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

    if(self.WebGL2RenderingContext){
        let reverseParamDict = {}
        Reflect.ownKeys(self.WebGL2RenderingContext.prototype).forEach((key)=>{
            if(typeof(key)==="symbol") return; //ignore symbols
            if(key==="getParameter") return; //implemented below for better logging
            try{
                var val = self.WebGL2RenderingContext.prototype[key]
                var type = typeof(val)
            } catch(err){ return; }
            if(type==="function")
                logFunctionCall(key, self.WebGL2RenderingContext.prototype, 'self.WebGL2RenderingContext.prototype.'+key)
            else if(type==="number")
                reverseParamDict[val] = key
        })
        self.WebGL2RenderingContext.prototype.getParameter = new Proxy(self.WebGL2RenderingContext.prototype.getParameter, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method: 'apply',
                    level:'warning',
                    category:'webgl',
                    path: `self.WebGL2RenderingContext.prototype.getParameter(${reverseParamDict[args[0]]||args[0]})`
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }
    if(self.WebGLRenderingContext){
        let reverseParamDict = {}
        Reflect.ownKeys(self.WebGLRenderingContext.prototype).forEach((key)=>{
            if(typeof(key)==="symbol") return; //ignore symbols
            if(key==="getParameter") return; //implemented below for better logging
            try{
                var val = self.WebGLRenderingContext.prototype[key]
                var type = typeof(val)
            } catch(err){ return; }
            if(type==="function")
                logFunctionCall(key, self.WebGLRenderingContext.prototype, 'self.WebGLRenderingContext.prototype.'+key)
            else if(type==="number")
                reverseParamDict[val] = key
        })
        self.WebGLRenderingContext.prototype.getParameter = new Proxy(self.WebGLRenderingContext.prototype.getParameter, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method: 'apply',
                    level:'warning',
                    category:'webgl',
                    path: `self.WebGLRenderingContext.prototype.getParameter(${reverseParamDict[args[0]]||args[0]})`
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

}

export const metadata = {
    category:"webgl",
    icon:"fa-globe",
    title:"WebGL Fingerprinting",
    desc:"Draws a hidden image which varies depending on OS and hardware.",
    moreInfo:"https://browserleaks.com/webgl",
    priority:1,
}