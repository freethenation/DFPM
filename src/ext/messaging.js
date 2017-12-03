//Chrome extensions have an obnoxious amount of diff contexts
// * Content Page: can only use `chrome.runtime.sendMessage`
// * Background Page: Can use all methods. Needs to proxy messages from the devtools_page to content pages.
// * UI Pages: Can use all methods? (need to confirm chrome.tabs)
// * devtools_page: Does not have access to chrome.tabs so must proxy communication to content pages through background page. Can listen to messages not to a specific tab with `chrome.runtime.onMessage`.
// * devtools panel: Does not have access to chrome.tabs so must proxy communication to content pages through background page. Can listen to messages not to a specific tab with `chrome.runtime.onMessage`.

/**
 * Registers a method that is callable from other chrome extension contexts
 * @param {*} methodName the name of the method to register
 * @param {*} handler a function to be called when the method is called.
 *    Note: An additional argument, the senders tab id (or null if sender does not have tab id) will be will be appended to the arguments when calling the handler
 */
export function addJsonRpcListener(methodName, handler) {
  chrome.runtime.onMessage.addListener(function(request, sender) {
    // Check if the call is for this listener
    if (request.method != methodName) {
      return;
    }

    var params = request.params || []
    params.push((sender.tab && sender.tab.id!=-1 && sender.tab.id) || null)
    var ret = handler.apply(null, params);
    if (!(ret || {}).then) {
      ret = Promise.resolve(ret);
    }
    ret.then(
      function(result) {
        if (sender.tab && sender.tab.id !== -1 && chrome.tabs) { //chrome.tabs is not defined in devtools && devtools sender.tab.id == -1
          chrome.tabs.sendMessage(sender.tab.id, { error: null, result: result, id: request.id });
        } else {
          chrome.runtime.sendMessage({ error: null, result: result, id: request.id });
        }
      },
      function(error) {
        if (sender.tab && sender.tab.id !== -1  && chrome.tabs) {
          chrome.tabs.sendMessage(sender.tab.id, { error: error, result: null, id: request.id });
        } else {
          chrome.runtime.sendMessage({ error: error, result: null, id: request.id });
        }
      }
    );
  });
}

/**
 * Calls a method in another chrome context that has been registered with addJsonRpcListener
 * @param {*} tabId the tab to send the message to. Pass null to send the message to a non tab recipient (aka background page)
 * @param {*} method the name of the method to call
 * @param {*} params arguments to pass to the method as additional params
 */
export function callJsonRpc(tabId, method, params) {
  params = Array.from(arguments).splice(2)
  return new Promise(function(resolve, reject) {
    var id = Math.random();

    function cb(request) {
      if (request.id !== id) return; //its not us... ignore
      chrome.runtime.onMessage.removeListener(cb);
      if (request.error) { reject(request.error) } else { resolve(request.result) }
    }
    chrome.runtime.onMessage.addListener(cb)
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { method: method, params: params, id: id });
    } else {
      chrome.runtime.sendMessage({ method: method, params: params, id: id });
    }
  });
}
