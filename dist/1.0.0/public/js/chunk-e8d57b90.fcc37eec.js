(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-e8d57b90"],{"097f":function(t,e,i){"use strict";var n=i("6f91"),a=i.n(n);a.a},"11e9":function(t,e,i){var n=i("52a7"),a=i("4630"),o=i("6821"),s=i("6a99"),l=i("69a8"),r=i("c69a"),u=Object.getOwnPropertyDescriptor;e.f=i("9e1e")?u:function(t,e){if(t=o(t),e=s(e,!0),r)try{return u(t,e)}catch(i){}if(l(t,e))return a(!n.f.call(t,e),t[e])}},"25f8":function(t,e,i){},"31a0":function(t,e,i){},"333d":function(t,e,i){"use strict";var n=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"pagination-container",class:{hidden:t.hidden}},[i("el-pagination",t._b({attrs:{background:t.background,"current-page":t.currentPage,"page-size":t.pageSize,layout:t.layout,"page-sizes":t.pageSizes,total:t.total},on:{"update:currentPage":function(e){t.currentPage=e},"update:current-page":function(e){t.currentPage=e},"update:pageSize":function(e){t.pageSize=e},"update:page-size":function(e){t.pageSize=e},"size-change":t.handleSizeChange,"current-change":t.handleCurrentChange}},"el-pagination",t.$attrs,!1))],1)},a=[];i("c5f6");Math.easeInOutQuad=function(t,e,i,n){return t/=n/2,t<1?i/2*t*t+e:(t--,-i/2*(t*(t-2)-1)+e)};var o=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(t){window.setTimeout(t,1e3/60)}}();function s(t){document.documentElement.scrollTop=t,document.body.parentNode.scrollTop=t,document.body.scrollTop=t}function l(){return document.documentElement.scrollTop||document.body.parentNode.scrollTop||document.body.scrollTop}function r(t,e,i){var n=l(),a=t-n,r=20,u=0;e="undefined"===typeof e?500:e;var c=function t(){u+=r;var l=Math.easeInOutQuad(u,n,a,e);s(l),u<e?o(t):i&&"function"===typeof i&&i()};c()}var u={name:"Pagination",props:{total:{required:!0,type:Number},page:{type:Number,default:1},limit:{type:Number,default:20},pageSizes:{type:Array,default:function(){return[6,10,20,30,50]}},layout:{type:String,default:"total, sizes, prev, pager, next, jumper"},background:{type:Boolean,default:!0},autoScroll:{type:Boolean,default:!0},hidden:{type:Boolean,default:!1}},computed:{currentPage:{get:function(){return this.page},set:function(t){this.$emit("update:page",t)}},pageSize:{get:function(){return this.limit},set:function(t){this.$emit("update:limit",t)}}},methods:{handleSizeChange:function(t){this.$emit("pagination",{page:this.currentPage,limit:t}),this.autoScroll&&r(0,800)},handleCurrentChange:function(t){this.$emit("pagination",{page:t,limit:this.pageSize}),this.autoScroll&&r(0,800)}}},c=u,d=(i("35d2"),i("2877")),p=Object(d["a"])(c,n,a,!1,null,"820c5f22",null);e["a"]=p.exports},"35d2":function(t,e,i){"use strict";var n=i("a38a"),a=i.n(n);a.a},"386d":function(t,e,i){"use strict";var n=i("cb7c"),a=i("83a1"),o=i("5f1b");i("214f")("search",1,(function(t,e,i,s){return[function(i){var n=t(this),a=void 0==i?void 0:i[e];return void 0!==a?a.call(i,n):new RegExp(i)[e](String(n))},function(t){var e=s(i,t,this);if(e.done)return e.value;var l=n(t),r=String(this),u=l.lastIndex;a(u,0)||(l.lastIndex=0);var c=o(l,r);return a(l.lastIndex,u)||(l.lastIndex=u),null===c?-1:c.index}]}))},"51ea":function(t,e,i){"use strict";i.r(e);var n=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"app-wrapper"},[i("plugin-navbar"),t._v(" "),i("plugin-list")],1)},a=[];i("b775");var o=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"app-main-content",staticStyle:{margin:"10px",background:"#fff"}},[i("div",{staticClass:"filter-container"},[i("el-row",[i("el-col",{staticClass:"advanced-search-groups",attrs:{xs:24,sm:12,md:8,lg:8,xl:8}},[t._v("\n        插件名称/描述：\n        "),i("el-input",{staticClass:"filter-item",staticStyle:{width:"200px"},attrs:{placeholder:"插件名称/描述",clearable:""},nativeOn:{keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.handleSeach()}},model:{value:t.searchName,callback:function(e){t.searchName="string"===typeof e?e.trim():e},expression:"searchName"}})],1),t._v(" "),i("el-col",{staticClass:"advanced-search-groups",attrs:{xs:24,sm:12,md:6,lg:6,xl:6}},[t._v("\n        插件状态：\n        "),i("el-select",{staticClass:"filter-item",attrs:{placeholder:"插件状态"},on:{change:function(e){return t.handleFilterInit()}},model:{value:t.searchStatus,callback:function(e){t.searchStatus=e},expression:"searchStatus"}},[i("el-option",{attrs:{label:"全部",value:"全部"}}),t._v(" "),"local"!==t.tabName?i("el-option",{attrs:{label:"下载",value:"下载"}}):t._e(),t._v(" "),i("el-option",{attrs:{label:"更新",value:"更新"}})],1)],1),t._v(" "),i("el-col",{staticClass:"advanced-search-operations",attrs:{align:"right",xs:24,sm:24,md:24,lg:24,xl:24}},[i("el-button",{staticClass:"filter-item",attrs:{type:"primary",icon:"el-icon-search"},on:{click:function(e){return t.getList()}}},[t._v("搜索")])],1)],1)],1),t._v(" "),i("div",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],staticStyle:{height:"100%"},attrs:{"element-loading-background":"#FFFFFF"}},[i("div",{staticStyle:{position:"relative",display:"inline-block",width:"100%"}},t._l(t.list,(function(e){return i("div",{key:e.plugin_id,staticClass:"card-panel",staticStyle:{"margin-top":"1%",width:"48.5%",float:"left","margin-left":"1%",height:"180px"},attrs:{id:e.plugin_id}},[i("el-card",{attrs:{"body-style":{padding:"0px",height:"100%"},shadow:"never"}},["nodejs"===e.language?i("svg",{staticClass:"icon",staticStyle:{float:"right",margin:"14px 10px 0px 0px"},attrs:{t:"1565963200375",viewBox:"0 0 1024 1024",version:"1.1",xmlns:"http://www.w3.org/2000/svg","p-id":"4393",width:"46",height:"46"}},[i("path",{attrs:{d:"M875.2 262.3L546.7 72.7c-20.7-11.8-48.3-11.8-69 0L148.8 262.3c-21.5 12.2-34.5 34.9-34.5 59.7v379.2c0 24.8 13.4 47.9 34.5 60.1l86.1 49.5c41.8 20.7 56.8 20.7 75.9 20.7 62.1 0 97.4-37.8 97.4-102.7V354.4c0-5.3-4.1-9.3-9.3-9.3h-41.4c-5.3 0-9.3 4.1-9.3 9.3v374.3c0 28.8-30 57.7-78.8 33.3l-90.1-52c-3.2-2-5.3-5.3-5.3-8.9V321.9c0-3.7 2-7.3 5.3-8.9l328.1-190c3.2-1.6 7.3-1.6 10.2 0l328.5 189.6c3.2 1.6 5.3 5.3 5.3 8.9v379.2c0 3.7-2 7.3-4.9 8.9L517.9 899.3c-2.8 1.6-7.3 1.6-10.2 0l-84.4-49.9c-2.4-1.2-5.7-1.6-8.1-0.4-23.1 13.4-27.6 15-49.5 22.7-5.7 1.6-13.4 4.9 2.8 14.2l109.6 65c10.6 6.1 22.3 9.3 34.5 9.3 11.8-0.4 24-3.2 34.1-9.7l328.5-189.6c21.1-12.2 34.5-34.9 34.5-59.7V321.9c0-24.3-13.4-47.5-34.5-59.6z",fill:"#689F63","p-id":"4394"}}),t._v(" "),i("path",{attrs:{d:"M614.1 641.1c-86.9 0-106-21.9-112.5-65-0.8-4.9-4.5-8.1-9.3-8.1h-42.6c-5.3 0-9.3 4.1-9.3 9.3 0 55.2 30 121.4 173.8 121.4l-0.4-0.4c103.9 0 163.6-41 163.6-112.5 0-70.6-47.9-89.7-149-103.1-101.9-13.4-112.5-20.3-112.5-44.3 0-19.5 8.9-45.9 84.4-45.9 67.8 0 92.6 14.6 102.7 60.1 1.2 4.1 4.9 7.3 9.3 7.3H755c2.4 0 5.3-0.8 6.9-2.8 1.6-2 2.8-4.5 2.4-7.3-6.9-78.4-58.9-114.9-164-114.9-93.4 0-149.4 39.4-149.4 105.6 0 71.9 55.6 91.8 145.8 100.7 107.6 10.6 116.1 26.4 116.1 47.5 0 36.5-29.3 52.4-98.7 52.4z",fill:"#689F63","p-id":"4395"}})]):t._e(),t._v(" "),"python"===e.language?i("svg",{staticClass:"icon",staticStyle:{float:"right",margin:"14px 10px 0 0"},attrs:{t:"1565963546363",viewBox:"0 0 1029 1024",version:"1.1",xmlns:"http://www.w3.org/2000/svg","p-id":"5140",width:"40",height:"40"}},[i("path",{attrs:{d:"M610.304 7.68l38.4 8.704 31.232 11.264 25.088 12.8 19.456 13.824 14.336 14.336 10.752 14.336 6.656 14.336 4.096 12.8 1.536 11.264 1.024 8.704-0.512 5.632v227.84l-2.048 26.624-5.632 23.552-9.216 19.456-11.264 16.384-12.8 13.312-14.336 10.752-14.848 8.192-14.848 6.144-14.336 4.096-12.8 3.072-11.264 1.536-9.216 1.024H376.832l-29.696 2.048-25.088 6.144-21.504 9.216-17.408 11.776-13.824 13.824-11.264 14.848-8.704 15.36-6.144 15.872-4.096 14.848-3.072 13.824-1.536 11.264-1.024 9.216v130.56h-95.744l-9.216-1.024-11.776-3.072-13.824-5.12-14.848-7.68-15.36-11.264-15.36-15.36-14.848-19.456L28.672 678.4l-11.776-31.232-8.704-37.376L2.048 563.2 0 510.464l2.56-52.224 6.656-44.544 10.24-36.864 13.824-30.208 15.36-24.576 16.896-18.944 17.92-13.824 17.92-10.24 16.896-6.656 15.36-4.096 13.824-2.048 10.24-0.512h6.656l2.56 0.512h348.16v-35.328H266.24l-0.512-117.248-1.024-15.872 2.048-14.336 4.608-13.312 7.168-11.776 10.752-11.264 13.312-9.728 16.384-8.704 18.944-7.68 21.504-6.144L384 9.728l27.648-4.608 30.208-2.56 32.768-1.536L510.464 0l54.272 2.048 45.568 5.632zM342.016 92.16l-9.728 14.336-3.584 17.408 3.584 17.408 9.728 14.336 14.336 9.216 17.408 4.096 17.408-4.096 14.336-9.216 9.728-14.336 3.584-17.408-4.096-17.92-9.728-13.824-14.336-9.216-17.408-4.096-17.408 4.096-13.824 9.216z",fill:"#0075AA","p-id":"5141"}}),t._v(" "),i("path",{attrs:{d:"M900.096 260.608l11.776 2.56 13.824 5.12 14.848 7.68 15.36 11.264 15.36 14.848 14.848 19.968 13.824 25.088 11.776 31.232 9.216 37.376 6.144 44.544 2.048 52.224-2.56 52.224-6.656 44.544-10.24 36.864-13.824 30.208-15.36 24.576-16.896 19.456-17.92 14.336-17.92 10.24-16.896 6.656-15.36 4.096-13.824 2.048-10.24 1.024-6.656-0.512h-350.72v34.816H762.88l0.512 117.76 1.024 15.36-2.048 14.336-4.608 13.312-7.168 12.288-10.752 10.752-13.312 10.24-16.384 8.704-18.944 7.168-21.504 6.144-24.576 5.632-27.136 4.096-30.208 3.072-32.768 1.536-35.84 0.512-54.272-1.536-45.568-6.144-38.4-8.704-31.232-10.752-25.088-12.8-19.456-14.336-14.336-14.336-10.752-14.336-6.656-14.336-4.096-12.8-1.536-10.752-1.024-8.704 0.512-5.632v-227.84l2.048-27.136 5.632-23.04 9.216-19.456 11.264-16.384 12.8-13.824 14.336-10.24 14.848-8.704 14.848-6.144 13.824-4.096 12.8-2.56 11.264-1.536 9.216-1.024 5.632-0.512h249.344l29.696-2.048 25.088-6.144 21.504-8.704 17.408-11.776 14.336-13.824 11.264-14.848 8.704-15.36 6.144-15.36 4.096-14.848 3.072-13.824 1.536-11.776 1.024-9.216V259.072h89.088l6.144 0.512 6.656 1.024zM624.128 868.864L614.4 883.2l-3.584 17.408 3.584 17.408 9.728 14.336 14.336 9.728 17.408 3.584 17.408-3.584 14.336-9.728 9.728-14.336 3.584-17.408-3.584-17.408-9.728-14.336-14.336-9.728-17.408-3.584-17.408 3.584-14.336 9.728z",fill:"#FFD400","p-id":"5142"}})]):t._e(),t._v(" "),"java"===e.language?i("svg",{staticClass:"icon",staticStyle:{float:"right",margin:"14px 10px 0 0"},attrs:{t:"1572767890841",viewBox:"0 0 1024 1024",version:"1.1",xmlns:"http://www.w3.org/2000/svg","p-id":"2391","data-spm-anchor-id":"a313x.7781069.0.i2",width:"40",height:"40"}},[i("path",{staticClass:"selected",attrs:{d:"M701.72245 245.828637s-162.696653 40.05327-190.648146 134.112978c-27.951493 94.059708 107.42585 114.379856 24.790581 191.957666 0 0 71.165674-36.847202 71.165675-85.796181s-67.37258-73.73956-48.316797-120.746836c19.055783-47.097588 143.008687-119.527627 143.008687-119.527627z",fill:"#E83418","p-id":"2392","data-spm-anchor-id":"a313x.7781069.0.i1"}}),t._v(" "),i("path",{attrs:{d:"M594.2966 68.501477s64.843851 74.371742-34.950655 184.326322-185.590687 106.116329-55.948141 286.017375c0 0-141.11214-93.427526-103.5876-183.69414s234.539666-126.481633 194.486396-286.649557z",fill:"#E83418","p-id":"2393"}}),t._v(" "),i("path",{staticClass:"selected",attrs:{d:"M408.073731 545.79918s-88.324911 23.526216-88.324911 38.788905c0 15.262689 223.702253 34.318472 370.549191-7.631345 0 0-102.323235 46.375094-266.284253 46.375094s-251.06672-48.903823-15.940027-77.532654zM371.226529 645.593685s-45.110729 12.056621-45.110729 29.893196c0 17.791419 96.588438 69.269127 331.760286 12.688804 0 0-30.525378-15.894871-35.582837-21.629669 0 0-324.761124 46.42025-251.06672-20.952331zM390.282312 738.389029s-65.476033 55.270803 207.1752 20.320148l45.110729 22.894033s-73.73956 29.215857-163.328835 29.215858-175.385457-38.111567-88.957094-72.430039zM322.27755 804.497244s-81.370904 15.262689-81.370905 33.054108 125.217269 34.950655 275.812145 34.950654 291.074834-26.054946 256.756361-61.637782c0 0 15.894871 6.999162 15.894871 18.423601s-36.847202 64.843851-333.656832 64.84385-266.916435-44.478547-266.916436-44.478546 7.044318-34.363628 133.480796-45.155885z",fill:"#06509B","p-id":"2394","data-spm-anchor-id":"a313x.7781069.0.i0"}}),t._v(" "),i("path",{attrs:{d:"M303.221767 910.613573s366.710941 52.742073 523.040613-54.63862c0 0 12.056621 62.269965-228.172686 76.900471s-294.867928-22.261851-294.867927-22.261851zM708.08943 552.798342s81.370904-17.159236 81.370904 48.948979-99.162323 105.484147-99.162323 105.484147 136.641707-21.629669 136.641708-110.586762-118.850289-43.846364-118.850289-43.846364z",fill:"#06509B","p-id":"2395"}})]):t._e(),t._v(" "),i("div",{staticStyle:{padding:"14px"}},[i("span",{staticClass:"plugin_name"},[t._v(t._s(e.plugin_name))]),t._v(" "),i("div",{staticClass:"bottom"},[i("span",{staticStyle:{"font-size":"14px",color:"#999999"}},[t._v("作者:")]),t._v("\n              "+t._s(e.author)+"  \n              "),i("span",{staticStyle:{"font-size":"14px",color:"#999999"}},[t._v("版本号:")]),t._v("\n              "+t._s(e.version)+"  \n              "),i("span",{staticStyle:{"font-size":"14px",color:"#999999"}},[t._v("最近更新时间:")]),t._v("\n              "+t._s(e.updatedAt)+"\n            ")]),t._v(" "),i("div",{staticClass:"bottom",staticStyle:{height:"50px"}},[i("span",{staticClass:"paragraph"},[i("span",{staticStyle:{"font-size":"14px",color:"#999999"}},[t._v("描述:")]),t._v("\n                "+t._s(e.plugin_description)+"\n              ")])]),t._v(" "),i("div",[i("div",[t.download_plugin[e.plugin_id]&&"exception"===t.download_plugin[e.plugin_id].downloadStatus&&t.download_plugin[e.plugin_id].errLog?i("span",{staticStyle:{"font-size":"12px",color:"#F56C6C",float:"left","margin-bottom":"-15px"}},[t._v(t._s(t.download_plugin[e.plugin_id].errLog))]):t._e(),t._v(" "),t.download_plugin[e.plugin_id]?i("el-progress",{staticClass:"download-progress",attrs:{percentage:t.download_plugin[e.plugin_id].downloadRate,status:t.download_plugin[e.plugin_id].downloadStatus}},[t._v(t._s(t.download_plugin[e.plugin_id].downloadRate)+"%")]):t._e(),t._v(" "),"local"!==t.tabName||e.is_uiauto_base_integration?t._e():i("el-button",{staticStyle:{float:"right","margin-left":"10px"},attrs:{type:"danger"},on:{click:function(i){return t.deletePlugin(e)}}},[t._v("删除")]),t._v(" "),i("el-button",{staticStyle:{cursor:"pointer",float:"right"},attrs:{plain:!t.plugin_status[e.plugin_id].needUpdate,type:t.plugin_status[e.plugin_id].needUpdate?"primary":"info",disabled:!t.plugin_status[e.plugin_id].needUpdate,loading:!!t.download_plugin[e.plugin_id]&&t.download_plugin[e.plugin_id].isDownloading},on:{click:function(i){return t.singleDownload(e)}}},[t._v(t._s(t.plugin_status[e.plugin_id].buttonText))])],1)])])])],1)})),0),t._v(" "),i("div",{staticStyle:{width:"100%","margin-top":"6px"}},[i("center",[i("pagination",{staticStyle:{display:"inline-block"},attrs:{total:t.total,page:t.listQuery.pageIndex,limit:t.listQuery.pageSize},on:{"update:page":function(e){return t.$set(t.listQuery,"pageIndex",e)},"update:limit":function(e){return t.$set(t.listQuery,"pageSize",e)},pagination:t.getList}})],1)],1)])])},s=[],l=(i("7f7f"),i("7514"),i("6762"),i("2fdb"),i("96cf"),i("3b8d")),r=i("2ef0"),u=i.n(r),c=(i("4328"),i("9448")),d=i("333d"),p=i("f22f");i("a481"),i("6b54"),i("7618"),i("28a5");function g(t,e){var i=h(t),n=h(e);return i!=n&&(i>n||!(i<n)&&void 0)}function h(t){for(var e=t.split(/\./),i=["","0","00","000","0000"],n=i.reverse(),a=0;a<e.length;a++){var o=e[a].length;e[a]=n[o]+e[a]}var s=e.join("");return s}var f=i("2b0e"),_=new f["default"],m=new f["default"],v=window.require("fs"),b=window.require("path"),y=window.require("fs-extra"),w=(window.require("axios"),window.require("electron").ipcRenderer,i("1e55")),S=w.allDownload,x=w.executeDownload,k={name:"PluginList",components:{Pagination:d["a"]},data:function(){return{list:[],total:0,searchName:"",searchStatus:"全部",listQuery:{pageIndex:1,pageSize:6},loading:!0}},mounted:function(){var t=this;m.$on("getdownloadAllPlugin",(function(e){t.getAllDownloadParams()}))},computed:{tabName:function(){return this.$store.state.plugin.tab},refresh:function(){return this.$store.state.plugin.refresh},download_plugin:function(){return this.$store.state.plugin.pluginDownload},plugin_status:function(){return this.$store.state.plugin.pluginStatus}},watch:{tabName:function(){this.listQuery={pageIndex:1,pageSize:6},this.total=0,this.searchStatus="全部",this.searchName="",this.getList()},refresh:function(t,e){this.getList()}},created:function(){this.getList()},methods:{singleDownload:function(){var t=Object(l["a"])(regeneratorRuntime.mark((function t(e){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if("python"!==e.language){t.next=8;break}if(!this.$store.state.plugin.has_python_downloading){t.next=6;break}return this.$message({message:"当前已有python插件在下载，请稍候再下载！",type:"error"}),t.abrupt("return",!1);case 6:"uiauto_uiselector"===e.plugin_id&&window.uiselector.exit_uiselector(),this.$store.commit("plugin/MARK_PYTHON_DOWNLOADING",!0);case 8:x(e).then((function(t){})).catch((function(t){}));case 9:case"end":return t.stop()}}),t,this)})));function e(e){return t.apply(this,arguments)}return e}(),getAllDownloadParams:function(){var t=Object(l["a"])(regeneratorRuntime.mark((function t(){var e,i=this;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:e=this,Object(c["c"])({}).then((function(t){var n=t.data,a=b.join(b.resolve(),"/public/base_integration/"),o=v.readdirSync(a),s=p["default"].pluginsPath+"/",l=u.a.difference(v.readdirSync(s),["list.json","npm_i.sh"]);l=u.a.concat(l,o),u.a.remove(n,(function(t){var i="";return i=v.existsSync(b.normalize(a+t.plugin_id+"/package.json"))?b.normalize(a+t.plugin_id+"/package.json"):b.normalize(p["default"].pluginsPath+"/"+t.plugin_id+"/package.json"),u.a.includes(l,t.plugin_id)&&!1===g(t.version,y.readJsonSync(i).version)||!!e.download_plugin[t.plugin_id]&&!0===e.download_plugin[t.plugin_id]["isDownloading"]})),u.a.map(n,(function(t){return t["latestVersion"]=t.version})),u.a.each(n,(function(t,e){var n="";if(v.existsSync(b.normalize(a+t.plugin_id+"/package.json"))?("uiauto_uiselector"===t.plugin_id&&window.uiselector.exit_uiselector(),n=b.normalize(a+t.plugin_id+"/package.json")):n=b.normalize(p["default"].pluginsPath+"/"+t.plugin_id+"/package.json"),v.existsSync(n)){var o=y.readJsonSync(n);t.is_uiauto_base_integration=!!o.is_uiauto_base_integration}else t.is_uiauto_base_integration=!1;var s={plugin_id:t.plugin_id,downloadRate:0,downloadStatus:"text",isWaitDownload:!0,isDownloading:!0};i.$store.commit("plugin/PLUGIN_DOWNLOAD",s);var l={plugin_id:t.plugin_id,needUpdate:!0,buttonText:"等待下载"};i.$store.commit("plugin/PLUGIN_STATUS",l)})),setTimeout((function(){S(n,0)}),0)}));case 2:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),getList:function(){u.a.includes(["下载","更新"],this.searchStatus)?this.handleFilter():(this.loading=!0,this.list=[],"all"===this.tabName?this.getWebPlugins():"local"===this.tabName&&this.getLocalPlugins())},handleSeach:function(){this.listQuery={pageIndex:1,pageSize:6},this.getList()},getWebPlugins:function(){var t=this;return new Promise((function(e,i){var n=b.join(b.resolve(),"/public/base_integration/"),a=p["default"].pluginsPath+"/";""!==t.searchName?t.listQuery.where={$or:[{plugin_id:{$like:"%"+[t.searchName]+"%"}},{plugin_description:{$like:"%"+t.searchName+"%"}}]}:t.listQuery.where={},Object(c["b"])(t.listQuery).then((function(e){var i=e.data.list;u.a.map(i,(function(e){var i=a+e.plugin_id+"/package.json";if(v.existsSync(i)||(i=n+e.plugin_id+"/package.json"),"uiauto_logMonitor"===e.plugin_id&&(e.is_uiauto_base_integration=!0),v.existsSync(i)){var o=y.readJsonSync(i);e.is_uiauto_base_integration=!!o.is_uiauto_base_integration,e.latestVersion=e.version;var s={plugin_id:e.plugin_id,needUpdate:!!g(e.version,o.version),buttonText:t.download_plugin[e.plugin_id]?"exception"===t.download_plugin[e.plugin_id]["downloadStatus"]?"重新下载":!0===t.download_plugin[e.plugin_id]["isWaitDownload"]?"等待下载":"正在下载":g(e.version,o.version)?"更新":"已安装最新版本"};t.$store.commit("plugin/PLUGIN_STATUS",s)}else{e.latestVersion=e.version;var l={plugin_id:e.plugin_id,needUpdate:!0,buttonText:t.download_plugin[e.plugin_id]?"exception"===t.download_plugin[e.plugin_id]["downloadStatus"]?"重新下载":!0===t.download_plugin[e.plugin_id]["isWaitDownload"]?"等待下载":"正在下载":"下载"};t.$store.commit("plugin/PLUGIN_STATUS",l)}})),t.list=i,t.total=e.data.total,t.loading=!1})).catch((function(e){t.loading=!1,console.warn("err"),console.warn(e)}))}))},getLocalPlugins:function(){var t=this,e=b.join(b.resolve(),"/public/base_integration/"),i=v.readdirSync(e),n=p["default"].pluginsPath+"/",a=u.a.difference(v.readdirSync(n),["list.json","npm_i.sh"]);a=u.a.concat(a,i);var o=[],s={};s=""!==this.searchName?{$or:[{plugin_id:{$like:"%"+[this.searchName]+"%"}},{plugin_description:{$like:"%"+this.searchName+"%"}}]}:{plugin_id:a},Object(c["c"])(s).then((function(i){var s=i.data;""!==t.searchName&&(a=u.a.pullAll(a,u.a.difference(a,u.a.map(s,"plugin_id")))),u.a.map(a,(function(i){var a=n+i+"/package.json";if(v.existsSync(a)||(a=e+i+"/package.json"),v.existsSync(a)){var l=y.readJsonSync(a),r=u.a.find(s,(function(t){return t.plugin_id==l.id}));"uiauto_logMonitor"===l.id&&(l.is_uiauto_base_integration=!0),o.push({plugin_id:l.id,plugin_name:l.name,author:l.author,version:l.version,language:l.language,latestVersion:r?r.version:l.version,plugin_description:l.description,attachment_md5:r?r.attachment_md5:null,is_uiauto_base_integration:!!l.is_uiauto_base_integration});var c={plugin_id:l.id,needUpdate:!!t.download_plugin[l.id]||!!g(r?r.version:l.version,l.version),buttonText:t.download_plugin[l.id]?"exception"===t.download_plugin[l.id]["downloadStatus"]?"重新下载":!0===t.download_plugin[l.id]["isWaitDownload"]?"等待下载":"正在下载":g(r?r.version:l.version,l.version)?"更新":"已安装最新版本"};t.$store.commit("plugin/PLUGIN_STATUS",c)}})),t.list=u.a.chunk(o,t.listQuery.pageSize)[t.listQuery.pageIndex-1],t.total=o.length,t.loading=!1})).catch((function(e){console.warn(e),t.loading=!1}))},deletePlugin:function(t){var e=this;this.$confirm("此操作将永久删除该插件, 是否继续?","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then((function(){var i=e.$loading({text:"正在删除",spinner:"el-icon-loading",background:"rgba(0, 0, 0, 0.7)",target:"#"+t.plugin_id}),n=p["default"].pluginsPath+"/",a=u.a.difference(v.readdirSync(n),["list.json"]),o=n+a[u.a.indexOf(a,t.plugin_id)]+"/";if(v.existsSync(o))try{y.emptyDirSync(o),v.rmdirSync(o),i.close(),e.getList(),e.$message({showClose:!0,message:"删除成功",type:"success"})}catch(s){i.close(),e.$message({showClose:!0,message:s,type:"error"})}else i.close(),e.$message({showClose:!0,message:"删除失败，插件已被删除或文件不合法",type:"error"})})).catch((function(){e.$message({type:"info",message:"已取消删除"})}))},handleFilterInit:function(){this.listQuery.pageIndex=1,this.handleFilter()},handleFilter:function(){var t=this;if(u.a.includes(["下载","更新"],this.searchStatus)){var e=[],i=[],n=u.a.concat(u.a.difference(v.readdirSync("".concat(p["default"].pluginsPath,"/")),["list.json","npm_i.sh",".DS_Store"]),v.readdirSync(b.join(b.resolve(),"/public/base_integration/")));Object(c["c"])({}).then((function(a){u.a.each(a.data,(function(e){var a="".concat(p["default"].pluginsPath,"/").concat(e.plugin_id,"/package.json"),o=b.join(b.resolve(),"/public/base_integration/");v.existsSync(a)||(a=o+e.plugin_id+"/package.json"),u.a.includes(["uiauto_executor","uiauto_uiselector","uiauto_logMonitor"],e.plugin_id)?e.is_uiauto_base_integration=!0:e.is_uiauto_base_integration=!1;var s=u.a.includes(n,e.plugin_id)?y.readJsonSync(a).version:null,l={plugin_id:e.plugin_id,needUpdate:"下载"===t.searchStatus||!!g(e.version,s||e.version),buttonText:u.a.includes(n,e.plugin_id)?g(e.version,s||e.version)?"更新":"已安装最新版本":"下载"};i.push(l),t.$store.commit("plugin/PLUGIN_STATUS",l)})),"下载"===t.searchStatus?u.a.each(i,(function(i){if("下载"===i.buttonText){var n=u.a.find(a.data,{plugin_id:i.plugin_id});""!==t.searchName?n&&(n.plugin_id.indexOf(t.searchName)>-1||n.plugin_description&&n.plugin_description.indexOf(t.searchName)>-1)&&e.push({plugin_id:n.plugin_id,plugin_name:n.plugin_name,author:n.author,version:n.version,latestVersion:n.version,language:n.language,plugin_description:n.plugin_description,attachment_md5:n.attachment_md5,is_uiauto_base_integration:n.is_uiauto_base_integration,updatedAt:n.updatedAt}):e.push({plugin_id:n.plugin_id,plugin_name:n.plugin_name,author:n.author,version:n.version,latestVersion:n.version,language:n.language,plugin_description:n.plugin_description,attachment_md5:n.attachment_md5,is_uiauto_base_integration:n.is_uiauto_base_integration,updatedAt:n.updatedAt})}})):"更新"===t.searchStatus&&u.a.each(i,(function(i){if("更新"===i.buttonText){var n=u.a.find(a.data,{plugin_id:i.plugin_id});""!==t.searchName?n&&(n.plugin_id.indexOf(t.searchName)>-1||n.plugin_description&&n.plugin_description.indexOf(t.searchName)>-1)&&e.push({plugin_id:n.plugin_id,plugin_name:n.plugin_name,author:n.author,version:n.version,latestVersion:n.version,language:n.language,plugin_description:n.plugin_description,attachment_md5:n.attachment_md5,is_uiauto_base_integration:n.is_uiauto_base_integration,updatedAt:n.updatedAt}):e.push({plugin_id:n.plugin_id,plugin_name:n.plugin_name,author:n.author,version:n.version,latestVersion:n.version,language:n.language,plugin_description:n.plugin_description,attachment_md5:n.attachment_md5,is_uiauto_base_integration:n.is_uiauto_base_integration,updatedAt:n.updatedAt})}})),t.list=u.a.chunk(e,t.listQuery.pageSize)[t.listQuery.pageIndex-1],t.total=e.length}))}else this.listQuery.pageIndex=1,this.getList()}}},N=k,P=(i("097f"),i("2877")),C=Object(P["a"])(N,o,s,!1,null,"4b7647a0",null),$=C.exports,A=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"navbar"},[i("breadcrumb",{staticClass:"breadcrumb-container"}),t._v(" "),i("plugin-tabs",{staticClass:"select"}),t._v(" "),i("div",{staticClass:"right-menu"},[i("uploadPlugin",{staticClass:"right-menu-item",staticStyle:{"margin-right":"15px"}}),t._v(" "),i("downloadPlugin",{staticClass:"right-menu-item"})],1)],1)},z=[],I=(i("386d"),function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("el-tabs",{model:{value:t.tabActiveName,callback:function(e){t.tabActiveName=e},expression:"tabActiveName"}},[i("el-tab-pane",{attrs:{label:"本地",name:"local"}}),t._v(" "),i("el-tab-pane",{attrs:{label:"全部",name:"all"}})],1)],1)}),L=[],j={name:"PluginTabs",components:{},data:function(){return this.$store.state.plugin.tab="all",{}},computed:{tabActiveName:{get:function(){return this.$store.state.plugin.tab},set:function(t){return this.$store.state.plugin.tab=t,t}}},watch:{tabActiveName:function(){}},mounted:function(){},methods:{}},T=j,O=Object(P["a"])(T,I,L,!1,null,"516f5602",null),E=O.exports,D=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("el-button",{staticClass:"button",attrs:{type:"primary"},on:{click:function(e){t.dialogSelectVisible=!0}}},[t._v("导入插件")]),t._v(" "),i("el-dialog",{attrs:{title:"导入插件",visible:t.dialogSelectVisible,width:"30%",center:""},on:{"update:visible":function(e){t.dialogSelectVisible=e},close:t.close}},[i("el-dialog",{attrs:{width:"25%",top:"25vh",visible:t.uploadLoading,"close-on-click-modal":!1,"close-on-press-escape":!1,"show-close":!1,"append-to-body":"",center:""},on:{"update:visible":function(e){t.uploadLoading=e}}},[i("span",{staticClass:"dialog-title",attrs:{slot:"title"},slot:"title"},[t._v(t._s(t.uploadTitle))]),t._v(" "),i("div",{staticClass:"loading"},[i("i",{staticClass:"el-icon-loading uploadLoading"})])]),t._v(" "),i("el-input",{attrs:{autocomplete:"off",readonly:!0},model:{value:t.filePath,callback:function(e){t.filePath=e},expression:"filePath"}},[i("template",{slot:"append"},[i("el-upload",{ref:"upload",staticClass:"upload-demo",attrs:{action:t.productionUploadUrl,headers:t.headers,data:t.uploadData,"on-change":t.fileChange,"on-success":t.uploadSuccess,"on-error":t.uploadError,"before-upload":t.beforeupload,"show-file-list":!1,"auto-upload":!1}},[i("el-button",{attrs:{type:"primary"}},[t._v("选择文件")])],1)],1)],2),t._v(" "),i("center",[i("el-checkbox",{staticClass:"checkbox",model:{value:t.checked,callback:function(e){t.checked=e},expression:"checked"}},[t._v("是否为上传为私有插件")])],1),t._v(" "),i("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[i("el-button",{staticStyle:{color:"#1890ff",border:"1px solid #1890ff"},on:{click:function(e){t.dialogSelectVisible=!1}}},[t._v("取 消")]),t._v(" "),i("el-button",{staticStyle:{color:"white"},attrs:{type:"primary",disabled:""===t.filePath},on:{click:function(e){return t.upload()}}},[t._v("导 入")])],1)],1)],1)},F=[],U=(i("f559"),window.require("electron").ipcRenderer,window.require("electron").remote.app,window.require("fs-extra")),M=window.require("fs"),V=window.require("crypto"),Q=window.require("decompress"),q=window.require("path"),R=i("95a9"),J=R.nodeInit,G=R.pythonInit,B={data:function(){return{productionUploadUrl:p["default"].serverUrl+"/api/v1/plugins/upload",dialogSelectVisible:!1,uploadLoading:!1,filePath:"",headers:null,uploadData:null,checked:!1,uploadTitle:""}},computed:{},watch:{},created:function(){},methods:{close:function(){this.filePath="",this.checked=!1,this.headers=null,this.uploadData=null},fileChange:function(t,e){this.filePath=t.raw.path,console.log(this.filePath);var i=M.readFileSync(this.filePath),n=V.createHash("md5").update(i).digest("hex");console.log(n),this.headers={Authorization:localStorage.getItem("access_token")},this.uploadData={private:this.checked,md5:n},console.log(this.uploadData)},beforeupload:function(t){console.log("beforeupload"),console.log(t.path),this.uploadTitle="正在上传",this.uploadLoading=!0},upload:function(){this.$refs.upload.submit()},uploadSuccess:function(t,e){console.log(e),this.uploadTitle="正在安装",this.installPlugin()},uploadError:function(t,e){this.uploadLoading=!1,this.dialogSelectVisible=!1,this.uploadTitle="",this.$message({showClose:!0,message:"上传失败",type:"error"})},installPlugin:function(){var t=this,e=q.normalize(p["default"].pluginsPath+"/../plugins_temp/"),i=p["default"].pluginsPath+"/";M.existsSync(e)||M.mkdirSync(e),M.existsSync(i)||M.mkdirSync(i),Q(this.filePath,e,{filter:function(t){var e=!0;return t.path.startsWith("__MACOSX")&&(e=!1),e}}).then((function(n){var a=n[0].path.split("/")[0],o=e+a,s=q.normalize(o+"/package.json");if(M.existsSync(o)&&M.existsSync(s)&&U.readJsonSync(s).id===a&&U.readJsonSync(s).version&&U.readJsonSync(s).author&&U.readJsonSync(s).language){try{var l=U.readJsonSync(s);if(l.source="local",U.writeJsonSync(s,l),M.existsSync(i+a)&&(U.emptyDirSync(i+a),M.rmdirSync(i+a)),U.moveSync(o,i+a,{overwrite:!0}),M.existsSync(q.normalize(i+a+"/node_modules")))t.importSuccess();else if("nodejs"===l.language)J(i+a).then((function(e){t.importSuccess()})).catch((function(e){t.importError(e,i+a)}));else if("python"===l.language)G(i+a).then((function(e){t.importSuccess()})).catch((function(e){t.importError(e,i+a)}));else{var r="文件格式有误，language需为一种有效语言";t.importError(r,i+a)}}catch(r){t.importError(r,i+a)}U.emptyDirSync(o),M.rmdirSync(o)}else t.importError("包内文件不合法，请检查包内容后再试！",o)})).catch((function(e){t.$message({showClose:!0,message:"文件解压失败",type:"error"})}))},importSuccess:function(){this.uploadLoading=!1,this.dialogSelectVisible=!1,this.uploadTitle="",this.$message({showClose:!0,message:"导入成功！",type:"success"}),this.$store.dispatch("plugin/refreshPugin")},importError:function(t,e){this.uploadLoading=!1,this.dialogSelectVisible=!1,this.uploadTitle="",e&&(U.emptyDirSync(e),M.rmdirSync(e)),this.$message({showClose:!0,message:t,type:"error"})}}},W=B,H=(i("7344"),Object(P["a"])(W,D,F,!1,null,"3dcc6af7",null)),X=H.exports,Y=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("el-button",{staticClass:"button",attrs:{type:"primary",loading:t.allDownloadStatus},on:{click:function(e){return t.download()}}},[t._v(t._s(!0===t.allDownloadStatus?"正在下载":"全部下载"))])],1)},K=[],Z=(window.require("path"),{data:function(){return{}},computed:{allDownloadStatus:function(){return this.$store.state.plugin.has_all_plugin_downloading}},created:function(){},methods:{download:function(){this.$store.commit("plugin/ALL_PLUGIN_DOWNLOADING",!0),m.$emit("getdownloadAllPlugin",!0)}}}),tt=Z,et=(i("9c1d3"),Object(P["a"])(tt,Y,K,!1,null,"6e966954",null)),it=et.exports,nt=i("6350"),at={name:"PluginNavbar",components:{uploadPlugin:X,downloadPlugin:it,pluginTabs:E,Breadcrumb:nt["a"]},data:function(){return{search:"",show:!1}},methods:{searchClick:function(){console.log("searchClick"),this.show=!this.show,this.show&&this.$refs.headerSearchSelect&&this.$refs.headerSearchSelect.focus()},addSearch:function(){var t=this.search.replace(/\s+/g,"");_.$emit("getSearchParameters",{searchName:t})},tabClick:function(t,e){console.log("tabClick"),console.log(t,e),console.log(this.tabActiveName)}}},ot=at,st=(i("c3f0"),Object(P["a"])(ot,A,z,!1,null,"51e1664a",null)),lt=st.exports,rt={name:"Plugins",components:{PluginList:$,PluginNavbar:lt},data:function(){return{}},created:function(){},methods:{},destroyed:function(){_.$off("getSearchParameters"),m.$off("getdownloadAllPlugin")}},ut=rt,ct=(i("d2a8"),Object(P["a"])(ut,n,a,!1,null,"025424c1",null));e["default"]=ct.exports},"5dbc":function(t,e,i){var n=i("d3f4"),a=i("8b97").set;t.exports=function(t,e,i){var o,s=e.constructor;return s!==i&&"function"==typeof s&&(o=s.prototype)!==i.prototype&&n(o)&&a&&a(t,o),t}},6981:function(t,e,i){},"6f91":function(t,e,i){},7344:function(t,e,i){"use strict";var n=i("b3c2"),a=i.n(n);a.a},7514:function(t,e,i){"use strict";var n=i("5ca1"),a=i("0a49")(5),o="find",s=!0;o in[]&&Array(1)[o]((function(){s=!1})),n(n.P+n.F*s,"Array",{find:function(t){return a(this,t,arguments.length>1?arguments[1]:void 0)}}),i("9c6c")(o)},7618:function(t,e,i){"use strict";i.d(e,"a",(function(){return l}));var n=i("5d58"),a=i.n(n),o=i("67bb"),s=i.n(o);function l(t){return l="function"===typeof s.a&&"symbol"===typeof a.a?function(t){return typeof t}:function(t){return t&&"function"===typeof s.a&&t.constructor===s.a&&t!==s.a.prototype?"symbol":typeof t},l(t)}},"83a1":function(t,e){t.exports=Object.is||function(t,e){return t===e?0!==t||1/t===1/e:t!=t&&e!=e}},"8b97":function(t,e,i){var n=i("d3f4"),a=i("cb7c"),o=function(t,e){if(a(t),!n(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,n){try{n=i("9b43")(Function.call,i("11e9").f(Object.prototype,"__proto__").set,2),n(t,[]),e=!(t instanceof Array)}catch(a){e=!0}return function(t,i){return o(t,i),e?t.__proto__=i:n(t,i),t}}({},!1):void 0),check:o}},9093:function(t,e,i){var n=i("ce10"),a=i("e11e").concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return n(t,a)}},"9c1d3":function(t,e,i){"use strict";var n=i("25f8"),a=i.n(n);a.a},a38a:function(t,e,i){},aa77:function(t,e,i){var n=i("5ca1"),a=i("be13"),o=i("79e5"),s=i("fdef"),l="["+s+"]",r="​",u=RegExp("^"+l+l+"*"),c=RegExp(l+l+"*$"),d=function(t,e,i){var a={},l=o((function(){return!!s[t]()||r[t]()!=r})),u=a[t]=l?e(p):s[t];i&&(a[i]=u),n(n.P+n.F*l,"String",a)},p=d.trim=function(t,e){return t=String(a(t)),1&e&&(t=t.replace(u,"")),2&e&&(t=t.replace(c,"")),t};t.exports=d},b3c2:function(t,e,i){},c3f0:function(t,e,i){"use strict";var n=i("31a0"),a=i.n(n);a.a},c5f6:function(t,e,i){"use strict";var n=i("7726"),a=i("69a8"),o=i("2d95"),s=i("5dbc"),l=i("6a99"),r=i("79e5"),u=i("9093").f,c=i("11e9").f,d=i("86cc").f,p=i("aa77").trim,g="Number",h=n[g],f=h,_=h.prototype,m=o(i("2aeb")(_))==g,v="trim"in String.prototype,b=function(t){var e=l(t,!1);if("string"==typeof e&&e.length>2){e=v?e.trim():p(e,3);var i,n,a,o=e.charCodeAt(0);if(43===o||45===o){if(i=e.charCodeAt(2),88===i||120===i)return NaN}else if(48===o){switch(e.charCodeAt(1)){case 66:case 98:n=2,a=49;break;case 79:case 111:n=8,a=55;break;default:return+e}for(var s,r=e.slice(2),u=0,c=r.length;u<c;u++)if(s=r.charCodeAt(u),s<48||s>a)return NaN;return parseInt(r,n)}}return+e};if(!h(" 0o1")||!h("0b1")||h("+0x1")){h=function(t){var e=arguments.length<1?0:t,i=this;return i instanceof h&&(m?r((function(){_.valueOf.call(i)})):o(i)!=g)?s(new f(b(e)),i,h):b(e)};for(var y,w=i("9e1e")?u(f):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),S=0;w.length>S;S++)a(f,y=w[S])&&!a(h,y)&&d(h,y,c(f,y));h.prototype=_,_.constructor=h,i("2aba")(n,g,h)}},d2a8:function(t,e,i){"use strict";var n=i("6981"),a=i.n(n);a.a},fdef:function(t,e){t.exports="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"}}]);