(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-3a189946"],{"0fb9":function(e,t,r){},2017:function(e,t,r){"use strict";var s=r("b12d"),o=r.n(s);o.a},2735:function(e,t,r){"use strict";var s=r("0fb9"),o=r.n(s);o.a},"27ae":function(module,exports,__webpack_require__){(function(global){var __WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;(function(e,t){module.exports=t(e)})("undefined"!==typeof self?self:"undefined"!==typeof window?window:"undefined"!==typeof global?global:this,(function(global){"use strict";global=global||{};var _Base64=global.Base64,version="2.5.1",buffer;if(module.exports)try{buffer=eval("require('buffer').Buffer")}catch(err){buffer=void 0}var b64chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",b64tab=function(e){for(var t={},r=0,s=e.length;r<s;r++)t[e.charAt(r)]=r;return t}(b64chars),fromCharCode=String.fromCharCode,cb_utob=function(e){if(e.length<2){var t=e.charCodeAt(0);return t<128?e:t<2048?fromCharCode(192|t>>>6)+fromCharCode(128|63&t):fromCharCode(224|t>>>12&15)+fromCharCode(128|t>>>6&63)+fromCharCode(128|63&t)}t=65536+1024*(e.charCodeAt(0)-55296)+(e.charCodeAt(1)-56320);return fromCharCode(240|t>>>18&7)+fromCharCode(128|t>>>12&63)+fromCharCode(128|t>>>6&63)+fromCharCode(128|63&t)},re_utob=/[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,utob=function(e){return e.replace(re_utob,cb_utob)},cb_encode=function(e){var t=[0,2,1][e.length%3],r=e.charCodeAt(0)<<16|(e.length>1?e.charCodeAt(1):0)<<8|(e.length>2?e.charCodeAt(2):0),s=[b64chars.charAt(r>>>18),b64chars.charAt(r>>>12&63),t>=2?"=":b64chars.charAt(r>>>6&63),t>=1?"=":b64chars.charAt(63&r)];return s.join("")},btoa=global.btoa?function(e){return global.btoa(e)}:function(e){return e.replace(/[\s\S]{1,3}/g,cb_encode)},_encode=buffer?buffer.from&&Uint8Array&&buffer.from!==Uint8Array.from?function(e){return(e.constructor===buffer.constructor?e:buffer.from(e)).toString("base64")}:function(e){return(e.constructor===buffer.constructor?e:new buffer(e)).toString("base64")}:function(e){return btoa(utob(e))},encode=function(e,t){return t?_encode(String(e)).replace(/[+\/]/g,(function(e){return"+"==e?"-":"_"})).replace(/=/g,""):_encode(String(e))},encodeURI=function(e){return encode(e,!0)},re_btou=new RegExp(["[À-ß][-¿]","[à-ï][-¿]{2}","[ð-÷][-¿]{3}"].join("|"),"g"),cb_btou=function(e){switch(e.length){case 4:var t=(7&e.charCodeAt(0))<<18|(63&e.charCodeAt(1))<<12|(63&e.charCodeAt(2))<<6|63&e.charCodeAt(3),r=t-65536;return fromCharCode(55296+(r>>>10))+fromCharCode(56320+(1023&r));case 3:return fromCharCode((15&e.charCodeAt(0))<<12|(63&e.charCodeAt(1))<<6|63&e.charCodeAt(2));default:return fromCharCode((31&e.charCodeAt(0))<<6|63&e.charCodeAt(1))}},btou=function(e){return e.replace(re_btou,cb_btou)},cb_decode=function(e){var t=e.length,r=t%4,s=(t>0?b64tab[e.charAt(0)]<<18:0)|(t>1?b64tab[e.charAt(1)]<<12:0)|(t>2?b64tab[e.charAt(2)]<<6:0)|(t>3?b64tab[e.charAt(3)]:0),o=[fromCharCode(s>>>16),fromCharCode(s>>>8&255),fromCharCode(255&s)];return o.length-=[0,0,2,1][r],o.join("")},_atob=global.atob?function(e){return global.atob(e)}:function(e){return e.replace(/\S{1,4}/g,cb_decode)},atob=function(e){return _atob(String(e).replace(/[^A-Za-z0-9\+\/]/g,""))},_decode=buffer?buffer.from&&Uint8Array&&buffer.from!==Uint8Array.from?function(e){return(e.constructor===buffer.constructor?e:buffer.from(e,"base64")).toString()}:function(e){return(e.constructor===buffer.constructor?e:new buffer(e,"base64")).toString()}:function(e){return btou(_atob(e))},decode=function(e){return _decode(String(e).replace(/[-_]/g,(function(e){return"-"==e?"+":"/"})).replace(/[^A-Za-z0-9\+\/]/g,""))},noConflict=function(){var e=global.Base64;return global.Base64=_Base64,e};if(global.Base64={VERSION:version,atob:atob,btoa:btoa,fromBase64:decode,toBase64:encode,utob:utob,encode:encode,encodeURI:encodeURI,btou:btou,decode:decode,noConflict:noConflict,__buffer__:buffer},"function"===typeof Object.defineProperty){var noEnum=function(e){return{value:e,enumerable:!1,writable:!0,configurable:!0}};global.Base64.extendString=function(){Object.defineProperty(String.prototype,"fromBase64",noEnum((function(){return decode(this)}))),Object.defineProperty(String.prototype,"toBase64",noEnum((function(e){return encode(this,e)}))),Object.defineProperty(String.prototype,"toBase64URI",noEnum((function(){return encode(this,!0)})))}}return global["Meteor"]&&(Base64=global.Base64),module.exports?module.exports.Base64=global.Base64:(__WEBPACK_AMD_DEFINE_ARRAY__=[],__WEBPACK_AMD_DEFINE_RESULT__=function(){return global.Base64}.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__),void 0===__WEBPACK_AMD_DEFINE_RESULT__||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)),{Base64:global.Base64}}))}).call(this,__webpack_require__("c8ba"))},"3c79":function(e,t,r){"use strict";r.d(t,"a",(function(){return o}));var s=r("2b0e"),o=new s["default"]},"8fbb":function(e,t){e.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAAsCAYAAADFP/AjAAAAAXNSR0IArs4c6QAAAu9JREFUaAXtmrtrFUEYxbPqRXyCBp9RxMpX8EEUURRsAqI2gpUR/BuECHYWQhpLLVNYaLCwSKGCLwiCYGVjYSwEFYyNCEYFEfX6+2RvstzMndkzd9eFsB8cdnfmfOfsN7O7d3a5SU+X0Ww2+5HYB2xr2AUuJUlym22pgfdmDA6Clq9t7y+KcUVsPXnnwHlgQu2xoL2hqGO8l6F1Bpj3MZCAbDySikJwG9lXwQmwMKtU9j7eq/EYAUNguc8vV1EIGu8iuAwW+wTL6MPfZuY6WJdHP1gUgjsRugnsvvmvkc7OKKanFWNvUYhuR2wCrFFEi+DivRKdh2BA1et4QyO6FbHHoIqCluJ7D8gFkdPjLIqCNtD3BPQZKSK+RuT8S8G7wc44OBKpMe3MQ/gOUOMXCWNgj1M0ZyP5w6pxyp9ge9xpQ8dghOhzcuxy7SrQ2AimRf+P8A93NKazAV6Joi/hr+ooKnSgc0v0/gx/t9cCwgVR9A18u/+6DnQOid7fLCdoDGlSFD4ZFM1JwPeG6H0lKI3ggCj6Hr7z6Rk0ayOgswQo99Jv+FvaZGYOsyd1dqY1384oK/E/+ahB1ikYK4KsWcIDvN/NHjr2bMTBFFBik0MqqgnTccUYrq0F/QHpgCj6xa+Yvxdfe+L+EP13+Bxal99eH8nR98HRFttk60t15e/1bxWlrgKmYitw5Kne37mf3EuhVDy2KO9IOU7c16QWFfS2B4S9Dvt/leee0qe5TdEtalFBb5spe4rZu4sSTYUc4NqHGiWC3vaS2Ksoptz9zPCwJ+8u1/2kpz/bpfr3BbxfJBCO4vA061LA/hBFjYV08G7A+Rniif3X7PJTLz3Rw0svxXveFqWsubzDHtFZirfNVCnCOQssxduKMhQdwcdualiKdxmiRQ+QrFcXJQ9ZRQn1TFU08LJtPVPykFWUUM9URQMv29YzJQ9ZRQn1TFU08LLtvJwp+0Zhfyko+u8Ez/hG8TY0xHivhTMY4on9r/8C2QzmGeYm/igAAAAASUVORK5CYII="},"974d":function(e,t,r){"use strict";var s=r("fea0"),o=r.n(s);o.a},"9b5d":function(e,t,r){},"9ed6":function(e,t,r){"use strict";r.r(t);var s=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"login-container"},[e._m(0),e._v(" "),r("el-form",{ref:"loginForm",staticClass:"login-form",attrs:{model:e.loginForm,rules:e.loginRules,"auto-complete":"on","label-position":"left"}},[r("div",{staticClass:"left-body"}),e._v(" "),r("div",{staticClass:"right-body"},[r("svg-icon",{staticStyle:{width:"18px",height:"18px",color:"#333",position:"absolute",right:"10px",top:"10px",cursor:"pointer"},attrs:{"icon-class":"setting"},on:{click:e.setting}}),e._v(" "),r("div",{staticClass:"title-container"},[r("h3",{staticClass:"title"},[e._v("系统登录")])]),e._v(" "),r("el-form-item",{staticStyle:{margin:"60px 40px 20px 40px"},attrs:{prop:"username"}},[r("span",{staticClass:"svg-container"},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"user"}})],1),e._v(" "),r("el-input",{ref:"username",staticStyle:{color:"#333333"},attrs:{placeholder:"用户名",name:"username",type:"text","auto-complete":"on"},model:{value:e.loginForm.username,callback:function(t){e.$set(e.loginForm,"username",t)},expression:"loginForm.username"}})],1),e._v(" "),r("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"password"}},[r("span",{staticClass:"svg-container"},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"}})],1),e._v(" "),r("el-input",{key:e.passwordType,ref:"password",staticStyle:{color:"#333333"},attrs:{type:e.passwordType,placeholder:"密码",name:"password","auto-complete":"on"},nativeOn:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.handleLogin(t)}},model:{value:e.loginForm.password,callback:function(t){e.$set(e.loginForm,"password",t)},expression:"loginForm.password"}}),e._v(" "),r("span",{staticClass:"show-pwd",on:{click:e.showPwd}},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"===e.passwordType?"eye":"eye-open"}})],1)],1),e._v(" "),r("div",{staticStyle:{margin:"30px 40px",height:"36px","line-height":"36px","margin-bottom":"0","padding-bottom":"0"}},[r("el-checkbox",{model:{value:e.checked,callback:function(t){e.checked=t},expression:"checked"}},[e._v("7天内记住我")]),e._v(" "),r("el-button",{staticStyle:{float:"right",width:"40%",background:"#2249a8"},attrs:{loading:e.loading,type:"primary"},nativeOn:{click:function(t){return t.preventDefault(),e.handleLogin(t)}}},[e._v("登录")])],1),e._v(" "),r("div",{staticStyle:{"padding-top":"0","margin-top":"0","padding-left":"60%"}},[r("el-link",{staticStyle:{"margin-right":"0"},attrs:{href:"#",type:"info",size:"mini",underline:!1},nativeOn:{click:function(t){t.preventDefault(),e.showRegisterDialog=!0}}},[e._v("没有账号？点击注册")])],1)],1)]),e._v(" "),r("el-dialog",{attrs:{title:"注册",visible:e.showRegisterDialog,width:"500px","before-close":e.cancelRegister},on:{"update:visible":function(t){e.showRegisterDialog=t}}},[r("el-form",{ref:"regisForm",attrs:{model:e.regisForm,rules:e.registerRules}},[r("el-form-item",{staticStyle:{margin:"0 40px"},attrs:{prop:"username"}},[r("span",{staticClass:"svg-container"},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"user"}})],1),e._v(" "),r("el-input",{attrs:{autocomplete:"off",type:"text",placeholder:"账号"},model:{value:e.regisForm.username,callback:function(t){e.$set(e.regisForm,"username",t)},expression:"regisForm.username"}})],1),e._v(" "),r("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"password"}},[r("span",{staticClass:"svg-container"},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"}})],1),e._v(" "),r("el-input",{ref:"regisPassword1",staticStyle:{color:"#333333"},attrs:{type:e.regisPasswordType1,placeholder:"密码不少于6位","auto-complete":"off"},model:{value:e.regisForm.password,callback:function(t){e.$set(e.regisForm,"password",t)},expression:"regisForm.password"}}),e._v(" "),r("span",{staticClass:"show-pwd",on:{click:function(t){return e.showRegistrationPwd(1)}}},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"===e.regisPasswordType1?"eye":"eye-open"}})],1)],1),e._v(" "),r("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"checkPassword"}},[r("span",{staticClass:"svg-container"},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"}})],1),e._v(" "),r("el-input",{ref:"regisPassword2",staticStyle:{color:"#333333"},attrs:{type:e.regisPasswordType2,placeholder:"请重新输入密码","auto-complete":"off"},model:{value:e.regisForm.checkPassword,callback:function(t){e.$set(e.regisForm,"checkPassword",t)},expression:"regisForm.checkPassword"}}),e._v(" "),r("span",{staticClass:"show-pwd",on:{click:function(t){return e.showRegistrationPwd(2)}}},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"password"===e.regisPasswordType2?"eye":"eye-open"}})],1)],1),e._v(" "),r("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"email"}},[r("span",{staticClass:"svg-container"},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"email"}})],1),e._v(" "),r("el-input",{attrs:{autocomplete:"off",type:"email",placeholder:"邮箱"},model:{value:e.regisForm.email,callback:function(t){e.$set(e.regisForm,"email",t)},expression:"regisForm.email"}})],1),e._v(" "),r("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"phone"}},[r("span",{staticClass:"svg-container"},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"phone"}})],1),e._v(" "),r("el-input",{attrs:{placeholder:"手机号",autocomplete:"off"},model:{value:e.regisForm.phone,callback:function(t){e.$set(e.regisForm,"phone",t)},expression:"regisForm.phone"}})],1),e._v(" "),r("el-form-item",{staticStyle:{margin:"30px 40px"},attrs:{prop:"code"}},[r("span",{staticClass:"svg-container"},[r("svg-icon",{staticStyle:{color:"#333"},attrs:{"icon-class":"code"}})],1),e._v(" "),r("el-input",{attrs:{maxlength:"6",placeholder:"验证码",autocomplete:"off"},model:{value:e.regisForm.code,callback:function(t){e.$set(e.regisForm,"code",t)},expression:"regisForm.code"}}),e._v(" "),r("el-button",{staticStyle:{position:"absolute",right:"5px",top:"5px",background:"#2249a8"},attrs:{size:"max",type:"primary",disabled:e.canClick},on:{click:e.sendMsg}},[e._v(e._s(e.statusMsg))])],1),e._v(" "),r("el-form-item",{staticStyle:{border:"0",color:"white",background:"white","margin-right":"20px"}},[r("el-button",{staticStyle:{background:"#2249a8"},attrs:{type:"primary",size:"max"},on:{click:e.handleRegister}},[e._v("注 册")]),e._v(" "),r("el-button",{attrs:{size:"max"},on:{click:e.cancelRegister}},[e._v("取 消")])],1)],1)],1),e._v(" "),r("settingForm",{ref:"settingForm"})],1)},o=[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticStyle:{width:"850px",margin:"6% auto 20px"}},[s("img",{staticStyle:{"vertical-align":"sub"},attrs:{src:r("8fbb")}}),e._v(" "),s("span",{staticStyle:{color:"#ffffff","font-size":"40px","font-weight":"400","margin-left":"15px"}},[e._v("让您的工作，更加高效！")])])}],i=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"setting"},[r("el-dialog",{attrs:{title:"服务器信息",visible:e.dialogFormVisible,width:"500px"},on:{"update:visible":function(t){e.dialogFormVisible=t},closed:e.reset}},[e.dialogFormVisible?r("el-form",{ref:"setting-form",attrs:{"label-width":"100px","status-icon":""}},[r("el-form-item",{attrs:{label:"服务器地址"}},[r("el-input",{staticStyle:{width:"100%"},attrs:{id:"serverUrl",disabled:!1,type:"text"},model:{value:e.serverUrl,callback:function(t){e.serverUrl=t},expression:"serverUrl"}})],1)],1):e._e(),e._v(" "),r("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[r("el-button",{staticStyle:{background:"#2249a8"},attrs:{type:"primary"},on:{click:e.handleConfirm}},[e._v("确 定")]),e._v(" "),r("el-button",{on:{click:function(t){e.dialogFormVisible=!1}}},[e._v("取 消")])],1)],1)],1)},a=[],n=r("f22f"),c=r("1e55"),l=(c.fileSelector,window.require("path")),u=(window.require("os"),window.require("fs-extra"),window.require("fs")),d="".concat(l.resolve(),"/.uiauto/uiauto.conf"),g={data:function(){return{dialogFormVisible:!1,serverUrl:""}},watch:{serverUrl:function(e){n["default"].serverUrl=e}},methods:{show:function(e){this.dialogFormVisible=!0,this.serverUrl=n["default"].serverUrl},reset:function(){},handleConfirm:function(){var e=JSON.parse(u.readFileSync(d,"utf8")),t={pluginsPath:e.pluginsPath,projectsPath:e.projectsPath,pythonPath:e.pythonPath,serverUrl:this.serverUrl,deviceId:e.deviceId||""};u.writeFileSync(d,JSON.stringify(t,null,"\t")),this.$message({message:"修改成功",type:"success"}),this.dialogFormVisible=!1}}},f=g,p=(r("cbc7"),r("2877")),m=Object(p["a"])(f,i,a,!1,null,"4c27f067",null),h=m.exports,b=(r("61f7"),function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"social-signup-container"},[r("div",{staticClass:"sign-btn",on:{click:function(t){return e.wechatHandleClick("wechat")}}},[r("span",{staticClass:"wx-svg-container"},[r("svg-icon",{staticClass:"icon",attrs:{"icon-class":"wechat"}})],1),e._v(" 微信\n  ")]),e._v(" "),r("div",{staticClass:"sign-btn",on:{click:function(t){return e.tencentHandleClick("tencent")}}},[r("span",{staticClass:"qq-svg-container"},[r("svg-icon",{staticClass:"icon",attrs:{"icon-class":"qq"}})],1),e._v(" QQ\n  ")])])}),v=[],w={name:"SocialSignin",methods:{wechatHandleClick:function(e){alert("ok")},tencentHandleClick:function(e){alert("ok")}}},_=w,y=(r("2735"),Object(p["a"])(_,b,v,!1,null,"253699e4",null)),C=y.exports,F=r("3c79"),A=r("a78e"),x=r.n(A),S=r("27ae").Base64,k={name:"Login",components:{SocialSign:C,settingForm:h},data:function(){var e=this,t=x.a.get("remember")?JSON.parse(S.decode(x.a.get("remember"))):{},r=function(e,t,r){r()},s=function(t,r,s){r.length<6?s(new Error("密码不能少于6位")):(""!==e.regisForm.checkPassword&&e.$refs.regisForm.validateField("checkPassword"),s())},o=function(t,r,s){""===r?s(new Error("请再次输入密码")):r!==e.regisForm.password?s(new Error("两次输入密码不一致!")):s()},i=function(e,t,r){/^1[34578]\d{9}$/.test(t)?r():r(new Error("请输入正确的手机号码"))},a=function(e,t,r){if(""===t)r(new Error("请正确填写邮箱"));else{if(""!==t){var s=/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;s.test(t)||r(new Error("请输入有效的邮箱"))}r()}},n=function(e,t,r){if(""===t)r(new Error("请输入验证码"));else if(""!==t){var s=/^\d{6}$/;s.test(t)||r(new Error("验证码不能少于6位纯数字"))}else r()};return{loginForm:{username:t.username||"",password:t.password||""},loginRules:{username:[{required:!0,trigger:"blur",validator:r}],password:[{required:!0,trigger:"blur",validator:s}]},passwordType:"password",regisPasswordType1:"password",regisPasswordType2:"password",loading:!1,showDialog:!1,redirect:void 0,checked:!1,showRegisterDialog:!1,regisForm:{username:"",password:"",checkPassword:"",phone:"",code:"",email:""},statusMsg:"发送验证码",registerRules:{username:[{required:!0,trigger:"blur",validator:r}],password:[{required:!0,trigger:"blur",validator:s}],checkPassword:[{trigger:"blur",validator:o}],phone:[{required:!0,trigger:"blur",validator:i}],email:[{required:!0,trigger:"blur",validator:a}],code:[{required:!0,trigger:"blur",validator:n}]},canClick:!1,timerid:""}},watch:{$route:{handler:function(e){this.redirect=e.query&&e.query.redirect},immediate:!0}},created:function(){},mounted:function(){""===this.loginForm.username?this.$refs.username.focus():""===this.loginForm.password&&this.$refs.password.focus()},destroyed:function(){},methods:{showPwd:function(){var e=this;"password"===this.passwordType?this.passwordType="":this.passwordType="password",this.$nextTick((function(){e.$refs.password.focus()}))},showRegistrationPwd:function(e){var t=this;"password"===this["regisPasswordType".concat(e)]?this["regisPasswordType".concat(e)]="":this["regisPasswordType".concat(e)]="password",this.$nextTick((function(){t.$refs["regisPassword".concat(e)].focus()}))},handleLogin:function(){var e=this;this.loginForm.username&&this.loginForm.password?(this.loading=!0,this.$store.dispatch("user/login",this.loginForm).then((function(){e.checked&&x.a.set("remember",S.encode(JSON.stringify(e.loginForm)),{expires:7}),F["a"].$emit("is_first_run");var t=localStorage.getItem("is_first_run");null!==t&&!0!==t||(e.redirect="/workspace/index"),e.$router.push({path:e.redirect||"/"}),e.$store.state.user.name=e.loginForm.username,e.loading=!1})).catch((function(t){e.loading=!1,t.isSuccess||e.$message({message:t.error,type:"error"})}))):this.$message({message:"用户名或密码不能为空",type:"error"})},handleRegister:function(){var e,t,r,s=this;this.regisForm.username&&this.regisForm.phone&&this.regisForm.code&&this.regisForm.password?(this.$refs.regisForm.validateField("password",(function(t){e=t})),this.$refs.regisForm.validateField("phone",(function(e){t=e})),this.$refs.regisForm.validateField("email",(function(e){r=e})),e||t||r?this.$message({message:"密码或手机号或邮箱格式不正确",type:"error"}):this.$store.dispatch("user/register",this.regisForm).then((function(){s.$message({message:"注册成功",type:"success"}),s.cancelRegister()})).catch((function(e){e.isSuccess||s.$message({message:e.error,type:"error"})}))):this.$message({message:"用户名或密码或手机号或验证码或邮箱不能为空",type:"error"})},cancelRegister:function(){this.regisForm.password="",this.regisForm.username="",this.statusMsg="发送验证码",this.regisForm.phone="",this.regisForm.code="",this.regisForm.email="",this.showRegisterDialog=!1,this.$refs.regisForm.resetFields()},sendMsg:function(){var e,t=this;this.regisForm.phone?(this.$refs.regisForm.validateField("phone",(function(t){e=t})),e?this.$message({message:"请输入正确的手机号",type:"error"}):this.$store.dispatch("user/sendMsg",{mobile:this.regisForm.phone}).then((function(){var e=t;t.statusMsg="验证码已发送",t.canClick=!0;var r=60;t.statusMsg="".concat(r--,"s后重新获取"),t.timerid=setInterval((function(){e.statusMsg="".concat(r--,"s后重新获取"),0===r&&(e.canClick=!1,e.statusMsg="重新发送",clearInterval(e.timerid))}),1e3),t.$message({message:"验证码发送成功，请前往手机查看",type:"success"})})).catch((function(e){e.isSuccess||t.$message({message:e.error,type:"error"})}))):this.$message({message:"手机号不能为空",type:"error"})},setting:function(){this.$refs["settingForm"]&&this.$refs["settingForm"].show()}}},E=k,R=(r("2017"),r("974d"),Object(p["a"])(E,s,o,!1,null,"4f82c499",null));t["default"]=R.exports},b12d:function(e,t,r){},cbc7:function(e,t,r){"use strict";var s=r("9b5d"),o=r.n(s);o.a},fea0:function(e,t,r){}}]);