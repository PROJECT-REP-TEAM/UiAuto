<template>
  <div>
    <div class="app-actionBar">
      <div class="left-menu">应用</div>
      <div style="float: right; height: 40px">
        <el-button
          type="text"
          size="mini"
          icon="el-icon-loading"
          style="color: #999; line-height: 25px;margin-right: 10px;"
          v-if="syncLoading"
          >正在同步我的应用</el-button
        >
      </div>
    </div>

    <div class="app-container">
      <el-tabs v-model="selectedTab" style="background: #fff; padding: 0 10px">
        <el-tab-pane label="我的应用" name="my_application" />
        <el-tab-pane label="应用市场" name="application_market" />
      </el-tabs>

      <div v-if="selectedTab == 'my_application'">
        <myApplication ref="myApplication" />
      </div>
      <div v-if="selectedTab == 'application_market'">
        <applicationMarket />
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import myApplication from "./my_application";
import applicationMarket from "./application_market";
import config from "@/config/environment/index";
const fs = window.nodeRequire("fs");
const fse = window.nodeRequire("fs-extra");

export default {
  name: "Application",
  components: { myApplication, applicationMarket },
  data() {
    return {
      selectedTab: "my_application",
      syncLoading: false,
    };
  },
  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
</style>
