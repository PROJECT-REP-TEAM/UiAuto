<template>
  <div class="login-container">
    <div style="width: 850px;margin: 6% auto 20px;">
      <img src="../../assets/images/symbol.png" style="vertical-align: sub;">
      <span style="color: #ffffff;font-size: 40px;font-weight: 400;margin-left: 15px;">让您的工作，更加高效！</span>
    </div>
    <div class="login-body">
      <div class="left-body" />

      <div class="right-body">
        <svg-icon
          icon-class="setting"
          style="width: 18px;height: 18px;color: #333;position: absolute;right: 10px;top: 10px;cursor: pointer;"
          @click="setting"
        />
        <div class="title-container">
          <h3 class="title">系统登录</h3>
        </div>

        <div class="login-switch-tab">
          <a
            href="javascript:void(0);"
            class="login-tab-item"
            :class="{'login-tab-highlight': loginType === 'passwordLogin'}"
            @click="handleLoginType('passwordLogin')"
          >密码登录</a>
          <!-- <a
            href="javascript:void(0);"
            class="login-tab-item"
            @click="handleLoginType('mobileLogin')"
            v-bind:class="{'login-tab-highlight': loginType === 'mobileLogin'}"
          >短信登录</a> -->
        </div>

        <passwordLogin v-if="loginType === 'passwordLogin'" />
        <mobileLogin v-if="loginType === 'mobileLogin'" />
      </div>
    </div>

    <settingForm ref="settingForm" />
  </div>
</template>

<script>
import settingForm from './components/setting-form'
import passwordLogin from './components/password-login'
import mobileLogin from './components/mobile-login'
import { validUsername } from '@/utils/validate'

export default {
  name: 'Login',
  components: {
    settingForm,
    passwordLogin,
    mobileLogin
  },
  data() {
    return {
      loginType: 'passwordLogin',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {},
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    // 登录方式
    handleLoginType(type) {
      this.loginType = type
    },
    // 设置连接服务器信息
    setting() {
      this.$refs['settingForm'] && this.$refs['settingForm'].show()
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #333333;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor !important;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    color: #454545;
  }

  .el-dialog {
    text-align: center;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #333333;

.login-container {
  min-height: 100%;
  width: 100%;
  height: 100%;
  background: url("../../assets/images/background.png");
  background-color: $bg;
  overflow: hidden;
  background-size: cover;

  .login-body {
    position: relative;
    width: 850px;
    max-width: 100%;
    height: 450px;
    // padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 10px;
    background: #ffffff;
    .left-body {
      float: left;
      width: 400px;
      height: 505px;
      background: url("../../assets/images/uiAuto.png") no-repeat 100% 100%;
    }
    .right-body {
      float: right;
      width: 450px;
      height: 100%;
      background: url("../../assets/images/login.png") no-repeat 50% 55px;
      .title-container {
        position: relative;

        .title {
          font-size: 26px;
          color: $light_gray;
          margin: 70px auto 20px auto;
          text-align: center;
          font-weight: bold;
        }
      }

      .login-switch-tab {
        padding: 0 40px;
        .login-tab-item {
          display: inline-block;
          height: 18px;
          line-height: 5px;
          font-size: 16px;
          color: #3c3c3c;
          margin: 9px 10px 0 0;
          font-weight: 700;
        }
        .login-tab-highlight {
          border-bottom: 2px solid #000;
        }
      }
    }
  }
}
</style>
