(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-155de78c"],{"163d":function(t,e,a){"use strict";var n=a("e7ad"),r=a("e042"),i=a("75c4"),o=a("1e5b"),s=a("94b3"),l=a("238a"),c=a("2ea2").f,u=a("dcb7").f,p=a("064e").f,d=a("777a").trim,f="Number",g=n[f],m=g,h=g.prototype,y=i(a("e005")(h))==f,v="trim"in String.prototype,b=function(t){var e=s(t,!1);if("string"==typeof e&&e.length>2){e=v?e.trim():d(e,3);var a,n,r,i=e.charCodeAt(0);if(43===i||45===i){if(a=e.charCodeAt(2),88===a||120===a)return NaN}else if(48===i){switch(e.charCodeAt(1)){case 66:case 98:n=2,r=49;break;case 79:case 111:n=8,r=55;break;default:return+e}for(var o,l=e.slice(2),c=0,u=l.length;c<u;c++)if(o=l.charCodeAt(c),o<48||o>r)return NaN;return parseInt(l,n)}}return+e};if(!g(" 0o1")||!g("0b1")||g("+0x1")){g=function(t){var e=arguments.length<1?0:t,a=this;return a instanceof g&&(y?l((function(){h.valueOf.call(a)})):i(a)!=f)?o(new m(b(e)),a,g):b(e)};for(var _,k=a("149f")?c(m):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),w=0;k.length>w;w++)r(m,_=k[w])&&!r(g,_)&&p(g,_,u(m,_));g.prototype=h,h.constructor=g,a("bf16")(n,f,g)}},"1e5b":function(t,e,a){var n=a("fb68"),r=a("859b").set;t.exports=function(t,e,a){var i,o=e.constructor;return o!==a&&"function"==typeof o&&(i=o.prototype)!==a.prototype&&n(i)&&r&&r(t,i),t}},"2ea2":function(t,e,a){var n=a("c2f7"),r=a("ceac").concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return n(t,r)}},"333d":function(t,e,a){"use strict";var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"pagination-container",class:{hidden:t.hidden}},[a("el-pagination",t._b({attrs:{background:t.background,"current-page":t.currentPage,"page-size":t.pageSize,layout:t.layout,"page-sizes":t.pageSizes,total:t.total},on:{"update:currentPage":function(e){t.currentPage=e},"update:current-page":function(e){t.currentPage=e},"update:pageSize":function(e){t.pageSize=e},"update:page-size":function(e){t.pageSize=e},"size-change":t.handleSizeChange,"current-change":t.handleCurrentChange}},"el-pagination",t.$attrs,!1))],1)},r=[];a("163d");Math.easeInOutQuad=function(t,e,a,n){return t/=n/2,t<1?a/2*t*t+e:(t--,-a/2*(t*(t-2)-1)+e)};var i=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(t){window.setTimeout(t,1e3/60)}}();function o(t){document.documentElement.scrollTop=t,document.body.parentNode.scrollTop=t,document.body.scrollTop=t}function s(){return document.documentElement.scrollTop||document.body.parentNode.scrollTop||document.body.scrollTop}function l(t,e,a){var n=s(),r=t-n,l=20,c=0;e="undefined"===typeof e?500:e;var u=function t(){c+=l;var s=Math.easeInOutQuad(c,n,r,e);o(s),c<e?i(t):a&&"function"===typeof a&&a()};u()}var c={name:"Pagination",props:{total:{required:!0,type:Number},page:{type:Number,default:1},limit:{type:Number,default:20},pageSizes:{type:Array,default:function(){return[6,10,20,30,50]}},layout:{type:String,default:"total, sizes, prev, pager, next, jumper"},background:{type:Boolean,default:!0},autoScroll:{type:Boolean,default:!0},hidden:{type:Boolean,default:!1}},computed:{currentPage:{get:function(){return this.page},set:function(t){this.$emit("update:page",t)}},pageSize:{get:function(){return this.limit},set:function(t){this.$emit("update:limit",t)}}},methods:{handleSizeChange:function(t){this.$emit("pagination",{page:this.currentPage,limit:t}),this.autoScroll&&l(0,800)},handleCurrentChange:function(t){this.$emit("pagination",{page:t,limit:this.pageSize}),this.autoScroll&&l(0,800)}}},u=c,p=(a("ba67"),a("e90a")),d=Object(p["a"])(u,n,r,!1,null,"2758e530",null);e["a"]=d.exports},"777a":function(t,e,a){var n=a("e46b"),r=a("f6b4"),i=a("238a"),o=a("9769"),s="["+o+"]",l="​",c=RegExp("^"+s+s+"*"),u=RegExp(s+s+"*$"),p=function(t,e,a){var r={},s=i((function(){return!!o[t]()||l[t]()!=l})),c=r[t]=s?e(d):o[t];a&&(r[a]=c),n(n.P+n.F*s,"String",r)},d=p.trim=function(t,e){return t=String(r(t)),1&e&&(t=t.replace(c,"")),2&e&&(t=t.replace(u,"")),t};t.exports=p},"859b":function(t,e,a){var n=a("fb68"),r=a("69b3"),i=function(t,e){if(r(t),!n(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,n){try{n=a("4ce5")(Function.call,a("dcb7").f(Object.prototype,"__proto__").set,2),n(t,[]),e=!(t instanceof Array)}catch(r){e=!0}return function(t,a){return i(t,a),e?t.__proto__=a:n(t,a),t}}({},!1):void 0),check:i}},9769:function(t,e){t.exports="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"},a4f5:function(t,e,a){},b199:function(t,e,a){"use strict";a.d(e,"b",(function(){return r})),a.d(e,"a",(function(){return i})),a.d(e,"c",(function(){return o}));var n=a("29d4");function r(t){return n["a"].post("/api/v1/tasks/list",t)}function i(t){return n["a"].post("/api/v1/tasks/edit",t)}function o(t){return n["a"].post("/api/v1/tasks/synchronize/upload",t)}},ba67:function(t,e,a){"use strict";var n=a("c5a8"),r=a.n(n);r.a},c5a8:function(t,e,a){},dcb7:function(t,e,a){var n=a("4f18"),r=a("cc33"),i=a("09b9"),o=a("94b3"),s=a("e042"),l=a("db6b"),c=Object.getOwnPropertyDescriptor;e.f=a("149f")?c:function(t,e){if(t=i(t),e=o(e,!0),l)try{return c(t,e)}catch(a){}if(s(t,e))return r(!n.f.call(t,e),t[e])}},e024:function(t,e,a){"use strict";var n=a("a4f5"),r=a.n(n);r.a},fac5:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"app-main-content",staticStyle:{padding:"0 10px"}},[a("div",{staticClass:"filter-container"},[a("el-row",[a("el-col",{staticClass:"advanced-search-groups",attrs:{xs:24,sm:12,md:6,lg:6,xl:6}},[t._v("\n        项目名称：\n        "),a("el-input",{staticClass:"filter-item",staticStyle:{width:"200px"},attrs:{placeholder:"项目名称"},nativeOn:{keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.handleFilter()}},model:{value:t.listQuery.name,callback:function(e){t.$set(t.listQuery,"name",e)},expression:"listQuery.name"}})],1),t._v(" "),a("el-col",{staticClass:"advanced-search-groups",attrs:{xs:24,sm:12,md:7,lg:7,xl:7}},[t._v("\n        任务状态：\n        "),a("el-select",{staticClass:"filter-item",attrs:{placeholder:"任务状态"},on:{change:function(e){return t.handleFilter()}},model:{value:t.listQuery.status,callback:function(e){t.$set(t.listQuery,"status",e)},expression:"listQuery.status"}},t._l(t.sortOptions,(function(t){return a("el-option",{key:t.key,attrs:{label:t.label,value:t.key}})})),1)],1),t._v(" "),a("el-col",{staticClass:"advanced-search-groups",attrs:{xs:24,sm:24,md:11,lg:11,xl:11}},[t._v("\n        任务时间：\n        "),a("el-date-picker",{attrs:{type:"datetimerange",align:"right","start-placeholder":"开始日期","end-placeholder":"结束日期"},model:{value:t.listQuery.createdAt,callback:function(e){t.$set(t.listQuery,"createdAt",e)},expression:"listQuery.createdAt"}})],1),t._v(" "),a("el-col",{staticClass:"advanced-search-operations",attrs:{align:"right",xs:24,sm:24,md:24,lg:24,xl:24}},[a("el-button",{staticClass:"filter-item",attrs:{type:"primary",icon:"el-icon-search"},on:{click:function(e){return t.handleFilter()}}},[t._v("搜索")])],1)],1)],1),t._v(" "),a("el-table",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],staticStyle:{width:"100%"},attrs:{border:"",data:t.taskList}},[a("el-table-column",{attrs:{prop:"id",align:"center",label:"任务ID"}}),t._v(" "),a("el-table-column",{attrs:{prop:"project_name",align:"center",label:"项目名称"}}),t._v(" "),a("el-table-column",{attrs:{label:"任务状态",align:"center","class-name":"small-padding fixed-width"},scopedSlots:t._u([{key:"default",fn:function(e){return["running"==e.row.status?a("el-tag",{attrs:{type:"primary",effect:"dark"}},[t._v("运行中")]):t._e(),t._v(" "),"success"==e.row.status?a("el-tag",{attrs:{effect:"dark",type:"success"}},[t._v("成功")]):t._e(),t._v(" "),"todo"==e.row.status?a("el-tag",{attrs:{effect:"dark",type:"primary"}},[t._v("待执行")]):t._e(),t._v(" "),"fail"==e.row.status?a("el-tag",{attrs:{effect:"dark",type:"danger"}},[t._v("失败")]):t._e()]}}])}),t._v(" "),a("el-table-column",{attrs:{prop:"updatedAt",align:"center",label:"任务时间"}}),t._v(" "),a("el-table-column",{attrs:{prop:"message",fixed:"right",align:"center",label:"错误信息"},scopedSlots:t._u([{key:"default",fn:function(e){return["fail"==e.row.status?a("el-button",{attrs:{slot:"reference",type:"primary"},on:{click:function(a){return t.viewClick(e.row.message)}},slot:"reference"},[t._v("查看详情")]):t._e()]}}])})],1),t._v(" "),a("el-dialog",{attrs:{title:"详情信息",visible:t.showDialog,center:"","close-on-click-modal":!1,"close-on-press-escape":!1,top:"5vh"},on:{"update:visible":function(e){t.showDialog=e}}},[a("el-table",{staticStyle:{width:"100%"},attrs:{border:"",data:t.message,"show-header":!1,"max-height":"calc(100vh - 200px)"}},[a("el-table-column",{scopedSlots:t._u([{key:"default",fn:function(e){var n=e.row;return[n.log.indexOf("[error]")>-1?a("font",{staticStyle:{color:"red"}},[t._v(t._s(n.log))]):a("font",[t._v(t._s(n.log))])]}}])})],1)],1),t._v(" "),a("div",{staticStyle:{width:"100%"}},[a("center",[a("pagination",{staticStyle:{display:"inline-block"},attrs:{total:t.total,page:t.listQuery.pageIndex,limit:t.listQuery.pageSize},on:{"update:page":function(e){return t.$set(t.listQuery,"pageIndex",e)},"update:limit":function(e){return t.$set(t.listQuery,"pageSize",e)},pagination:function(e){return t.getList(t.listQuery)}}})],1)],1)],1)},r=[],i=(a("9a33"),a("cc57"),a("c1f9")),o=a.n(i),s=a("6bf2"),l=a.n(s),c=a("b199"),u=a("333d"),p={name:"Job",components:{Pagination:u["a"]},data:function(){return{loading:!1,showDialog:!1,message:[],total:0,listQuery:{name:"",status:"all",createdAt:[new Date(l()().format("YYYY-MM-DD 00:00:00")),new Date(l()().format("YYYY-MM-DD 23:59:59"))],pageIndex:1,pageSize:10},taskList:[],sortOptions:[{label:"全部",key:"all"},{label:"运行中",key:"running"},{label:"成功",key:"success"},{label:"失败",key:"fail"}]}},created:function(){this.getList(this.listQuery)},mounted:function(){},methods:{getList:function(t){var e=this;this.loading=!0;var a={};if(t.name&&(a.name={$like:"%".concat(t.name,"%")}),t.createdAt){var n=o.a.map(t.createdAt,(function(t){return l()(t).format("YYYY-MM-DD HH:mm:ss")}));a.createdAt={$between:n}}"all"!==t.status&&(a.status=t.status);var r={where:a,pageIndex:t.pageIndex,pageSize:t.pageSize};Object(c["b"])(r).then((function(t){e.loading=!1,t.data&&(e.taskList=t.data.list,e.total=t.data.total,e.pageIndex=t.data.pageIndex,e.pageSize=t.data.pageSize)}))},handleFilter:function(){this.listQuery.pageIndex=1,this.getList(this.listQuery)},refresh:function(){this.getList(this.listQuery)},viewClick:function(t){var e=this;JSON.parse(t)&&o.a.each(o.a.compact(JSON.parse(t).split("\n")),(function(t){" "!==t&&e.message.push({log:t})})),console.log(this.message),this.showDialog=!0}}},d=p,f=(a("e024"),a("e90a")),g=Object(f["a"])(d,n,r,!1,null,"1f8ce5e2",null);e["default"]=g.exports}}]);