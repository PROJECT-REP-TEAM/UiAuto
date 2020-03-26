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

        result.html["xpath"] = generateXPath(el);

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
                xpath = generateXPath(el.parentElement) + "/" + el.localName + "[" + $(el).index() + "]"
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

