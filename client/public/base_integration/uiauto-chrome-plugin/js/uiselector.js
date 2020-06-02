/*
* ------------------------------------------------
* Chrome网页元素捕获脚本
* ------------------------------------------------
*/
var extension_id = "ipkffocjcjdndihkgldnknfjalolaodg";
console.log(chrome);
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.event) {
        case "UI":
            var html = UiAuto_GetElementFromPoint(message.data.x, message.data.y);
            sendResponse(html);
            break;
    }
});


var windowX = -1;
var windowY = -1;
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

//获取当前页面的缩放值
var UiAuto_DetectZoom = function() {
    var ratio = 0,
        screen = window.screen,
        ua = navigator.userAgent.toLowerCase();

    if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    }
    else if (~ua.indexOf('msie')) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
            ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
    }
    else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
        ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
        ratio = Math.round(ratio * 100);
    }
    return ratio;
}

var radio = UiAuto_DetectZoom() / 100;

var UiAuto_GetElementFromPoint = function (x, y) {
    x = x / radio - windowX;
    y = y / radio - windowY;
    var element = document.elementFromPoint(x, y);
    var html = {};
    if (!!element) {
        if (element.tagName.toLowerCase() === "iframe") {
            var elObj = UiAuto_GetIframeElement(element, x, y);
            html = UiAuto_GetHtmlStructure(elObj.el);
            html.left += elObj.x - element.contentWindow.document.documentElement.scrollLeft;
            html.top += elObj.y - element.contentWindow.document.documentElement.scrollTop;
            html.frame = elObj.frame;
        } else {
            html = UiAuto_GetHtmlStructure(element);
            html.frame = null;
        }
    }

    return JSON.stringify(html);
}

var UiAuto_GetIframeElement = function(element, _x, _y) {
    var elObj = {
        x: element.offsetLeft,
        y: element.offsetTop,
        frame: {
            xpath: UiAuto_ReadXPath(element),
            full_xpath: UiAuto_ReadXPath(element, true),
            next_frame: null
        },
        el: null
    };
    _x = _x - element.offsetLeft;
    _y = _y - element.offsetTop;
    elObj.el = element.contentWindow.document.elementFromPoint(_x, _y);
    if (elObj.el != null && elObj.el.tagName.toLowerCase() === "iframe") {
        elObj.x += elObj.el.offsetLeft;
        elObj.y += elObj.el.offsetTop;
        var nextEl = UiAuto_GetElementFromPoint(elObj.el, _x, _y);
        el.frame.next_frame = nextEl.frame;
        elObj.x += nextEl.x - elObj.el.contentWindow.document.documentElement.scrollLeft;
        elObj.y += nextEl.y - elObj.el.contentWindow.document.documentElement.scrollTop;
        elObj.el = nextEl.el;
    }

    return elObj;
}

var UiAuto_ReadXPath = function (element, isFull) {
    try{
        if (element.id !== "" && !isFull) {//判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
            return "//*[@id='" + element.id + "']";
        }
        //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
        if (element == document.body) {//递归到body处，结束递归
            return '/html/' + element.tagName.toLowerCase();
        }
        if (element.parentNode === null) {
            return '';
        }
        var ix = 1,//在nodelist中的位置，且每次点击初始化
            siblings = element.parentNode.childNodes;//同级的子元素

        var same_tags_count = 0;
        for (var i = 0; i < siblings.length; i++) {
            var sibling = siblings[i];
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                same_tags_count++;
            }
        }
    
        for (var i = 0, l = siblings.length; i < l; i++) {
            var sibling = siblings[i];
            //如果这个元素是siblings数组中的元素，则执行递归操作
            if (sibling == element) {
                if (same_tags_count === 1) {
                    return arguments.callee(element.parentNode, isFull) + '/' + element.tagName.toLowerCase();
                } else {
                    return arguments.callee(element.parentNode, isFull) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
                }
                //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
            } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
                ix++;
            }
        }
    } catch (e) {
        console.log(e);
    }
};

var UiAuto_GetOffset = function (element) {
    var result = {
        left: 0,
        top: 0
    };

    result.left += element.offsetLeft - element.scrollLeft;
    result.top += element.offsetTop - element.scrollTop;

    if (!!element.offsetParent) {
        var parent = UiAuto_GetOffset(element.offsetParent);
        result.left += parent.left;
        result.top += parent.top;
    }

    return result;
}

var UiAuto_GetHtmlStructure = function (element) {
    var html = {};
    html['id'] = element.id;
    html['tag'] = element.tagName.toLowerCase();
    html['text'] = element.innerText;
    html['value'] = element.value;
    html['xpath'] = UiAuto_ReadXPath(element);
    html['full_xpath'] = UiAuto_ReadXPath(element, true);
    var offset = UiAuto_GetOffset(element);
    html['left'] = Math.round((offset.left + windowX - document.documentElement.scrollLeft) * radio);
    html['top'] = Math.round((offset.top + windowY - document.documentElement.scrollTop) * radio);
    html['width'] = Math.round(element.offsetWidth * radio);
    html['height'] = Math.round(element.offsetHeight * radio);
    return html;
}

function NewMessageBody() {
    return {
        event: null,
        data: null
    };
}



/**
 * 初始鼠标事件
 */
var mousemove = function (e) {
    console.log("mousemove");
}

var lock_mouseover = false;
var mouseover = function (e) {
    if (!lock_mouseover) {
        lock_mouseover = true;
        windowX = e.screenX - e.clientX;
        windowY = e.screenY - e.clientY;
        var msg = NewMessageBody();
        msg.event = "mouseover";
        msg.data = {
            contentArea: {
                left: windowX,
                top:windowY,
                width: window.innerWidth,
                height: window.innerHeight
            },
            radio: radio
        }
        chrome.runtime.sendMessage(extension_id, msg, function() {
            lock_mouseover = false;
            // console.log("mouseover");
        });
    } else {
        // console.log("mouseover lock");
    }
    
}

var lock_mouseout = false;
var mouseout = function (e) {

    if (!lock_mouseout) {
        lock_mouseout = true;
        var msg = NewMessageBody();
        msg.event = "mouseout";

        chrome.runtime.sendMessage(extension_id, msg, function() {
            lock_mouseout = false;
            // console.log("mouseout");
        });
    } else {
        // console.log("mouseout lock");
    }
    
}

// window.removeEventListener("mousemove", mousemove);
window.removeEventListener("mouseover", mouseover);
window.removeEventListener("mouseout", mouseout);

// window.addEventListener('mousemove', mousemove);
window.addEventListener('mouseover', mouseover);
window.addEventListener('mouseout', mouseout);
