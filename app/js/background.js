chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {bounds: {width: 700, height: 550}});
});

var socket = chrome.socket;
var serverIP = '0.0.0.0';
var udpPort = 9876;
var socketId;
var clientId;

network = namespace.gdg.network;

function sendSocketData(remoteIP, data) {
    socket.create('udp', null, function(createInfo) {
        clientId = createInfo.socketId;
        socket.connect(clientId, remoteIP, udpPort, function(result) {
            socket.write(clientId, stringToBuffer(data), function(result){
                if (result.bytesWritten < 0) {
                    console.error("Could not write string (" + result.bytesWritten + ")");
                    return;
                }
                console.log("UDP To: " + remoteIP + ":" + udpPort + ":'" +
                            data + "' (" + result.bytesWritten + " bytes)");
                socket.destroy(clientId);
            });
        });
    });
}

function stringToBuffer(s) {
    var v = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) {
        v[i] = s.charCodeAt(i);
    }
    return v.buffer;
}

function bufferToString(b) {
    var s = '';
    var v = new Uint8Array(b);
    for (var i = 0; i < v.length; i++) {
        s += String.fromCharCode(v[i]);
    }
    return s;
}

setTimeout(function () {
               sendSocketData(serverIP, "test data");
           },
           1000);
