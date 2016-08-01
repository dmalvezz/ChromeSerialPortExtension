
var extensionId = "fakeldaakeedmpfflakfnhfppaadaccm";

var serialConnectionId;
var isSerialPortOpen = false;
var onDataReceivedCallback = undefined;

var portGUID;
var port = chrome.runtime.connect(extensionId);

port.onMessage.addListener(
  function(msg) {
    console.log(msg);
    if(msg.header === "guid"){
      portGUID = msg.guid;
    }
    else if(msg.header === "serialdata"){
      //console.log(msg.data);
      if(onDataReceivedCallback !== undefined){
        onDataReceivedCallback(new Uint8Array(msg.data).buffer);
      }
    }
  }
);

function getDevicesList(callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "list"}, callBack);
}

function openPort(portInfo, callBack){
  chrome.runtime.sendMessage(extensionId,
    {
      cmd: "open",
      portGUID: portGUID,
      info: portInfo
    },
    function(response){
      if(response.result === "ok"){
        isSerialPortOpen = true;
        serialConnectionId = response.connectionInfo.connectionId;
      }
      callBack(response);
    }
  );
}

function closePort(callBack){
  chrome.runtime.sendMessage(extensionId,
    {
      cmd: "close",
      connectionId: serialConnectionId
    },
    function(response){
        if(response.result === "ok"){
          isSerialPortOpen = false;
        }
        callBack(response);
    }
  );
}

function write(data, callBack){
  chrome.runtime.sendMessage(extensionId,
    {
      cmd: "write",
      connectionId: serialConnectionId,
      data: Array.prototype.slice.call(new Uint8Array(data))
    },
    function(response){
      if(response.result === "ok"){
        if(response.sendInfo.error !== undefined){
          if(response.sendInfo.error === "disconnected" || response.sendInfo.error === "disconnected"){
            isSerialPortOpen = false;
            closePort(function(){});
          }
        }
      }
      callBack(response);
    }
  );
}

function isOpen(){
	return isSerialPortOpen;
}

function setOnDataReceivedCallback(callBack){
  onDataReceivedCallback = callBack;
}
