<template>
  <div class="sidebar-setting-container" :class="{'collapse':collapse}">
    <router-link key="expand" class="sidebar-setting-link" to="/home/index">
      <img v-if="set" :src="set" class="sidebar-setting">
      <h1 class="sidebar-title">{{ title }}</h1>
    </router-link>
  </div>
</template>

<script>
import set from '@/assets/images/set.png'
export default {
  name: 'Setting',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: 'setting',
      set: set
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-setting-container {
  position: relative;
  width: 100%;
  height: 60px;
  line-height: 60px;
  // background: #2b2f3a;
  background: #314156;
  text-align: center;
  overflow: hidden;

  & .sidebar-setting-link {
    height: 100%;
    width: 100%;

    & .sidebar-setting {
      vertical-align: middle;
      margin-right: 12px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 60px;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-setting {
      margin-right: 0px;
    }
  }
}
</style>
