<!--
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-07-01 15:36:31
 * @LastEditTime: 2019-08-19 17:33:07
 * @Description: file content
 -->
<template>
  <div class="navbar">
    <breadcrumb class="breadcrumb-container"/>
    <plugin-tabs class="select"/>
    <div class="right-menu">
      <!-- <div :class="{'show':show}" class="header-search right-menu-item">
        <svg-icon class-name="search-icon" icon-class="search" @click.stop="searchClick"/>
        <el-input
          class="header-search-select"
          v-model="search"
          ref="headerSearchSelect"
          placeholder="请输入插件名称"
          clearable
          @keyup.enter.native="addSearch()"
        ></el-input> -->
        <!-- <el-select
          ref="headerSearchSelect"
          v-model="search"
          filterable
          default-first-option
          remote
          placeholder="Search"
          class="header-search-select"
        >
          <el-option
            v-for="item in options"
            :key="item.path"
            :value="item"
            :label="item.title.join(' > ')"
          />
        </el-select>-->
      <!-- </div> -->
      <sourceSetting class="right-menu-item" style="margin-right: 15px;"/>
      <uploadPlugin class="right-menu-item" style="margin-right: 15px;"/>
      <downloadPlugin class="right-menu-item"/>
    </div>
  </div>
</template>

<script>
import pluginTabs from "./pluginTabs";
import uploadPlugin from "./uploadPlugin";
import downloadPlugin from "./downloadPlugin";
import sourceSetting from "./sourceSetting";
import Breadcrumb from "@/components/Breadcrumb";
import { globalSearch } from "@/utils/search.js";
export default {
  name: "PluginNavbar",
  components: {
    uploadPlugin,
    downloadPlugin,
    sourceSetting,
    pluginTabs,
    Breadcrumb
  },
  // mounted() {
  //   var target = document.querySelector('#tab-local');
  //   console.log(target);
  // },
  data() {
    return {
      search: "",
      show: false
    };
  },
  methods: {
    searchClick() {
      console.log("searchClick");
      this.show = !this.show;
      if (this.show) {
        this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus();
      }
    },
    addSearch() {
      const searchName = this.search.replace(/\s+/g, "");
      globalSearch.$emit("getSearchParameters", { searchName: searchName });
    },
    tabClick(tab, event) {
      console.log("tabClick");
      console.log(tab, event);
      console.log(this.tabActiveName);
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 40px;
  overflow: hidden;
  position: relative;
  text-align: center;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .select {
    // float: left;
    // margin-left: 42%;
    // margin-right: 15%;
    // height: 100%;
    display: inline-block;
    line-height: 40px;
  }

  .breadcrumb-container {
    position: absolute;
    left: 0;
    top: 0;
    height: 40px;
    line-height: 40px;
  }

  .right-menu {
    position: absolute;
    right: 0;
    top: 0;
    padding-right: 1%;
    height: 40px;
    line-height: 40px;
    // float: right;
    // height: 100%;
    // line-height: 40px;
    // margin-right: 1%;

    .right-menu-item {
      display: inline-block;
      // padding: 0 8px;
      height: 100%;
      //   vertical-align: text-bottom;
    }
  }
}
.header-search {
  padding-right: 15px;
  font-size: 0 !important;

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    margin-bottom: 5px;
    vertical-align: middle;
  }

  .header-search-select {
    font-size: 14px;
    margin-bottom: 5px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    /deep/ .el-input__inner {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #050505;
      vertical-align: middle;
    }
  }

  &.show {
    .header-search-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}

/deep/ .el-input-group__append {
  background-color: #1890ff;
  color: #ffffff;
  border: 1px solid #1890ff;
}
</style>
