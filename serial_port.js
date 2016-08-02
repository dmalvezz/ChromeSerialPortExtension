
var extensionId = "fakeldaakeedmpfflakfnhfppaadaccm";

function SerialPort(){
  var portGUID;
  var port = chrome.runtime.connect(extensionId);

  var serialConnectionId;
  var isSerialPortOpen = false;
  var onDataReceivedCallback = undefined;

  port.onMessage.addListener(
    function(msg) {
      console.log(msg);
      if(msg.header === "guid"){
        portGUID = msg.guid;
      }
      else if(msg.header === "serialdata"){
        if(onDataReceivedCallback !== undefined){
          onDataReceivedCallback(new Uint8Array(msg.data).buffer);
        }
      }
    }
  );

  this.isOpen = function(){
  	return isSerialPortOpen;
  }

  this.setOnDataReceivedCallback = function(callBack){
    onDataReceivedCallback = callBack;
  }

  this.openPort = function(portInfo, callBack){
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

  this.closePort = function(callBack){
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

  this.write = function(data, callBack){
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


}

function getDevicesList(callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "list"}, callBack);
}

function isExtensionInstalled(callback){
   chrome.runtime.sendMessage(extensionId, { cmd: "installed" },
     function (response) {
       if (response){
        callback(true);
      }else{
        callback(false);
      }
    }
  );
}
