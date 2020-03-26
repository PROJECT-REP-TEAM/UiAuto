<!--
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-07-01 15:36:31
 * @LastEditTime: 2019-08-20 09:19:17
 * @Description: file content
 -->
<template>
  <div class="app-wrapper">
    <plugin-navbar />
    <plugin-list />
    <!-- <center>
      <pagination
        v-show="total>0"
        style="display: inline-block;"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </center>-->
  </div>
</template>

<script>
import { fetchList } from "@/api/article";
// import Pagination from '@/components/Pagination'
import PluginList from "./components/pluginList";
import PluginNavbar from "./components/pluginNavbar/index";
import { globalSearch } from "@/utils/search.js";
import { downloadAllPlugin } from "@/utils/downloadAllPlugin.js";

export default {
  name: "Plugins",
  components: {
    // Pagination,
    PluginList,
    PluginNavbar
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
  destroyed() {
    globalSearch.$off("getSearchParameters");
    downloadAllPlugin.$off("getdownloadAllPlugin");
  }
};
</script>
<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  // padding-left: 6px;
}
/deep/.el-card {
  border-radius: 5px;
  border: 1px solid #cccccc;
}
.card-panel-col {
  padding-right: 0px !important;
}
.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}
</style>

