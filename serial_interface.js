var connections = {};

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "knockknock");
  port.onMessage.addListener(function(msg) {
    if (msg.joke == "Knock knock")
      port.postMessage({question: "Who's there?"});
    else if (msg.answer == "Madame")
      port.postMessage({question: "Madame who?"});
    else if (msg.answer == "Madame... Bovary")
      port.postMessage({question: "I don't get it."});
  });
});


/*
chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		console.log(request);

		if(request.cmd === "open"){
			openPort(request, sender, sendResponse);
		}
		else if(request.cmd === "close"){
			closePort(request, sender, sendResponse);
		}
		else if(request.cmd === "list"){
			getPortList(request, sender, sendResponse);
		}
		else if(request.cmd === "write"){
			writeOnPort(request, sender, sendResponse);
		}

		return true;
});



function openPort(request, sender, sendResponse){
	chrome.serial.connect(request.name,
		{
		bitrate: request.bitrate,
		dataBits: request.dataBits,
		parityBit: request.parityBit,
		stopBits: request.stopBits
		},
		function(connectionInfo){
			connections[connectionInfo.connectionId] = sendResponse;
			sendResponse(JSON.stringify(connectionInfo));
		}
	);
}

function closePort(request, sender, sendResponse){
	chrome.serial.disconnect(request.connectionId,
		function(result){
			//Remove id from connections
			sendResponse(JSON.stringify(result));
		}
	);
}

function getPortList(request, sender, sendResponse){
	chrome.serial.getDevices(
		function(ports){
			//console.log(JSON.stringify(ports));
			sendResponse(JSON.stringify(ports));
		}
	);
}

function writeOnPort(request, sender, sendResponse){

}
*/
