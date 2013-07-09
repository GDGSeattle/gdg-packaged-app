/* network.js - Network wrappers for Chrome Packaged Apps socket library.

   UDPServer(port) - Create a UDP listener on a given machine port.

   2013: Mike Koss - GDG Seattle
*/
namespace.module('gdg.network', function (exports, require) {
    require('org.startpad.funcs').patch();

    var socket = chrome.socket;
    var initialized = false;

    exports.extend({
        'init': init,
        'getLocalIP': getLocalIP,
        'getAdaptors': getAdaptors,
        'UDPServer': UDPServer
    });

    var localIP;
    var adaptors = [];
    var initCallbacks = [];

    function init(callback) {
        function done() {
            initialized = true;
            while (initCallbacks.length > 0) {
                var nextCallback = initCallbacks.shift();
                if (nextCallback) {
                    nextCallback();
                }
            }
        }

        initCallbacks.push(callback);

        if (initialized) {
            done();
            return;
        }

        if (initCallbacks.length > 1) {
            return;
        }

        chrome.socket.getNetworkList(function (allAdaptors) {
            for (var i = 0; i < allAdaptors.length; i++) {
                // Exclude the IPv6 addresses
                if (allAdaptors[i].address.indexOf(':') == -1) {
                    adaptors.push(allAdaptors[i]);
                    if (!localIP) {
                        localIP = allAdaptors[i].address;
                    }
                }
            }
            done();
        });
    }

    function getLocalIP() {
        return localIP;
    }

    function getAdaptors() {
        return adaptors;
    }

    function UDPServer(port) {
        if (!(this instanceof UDPServer)) {
            return new UDPServer(port);
        }
        var self = this;

        self.port = port;
        self.bound = false;
        self.listeners = [];

        socket.create('udp', {}, function(socketInfo) {
            // Should generally bind to default adaptor?
            var serverIP = '0.0.0.0';

            self.socketId = socketInfo.socketId;
            socket.bind(self.socketId, serverIP, port, function(result) {
                if (result < 0) {
                    console.error("Could not bind listening UDP port " + serverIP + ':' + port +
                                 " (" + result + ")");
                } else {
                    console.log("UDPServer bound to " + serverIP + ':' + port);
                    self.bound = true;
                    setTimeout(self.readUDP.bind(self), 1);
                }
            });
        });
    }

    UDPServer.methods({
        addListener: function(listener) {
            this.listeners.push(listener);
        },

        getIP: function() {
            return localIP;
        },

        getPort: function () {
            return this.port;
        },

        notifyListeners: function (data) {
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i](data);
            }
        },

        readUDP: function () {
            var self = this;

            if (!this.bound) {
                console.error("Trying to read from unbound UDP socket.");
                return;
            }
            socket.recvFrom(this.socketId, 1024, function(info) {
                if (info.resultCode < 0) {
                    console.erro("Reader error", info);
                    return;
                }
                if (info.data.byteLength != 0) {
                    var s = bufferToString(info.data);
                    self.notifyListeners(s);
                    console.log("UDP From: " + info.address + ":" + info.port + ": '" + s + "'");
                }
                setTimeout(self.readUDP.bind(self), 100);
            });
        }
    });

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
});
