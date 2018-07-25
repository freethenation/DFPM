//html & css
import 'file-loader?name=[name].[ext]!./dfpm_panel.html'
import 'font-awesome/css/font-awesome.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './dfpm_panel.css'
//actual js imports
import {callJsonRpc, addJsonRpcListener} from './messaging'
import 'bootstrap'
import {Model, levelToInt} from './model'
import Vue from 'vue/dist/vue.js'


function levelToClass(level){
    return ({
        'warning':'list-group-item-warning',
        'null':'text-muted',
        'danger':'list-group-item-danger',
    })[level] || ''
}

function getDomain(url){
    if(!url) return ""
    url = DOMAIN_REGEX.exec(url)
    if(!url) return ""
    return url[1].toLowerCase()
}

var DOMAIN_REGEX = /.*\:\/\/?([^\/]+)/
Vue.component('log-line', {
    props: ['event'],
    template: `<li class="log-line" v-bind:class=" ['list-group-item', levelToClass(event.level)]">
      <b>{{event.category}}</b> {{event.method}} {{event.path}} <span class="links" :title="stackTrace"><span v-if="scriptDomain">from <a target="_blank" :href="scriptUrl">{{scriptDomain}}</a></span> on <a target="_blank" :href="event.url">{{pageDomain}}</a></span>
    </li>`,
    computed: {
        pageDomain: function () {
            return getDomain(this.event.url)
        },
        scriptUrl: function () {
            var frame = this.event.stack[0]
            return frame && frame.fileName || ""
        },
        scriptDomain: function(){
            var frame = this.event.stack[0]
            var url = frame && frame.fileName || ""
            return getDomain(url)
        },
        stackTrace: function(){
            return JSON.stringify(this.event.stack, null, 2)
        }
    },
    methods: {
        levelToClass:levelToClass,
    }
})


var currentTabId = chrome.devtools.inspectedWindow.tabId;
var vm = null;
function contentPageEvent(evt, tabId){
    if(currentTabId !== tabId) return; //Skip if the message is not ment for me
    vm.events.push(evt)
}

callJsonRpc(null, 'registerDevtoolsTab', chrome.devtools.inspectedWindow.tabId)
    .then((data)=>{
        vm = new Vue({
            el: '#app',
            data: Object.assign(new Model(), data),
            computed:{
                filteredEvents:function(){
                    var levels = {
                        info:this.showInfo,
                        warning:this.showWarn,
                        danger:this.showDanger,
                        "undefined":true, //show events with no levels
                    }
                    return this.events.filter((e)=>levels[e.level])
                },
            },
            watch:{
                events: function(events){
                    this.updateCategories(events[events.length-1])
                }
            },
            created: function () {
                this.events.forEach(this.updateCategories.bind(this)) //make sure level is set on categories
            },
            methods: {
                updateCategories: function(event){
                    if(!event) return;
                    var category = this.categories.find((c)=>c.category==event.category)
                    var eventLevel = levelToInt(event.level)
                    var categoryLevel = levelToInt(category.level)
                    if(eventLevel > categoryLevel){
                        category.level = event.level
                    }
                },
                clearLogs: function(){
                    this.events = []
                    this.categories.forEach(c=>c.level=null)
                },
                resetFilters: function(){
                    this.showInfo = true;
                    this.showWarn = true;
                    this.showDanger = true;
                },
                levelToClass:levelToClass,
            }
        })
        //listen for new events
        addJsonRpcListener('contentPageEvent', contentPageEvent)
    })
