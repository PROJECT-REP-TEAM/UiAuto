<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/home/index">
        <img v-if="logoVuex" :src="logoOnline" class="sidebar-logo">
        <img v-else :src="logoOffline" class="sidebar-logo">
        <!-- <h1 v-else class="sidebar-title">{{ title }} </h1> -->
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/home/index">
        <img v-if="logoVuex" :src="logoOnline" class="sidebar-logo">
        <img v-else :src="logoOffline" class="sidebar-logo">
        <!-- <h1 class="sidebar-title">{{ title }} </h1> -->
      </router-link>
    </transition>
  </div>
</template>

<script>
import logoOffline from '@/assets/images/logoOffline.png'
import logoOnline from '@/assets/images/logoOnline.png'
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: 'UiAuto',
      logoOffline: logoOffline,
      logoOnline: logoOnline
    }
  },
  computed: {
    logoVuex() {
      return this.$store.state.socket.socketOnline
    }
  },
  methods: {
    logoFn() {
      if (logoVuex) {
        this.logo = logoOnline
      } else {
        this.logo = logoOffline
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 60px;
  line-height: 60px;
  // background: #2b2f3a;
  background: #314156;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      width: 31px;
      // height: 38px;
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
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
