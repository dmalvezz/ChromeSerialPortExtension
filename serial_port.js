/**
* @author Davide Malvezzi
* @version 0.1.0
* Google Chrome browser app to allow the use of serial ports comunication inside a web page.
*	The app acts as an wrapper between the web pages and the serial ports.
* The app use the chrome.serial API to interact with the serial ports and
* the chrome.runtime messaging API to exchange information with the web page.
* It is also provided a simple JavaScript library to use inside the web pages to access the services offered by the app.
*/

/**
* Extension unique id to start the comunication.
*/
var extensionId = "agdnkpfcfmmchhcjhnknbggldfcfmnam";

function SerialPort(){
  /**
  * Port GUID assigned by the app.
  */
  var portGUID;

  /**
  * Initialize the comunication with the app.
  */
  var port = chrome.runtime.connect(extensionId);

  /**
  * Contain the unique serial port connection id.
  */
  var serialConnectionId;

  /**
  * Bool that indicates if the serial connection is open.
  */
  var isSerialPortOpen = false;

  /**
  * Callback function to call if there is new data incoming from the serial port connection.
  */
  var onDataReceivedCallback = undefined;

  /**
  * Callback function to call if there is the connection encountered some problems.
  */
  var onErrorReceivedCallback = undefined;

  /**
  * Listener to handle incoming message from the app trought the messaging port.
  * Handled commands are:
  * - guid -> received when the connection with the app is established, represent the GUID assigned to the port
  * - serialdata -> received when new binary data is available on the serial port
  */
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
      else if(msg.header === "serialerror"){
        onErrorReceivedCallback(msg.error);
      }
    }
  );

  /**
  * Check if the current port is opened.
  */
  this.isOpen = function(){
  	return isSerialPortOpen;
  }

  /**
  * Set the new data callback.
  */
  this.setOnDataReceivedCallback = function(callBack){
    onDataReceivedCallback = callBack;
  }

  /**
  * Set the error callback.
  */
  this.setOnErrorReceivedCallback = function(callBack){
    onErrorReceivedCallback = callBack;
  }

  /**
  * Try to open a serial connection.
  * portInfo MUST contain:
  * portName -> path to the port to open
  * bitrate -> port bit rate as number
  * dataBits -> data bit ("eight" or "seven")
  * parityBit -> parity bit ("no", "odd" or "even")
  * stopBits -> stop bit ("one" or "two")
  * Callback is a function to call to handle the app result.
  */
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

  /**
  * Try to close the serial connection.
  * Callback is a function to call to handle the app result.
  */
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

  /**
  *	Write data on the serial port.
  * The request MUST contain:
  * connectionId -> connection unique id provided when the port is opened
  * data -> Array which contains the bytes to send
  */
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
            if(response.sendInfo.error === "disconnected" || response.sendInfo.error === "system_error"){
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

/**
*	Get the list of all serial devices connected to the pc.
* If there is no error it will return an array of object containing:
* - path
* - vendorId (optional)
* - productId (optional)
* - displayName (optional)
* Callback is a function to call to handle the app result.
*/
function getDevicesList(callBack){
  chrome.runtime.sendMessage(extensionId, {cmd: "list"}, callBack);
}

/**
* Used to check if the Serial Interface app is installed on the browser.
* If it's installed return result: "ok" and the current version
*/
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
