chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {bounds: {width: 700, height: 500}});
});

var socket = chrome.socket;
var ipAddress;
var udpPort = 9876;
var socketId;

socket.getNetworkList(function (adaptors) {
    for (var i = 0; i < adaptors.length; i++) {
        if (adaptors[i].address.indexOf(':') == -1) {
            ipAddress = adaptors[i].address;
            break;
        }
    }

    socket.create('udp', {}, function(socketInfo) {
        socket.bind(socketInfo.socketId, ipAddress, udpPort, function(result) {
            socketId = socketInfo.socketId;
            console.log("UDP bound", socketInfo);
        });
    });
});

function sendSocketData(ipRemote, data) {
    console.log("UDP send", data);
    socket.sendTo(socketId, stringToBuffer(data), ipRemote, udpPort, function (result) {
            console.log("sent", result);
    });
}

function stringToBuffer(s) {
    var b = new ArrayBuffer(s.length);
    var v = new Uint8Array(b);
    for (var i = 0; i < s.length; i++) {
        v[i] = s.charCodeAt(i);
    }
    return b;
}

function bufferToString(b) {
    var s = '';
    var v = new Uint8Array(b);
    for (var i = 0; i < v.length; i++) {
        s += String.fromCharCode(v[i]);
    }
    return s;
}
