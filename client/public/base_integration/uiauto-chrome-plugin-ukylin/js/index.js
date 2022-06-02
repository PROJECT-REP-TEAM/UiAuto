// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
console.log('uiauto-chrome-plugin', chrome);
let ws = null;
try {
    var IsInChrome = false;
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        // message 就是你发送的 message
        // sender 代表发送者，可以通过 sender.tab 判断消息是否是从内容脚本发出
        // sendResponse 可以直接发送回复，如：
    
        switch (message.event) {
            case "mouseover":
                IsInChrome = true;
                break;
            case "mouseout":
                IsInChrome = false;
                break;
            case "UI":
                console.log(message, sender, sendResponse);
                console.log("plugin selected data:", message)
                ws.send(JSON.stringify(message))
                break;
            case "STOP":
                console.log(message, sender, sendResponse);
                console.log("plugin stop:", message)
                ws.send(JSON.stringify(message))
                break;
        }
        
        ws.readyState === 1 && ws.send(JSON.stringify({
            event: "CHECK",
            data: IsInChrome
        }));

        sendResponse();
    });
    
    /**
     * WebSocket初始化
     **/
    function InitSocket() {
    
        console.log('初始化WebSocket');
        return new window.ReconnectingWebSocket("ws://127.0.0.1:63360/chrome", null, {
            debug: true,
            reconnectInterval: 3000
        });
    
    }
    
    try {
        ws = InitSocket();
        // ws.open();
    
        ws.onopen = function() {
            console.log("onopen", ws);
        }

        ws.onerror = function (e) {
            console.error('websocket error:', e)
        }
        
        var lock_select = false;
        ws.onmessage = function(e, callback) {
            console.log("onmessage", e.data, callback);
            if (!lock_select) {
                lock_select = true;
                var msg = JSON.parse(e.data);
                switch (msg.event) {
                    case "UI":
                        chrome.tabs.getSelected(function (tab) {
                            if (tab && tab.id > -1) {
                                console.log(tab);
                                chrome.tabs.sendMessage(tab.id, msg, function (result) {
                                    console.log(result, IsInChrome);
                                    lock_select = false;
                                    ws.send(JSON.stringify({
                                        event: "UI",
                                        data: result
                                    }));
                                });
                            } else {
                                lock_select = false;
                            }
                        });
                        break;
                    case "CHECK":
                        ws.send(JSON.stringify({
                            event: "CHECK",
                            data: IsInChrome
                        }));
                        lock_select = false;
                        break;
                    case "START":
                        chrome.tabs.getSelected(function (tab) {
                            if (tab && tab.id > -1) {
                                console.log(tab, window.html2canvas);
                                msg.html2canvas = window.html2canvas
                                console.log("start>>>>>>>>", msg)
                                chrome.tabs.sendMessage(tab.id, msg, function (result) {
                                    console.log(result, IsInChrome);
                                    lock_select = false;
                                });
                            } else {
                                lock_select = false;
                            }
                        });
                        break;
                    case "STOP":
                        chrome.tabs.getSelected(function (tab) {
                            if (tab && tab.id > -1) {
                                console.log(tab);
                                chrome.tabs.sendMessage(tab.id, msg, function (result) {
                                    console.log(result, IsInChrome);
                                    lock_select = false;
                                });
                            } else {
                                lock_select = false;
                            }
                        });
                        break;
                }
            }
            
        }
        
        console.log(ws);
    } catch (e) {
        console.log(e);
    }
} catch (e) {
    console.log(e);
}



// Set up a click handler so that we can merge all the windows.
// chrome.browserAction.onClicked.addListener(start);