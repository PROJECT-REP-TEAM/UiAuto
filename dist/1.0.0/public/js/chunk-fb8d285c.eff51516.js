(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-fb8d285c"],{"11e9":function(e,t,a){var n=a("52a7"),i=a("4630"),r=a("6821"),o=a("6a99"),l=a("69a8"),s=a("c69a"),c=Object.getOwnPropertyDescriptor;t.f=a("9e1e")?c:function(e,t){if(e=r(e),t=o(t,!0),s)try{return c(e,t)}catch(a){}if(l(e,t))return i(!n.f.call(e,t),e[t])}},1399:function(e,t,a){"use strict";var n=a("68fb"),i=a.n(n);i.a},"333d":function(e,t,a){"use strict";var n=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"pagination-container",class:{hidden:e.hidden}},[a("el-pagination",e._b({attrs:{background:e.background,"current-page":e.currentPage,"page-size":e.pageSize,layout:e.layout,"page-sizes":e.pageSizes,total:e.total},on:{"update:currentPage":function(t){e.currentPage=t},"update:current-page":function(t){e.currentPage=t},"update:pageSize":function(t){e.pageSize=t},"update:page-size":function(t){e.pageSize=t},"size-change":e.handleSizeChange,"current-change":e.handleCurrentChange}},"el-pagination",e.$attrs,!1))],1)},i=[];a("c5f6");Math.easeInOutQuad=function(e,t,a,n){return e/=n/2,e<1?a/2*e*e+t:(e--,-a/2*(e*(e-2)-1)+t)};var r=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(e){window.setTimeout(e,1e3/60)}}();function o(e){document.documentElement.scrollTop=e,document.body.parentNode.scrollTop=e,document.body.scrollTop=e}function l(){return document.documentElement.scrollTop||document.body.parentNode.scrollTop||document.body.scrollTop}function s(e,t,a){var n=l(),i=e-n,s=20,c=0;t="undefined"===typeof t?500:t;var u=function e(){c+=s;var l=Math.easeInOutQuad(c,n,i,t);o(l),c<t?r(e):a&&"function"===typeof a&&a()};u()}var c={name:"Pagination",props:{total:{required:!0,type:Number},page:{type:Number,default:1},limit:{type:Number,default:20},pageSizes:{type:Array,default:function(){return[6,10,20,30,50]}},layout:{type:String,default:"total, sizes, prev, pager, next, jumper"},background:{type:Boolean,default:!0},autoScroll:{type:Boolean,default:!0},hidden:{type:Boolean,default:!1}},computed:{currentPage:{get:function(){return this.page},set:function(e){this.$emit("update:page",e)}},pageSize:{get:function(){return this.limit},set:function(e){this.$emit("update:limit",e)}}},methods:{handleSizeChange:function(e){this.$emit("pagination",{page:this.currentPage,limit:e}),this.autoScroll&&s(0,800)},handleCurrentChange:function(e){this.$emit("pagination",{page:e,limit:this.pageSize}),this.autoScroll&&s(0,800)}}},u=c,d=(a("ba67"),a("2877")),p=Object(d["a"])(u,n,i,!1,null,"2758e530",null);t["a"]=p.exports},"5dbc":function(e,t,a){var n=a("d3f4"),i=a("8b97").set;e.exports=function(e,t,a){var r,o=t.constructor;return o!==a&&"function"==typeof o&&(r=o.prototype)!==a.prototype&&n(r)&&i&&i(e,r),e}},"68fb":function(e,t,a){},"8b97":function(e,t,a){var n=a("d3f4"),i=a("cb7c"),r=function(e,t){if(i(e),!n(t)&&null!==t)throw TypeError(t+": can't set as prototype!")};e.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(e,t,n){try{n=a("9b43")(Function.call,a("11e9").f(Object.prototype,"__proto__").set,2),n(e,[]),t=!(e instanceof Array)}catch(i){t=!0}return function(e,a){return r(e,a),t?e.__proto__=a:n(e,a),e}}({},!1):void 0),check:r}},9093:function(e,t,a){var n=a("ce10"),i=a("e11e").concat("length","prototype");t.f=Object.getOwnPropertyNames||function(e){return n(e,i)}},aa77:function(e,t,a){var n=a("5ca1"),i=a("be13"),r=a("79e5"),o=a("fdef"),l="["+o+"]",s="​",c=RegExp("^"+l+l+"*"),u=RegExp(l+l+"*$"),d=function(e,t,a){var i={},l=r((function(){return!!o[e]()||s[e]()!=s})),c=i[e]=l?t(p):o[e];a&&(i[a]=c),n(n.P+n.F*l,"String",i)},p=d.trim=function(e,t){return e=String(i(e)),1&t&&(e=e.replace(c,"")),2&t&&(e=e.replace(u,"")),e};e.exports=d},b199:function(e,t,a){"use strict";a.d(t,"b",(function(){return i})),a.d(t,"a",(function(){return r})),a.d(t,"e",(function(){return o})),a.d(t,"d",(function(){return l})),a.d(t,"c",(function(){return s}));var n=a("29d4");function i(e){return n["a"].post("/api/v1/tasks/list",e)}function r(e){return n["a"].post("/api/v1/tasks/edit",e)}function o(e){return n["a"].post("/api/v1/tasks/synchronize/upload",e)}function l(e){return n["a"].post("/api/v1/tasks/updateCron",e)}function s(e){return n["a"].post("/api/v1/uiautoLogs/base/user/list",e)}},ba67:function(e,t,a){"use strict";var n=a("efde"),i=a.n(n);i.a},c5f6:function(e,t,a){"use strict";var n=a("7726"),i=a("69a8"),r=a("2d95"),o=a("5dbc"),l=a("6a99"),s=a("79e5"),c=a("9093").f,u=a("11e9").f,d=a("86cc").f,p=a("aa77").trim,g="Number",f=n[g],h=f,m=f.prototype,v=r(a("2aeb")(m))==g,b="trim"in String.prototype,y=function(e){var t=l(e,!1);if("string"==typeof t&&t.length>2){t=b?t.trim():p(t,3);var a,n,i,r=t.charCodeAt(0);if(43===r||45===r){if(a=t.charCodeAt(2),88===a||120===a)return NaN}else if(48===r){switch(t.charCodeAt(1)){case 66:case 98:n=2,i=49;break;case 79:case 111:n=8,i=55;break;default:return+t}for(var o,s=t.slice(2),c=0,u=s.length;c<u;c++)if(o=s.charCodeAt(c),o<48||o>i)return NaN;return parseInt(s,n)}}return+t};if(!f(" 0o1")||!f("0b1")||f("+0x1")){f=function(e){var t=arguments.length<1?0:e,a=this;return a instanceof f&&(v?s((function(){m.valueOf.call(a)})):r(a)!=g)?o(new h(y(t)),a,f):y(t)};for(var _,x=a("9e1e")?c(h):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),S=0;x.length>S;S++)i(h,_=x[S])&&!i(f,_)&&d(f,_,u(h,_));f.prototype=m,m.constructor=f,a("2aba")(n,g,f)}},efde:function(e,t,a){},fac5:function(e,t,a){"use strict";a.r(t);var n=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"app-main-content",staticStyle:{padding:"0 10px"}},[a("div",{staticClass:"filter-container"},[a("el-row",[a("el-col",{staticClass:"advanced-search-groups",attrs:{xs:24,sm:12,md:12,lg:8,xl:8}},[e._v("\n        项目名称：\n        "),a("el-input",{staticClass:"filter-item",staticStyle:{width:"200px"},attrs:{placeholder:"项目名称"},nativeOn:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.handleFilter()}},model:{value:e.listQuery.project_name,callback:function(t){e.$set(e.listQuery,"project_name",t)},expression:"listQuery.project_name"}})],1),e._v(" "),a("el-col",{staticClass:"advanced-search-groups",attrs:{xs:24,sm:12,md:12,lg:7,xl:7}},[e._v("\n        任务状态：\n        "),a("el-select",{staticClass:"filter-item",attrs:{placeholder:"任务状态"},on:{change:function(t){return e.handleFilter()}},model:{value:e.listQuery.status,callback:function(t){e.$set(e.listQuery,"status",t)},expression:"listQuery.status"}},e._l(e.sortOptions,(function(e){return a("el-option",{key:e.key,attrs:{label:e.label,value:e.key}})})),1)],1),e._v(" "),a("el-col",{staticClass:"advanced-search-groups",attrs:{xs:24,sm:24,md:24,lg:9,xl:9}},[e._v("\n        任务时间：\n        "),a("el-date-picker",{attrs:{type:"datetimerange",align:"right","start-placeholder":"开始日期","end-placeholder":"结束日期"},model:{value:e.listQuery.createdAt,callback:function(t){e.$set(e.listQuery,"createdAt",t)},expression:"listQuery.createdAt"}})],1),e._v(" "),a("el-col",{staticClass:"advanced-search-operations",attrs:{align:"right",xs:24,sm:24,md:24,lg:24,xl:24}},[a("el-button",{staticClass:"filter-item",attrs:{type:"primary",icon:"el-icon-search"},on:{click:function(t){return e.handleFilter()}}},[e._v("搜索")])],1)],1)],1),e._v(" "),a("el-table",{directives:[{name:"loading",rawName:"v-loading",value:e.loading,expression:"loading"}],staticStyle:{width:"100%"},attrs:{border:"",data:e.taskList}},[a("el-table-column",{attrs:{prop:"id",align:"center",label:"任务ID"}}),e._v(" "),a("el-table-column",{attrs:{prop:"project_name",align:"center",label:"项目名称"}}),e._v(" "),a("el-table-column",{attrs:{label:"任务状态",align:"center","class-name":"small-padding fixed-width"},scopedSlots:e._u([{key:"default",fn:function(t){return["running"==t.row.status?a("el-tag",{attrs:{type:"primary",effect:"dark"}},[e._v("运行中")]):e._e(),e._v(" "),"success"==t.row.status?a("el-tag",{attrs:{effect:"dark",type:"success"}},[e._v("成功")]):e._e(),e._v(" "),"todo"==t.row.status?a("el-tag",{attrs:{effect:"dark",type:"primary"}},[e._v("待执行")]):e._e(),e._v(" "),"fail"==t.row.status?a("el-tag",{attrs:{effect:"dark",type:"danger"}},[e._v("失败")]):e._e()]}}])}),e._v(" "),a("el-table-column",{attrs:{prop:"updatedAt",align:"center",label:"任务时间"}}),e._v(" "),a("el-table-column",{attrs:{fixed:"right",align:"center",label:"操作"},scopedSlots:e._u([{key:"default",fn:function(t){return[a("el-button",{attrs:{slot:"reference",type:"primary"},on:{click:function(a){return e.logFn(t.row.id)}},slot:"reference"},[e._v("日志")])]}}])})],1),e._v(" "),a("div",{staticStyle:{width:"100%"}},[a("center",[a("pagination",{staticStyle:{display:"inline-block"},attrs:{total:e.total,page:e.listQuery.pageIndex,limit:e.listQuery.pageSize},on:{"update:page":function(t){return e.$set(e.listQuery,"pageIndex",t)},"update:limit":function(t){return e.$set(e.listQuery,"pageSize",t)},pagination:function(t){return e.getList(e.listQuery)}}})],1)],1),e._v(" "),a("el-dialog",{attrs:{width:"70%",title:"日志详情",visible:e.innerVisible,"append-to-body":""},on:{"update:visible":function(t){e.innerVisible=t},closed:e.cancel}},[a("el-table",{directives:[{name:"infinite-scroll",rawName:"v-infinite-scroll",value:e.detailLogLoadMore,expression:"detailLogLoadMore"}],staticStyle:{width:"100%"},attrs:{data:e.detailLogTableData,height:"calc(40vh)",size:"mini"}},[a("el-table-column",{attrs:{type:"index"}}),e._v(" "),a("el-table-column",{attrs:{prop:"bank_name",label:"类型",width:"100"},scopedSlots:e._u([{key:"default",fn:function(t){var n=t.row;return[a("el-tag",{attrs:{type:["primary","warning","danger","success"][["info","warn","fail","success"].indexOf(n.status)],effect:"dark",size:"mini"}},[e._v(e._s(["信息","警告","失败","成功"][["info","warn","fail","success"].indexOf(n.status)]))])]}}])}),e._v(" "),a("el-table-column",{attrs:{prop:"content",label:"内容","min-width":"300","show-overflow-tooltip":""}}),e._v(" "),a("el-table-column",{attrs:{prop:"updatedAt",label:"创建时间","min-width":"150","show-overflow-tooltip":""}}),e._v(" "),a("div",{staticStyle:{"text-align":"center"},attrs:{slot:"append"},slot:"append"},[e.detailLogIsMore?a("div",{directives:[{name:"loading",rawName:"v-loading",value:!0,expression:"true"}],staticStyle:{height:"40px","line-height":"40px"},attrs:{"element-loading-spinner":"el-icon-loading"}},[e._v(" ")]):a("div",{staticStyle:{height:"40px","line-height":"40px",color:"#ccc"}},[e._v("--- 已经到底了 ---")])])],1)],1)],1)},i=[],r=a("2ef0"),o=a.n(r),l=a("c1df"),s=a.n(l),c=a("b199"),u=a("333d"),d={name:"Job",components:{Pagination:u["a"]},data:function(){return{loading:!1,showDialog:!1,message:[],total:0,listQuery:{project_name:"",status:"all",createdAt:[new Date(s()().format("YYYY-MM-DD 00:00:00")),new Date(s()().format("YYYY-MM-DD 23:59:59"))],pageIndex:1,pageSize:10},taskList:[],sortOptions:[{label:"全部",key:"all"},{label:"运行中",key:"running"},{label:"成功",key:"success"},{label:"失败",key:"fail"}],innerVisible:!1,detailLogTableData:[],detailLogPageIndex:1,detailLogPageSize:10,detailLogIsMore:!1,detailLogWhere:{}}},created:function(){this.getList(this.listQuery)},mounted:function(){},methods:{getList:function(e){var t=this;this.loading=!0;var a={};if(e.project_name&&(a.project_name={$like:"%".concat(e.project_name,"%")}),e.createdAt){var n=o.a.map(e.createdAt,(function(e){return s()(e).format("YYYY-MM-DD HH:mm:ss")}));a.createdAt={$between:n}}"all"!==e.status&&(a.status=e.status);var i={where:a,pageIndex:e.pageIndex,pageSize:e.pageSize};Object(c["b"])(i).then((function(e){t.loading=!1,e.data&&(t.taskList=e.data.list,t.total=e.data.total,t.pageIndex=e.data.pageIndex,t.pageSize=e.data.pageSize)}))},handleFilter:function(){this.listQuery.pageIndex=1,this.getList(this.listQuery)},refresh:function(){this.getList(this.listQuery)},cancel:function(){this.innerVisible=!1,this.detailLogTableData=[],this.detailLogPageIndex=1,this.detailLogPageSize=10,this.detailLogIsMore=!1,this.detailLogWhere={}},logFn:function(e){this.innerVisible=!0,this.detailLogLoadList(e)},detailLogLoadList:function(e){var t=this;this.detailLogWhere={taskId:e},Object(c["c"])({pageIndex:this.detailLogPageIndex,pageSize:this.detailLogPageSize,where:this.detailLogWhere,order:[["createdAt","DESC"],["id","DESC"]]}).then((function(e){var a=e.data;t.detailLogTableData=a.list,t.detailLogPageIndex=a.pageIndex,t.detailLogPageSize=a.pageSize,t.detailLogIsMore=a.isMore}))},getRemote:o.a.debounce((function(){var e=this;this.detailLogIsMore&&(this.detailLogPageIndex++,Object(c["c"])({pageIndex:this.detailLogPageIndex,pageSize:this.detailLogPageSize,where:this.detailLogWhere,order:[["createdAt","DESC"],["id","DESC"]]}).then((function(t){var a=t.data;e.detailLogTableData=e.detailLogTableData.concat(a.list),e.detailLogPageIndex=a.pageIndex,e.detailLogPageSize=a.pageSize,e.detailLogIsMore=a.isMore})))}),500),detailLogLoadMore:function(){this.getRemote()}}},p=d,g=(a("1399"),a("2877")),f=Object(g["a"])(p,n,i,!1,null,"40b2f123",null);t["default"]=f.exports},fdef:function(e,t){e.exports="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"}}]);