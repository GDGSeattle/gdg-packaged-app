angular.module('gdgMessages', []).service('MessageService', function () {
    var types = namespace.module('org.startpad.types');
    var network = namespace.module('gdg.network');

    // Modules are singletons - constructor only called once
    var self = this;
    types.extend(self, {
        'addListener': addListener,
        'addMessage': addMessage,
        'addPeer': addPeer,
        'sendToPeers': sendToPeers
    });

    var udpServer;
    var messages = [];
    var listeners = [];
    var peers = [];

    function addListener(listener) {
        listeners.push(listener);
    }

    function updateListeners() {
        setTimeout(function () {
            for (var i = 0; i < listeners.length; i++) {
                listeners[i](messages);
            }
        }, 0);
    }

    function addMessage(message, opt) {
        var options = types.extend({sendToPeers: true}, opt);
        messages.push(message);
        messages = messages.slice(-100);
        updateListeners();
        if (options.sendToPeers) {
            sendToPeers(message);
        }
    }

    function addPeer(peer) {
        peers.push(peer);
        return peers.length - 1;
    }

    function removePeer(id) {
        delete peers[id];
    }

    function sendToPeers(message) {
        for (var i = 0; i < peers.length; i++) {
            var peer = peers[i];
            if (!peer) {
                continue;
            }
            // TODO: Change to JSON formatted messages
            network.sendUDPData(peer.address, peer.port, message.text);
        }
    }

    function addDatagram(datagram) {
        addMessage({from: datagram.fromAddress, text: datagram.data},
                   {sendToPeers: false})
    }

    // TODO: Use promises to clean up callback style
    network.init(function () {
        chrome.storage.local.get('nextPort', function(obj) {
            port = obj.nextPort++;
            chrome.storage.local.set(obj);
            self.udpServer = network.UDPServer(port);
            updateListeners();
            self.udpServer.addListener(addDatagram);
        });
    });
});
