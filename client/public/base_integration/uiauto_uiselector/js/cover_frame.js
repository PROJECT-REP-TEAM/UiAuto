try {
    if (typeof $ === "undefined") {
        console.log('当前页面没有引入jQuery');
        const jquery_script = document.createElement('script');
        jquery_script.type = 'text/javascript';
        jquery_script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
        document.body.appendChild(jquery_script);
    }

    window["uiauto_selected_result"] = '';

    let pre_point = null;
    document.addEventListener('mouseover', function (e) {

        if (pre_point === null) {
            pre_point = {
                x: e.clientX,
                y: e.clientY
            }
        } else {
            const abs_x = Math.abs(e.clientX - pre_point.x);
            const abs_y = Math.abs(e.clientY - pre_point.y);
            if (abs_x <= 10 && abs_y <= 10) {
                return false;
            }
        }

        const result = {
            html: {}
        };

        const el = document.elementFromPoint(e.clientX, e.clientY);

        console.log('selected element', $(el).index());

        result.html = generateHtmlObject(el);
        result.html["parent"] = generateHtmlObject(el.parentElement);
        result.html["clientX"] = e.clientX;
        result.html["clientY"] = e.clientY;
        result.html["screenX"] = e.screenX;
        result.html["screenY"] = e.screenY;
        result.html["offsetX"] = e.screenX - e.clientX;
        result.html["offsetY"] = e.screenY - e.clientY;
        result.html["index"] = $(el).index();
        const bcr = el.getBoundingClientRect();
        result.html["bounding_client_rect"] = {
            left: bcr['left'],
            top: bcr['top'],
            right: bcr['right'],
            bottom: bcr['bottom'],
            width: bcr['width'],
            height: bcr['height']
        };

        // console.log(readXPath(el))
        result.html["xpath"] = readXPath(el)// generateXPath(el);

        window["uiauto_selected_result"] = JSON.stringify(result);

        console.log(JSON.stringify(result));
        
    });

    /**
     * 生成XPath
     * @param el
     */
    var generateXPath = function (el) {
        var xpath = '';
        if (el.hasAttribute('id')) {
            xpath = "//*[@id='" + $(el).attr('id') + "']"
        } else {
            if (el.localName !== 'html') {
                xpath = generateXPath(el.parentElement) + "/" + el.localName
                var same_tags = $(el).parent().find(el.localName)
                console.log(same_tags)
                if (same_tags.length > 0) {
                    xpath += "[" + $(el).index() + "]"
                }
            } else {
                xpath = "//html"
            }
        }
        return xpath;
    };

    /**
     * 生成html对象
     * @param el
     */
    var generateHtmlObject = function (el) {
        const html = {};
        if (el) {
            $(el).each(function () {
                $.each(this.attributes, function (index, attr) {
                    html[attr.name] = attr.value;
                });
            });
            
            html['left'] = el.offsetLeft;
            html['top'] = el.offsetTop;
            html['width'] = el.offsetWidth;
            html['height'] = el.offsetHeight;
            html.tag = el.tagName;

            for (var i = 0; i < el.childNodes.length; ++i) {
                console.log(el.childNodes[i]);
                const node = el.childNodes[i];
                if (node.nodeName === "#text") {
                    html['text'] = node.nodeValue;
                }
            }
        }

        return html;
    };
} catch (e) {
    console.error(e);
}

function readXPath(element) {
    if (element.id !== "") {//判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
        return "//*[@id='" + element.id + "']";
    }
    //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
    if (element == document.body) {//递归到body处，结束递归
        return '/html/' + element.tagName.toLowerCase();
    }
    var ix = 0,//在nodelist中的位置，且每次点击初始化
         siblings = element.parentNode.childNodes;//同级的子元素
 
    for (var i = 0, l = siblings.length; i < l; i++) {
        var sibling = siblings[i];
        //如果这个元素是siblings数组中的元素，则执行递归操作
        if (sibling == element) {
            if (ix == 0) {
                return arguments.callee(element.parentNode) + '/' + element.tagName.toLowerCase();
            } else {
                return arguments.callee(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
            }
            //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
        } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
            ix++;
        }
    }
};