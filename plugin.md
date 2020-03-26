# <b>CLI</b>
> UiAuto提供插件开发脚手架，方便UiAuto插件开发者初始化插件目录、定义插件参数。降低开发复杂度和参数定义错误导致的时间和精力浪费，有效帮助开发者专注于代码实现。<br>

## 安装
命令行执行：
``` javascript
npm install -g uiauto-cli	// 全局安装CLI
```
## 使用
- 新建插件项目
``` javascript
uiauto init "plugin_name"	// 在当前目录初始化名为 plugin_name 的UiAuto插件项目
```
> 执行后命令行持续请求开发者输入配置，完成配置填写后CLI自动在当前路径创建名为“plugin_name”的项目文件夹
- 向已经存在的插件项目新增插件功能
```javascript
uiauto add					// 在当前目录中向已存在的插件项目新增功能
```
> 执行后命令行持续请求开发者输入配置，完成配置填写后CLI自动在当前插件项目中添加新的功能配置。但新增的功能所需的参数配置，仍需手动配置，配置方法请继续向下阅读。<br>

# 插件开发<br>
> 插件由描述文件及入口程序组成，入口程序主要是暴露插件每个操作的执行方法（基于Java语言开发的插件的入口程序是编译打包的jar包文件）。<br>

## 插件依赖
> 对于基于Python语言开发的插件，通过添加requirements.txt文件来配置依赖库。<br>
> 对于基于NodeJS语言开发的插件是在package.json文件内的dependencies属性配置依赖库。<br>
> 对于基于Java语言开发的插件是在编译jar包时就需要把依赖库一起打包。<br>

## 描述文件结构
`描述文件内容为标准JSON格式`
``` javascript
{
  "id": "hello-world",
  "name": "hello-world", // must in English, 
  "description": "say hello from UiAuto!",
  "version": "1.0.0",
  "author": "UiAuto",
  "language": "nodejs",
  "license": "MIT",
  "dependencies": {
    "lodash": "4.17.11" // depandencies of the plugin
  },
  "uiauto_config": {
    "operations": [{
      "category_id": "plugin-template", // class of the operation, sort the opterations according to this param
      "category_name": "模板插件", // name of the class, if we don't have the category_id above yet, this name will be shown on front-end
      "operation_id": "plugin-one",
      "operation_name": "插件一",
      "method": "sayHello", // if this opteration is executed, function named "sayHello" in "./index.js" ("./index.py" in python) will be activated
      "type":"Convention",  // we have these types yet => [Start, Condition, Convention, Circulation, Script, End]. Only Condition and Convention can be defined
      "input": [{
        "name": "必填属性", // label of this input group
        "id": "required",
        "properties": [{
            "id": "addressee", // id of this input
            "name": "用户名", // label of this input
            "type": "text", // type of this input, you can read the detail of various types below
            "required": true, // is the value required
            "value": "uiauto_group" // the default value
          },
          {
            "id": "file",
            "name": "文件",
            "type": "file",
            "required": true,
            "value": ""
          }
        ]
      }, {
        "name": "可选属性",
        "id": "unrequired",
        "properties": [{
			"id": "drink",
          	"name": "饮品",
         	"required": false,
			"type": "select",
			"value": "tea"	// default value 「默认值」
			"options": {
				"multiple": true, // required option, could the user make multiple choices or not
				"choices": [{
					"value":"juice",
					"label":"果汁"
				}, {
					"value":"coffee",
					"label":"咖啡"
				}, {
					"value":"tea",
					"label":"茶"
				}] // enumerate groups of value and label
			}
		}]
      }],
      "output": {
        "is_allow_global_use": true,
        "description": "返回执行结果，true 或者 false",
        "value": ""
      }
    }]
  }
}

```

## 属性类型总览

### text 普通文本类型
``` javascript
{
	"type": "text",
	"value": "default value"	// 默认值
}
```
`result: <String>`


### password 密码文本类型
*密码文本类型的前端展示形式是 “···”
``` javascript
{
	"type": "password",
	"value": "default value"	// 默认值
}
```
`result: <String>`


### string 文本展示类型
*该类型下的文本只做展示用途，不允许编辑*
``` javascript
{
	"type": "string",
	"value": "value which can not be edited"
}
```
`result: null`


### file 文件类型
*该类型目前仅支持选择一个文件*
``` javascript
{
	"type": "file"
}
```
`result: <String <filePath>>`


### color 颜色类型
``` javascript
{
	"type": "color",
	"value": "#c71585"	// default value 「默认值」,
	"options": {
		"predefineColors": [
			"#ff4500",
			"#ff8c00",
			"#ffd700",
			"#90ee90",
			"#00ced1",
			"#1e90ff",
			"#c71585",
			"rgba(255, 69, 0, 0.68)",
			"rgb(255, 120, 0)",
			"hsv(51, 100, 98)",
			"hsva(120, 40, 94, 0.5)",
			"hsl(181, 100%, 37%)",
			"hsla(209, 100%, 56%, 0.73)",
			"#c7158577"
		]
	}
}
```
`result: <String>`


### checkbox 多选类型
``` javascript
{
	"type": "checkbox",
	"value": [],	// default value 「默认值」
	"options": {
		"checked": [] // 默认选中
	}
}
```
`result: <Array>`


### dateTimeRange 时间段类型
*options.type 不同，value 需求不同，但值可被兼容，若插件需要精确到时间，但默认值没有精确到时间（不推荐），则会默认设定为世界协调时间(UTC)/格林尼治时间(GMT) 00:00:00，即若在东八时区，则默认值为 08:00:00。*
``` javascript
{
	"type": "dateTimeRange",
	"value": ["2019-05-01 00:00:00", "2019-10-01 12:00:00"]	// default value 「默认值」
	"options": {
		"type": "daterange" // "datetimerange" | "daterange" | "monthrange"
	}
}
```
`result: <Array(2)>`

### inputNumber 计数器类型
``` javascript
{
    "type": "inputNumber",
    "value": 10 // 默认值
}
```
`result: <Number>`

### conditions 条件类型
*该类型的值均为不等式字符串*
``` javascript
{
    "type": "conditions",
    "value": ["value1 > 10", "value2 < 50"] // 默认值
}
```
`result: <Array>`

### dateTime 日期时间类型
``` javascript
{
    "type": "dateTime",
	"value": "2019-05-01 00:00:00"	// default value 「默认值」
	"options": {
		"type": "datetime" // "datetime" | "date" | "time"
	}
}
```
`result: <String>`

### radio 单选类型
``` javascript
{
    "type": "radio",
	"value": "tea"	// default value 「默认值」
	"options": {
		"choices": ["juice", "coffee", "tea"] // enumerations
	}
}
```
`result: <String>`

### select 下拉列表类型
``` javascript
{
    "type": "select",
	"value": "tea"	// default value 「默认值」
	"options": {
		"multiple": true, // required option, could the user make multiple choices or not
		"choices": [{
			"value":"juice",
			"label":"果汁"
		}, {
			"value":"coffee",
			"label":"咖啡"
		}, {
			"value":"tea",
			"label":"茶"
		}] // enumerate groups of value and label
	}
}
```
`!options.multiple`: `result: <String>`
`options.multiple`: `result: <Array>`

### slider 滑块类型
``` javascript
{
    "type": "slider",
	"value": 10	// default value 「默认值」
	"options": {
		"step": 10, // unrequired option, default 0
		"max": 100, // maximum, default 100
		"min": 0 // minimum, defalut 0
		"precision": 1 // precision, defalut 1
	}
}
```
`result: <String>`

### switch 开关类型
``` javascript
{
    "type": "switch",
	"value": false	// default value 「默认值」
}
```
`result: <Boolean>`

### json JSON类型
``` javascript
{
    "type": "json",
	"value": {
		"demo_key": "demo_value"
	}	// default value 「默认值」
}
```
`result: <Boolean>`

### code 编辑器类型
``` javascript
{
    "type": "code",
	"value": "print('Hello World!')"	// default value 「默认值」
}
```
`result: <Boolean>`

### screenshot 截屏类型
``` javascript
{
    "type": "screenshot",
    "value: "" // image path
}
```
`result: <String>`

### uiselector ui选择类型
``` javascript
{
  "type":"uiselector",
  "value":{
    "html":{
      "html":{
        "class":"head_wrapper",
        "text":"",
        "left":0,
        "top":0,
        "width":810,
        "height":895,
        "tag":"DIV",
        "parent":{
          "id":"head",
          "text":"",
          "left":0,
          "top":0,
          "width":810,
          "height":895,
          "tag":"DIV"
        },
        "clientX":580,
        "clientY":535,
        "screenX":598,
        "screenY":625,
        "offsetX":18,
        "offsetY":90,
        "bounding_client_rect":{
          "x":0,
          "y":0,
          "width":810,
          "height":895,
          "top":0,
          "right":810,
          "bottom":895,
          "left":0
        }
      },
      "element_screenshot":"element_1563522215.6124997.png"
    }
  }
}
```
`result: <Object>`

## 属性类型通用配置项

### 属性输入框联动
> 如果你在使用UiAuto进行开发的时候，需要根据使用者的输入动态渲染/隐藏某些属性输入框或想实现其他复杂的具有联动需求的输入配置，则可以通过参数 "show_if" 进行配置。

``` javascript
{
  ...
  
  "uiauto_config": {
    "operations": [{
      
	  ...
	  
      "input": [{
        "name": "必填属性", 
        "id": "required",
        "properties": [{
            "id": "dishType",
          	"name": "菜品类型",
         	"required": true,
			"type": "select",
			"value": "single"	// default value 「默认值」
			"options": {
				"multiple": false, // required option, could the user make multiple choices or not
				"choices": [{
					"value":"single",
					"label":"单点"
				}, {
					"value":"package",
					"label":"套餐"
				}] // enumerate groups of value and label
			}
        },{
            "id": "stapleFood",
          	"name": "主食",
         	"required": true,
			"type": "select",
			"value": "friedRice"	// default value 「默认值」
			"options": {
				"multiple": false, // required option, could the user make multiple choices or not
				"choices": [{
					"value":"pasta",
					"label":"意大利面"
				}, {
					"value":"friedRice",
					"label":"炒饭"
				}, {
					"value":"steak",
					"label":"牛排"
				}] // enumerate groups of value and label
			}
        }]
      }, {
        "name": "可选属性",
        "id": "unrequired",
        "properties": [{
			"id": "drink",
			"name": "饮品",
			"show_if": "$input.required.dishType==='package'",
         	"required": false,
			"type": "select",
			"value": "tea"	// default value 「默认值」
			"options": {
				"multiple": false, // required option, could the user make multiple choices or not
				"choices": [{
					"value":"juice",
					"label":"果汁"
				}, {
					"value":"coffee",
					"label":"咖啡"
				}, {
					"value":"tea",
					"label":"茶"
				}] // enumerate groups of value and label
			}
		}]
      }],
      "output": {
        "is_allow_global_use": true,
        "description": "返回执行结果，true 或者 false",
        "value": ""
      }
    }]
  }
}
```

> 以上代码在可选属性里对“饮品”属性框配置了 "show_if": "$input.required.dishType==='package'" 则控制为：
当本插件输入框id为 "required"，id为 "dishType" 的输入框值为 "package" 时，显示该属性配置。
目前 "show_if" 可配置javascript规范下的表达式，其中$input是指在本插件输入属性中查找。
