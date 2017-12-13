import 'file-loader?name=[name].[ext]!./manifest.json'
import 'file-loader?name=[name].[ext]!./icon128.png'
import {callJsonRpc, addJsonRpcListener} from './messaging'
import {Model} from './model'

var registeredTabs = {}
function contentPageEvent(evt, tabId){
    if(!registeredTabs[tabId]) return; //if the tab is not registered... ignore the event
    registeredTabs[tabId].events.push(evt)
}
addJsonRpcListener('contentPageEvent', contentPageEvent)

function registerDevtoolsTab(tabId){
    console.log('registerDevtoolsTab', tabId)
    if(!registeredTabs[tabId]){
        registeredTabs[tabId] = new Model()
    }
    return registeredTabs[tabId]
}
addJsonRpcListener('registerDevtoolsTab', registerDevtoolsTab)
