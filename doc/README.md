# 项目结构
``` markdown
UIAUTO
├ client ----- electron外壳
├ web ----- web目录
│   ├ build ----- 存放打包后html、css、js等文件(构建相关)
│   ├ public ----- 插件文件
│   ├ src ----- src目录
│   │   ├ api ----- 存放模拟接口文件
│   │   ├ assets ----- 静态文件，存放图片等
│   │   ├ components ----- 存放小组件(面包屑等)
│   │   ├ icons ----- 存放svg文件
│   │   ├ layout ----- 存放导航栏、设置等组件
│   │   ├ router ----- 路由文件
│   │   ├ store ----- vuex store文件
│   │   ├ styles ----- 框架样式文件
│   │   ├ util ----- 公用文件
│   │   ├ view ----- 模块文件
│   │   │   ├ dependency ----- 环境依赖模块
│   │   │   ├ home ----- 首页模块
│   │   │   ├ login ----- 登录模块
│   │   │   ├ plugin ----- 插件库模块
│   │   │   ├ project ----- 项目模块
│   │   │   ├ setting ----- 设置模块
│   │   └   └ workspace ----- 项目库模块
│   ├ App.vue ----- 入口文件
│   ├ main.js ----- 入口js依赖文件
│   ├ permission.js ----- 权限文件
└   └ setting.js ----- 设置文件
```

# 插件说明

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
      "type":"Convention",  // we have these types yet => [Start, Condition, Convention, Circulation, End]. Only Condition and Convention can be defined
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