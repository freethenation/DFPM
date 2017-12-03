//This file adds the ability to log webrtc which can get your local ip :(

export function logger(self, emitter){

    function logFunctionCall(fnName, proto, path){
        var fn = proto[fnName]
        proto[fnName] = new Proxy(fn, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method: 'apply',
                    level:({
                        enumerateDevices:'danger',
                        getSupportedConstraints:'danger',
                    })[fnName]||'warning',
                    category:'webrtc',
                    path: path
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

    if(self.MediaDevices){
        Reflect.ownKeys(self.MediaDevices.prototype).forEach((key)=>{
            if(typeof(key)==="symbol") return; //ignore symbols
            try{
                var val = self.MediaDevices.prototype[key]
                var type = typeof(val)
            } catch(err){ return; }
            if(type==="function")
                logFunctionCall(key, self.MediaDevices.prototype, 'self.MediaDevices.prototype.'+key)
        })
    }

    if(self.RTCPeerConnection){
        //override constructor
        self.RTCPeerConnection = new Proxy(self.RTCPeerConnection, {
            construct:function(target, argumentsList, newTarget){
                emitter.emit('event', {
                    method:'construct',
                    level:'danger',
                    category:'webrtc',
                    path: 'self.RTCPeerConnection'
                })
                var ret = Reflect.construct(target, argumentsList, newTarget)
                //onicecandidate is danger per https://github.com/diafygi/webrtc-ips/blob/master/index.html
                var value = null
                Object.defineProperty(ret, 'onicecandidate', {
                    get: function(){
                        emitter.emit('event', { method:'set', level:'danger', category:'webrtc', path: 'self.RTCPeerConnection.onicecandidate' })
                        return value;
                    },
                    set:function(val){
                        emitter.emit('event', { method:'get', level:'danger', category:'webrtc', path: 'self.RTCPeerConnection.onicecandidate' })
                        value = val
                    }
                })
                return ret;
            }
        })
        //override method prototypes
        Reflect.ownKeys(self.RTCPeerConnection.prototype).forEach((key)=>{
            if(typeof(key)==="symbol") return; //ignore symbols
            try{
                var val = self.RTCPeerConnection.prototype[key]
                var type = typeof(val)
            } catch(err){ return; }
            if(type==="function")
                logFunctionCall(key, self.RTCPeerConnection.prototype, 'self.RTCPeerConnection.prototype.'+key)
        })
    }

    if(navigator.getUserMedia){
        navigator.getUserMedia = new Proxy(navigator.getUserMedia, {
            apply:function(target, thisArgument, args){
                emitter.emit('event', {
                    method:'apply',
                    level:'warning',
                    category:'webrtc',
                    path:'navigator.getUserMedia'
                })
                return Reflect.apply(target, thisArgument, args)
            }
        })
    }

}

export const metadata = {
    category:"webrtc",
    icon:"fa-video-camera",
    title:"WebRTC Fingerprinting",
    desc:"Can get your local ip address and information about attached webcams & microphones.",
    moreInfo:"https://browserleaks.com/webrtc",
    priority:1,
}