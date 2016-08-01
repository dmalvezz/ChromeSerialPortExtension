
var extensionId = "fakeldaakeedmpfflakfnhfppaadaccm"

function getDevicesList(callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "list"}, callBack);
}

function openPort(portInfo, callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "open", info: portInfo}, callBack);
}

function closePort(connectionId, callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "close", connectionId: connectionId}, callBack);
}
