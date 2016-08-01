var port = chrome.runtime.connect("fakeldaakeedmpfflakfnhfppaadaccm", {name: "knockknock"});

console.log("ciao");
port.postMessage({joke: "Knock knock"});

port.onMessage.addListener(function(msg) {
  console.log(msg);
  if (msg.question == "Who's there?")
    port.postMessage({answer: "Madame"});
  else if (msg.question == "Madame who?")
    port.postMessage({answer: "Madame... Bovary"});
});
