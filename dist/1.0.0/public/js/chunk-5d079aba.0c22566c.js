(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-5d079aba"],{"3c79":function(e,n,o){"use strict";o.d(n,"a",(function(){return i}));var t=o("6e6d"),i=new t["default"]},"5e5f":function(e,n,o){"use strict";var t=o("e2b8"),i=o.n(t);i.a},"9e76":function(e,n,o){"use strict";var t=o("69b3"),i=o("eafa"),a=o("e754"),d=o("7108");o("0aed")("match",1,(function(e,n,o,s){return[function(o){var t=e(this),i=void 0==o?void 0:o[n];return void 0!==i?i.call(o,t):new RegExp(o)[n](String(t))},function(e){var n=s(o,e,this);if(n.done)return n.value;var r=t(e),l=String(this);if(!r.global)return d(r,l);var c=r.unicode;r.lastIndex=0;var p,u=[],h=0;while(null!==(p=d(r,l))){var m=String(p[0]);u[h]=m,""===m&&(r.lastIndex=a(l,i(r.lastIndex),c)),h++}return 0===h?null:u}]}))},c4b3:function(e,n,o){e.exports=o.p+"public/img/python_background.964f567f.png"},db11:function(e,n,o){e.exports=o.p+"public/img/chrome_background.9e29d38e.png"},e2b8:function(e,n,o){},e697:function(e,n,o){"use strict";var t=o("e46b"),i=o("013f")(5),a="find",d=!0;a in[]&&Array(1)[a]((function(){d=!1})),t(t.P+t.F*d,"Array",{find:function(e){return i(this,e,arguments.length>1?arguments[1]:void 0)}}),o("0e8b")(a)},f4cc:function(e,n,o){e.exports=o.p+"public/img/nodejs_background.9154b0bc.png"},f7f0:function(e,n,o){"use strict";o.r(n);var t=function(){var e=this,n=e.$createElement,o=e._self._c||n;return o("div",{staticClass:"app-main-content"},e._l(e.dependencies,(function(n){return o("div",{key:n.title,staticStyle:{display:"inline-block","margin-top":"20px","margin-left":"20px"}},[o("div",{style:{display:"inline-block",width:"300px",height:"177px",background:"url("+n.background+") no-repeat"}},[o("div",{staticStyle:{padding:"20px",height:"100%",position:"relative"}},[o("div",{staticClass:"title"},[e._v(e._s(n.title))]),e._v(" "),o("div",{staticClass:"version"},[e._v("版本号："+e._s(n.version||"无"))]),e._v(" "),o("div",{directives:[{name:"show",rawName:"v-show",value:"chrome"===n.name,expression:"dependency.name === 'chrome'"}],staticClass:"version"},[e._v("ChromeDriver："+e._s(n.driver_version||"无"))]),e._v(" "),o("div",{directives:[{name:"show",rawName:"v-show",value:"chrome"!==n.name,expression:"dependency.name !== 'chrome'"}],staticClass:"version"},[e._v(" ")]),e._v(" "),o("el-button",{class:"已安装"===e.downloadBtnText[n.name]||"已下载"===e.downloadBtnText[n.name]?"aLink-disable":"aLink",staticStyle:{padding:"0px 0px"},attrs:{target:"_blank",disabled:"已安装"===e.downloadBtnText[n.name]||"已下载"===e.downloadBtnText[n.name],loading:!!e.depandenciesDowload[n.name].downloading&&e.depandenciesDowload[n.name].downloading}},[e._v(e._s(e.downloadBtnText[n.name]))]),e._v(" "),!n.version&&e.depandenciesDowload[n.name].isdownloaded&&"selenium"!==n.name?o("el-button",{staticClass:"aLink",staticStyle:{left:"90px",padding:"0px 0px"},attrs:{target:"_blank",disabled:e.depandenciesDowload[n.name].installing,loading:e.depandenciesDowload[n.name].installing},on:{click:function(o){return e.installDependency(n)}}},[e._v(e._s(e.depandenciesDowload[n.name].installing?"安装中":e.depandenciesDowload[n.name].installed?"已安装":"安装"))]):e._e()],1)])])})),0)},i=[],a=(o("9a33"),o("9e76"),o("2b45"),o("b449"),o("17d6")),d=(o("cc57"),o("e697"),o("c1f9")),s=o.n(d),r=o("f22f"),l=(o("3c79"),window.require("child_process").spawn,window.require("child_process").exec),c=window.require("child_process").execSync,p=window.require("os"),u=window.require("path"),h=window.require("fs"),m=o("1e55"),v=m.dependencyDownload,w=window.require("decompress"),g=(window.require("request"),{name:"Dependency",components:{},data:function(){return{dependencies:[{name:"node",background:o("f4cc"),title:"Node.js",filename:"node-v10.16.0-x64.msi",version:"",download_url:"x64"==p.arch()?"http://cdn.npm.taobao.org/dist/node/v10.16.0/node-v10.16.0-x64.msi":"http://cdn.npm.taobao.org/dist/node/v10.16.0/node-v10.16.0-x86.msi"},{name:"python",background:o("c4b3"),title:"Python",filename:"Python3.6.8_20190818.zip",download_url:"http://pwb9l70fu.bkt.clouddn.com/Python3.6.8_20190818.zip",filePath:u.normalize(r["default"].pluginsPath+"/../dependencies/Python3.6.8_20190816.zip")},{name:"chrome",background:o("db11"),title:"Chrome",filename:"ChromeSetup.exe",version:"",download_url:"https://dl.google.com/tag/s/appguid%3D%7B8A69D345-D564-463C-AFF1-A69D9E530F96%7D%26iid%3D%7B980AB9C1-00E5-3F58-102C-3101AF5FA3DE%7D%26lang%3Dzh-CN%26browser%3D4%26usagestats%3D1%26appname%3DGoogle%2520Chrome%26needsadmin%3Dprefers%26ap%3Dx64-stable-statsdef_1%26installdataindex%3Dempty/update2/installers/ChromeSetup.exe"}],requirement:{node:"54.1.2",python:"54.1.2",chrome:"54.1.2"}}},computed:{downloadBtnText:function(){var e=this,n={};return s.a.forIn(this.requirement,(function(o,t){var i=s.a.find(e.dependencies,{name:t}).version;console.log("aaaaa"),console.log(i),console.log(e.depandenciesDowload[t]);var a="",d="";void 0==i||""==i?1==e.depandenciesDowload[t].isdownloaded?(a="已下载",d="安装"):a=0==e.depandenciesDowload[t].isdownloaded&&1==e.depandenciesDowload[t].downloading?"下载中":"下载":a="已安装",n[t+"isdownloaded"]=d,n[t]=a})),n},depandenciesDowload:function(){return console.log("depandenciesDowload",this.$store.state.dependency),this.$store.state.dependency}},created:function(){this.checkDepandenciesVersion()},mounted:function(){},methods:{checkDepandenciesVersion:function(){var e=this;s.a.each(this.dependencies,function(){var n=Object(a["a"])(regeneratorRuntime.mark((function n(o,t){var i,a,d,r,p,h,m;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:if("node"===o.name)o.version=window.process.versions.node;else if("python"===o.name)try{i=c(u.join(u.resolve(),"\\env\\python\\win32\\python.exe")+" --version").toString(),console.log("stdout>>>>>>",i),i&&(a=i.match(/[\d]*\.[\d]*\.[\d]*/)[0],e.$set(o,"version",a),o.version=a)}catch(t){d={name:o.name,downloading:!1,isdownloaded:!0},e.$store.dispatch("dependency/dependencyDownload",d),e.installDependency(o)}else if("chrome"===o.name)try{r=c('REG QUERY "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Google Chrome" /v version'),r=r.toString("UTF-8"),r=r.split("    "),o.version=r[r.length-1],p=r[r.length-1].split("."),p=s.a.slice(p,0,p.length-1).join("."),console.log("version>>>>>>>>>>>>>",p),h=u.join(u.resolve(),"/env/webdriver/win32/chromedriver.exe"),m=c(h+" --version"),o.driver_version=m.toString().split(" ")[1],console.log("driver_version>>>>>>>>>>>>>>",m.toString())}catch(v){console.log(v)}else"selenium"===o.name&&l("pip show selenium",(function(e,n,t){if(console.log("selenium"),console.log(n),n){var i=n.match(/[\d]*\.[\d]*\.[\d]*/)[0];console.log(i),o.version=i}}));case 1:case"end":return n.stop()}}),n)})));return function(e,o){return n.apply(this,arguments)}}())},download:function(e){var n=this;return new Promise((function(o,t){if(console.log("download"),"selenium"===e.name){var i="";if(l("python --version",(function(n,o,t){console.log("python"),console.log(o),console.log(t),t&&(i=t.match(/[\d]*\.[\d]*\.[\d]*/)[0],e.version=i)})),""===i||void 0===i)n.$message({showClose:!0,message:"检测到系统没有安装python，请先安装python",type:"warning"});else{var a={name:e.name,downloading:!0,isdownloaded:!1};n.$store.dispatch("dependency/dependencyDownload",a).then((function(o){l("pip install selenium",(function(o,t,i){if(console.log(o),console.log(t),console.log(i),null!=o){var a={name:e.name,downloading:!1,isdownloaded:!1};n.$store.dispatch("dependency/dependencyDownload",a)}else{var d={name:e.name,downloading:!1,isdownloaded:!0};n.$store.dispatch("dependency/dependencyDownload",d)}}))}))}}else{var d={name:e.name,downloading:!0,isdownloaded:!1};n.$store.dispatch("dependency/dependencyDownload",d).then((function(t){console.log("after",t),console.log(n.depandenciesDowload[e.name]),v({dependency:e,listener_name:"downstate"+e.filename,downloadPath:e.download_url,configPath:u.normalize(r["default"].pluginsPath+"/../dependencies/")}).then((function(e){console.log("download sueccess"),o()})).catch((function(o){var t={name:e.name,downloading:!1,isdownloaded:!1};n.$store.dispatch("dependency/dependencyDownload",t).then((function(o){console.log("err after"),console.log(n.depandenciesDowload[e.name])}))}))}))}}))},installDependency:function(){var e=Object(a["a"])(regeneratorRuntime.mark((function e(n){var o,t=this;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.prev=0,console.log("installDependency"),o=this.depandenciesDowload[n.name].filePath,console.log(o),e.next=6,this.$store.dispatch("dependency/dependencyDownload",{name:n.name,installing:!0});case 6:"python"===n.name?(console.log(n),h.existsSync(u.join(u.resolve()+"/env/python/"))||h.mkdirSync(u.join(u.resolve()+"/env/python/")),h.existsSync(u.join(u.resolve()+"/env/python/win32/"))||h.mkdirSync(u.join(u.resolve()+"/env/python/win32/")),w(u.join(u.resolve(),"/env/python.zip"),u.join(u.resolve()+"/env/python/win32/"),{map:function(e){return e}}).then(function(){var e=Object(a["a"])(regeneratorRuntime.mark((function e(o){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return console.log("done!"),e.next=3,t.$store.dispatch("dependency/dependencyDownload",{name:n.name,installing:!1,installed:!0});case 3:t.checkDepandenciesVersion();case 4:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}()).catch(function(){var e=Object(a["a"])(regeneratorRuntime.mark((function e(o){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return console.log("解压python环境包出错：",o),e.next=3,t.$store.dispatch("dependency/dependencyDownload",{name:n.name,installing:!1,installed:!1});case 3:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}())):l(o,(function(e,n,o){console.log("installDependency"),console.log(n)})),e.next=12;break;case 9:e.prev=9,e.t0=e["catch"](0),console.log(e.t0);case 12:case"end":return e.stop()}}),e,this,[[0,9]])})));function n(n){return e.apply(this,arguments)}return n}()}}),f=g,y=(o("5e5f"),o("e90a")),b=Object(y["a"])(f,t,i,!1,null,"1c9fbae0",null);n["default"]=b.exports}}]);