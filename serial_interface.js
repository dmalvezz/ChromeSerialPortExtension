var webPages = [];
var connections = [];

chrome.runtime.onConnectExternal.addListener(
	function(port) {
		var portIndex = webPages.push(port) - 1;
		port.postMessage({header: "index", pageId: portIndex});
		port.onDisconnect.addListener(
			function(){
				webPages.splice(portIndex, 1);
				console.log("Web page closed index " + portIndex);
			}
		);

		console.log("New web page with index " + portIndex);
	}
);

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

chrome.serial.onReceive.addListener(
	function(info){
		console.log(info);

		var pageId = connections[info.connectionId];
		webPages[pageId].postMessage({header: "serialdata", data: info.data});

	}
);



function openPort(request, sender, sendResponse){
	chrome.serial.connect(request.info.portName,
		{
		bitrate: request.info.bitrate,
		dataBits: request.info.dataBits,
		parityBit: request.info.parityBit,
		stopBits: request.info.stopBits
		},
		function(connectionInfo){
			if (chrome.runtime.lastError) {
				sendResponse({result: "error", error: chrome.runtime.lastError.message});
			}
			else{
				connections[connectionInfo.connectionId] = request.pageId;
				sendResponse({result:"ok", connectionInfo: connectionInfo});
			}
		}
	);
}

function closePort(request, sender, sendResponse){
	chrome.serial.disconnect(request.connectionId,
		function(connectionInfo){
			if (chrome.runtime.lastError) {
				sendResponse({result: "error", error: chrome.runtime.lastError.message});
			}
			else{
				connections.slice(connectionInfo.connectionId, 1);
				sendResponse({result:"ok", connectionInfo: connectionInfo});
			}
		}
	);
}

function getPortList(request, sender, sendResponse){
	chrome.serial.getDevices(
		function(ports){
			if (chrome.runtime.lastError) {
				sendResponse({result: "error", error: chrome.runtime.lastError.message});
			}
			else{
				sendResponse({result:"ok", ports: ports});
			}
		}
	);
}

function writeOnPort(request, sender, sendResponse){

}
