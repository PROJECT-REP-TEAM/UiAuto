(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-45123e27"],{"0fa6":function(e,t,s){"use strict";var r=s("9c8b"),o=s.n(r);o.a},1667:function(e,t,s){"use strict";var r=s("e3ee"),o=s.n(r);o.a},2017:function(e,t,s){"use strict";var r=s("b12d"),o=s.n(r);o.a},"27ae":function(module,exports,__webpack_require__){(function(global){var __WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;(function(e,t){module.exports=t(e)})("undefined"!==typeof self?self:"undefined"!==typeof window?window:"undefined"!==typeof global?global:this,(function(global){"use strict";global=global||{};var _Base64=global.Base64,version="2.5.1",buffer;if(module.exports)try{buffer=eval("require('buffer').Buffer")}catch(err){buffer=void 0}var b64chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",b64tab=function(e){for(var t={},s=0,r=e.length;s<r;s++)t[e.charAt(s)]=s;return t}(b64chars),fromCharCode=String.fromCharCode,cb_utob=function(e){if(e.length<2){var t=e.charCodeAt(0);return t<128?e:t<2048?fromCharCode(192|t>>>6)+fromCharCode(128|63&t):fromCharCode(224|t>>>12&15)+fromCharCode(128|t>>>6&63)+fromCharCode(128|63&t)}t=65536+1024*(e.charCodeAt(0)-55296)+(e.charCodeAt(1)-56320);return fromCharCode(240|t>>>18&7)+fromCharCode(128|t>>>12&63)+fromCharCode(128|t>>>6&63)+fromCharCode(128|63&t)},re_utob=/[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,utob=function(e){return e.replace(re_utob,cb_utob)},cb_encode=function(e){var t=[0,2,1][e.length%3],s=e.charCodeAt(0)<<16|(e.length>1?e.charCodeAt(1):0)<<8|(e.length>2?e.charCodeAt(2):0),r=[b64chars.charAt(s>>>18),b64chars.charAt(s>>>12&63),t>=2?"=":b64chars.charAt(s>>>6&63),t>=1?"=":b64chars.charAt(63&s)];return r.join("")},btoa=global.btoa?function(e){return global.btoa(e)}:function(e){return e.replace(/[\s\S]{1,3}/g,cb_encode)},_encode=buffer?buffer.from&&Uint8Array&&buffer.from!==Uint8Array.from?function(e){return(e.constructor===buffer.constructor?e:buffer.from(e)).toString("base64")}:function(e){return(e.constructor===buffer.constructor?e:new buffer(e)).toString("base64")}:function(e){return btoa(utob(e))},encode=function(e,t){return t?_encode(String(e)).replace(/[+\/]/g,(function(e){return"+"==e?"-":"_"})).replace(/=/g,""):_encode(String(e))},encodeURI=function(e){return encode(e,!0)},re_btou=new RegExp(["[À-ß][-¿]","[à-ï][-¿]{2}","[ð-÷][-¿]{3}"].join("|"),"g"),cb_btou=function(e){switch(e.length){case 4:var t=(7&e.charCodeAt(0))<<18|(63&e.charCodeAt(1))<<12|(63&e.charCodeAt(2))<<6|63&e.charCodeAt(3),s=t-65536;return fromCharCode(55296+(s>>>10))+fromCharCode(56320+(1023&s));case 3:return fromCharCode((15&e.charCodeAt(0))<<12|(63&e.charCodeAt(1))<<6|63&e.charCodeAt(2));default:return fromCharCode((31&e.charCodeAt(0))<<6|63&e.charCodeAt(1))}},btou=function(e){return e.replace(re_btou,cb_btou)},cb_decode=function(e){var t=e.length,s=t%4,r=(t>0?b64tab[e.charAt(0)]<<18:0)|(t>1?b64tab[e.charAt(1)]<<12:0)|(t>2?b64tab[e.charAt(2)]<<6:0)|(t>3?b64tab[e.charAt(3)]:0),o=[fromCharCode(r>>>16),fromCharCode(r>>>8&255),fromCharCode(255&r)];return o.length-=[0,0,2,1][s],o.join("")},_atob=global.atob?function(e){return global.atob(e)}:function(e){return e.replace(/\S{1,4}/g,cb_decode)},atob=function(e){return _atob(String(e).replace(/[^A-Za-z0-9\+\/]/g,""))},_decode=buffer?buffer.from&&Uint8Array&&buffer.from!==Uint8Array.from?function(e){return(e.constructor===buffer.constructor?e:buffer.from(e,"base64")).toString()}:function(e){return(e.constructor===buffer.constructor?e:new buffer(e,"base64")).toString()}:function(e){return btou(_atob(e))},decode=function(e){return _decode(String(e).replace(/[-_]/g,(function(e){return"-"==e?"+":"/"})).replace(/[^A-Za-z0-9\+\/]/g,""))},noConflict=function(){var e=global.Base64;return global.Base64=_Base64,e};if(global.Base64={VERSION:version,atob:atob,btoa:btoa,fromBase64:decode,toBase64:encode,utob:utob,encode:encode,encodeURI:encodeURI,btou:btou,decode:decode,noConflict:noConflict,__buffer__:buffer},"function"===typeof Object.defineProperty){var noEnum=function(e){return{value:e,enumerable:!1,writable:!0,configurable:!0}};global.Base64.extendString=function(){Object.defineProperty(String.prototype,"fromBase64",noEnum((function(){return decode(this)}))),Object.defineProperty(String.prototype,"toBase64",noEnum((function(e){return encode(this,e)}))),Object.defineProperty(String.prototype,"toBase64URI",noEnum((function(){return encode(this,!0)})))}}return global["Meteor"]&&(Base64=global.Base64),module.exports?module.exports.Base64=global.Base64:(__WEBPACK_AMD_DEFINE_ARRAY__=[],__WEBPACK_AMD_DEFINE_RESULT__=function(){return global.Base64}.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__),void 0===__WEBPACK_AMD_DEFINE_RESULT__||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)),{Base64:global.Base64}}))}).call(this,__webpack_require__("c8ba"))},3935:function(e,t,s){"use strict";var r=s("6d74"),o=s.n(r);o.a},"3c79":function(e,t,s){"use strict";s.d(t,"a",(function(){return o}));var r=s("2b0e"),o=new r["default"]},"6d74":function(e,t,s){},"8fbb":function(e,t){e.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAAsCAYAAADFP/AjAAAAAXNSR0IArs4c6QAAAu9JREFUaAXtmrtrFUEYxbPqRXyCBp9RxMpX8EEUURRsAqI2gpUR/BuECHYWQhpLLVNYaLCwSKGCLwiCYGVjYSwEFYyNCEYFEfX6+2RvstzMndkzd9eFsB8cdnfmfOfsN7O7d3a5SU+X0Ww2+5HYB2xr2AUuJUlym22pgfdmDA6Clq9t7y+KcUVsPXnnwHlgQu2xoL2hqGO8l6F1Bpj3MZCAbDySikJwG9lXwQmwMKtU9j7eq/EYAUNguc8vV1EIGu8iuAwW+wTL6MPfZuY6WJdHP1gUgjsRugnsvvmvkc7OKKanFWNvUYhuR2wCrFFEi+DivRKdh2BA1et4QyO6FbHHoIqCluJ7D8gFkdPjLIqCNtD3BPQZKSK+RuT8S8G7wc44OBKpMe3MQ/gOUOMXCWNgj1M0ZyP5w6pxyp9ge9xpQ8dghOhzcuxy7SrQ2AimRf+P8A93NKazAV6Joi/hr+ooKnSgc0v0/gx/t9cCwgVR9A18u/+6DnQOid7fLCdoDGlSFD4ZFM1JwPeG6H0lKI3ggCj6Hr7z6Rk0ayOgswQo99Jv+FvaZGYOsyd1dqY1384oK/E/+ahB1ikYK4KsWcIDvN/NHjr2bMTBFFBik0MqqgnTccUYrq0F/QHpgCj6xa+Yvxdfe+L+EP13+Bxal99eH8nR98HRFttk60t15e/1bxWlrgKmYitw5Kne37mf3EuhVDy2KO9IOU7c16QWFfS2B4S9Dvt/leee0qe5TdEtalFBb5spe4rZu4sSTYUc4NqHGiWC3vaS2Ksoptz9zPCwJ+8u1/2kpz/bpfr3BbxfJBCO4vA061LA/hBFjYV08G7A+Rniif3X7PJTLz3Rw0svxXveFqWsubzDHtFZirfNVCnCOQssxduKMhQdwcdualiKdxmiRQ+QrFcXJQ9ZRQn1TFU08LJtPVPykFWUUM9URQMv29YzJQ9ZRQn1TFU08LLtvJwp+0Zhfyko+u8Ez/hG8TY0xHivhTMY4on9r/8C2QzmGeYm/igAAAAASUVORK5CYII="},"9c8b":function(e,t,s){},"9ed6":function(e,t,s){"use strict";s.r(t);var r=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"login-container"},[e._m(0),e._v(" "),s("el-form",{ref:"loginForm",staticClass:"login-form",attrs:{model:e.loginForm,rules:e.loginRules,"auto-complete":"on","label-position":"left"}},[s("div",{staticClass:"left-body"}),e._v(" "),s("div",{staticClass:"right-body"},[s("svg-icon",{staticStyle:{width:"18px",height:"18px",color:"#333",position:"absolute",right:"10px",top:"10px",cursor:"pointer"},attrs:{"icon-class":"setting"},on:{click:e.setting}}),e._v(" "),s("div",{staticClass:"title-container"},[s("h3",{staticClass:"title"},[e._v("系统登录")])]),e._v(" "),s("el-form-item",{staticStyle:{margin:"60px 40px 20px 40px"},attrs:{prop:"username"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"user"}})],1),e._v(" "),s("el-input",{ref:"username",staticStyle:{color:"#333333"},attrs:{placeholder:"用户名",name:"username",type:"text","auto-complete":"on"},model:{value:e.loginForm.username,callback:function(t){e.$set(e.loginForm,"username",t)},expression:"loginForm.username"}})],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"password"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"}})],1),e._v(" "),s("el-input",{key:e.passwordType,ref:"password",staticStyle:{color:"#333333"},attrs:{type:e.passwordType,placeholder:"密码",name:"password","auto-complete":"on"},nativeOn:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.handleLogin(t)}},model:{value:e.loginForm.password,callback:function(t){e.$set(e.loginForm,"password",t)},expression:"loginForm.password"}}),e._v(" "),s("span",{staticClass:"show-pwd",on:{click:e.showPwd}},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"===e.passwordType?"eye":"eye-open"}})],1)],1),e._v(" "),s("div",{staticStyle:{margin:"30px 40px",height:"36px","line-height":"36px","margin-bottom":"0","padding-bottom":"0"}},[s("el-checkbox",{model:{value:e.checked,callback:function(t){e.checked=t},expression:"checked"}},[e._v("7天内记住我")]),e._v(" "),s("el-button",{staticStyle:{float:"right",width:"40%",background:"#2249a8"},attrs:{loading:e.loading,type:"primary"},nativeOn:{click:function(t){return t.preventDefault(),e.handleLogin(t)}}},[e._v("登录")])],1),e._v(" "),s("div",{staticStyle:{margin:"10px 40px","text-align":"end"}},[s("el-link",{staticStyle:{"margin-right":"10px"},attrs:{href:"#",type:"info",size:"mini",underline:!1},nativeOn:{click:function(t){return t.preventDefault(),e.handleResetPassword()}}},[e._v("忘记密码")]),e._v(" "),s("el-link",{staticStyle:{"margin-right":"10px"},attrs:{href:"#",type:"info",size:"mini",underline:!1},nativeOn:{click:function(t){return t.preventDefault(),e.handleResetUsername()}}},[e._v("忘记用户名")]),e._v(" "),s("el-link",{attrs:{href:"#",type:"info",size:"mini",underline:!1},nativeOn:{click:function(t){t.preventDefault(),e.showRegisterDialog=!0}}},[e._v("快速注册")])],1)],1)]),e._v(" "),s("el-dialog",{attrs:{title:"快速注册",visible:e.showRegisterDialog,width:"500px","before-close":e.cancelRegister},on:{"update:visible":function(t){e.showRegisterDialog=t}}},[s("el-form",{ref:"regisForm",attrs:{model:e.regisForm,rules:e.registerRules}},[s("el-form-item",{staticStyle:{margin:"0 40px"},attrs:{prop:"username"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"user"}})],1),e._v(" "),s("el-input",{attrs:{autocomplete:"off",type:"text",placeholder:"用户名"},model:{value:e.regisForm.username,callback:function(t){e.$set(e.regisForm,"username",t)},expression:"regisForm.username"}})],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"password"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"}})],1),e._v(" "),s("el-input",{ref:"regisPassword1",staticStyle:{color:"#333333"},attrs:{type:e.regisPasswordType1,placeholder:"密码不少于6位","auto-complete":"off"},model:{value:e.regisForm.password,callback:function(t){e.$set(e.regisForm,"password",t)},expression:"regisForm.password"}}),e._v(" "),s("span",{staticClass:"show-pwd",on:{click:function(t){return e.showRegistrationPwd(1)}}},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"===e.regisPasswordType1?"eye":"eye-open"}})],1)],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"checkPassword"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"}})],1),e._v(" "),s("el-input",{ref:"regisPassword2",staticStyle:{color:"#333333"},attrs:{type:e.regisPasswordType2,placeholder:"请重新输入密码","auto-complete":"off"},model:{value:e.regisForm.checkPassword,callback:function(t){e.$set(e.regisForm,"checkPassword",t)},expression:"regisForm.checkPassword"}}),e._v(" "),s("span",{staticClass:"show-pwd",on:{click:function(t){return e.showRegistrationPwd(2)}}},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"===e.regisPasswordType2?"eye":"eye-open"}})],1)],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"email"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"email"}})],1),e._v(" "),s("el-input",{attrs:{autocomplete:"off",type:"email",placeholder:"邮箱"},model:{value:e.regisForm.email,callback:function(t){e.$set(e.regisForm,"email",t)},expression:"regisForm.email"}})],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"phone"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"phone"}})],1),e._v(" "),s("el-input",{attrs:{placeholder:"手机号",autocomplete:"off"},model:{value:e.regisForm.phone,callback:function(t){e.$set(e.regisForm,"phone",t)},expression:"regisForm.phone"}})],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"code"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"code"}})],1),e._v(" "),s("el-input",{attrs:{maxlength:"6",placeholder:"验证码",autocomplete:"off"},model:{value:e.regisForm.code,callback:function(t){e.$set(e.regisForm,"code",t)},expression:"regisForm.code"}}),e._v(" "),s("el-button",{staticStyle:{position:"absolute",right:"5px",top:"5px",background:"#2249a8"},attrs:{size:"max",type:"primary",disabled:e.isSendCode},on:{click:e.sendMsg}},[e._v(e._s(e.statusMsg))])],1),e._v(" "),s("el-form-item",{staticStyle:{border:"0",color:"white",background:"white","margin-right":"20px"}},[s("el-button",{staticStyle:{background:"#2249a8"},attrs:{type:"primary",size:"max"},on:{click:e.handleRegister}},[e._v("注 册")]),e._v(" "),s("el-button",{attrs:{size:"max"},on:{click:e.cancelRegister}},[e._v("取 消")])],1)],1)],1),e._v(" "),s("settingForm",{ref:"settingForm"}),e._v(" "),s("resetPassword",{ref:"resetPassword"}),e._v(" "),s("resetUsername",{ref:"resetUsername"})],1)},o=[function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticStyle:{width:"850px",margin:"6% auto 20px"}},[r("img",{staticStyle:{"vertical-align":"sub"},attrs:{src:s("8fbb")}}),e._v(" "),r("span",{staticStyle:{color:"#ffffff","font-size":"40px","font-weight":"400","margin-left":"15px"}},[e._v("让您的工作，更加高效！")])])}],i=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"setting"},[s("el-dialog",{attrs:{title:"服务器信息",visible:e.dialogFormVisible,width:"500px"},on:{"update:visible":function(t){e.dialogFormVisible=t},closed:e.reset}},[e.dialogFormVisible?s("el-form",{ref:"setting-form",attrs:{"label-width":"100px","status-icon":""}},[s("el-form-item",{attrs:{label:"服务器地址"}},[s("el-input",{staticStyle:{width:"100%"},attrs:{id:"serverUrl",disabled:!1,type:"text"},model:{value:e.serverUrl,callback:function(t){e.serverUrl=t},expression:"serverUrl"}})],1)],1):e._e(),e._v(" "),s("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[s("el-button",{staticStyle:{background:"#2249a8"},attrs:{type:"primary"},on:{click:e.handleConfirm}},[e._v("确 定")]),e._v(" "),s("el-button",{on:{click:function(t){e.dialogFormVisible=!1}}},[e._v("取 消")])],1)],1)],1)},a=[],n=s("f22f"),c=s("1e55"),l=(c.fileSelector,window.require("path"),window.require("os")),d=(window.require("fs-extra"),window.require("fs")),u="".concat(l.homedir(),"/.uiauto/uiauto.conf"),m={data:function(){return{dialogFormVisible:!1,serverUrl:""}},watch:{serverUrl:function(e){n["default"].serverUrl=e}},methods:{show:function(e){this.dialogFormVisible=!0,this.serverUrl=n["default"].serverUrl},reset:function(){},handleConfirm:function(){var e=JSON.parse(d.readFileSync(u,"utf8")),t={pluginsPath:e.pluginsPath,projectsPath:e.projectsPath,pythonPath:e.pythonPath,serverUrl:this.serverUrl,deviceId:e.deviceId||""};d.writeFileSync(u,JSON.stringify(t,null,"\t")),this.$message({message:"修改成功",type:"success"}),this.dialogFormVisible=!1}}},f=m,g=(s("1667"),s("2877")),p=Object(g["a"])(f,i,a,!1,null,"4ebed1eb",null),h=p.exports,v=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"reset-password"},[s("el-dialog",{attrs:{title:"忘记密码",visible:e.dialogFormVisible,width:"500px"},on:{"update:visible":function(t){e.dialogFormVisible=t},closed:e.reset}},[s("el-form",{ref:"resetForm",attrs:{model:e.resetForm,rules:e.resetRules}},[s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"password"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"}})],1),e._v(" "),s("el-input",{ref:"resetPassword",staticStyle:{color:"#333333"},attrs:{type:e.passwordType,placeholder:"密码不少于6位","auto-complete":"off"},model:{value:e.resetForm.password,callback:function(t){e.$set(e.resetForm,"password",t)},expression:"resetForm.password"}}),e._v(" "),s("span",{staticClass:"show-pwd",on:{click:function(t){return e.showPwd()}}},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"===e.passwordType?"eye":"eye-open"}})],1)],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"mobile"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"mobile"}})],1),e._v(" "),s("el-input",{attrs:{placeholder:"手机号",autocomplete:"off"},model:{value:e.resetForm.mobile,callback:function(t){e.$set(e.resetForm,"mobile",t)},expression:"resetForm.mobile"}})],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"cerification_code"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"code"}})],1),e._v(" "),s("el-input",{attrs:{maxlength:"6",placeholder:"验证码",autocomplete:"off"},model:{value:e.resetForm.cerification_code,callback:function(t){e.$set(e.resetForm,"cerification_code",t)},expression:"resetForm.cerification_code"}}),e._v(" "),s("el-button",{staticStyle:{position:"absolute",right:"5px",top:"5px",background:"#2249a8"},attrs:{size:"max",type:"primary",disabled:e.isSendCode},on:{click:e.sendMsg}},[e._v(e._s(e.statusMsg))])],1),e._v(" "),s("el-form-item",{staticStyle:{border:"0",color:"white",background:"white","margin-right":"20px"}},[s("el-button",{staticStyle:{background:"#2249a8"},attrs:{type:"primary",size:"max"},on:{click:e.handleReset}},[e._v("确 定")]),e._v(" "),s("el-button",{attrs:{size:"max"},on:{click:function(t){e.dialogFormVisible=!1}}},[e._v("取 消")])],1)],1)],1)],1)},b=[],w={data:function(){var e=function(e,t,s){t.length<6?s(new Error("密码不能少于6位")):s()},t=function(e,t,s){/^1[34578]\d{9}$/.test(t)?s():s(new Error("请输入正确的手机号码"))},s=function(e,t,s){if(""===t)s(new Error("请输入验证码"));else if(""!==t){var r=/^\d{6}$/;r.test(t)||s(new Error("验证码不能少于6位纯数字"))}else s()};return{dialogFormVisible:!1,passwordType:"password",statusMsg:"发送验证码",isSendCode:!1,timer:"",resetForm:{password:"",mobile:"",cerification_code:""},resetRules:{password:[{required:!0,trigger:"blur",validator:e}],mobile:[{required:!0,trigger:"blur",validator:t}],cerification_code:[{required:!0,trigger:"blur",validator:s}]}}},methods:{show:function(){this.dialogFormVisible=!0},reset:function(){this.statusMsg="发送验证码",this.isSendCode=!1,this.dialogFormVisible=!1,this.resetForm={password:"",mobile:"",cerification_code:""},this.$refs.resetForm.resetFields()},showPwd:function(){var e=this;"password"===this.passwordType?this.passwordType="":this.passwordType="password",this.$nextTick((function(){e.$refs["resetPassword"].focus()}))},sendMsg:function(){var e=this;this.$refs.resetForm.validateField("mobile",(function(t){t?e.$message({message:t,type:"error"}):e.$store.dispatch("user/sendMsg",{type:"recover",mobile:e.resetForm.mobile}).then((function(){var t=e;e.statusMsg="验证码已发送",e.isSendCode=!0;var s=60;e.statusMsg="".concat(s--,"s后重新获取"),e.timer=setInterval((function(){t.statusMsg="".concat(s--,"s后重新获取"),0===s&&(t.isSendCode=!1,t.statusMsg="重新发送",clearInterval(t.timer))}),1e3),e.$message({message:"验证码发送成功，请前往手机查看",type:"success"})})).catch((function(t){t.isSuccess||e.$message({message:t.error,type:"error"})}))}))},handleReset:function(){var e,t,s,r=this;this.$refs.resetForm.validateField("password",(function(t){e=t})),this.$refs.resetForm.validateField("mobile",(function(e){t=e})),this.$refs.resetForm.validateField("cerification_code",(function(e){s=e})),e||t||s?this.$message({message:e||t||s,type:"error"}):this.$store.dispatch("user/smsRecoverPassword",this.resetForm).then((function(){r.$message({message:"密码重置成功",type:"success"}),r.reset()})).catch((function(e){e.isSuccess||r.$message({message:e.error,type:"error"})}))}}},_=w,y=Object(g["a"])(_,v,b,!1,null,"27ecf7da",null),F=y.exports,C=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"reset-username"},[s("el-dialog",{attrs:{title:"忘记用户名",visible:e.dialogFormVisible,width:"500px"},on:{"update:visible":function(t){e.dialogFormVisible=t},closed:e.reset}},[s("el-form",{ref:"resetForm",attrs:{model:e.resetForm,rules:e.resetRules}},[s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"mobile"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"mobile"}})],1),e._v(" "),s("el-input",{attrs:{placeholder:"手机号",autocomplete:"off"},model:{value:e.resetForm.mobile,callback:function(t){e.$set(e.resetForm,"mobile",t)},expression:"resetForm.mobile"}})],1),e._v(" "),s("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"cerification_code"}},[s("span",{staticClass:"svg-container"},[s("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"code"}})],1),e._v(" "),s("el-input",{attrs:{maxlength:"6",placeholder:"验证码",autocomplete:"off"},model:{value:e.resetForm.cerification_code,callback:function(t){e.$set(e.resetForm,"cerification_code",t)},expression:"resetForm.cerification_code"}}),e._v(" "),s("el-button",{staticStyle:{position:"absolute",right:"5px",top:"5px",background:"#2249a8"},attrs:{size:"max",type:"primary",disabled:e.isSendCode},on:{click:e.sendMsg}},[e._v(e._s(e.statusMsg))])],1),e._v(" "),e.showUsername?s("el-form-item",{staticStyle:{margin:"30px 40px"}},[s("span",[e._v("您的用户名为："+e._s(this.showUsername))])]):e._e(),e._v(" "),s("el-form-item",{staticStyle:{border:"0",color:"white",background:"white","margin-right":"20px"}},[s("el-button",{staticStyle:{background:"#2249a8"},attrs:{type:"primary",size:"max"},on:{click:e.handleConfirm}},[e._v("确 定")]),e._v(" "),s("el-button",{attrs:{size:"max"},on:{click:function(t){e.dialogFormVisible=!1}}},[e._v("取 消")])],1)],1)],1)],1)},x=[],S={data:function(){var e=function(e,t,s){/^1[34578]\d{9}$/.test(t)?s():s(new Error("请输入正确的手机号码"))},t=function(e,t,s){if(""===t)s(new Error("请输入验证码"));else if(""!==t){var r=/^\d{6}$/;r.test(t)||s(new Error("验证码不能少于6位纯数字"))}else s()};return{dialogFormVisible:!1,statusMsg:"发送验证码",showUsername:"",isSendCode:!1,timer:"",resetForm:{mobile:"",cerification_code:""},resetRules:{mobile:[{required:!0,trigger:"blur",validator:e}],cerification_code:[{required:!0,trigger:"blur",validator:t}]}}},methods:{show:function(){this.dialogFormVisible=!0},reset:function(){this.statusMsg="发送验证码",this.showUsername="",this.isSendCode=!1,this.dialogFormVisible=!1,this.resetForm={mobile:"",cerification_code:""},this.$refs.resetForm.resetFields()},sendMsg:function(){var e=this;this.$refs.resetForm.validateField("mobile",(function(t){t?e.$message({message:t,type:"error"}):e.$store.dispatch("user/sendMsg",{type:"recover",mobile:e.resetForm.mobile}).then((function(){var t=e;e.statusMsg="验证码已发送",e.isSendCode=!0;var s=60;e.statusMsg="".concat(s--,"s后重新获取"),e.timer=setInterval((function(){t.statusMsg="".concat(s--,"s后重新获取"),0===s&&(t.isSendCode=!1,t.statusMsg="重新发送",clearInterval(t.timer))}),1e3),e.$message({message:"验证码发送成功，请前往手机查看",type:"success"})})).catch((function(t){t.isSuccess||e.$message({message:t.error,type:"error"})}))}))},handleConfirm:function(){var e,t,s=this;this.$refs.resetForm.validateField("mobile",(function(t){e=t})),this.$refs.resetForm.validateField("cerification_code",(function(e){t=e})),e||t?this.$message({message:e||t,type:"error"}):this.$store.dispatch("user/smsGetUsername",this.resetForm).then((function(e){s.showUsername=e.data.username,s.$message({message:e.data.message,type:"success"})})).catch((function(e){e.isSuccess||s.$message({message:e.error,type:"error"})}))}}},A=S,k=Object(g["a"])(A,C,x,!1,null,"1ff1d1aa",null),$=k.exports,E=(s("61f7"),function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"social-signup-container"},[s("div",{staticClass:"sign-btn",on:{click:function(t){return e.wechatHandleClick("wechat")}}},[s("span",{staticClass:"wx-svg-container"},[s("svg-icon",{staticClass:"icon",attrs:{"icon-class":"wechat"}})],1),e._v(" 微信\n  ")]),e._v(" "),s("div",{staticClass:"sign-btn",on:{click:function(t){return e.tencentHandleClick("tencent")}}},[s("span",{staticClass:"qq-svg-container"},[s("svg-icon",{staticClass:"icon",attrs:{"icon-class":"qq"}})],1),e._v(" QQ\n  ")])])}),R=[],P={name:"SocialSignin",methods:{wechatHandleClick:function(e){alert("ok")},tencentHandleClick:function(e){alert("ok")}}},U=P,M=(s("0fa6"),Object(g["a"])(U,E,R,!1,null,"0cda1556",null)),B=M.exports,D=s("3c79"),T=s("a78e"),q=s.n(T),O=s("27ae").Base64,V={name:"Login",components:{SocialSign:B,settingForm:h,resetPassword:F,resetUsername:$},data:function(){var e=this,t=q.a.get("remember")?JSON.parse(O.decode(q.a.get("remember"))):{},s=function(e,t,s){s()},r=function(t,s,r){s.length<6?r(new Error("密码不能少于6位")):(""!==e.regisForm.checkPassword&&e.$refs.regisForm.validateField("checkPassword"),r())},o=function(t,s,r){""===s?r(new Error("请再次输入密码")):s!==e.regisForm.password?r(new Error("两次输入密码不一致!")):r()},i=function(e,t,s){/^1[34578]\d{9}$/.test(t)?s():s(new Error("请输入正确的手机号码"))},a=function(e,t,s){if(""===t)s(new Error("请正确填写邮箱"));else{if(""!==t){var r=/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;r.test(t)||s(new Error("请输入有效的邮箱"))}s()}},n=function(e,t,s){if(""===t)s(new Error("请输入验证码"));else if(""!==t){var r=/^\d{6}$/;r.test(t)||s(new Error("验证码不能少于6位纯数字"))}else s()};return{loginForm:{username:t.username||"",password:t.password||""},loginRules:{username:[{required:!0,trigger:"blur",validator:s}],password:[{required:!0,trigger:"blur",validator:r}]},passwordType:"password",regisPasswordType1:"password",regisPasswordType2:"password",loading:!1,showDialog:!1,redirect:void 0,checked:!1,showRegisterDialog:!1,regisForm:{username:"",password:"",checkPassword:"",phone:"",code:"",email:""},statusMsg:"发送验证码",registerRules:{username:[{required:!0,trigger:"blur",validator:s}],password:[{required:!0,trigger:"blur",validator:r}],checkPassword:[{trigger:"blur",validator:o}],phone:[{required:!0,trigger:"blur",validator:i}],email:[{required:!0,trigger:"blur",validator:a}],code:[{required:!0,trigger:"blur",validator:n}]},isSendCode:!1,timerid:""}},watch:{$route:{handler:function(e){this.redirect=e.query&&e.query.redirect},immediate:!0}},created:function(){},mounted:function(){""===this.loginForm.username?this.$refs.username.focus():""===this.loginForm.password&&this.$refs.password.focus()},destroyed:function(){},methods:{showPwd:function(){var e=this;"password"===this.passwordType?this.passwordType="":this.passwordType="password",this.$nextTick((function(){e.$refs.password.focus()}))},showRegistrationPwd:function(e){var t=this;"password"===this["regisPasswordType".concat(e)]?this["regisPasswordType".concat(e)]="":this["regisPasswordType".concat(e)]="password",this.$nextTick((function(){t.$refs["regisPassword".concat(e)].focus()}))},handleLogin:function(){var e=this;this.loginForm.username&&this.loginForm.password?(this.loading=!0,this.$store.dispatch("user/login",this.loginForm).then((function(){e.checked&&q.a.set("remember",O.encode(JSON.stringify(e.loginForm)),{expires:7}),D["a"].$emit("is_first_run");var t=localStorage.getItem("is_first_run");null!==t&&!0!==t||(e.redirect="/workspace/index"),e.$router.push({path:e.redirect||"/"}),e.$store.state.user.name=e.loginForm.username,e.loading=!1})).catch((function(t){e.loading=!1,t.isSuccess||e.$message({message:t.error,type:"error"})}))):this.$message({message:"用户名或密码不能为空",type:"error"})},handleRegister:function(){var e,t,s,r=this;this.regisForm.username&&this.regisForm.phone&&this.regisForm.code&&this.regisForm.password?(this.$refs.regisForm.validateField("password",(function(t){e=t})),this.$refs.regisForm.validateField("phone",(function(e){t=e})),this.$refs.regisForm.validateField("email",(function(e){s=e})),e||t||s?this.$message({message:"密码或手机号或邮箱格式不正确",type:"error"}):this.$store.dispatch("user/register",this.regisForm).then((function(){r.$message({message:"注册成功",type:"success"}),r.cancelRegister()})).catch((function(e){e.isSuccess||r.$message({message:e.error,type:"error"})}))):this.$message({message:"用户名或密码或手机号或验证码或邮箱不能为空",type:"error"})},cancelRegister:function(){this.regisForm.password="",this.regisForm.username="",this.statusMsg="发送验证码",this.regisForm.phone="",this.regisForm.code="",this.regisForm.email="",this.showRegisterDialog=!1,this.$refs.regisForm.resetFields()},sendMsg:function(){var e,t=this;this.regisForm.phone?(this.$refs.regisForm.validateField("phone",(function(t){e=t})),e?this.$message({message:"请输入正确的手机号",type:"error"}):this.$store.dispatch("user/sendMsg",{type:"registered",mobile:this.regisForm.phone}).then((function(){var e=t;t.statusMsg="验证码已发送",t.isSendCode=!0;var s=60;t.statusMsg="".concat(s--,"s后重新获取"),t.timerid=setInterval((function(){e.statusMsg="".concat(s--,"s后重新获取"),0===s&&(e.isSendCode=!1,e.statusMsg="重新发送",clearInterval(e.timerid))}),1e3),t.$message({message:"验证码发送成功，请前往手机查看",type:"success"})})).catch((function(e){e.isSuccess||t.$message({message:e.error,type:"error"})}))):this.$message({message:"手机号不能为空",type:"error"})},setting:function(){this.$refs["settingForm"]&&this.$refs["settingForm"].show()},handleResetPassword:function(){this.$refs["resetPassword"]&&this.$refs["resetPassword"].show()},handleResetUsername:function(){this.$refs["resetUsername"]&&this.$refs["resetUsername"].show()}}},z=V,I=(s("2017"),s("3935"),Object(g["a"])(z,r,o,!1,null,"3af00e6b",null));t["default"]=I.exports},b12d:function(e,t,s){},e3ee:function(e,t,s){}}]);