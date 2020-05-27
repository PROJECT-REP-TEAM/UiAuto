// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
console.log(chrome);
try {
    var IsInChrome = false;
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        // message 就是你发送的 message
        // sender 代表发送者，可以通过 sender.tab 判断消息是否是从内容脚本发出
        // sendResponse 可以直接发送回复，如：
        // console.log(message, sender, sendResponse);
    
        switch (message.event) {
            case "mouseover":
                IsInChrome = true;
                break;
            case "mouseout":
                IsInChrome = false;
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
        var ws = InitSocket();
        // ws.open();
    
        ws.onopen = function() {
            console.log("onopen", ws);
        }
        
        var lock_select = false;
        ws.onmessage = function(e) {
            console.log("onmessage", e.data);
            if (!lock_select) {
                lock_select = true;
                var msg = JSON.parse(e.data);
                switch (msg.event) {
                    case "UI":
                        chrome.tabs.getSelected(function (tab) {
                            if (tab &&tab.id > -1) {
                                console.log(tab);
                                chrome.tabs.sendMessage(tab.id, msg, function (result) {
                                    console.log(result, IsInChrome);
                                    lock_select = false;
                                    ws.send(JSON.stringify({
                                        event: "UI",
                                        data: result
                                    }));
                                });
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