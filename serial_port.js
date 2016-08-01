
var extensionId = "fakeldaakeedmpfflakfnhfppaadaccm";
var pageIndex;

var serialConnectionId;
var isSerialPortOpen = false;


var port = chrome.runtime.connect(extensionId, {name: "knockknock"});
console.log(port);
port.postMessage({joke: "Knock knock"});

port.onMessage.addListener(
  function(msg) {
    console.log(msg);
    if(msg.header === "index"){
      pageIndex = msg.pageId;
    }
    else if(msg.header === "serialdata"){
      console.log(msg.data);
    }
  }
);

function getDevicesList(callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "list"}, callBack);
}

function openPort(portInfo, callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "open", pageId: pageIndex, info: portInfo},
    function(response){
      if(response.result === "ok"){
        isPortOpen = true;
        connectionId = response.connectionInfo.connectionId;
      }
      callBack(response);
    }
  );
}

function closePort(callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "close", connectionId: serialConnectionId},
    function(response){
        if(response.result === "ok"){
          isPortOpen = false;
        }
        callBack(response);
    }
  );
}

function isOpen(){
	return isPortOpen;
}
