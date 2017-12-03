//This file adds the ability to log canvas access & fingerprinting

//XXX: log all canvas method calls

export function logger(self, emitter){

    function emit(event){
        event = Object.assign({
            method: 'apply',
            level: 'warning',
            category: 'canvas',
        }, event)
        emitter.emit(event.level, event);
    }

    if(self.CanvasRenderingContext2D){
        self.CanvasRenderingContext2D.prototype.fillText = new Proxy(self.CanvasRenderingContext2D.prototype.fillText, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.CanvasRenderingContext2D.prototype.fillText'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
        self.CanvasRenderingContext2D.prototype.strokeText = new Proxy(self.CanvasRenderingContext2D.prototype.strokeText, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.CanvasRenderingContext2D.prototype.strokeText'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
        self.CanvasRenderingContext2D.prototype.getImageData = new Proxy(self.CanvasRenderingContext2D.prototype.getImageData, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.CanvasRenderingContext2D.prototype.getImageData'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }
    if(self.HTMLCanvasElement){
        self.HTMLCanvasElement.prototype.toBlob = new Proxy(self.HTMLCanvasElement.prototype.toBlob, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.HTMLCanvasElement.prototype.toBlob', level:'danger'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
        self.HTMLCanvasElement.prototype.toDataURL = new Proxy(self.HTMLCanvasElement.prototype.toDataURL, {
            apply:function(target, thisArgument, args){
                emit({path: 'self.HTMLCanvasElement.prototype.toDataURL', level:'danger'})
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

}

export const metadata = {
    category:"canvas",
    icon:"fa-paint-brush",
    title:"Canvas Fingerprinting",
    desc:"Draws a hidden image which varies depending on OS and hardware.",
    moreInfo:"https://browserleaks.com/canvas",
    priority:1,
}