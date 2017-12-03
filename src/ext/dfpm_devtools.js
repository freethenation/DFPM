
import {callJsonRpc, addJsonRpcListener} from './messaging'
import 'file-loader?name=[name].[ext]!./dfpm_devtools.html'

var panelPromise = (new Promise((resolve,reject)=>
    chrome.devtools.panels.create("DFPM", "fake.png", "dfpm_panel.html", resolve)
))

callJsonRpc(null, 'registerDevtoolsTab', chrome.devtools.inspectedWindow.tabId)
