angular.module('gdgMessages', [])
    .service({
        MessageService: function() {
            var udpServer;
            var self = this;

            // TODO: Use promises to clean up callback style
            namespace.gdg.network.init(function () {
                chrome.storage.local.get('nextPort', function(obj) {
                    port = obj.nextPort++;
                    chrome.storage.local.set(obj);
                    self.udpServer = namespace.gdg.network.UDPServer(port);
                    self.updateListeners();
                    self.udpServer.addListener(function (datagram) {
                        self.addMessage({from: datagram.fromAddress,
                                         text: datagram.data})
                    });
                });
            });

            var self = this;
            chrome.storage.local.get('messages', function(obj) {
                self.updateListeners(obj.messages);
            });

            chrome.storage.onChanged.addListener(function(changes, areaName) {
                if (!changes.messages) {
                    return;
                }
                self.updateListeners(changes.messages.newValue);
            });

            this.listeners = [];
            this.addListener = function(listener) {
                this.listeners.push(listener);
                chrome.storage.local.get('messages', function(obj) {
                    listener(obj.messages);
                });
            };

            this.updateListeners = function(messages) {
                for (var i = 0; i < this.listeners.length; i++) {
                    this.listeners[i](messages);
                }
            }

            this.addMessage = function (message) {
                chrome.storage.local.get('messages', function(obj) {
                    if (!obj.messages) {
                        obj.messages = [];
                    }
                    obj.messages.push(message);
                    obj.messages = obj.messages.slice(-100);
                    chrome.storage.local.set(obj);
                });
            };
        }
    })
