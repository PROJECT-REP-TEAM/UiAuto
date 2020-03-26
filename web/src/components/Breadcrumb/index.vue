<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <!-- <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path"> -->
      <el-breadcrumb-item v-for="item in levelList" :key="item.path">
        <!-- <span v-if="item.redirect==='noredirect'||index==levelList.length-1" class="no-redirect">
          {{item.meta.title }} {{ '/' + projectName }}
        </span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>-->
        <span class="no-redirect">{{ item.meta.title_zh }}</span>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
// import { generateTitle } from '@/utils/i18n'
import pathToRegexp from "path-to-regexp";

export default {
  data() {
    return {
      levelList: null,
      projectName: ""
    };
  },
  watch: {
    $route() {
      this.getBreadcrumb();
    }
  },
  created() {
    this.getBreadcrumb();
  },
  mounted() {
    this.projectName = this.$route.query.projectName;
  },
  methods: {
    // generateTitle,
    getBreadcrumb() {
      let matched = this.$route.matched.filter(item => item.name);

      const first = matched[0];

      if (
        first &&
        first.name.trim().toLocaleLowerCase() === "Home".toLocaleLowerCase()
      ) {
        matched = [{ path: "/home", meta: { title: "home" } }].concat(matched);
      }

      this.levelList = matched.filter(
        item => item.meta && item.meta.title && item.meta.breadcrumb !== false
      );
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route;
      var toPath = pathToRegexp.compile(path);
      return toPath(params);
    },
    handleLink(item) {
      const { redirect, path } = item;
      if (redirect) {
        this.$router.push(redirect);
        return;
      }
      this.$router.push(this.pathCompile(path));
    }
  }
};
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 40px;
  margin-left: 15px;

  .no-redirect {
    color: #333;
    cursor: text;
  }
}
</style>
