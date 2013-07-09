chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {bounds: {width: 700, height: 500}});
});

var socket = chrome.socket;
var serverIP;
var udpPort = 9876;
var socketId;

socket.getNetworkList(function (adaptors) {
    for (var i = 0; i < adaptors.length; i++) {
        if (adaptors[i].address.indexOf(':') == -1) {
            serverIP = adaptors[i].address;
            break;
        }
    }

    socket.create('udp', {}, function(socketInfo) {
        socketId = socketInfo.socketId;
        socket.bind(socketId, '127.0.0.1', udpPort, function(result) {
            if (result < 0) {
                console.log("Could not bind listening UDP port " + udpPort);
            }
        });

        socket.recvFrom(socketId, 1024, function(info) {
            if (info.resultCode < 0) {
                console.log("Reader error", info);
                return;
            }
            if (info.data.byteLength != 0) {
                console.log("UDP Read: '" + bufferToString(info.data) + "'");
            }
        });
    });
});

function sendSocketData(remoteIP, data) {
    socket.sendTo(socketId, stringToBuffer(data), remoteIP, udpPort, function(result) {
        console.log("Sent string: '" + data + "' (" + result.bytesWritten + ")");
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
    sendSocketData('127.0.0.1', "test data");
},
           1000);
