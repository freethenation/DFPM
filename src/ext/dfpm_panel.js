//html & css
import 'file-loader?name=[name].[ext]!./dfpm_panel.html'
import 'font-awesome/css/font-awesome.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './dfpm_panel.css'
//actual js imports
import {callJsonRpc, addJsonRpcListener} from './messaging'
import 'bootstrap'
import {Model} from './model'
import Vue from 'vue/dist/vue.js'


var DOMAIN_REGEX = /.*\:\/\/?([^\/]+)/
Vue.component('log-line', {
    props: ['event'],
    template: `<li class="log-line" v-bind:class="['list-group-item',event.level=='info'?'':'list-group-item-'+event.level]">
      <b>{{event.category}}</b> {{event.method}} {{event.path}} <a target="_blank" :href="event.url">{{shortUrl}}</a>
    </li>`,
    computed: {
        shortUrl: function () {
            var url = this.event.url
            if(!url) return ""
            url = DOMAIN_REGEX.exec(url)
            if(!url) return ""
            return url[1].toLowerCase()
        }
    },
})


var currentTabId = chrome.devtools.inspectedWindow.tabId;
var vm = null;
function contentPageEvent(evt, tabId){
    if(currentTabId !== tabId) return; //Skip if the message is not ment for me
    vm.events.push(evt)
    console.log('dfpm_panel',evt)
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
                    if(!event || event.level === "info") return;
                    var category = this.categories.find((c)=>c.category==event.category)
                    if(!category || category.level === "danger") return;
                    category.level = event.level;
                },
                clearLogs: function(){
                    this.events = []
                    this.categories.forEach(c=>c.level="info")
                },
                resetFilters: function(){
                    this.showInfo = true;
                    this.showWarn = true;
                    this.showDanger = true;
                },
            }
        })
        //listen for new events
        addJsonRpcListener('contentPageEvent', contentPageEvent)
    })
