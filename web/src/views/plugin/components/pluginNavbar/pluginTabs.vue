<template>
  <div>
    <el-tabs v-model="tabActiveName">
      <el-tab-pane label="本地" name="local"/>

      <el-tab-pane label="全部" name="all"/>

      <!-- <el-tab-pane label="本地项" name="local"/> -->
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "PluginTabs",
  components: {},
  data() {
    this.$store.state.plugin.tab = "all";
    return {};
  },
  computed: {
    tabActiveName: {
      get() {
        return this.$store.state.plugin.tab;
      },
      set(val) {
        this.$store.state.plugin.tab = val;
        return val;
      }
    }
  },
  watch: {
    tabActiveName: function() {
      // console.warn(this.$store.state.plugin.tab);
    }
  },
  // computed: {
  //   tabActiveName: {
  //     get() {
  //       let tabName = "local";
  //       return tabName;
  //     },
  //     // set(value) {
  //     //   this.$store.commit("updateMessage", value);
  //     // }
  //   }
  // },
  mounted() {},
  methods: {}
};
</script>

<style lang="scss" scoped>
</style>


