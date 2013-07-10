angular.module('gdgMessages', []).service('MessageService', function () {
    var types = namespace.module('org.startpad.types');

    // Modules are singletons - constructor only called once
    var self = this;
    types.extend(self, {
        'addListener': addListener,
        'addMessage': addMessage
    });

    var udpServer;
    var messages = [];
    var listeners = [];

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

    function addMessage(message) {
        messages.push(message);
        messages = messages.slice(-100);
        updateListeners();
    }

    function addDatagram(datagram) {
        addMessage({from: datagram.fromAddress,
                    text: datagram.data})
    }

    // TODO: Use promises to clean up callback style
    namespace.gdg.network.init(function () {
        chrome.storage.local.get('nextPort', function(obj) {
            port = obj.nextPort++;
            chrome.storage.local.set(obj);
            self.udpServer = namespace.gdg.network.UDPServer(port);
            updateListeners();
            self.udpServer.addListener(addDatagram);
        });
    });
});
