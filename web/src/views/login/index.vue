<template>
  <div class="login-container">
    <div
      style="
        position: absolute;
        width: 100%;
        -webkit-app-region: drag;
        height: 30px;
      "
    >
      <div style="width: 100%; height: 30px">
        <div
          style="-webkit-app-region: no-drag; float: right; line-height: 30px"
        >
          <el-button
            size="mini"
            icon="el-icon-minus"
            style="border: 0; background-color: transparent; color: #fff"
            @click="handleMinimize"
          />
          <el-button
            size="mini"
            :icon="icon"
            style="border: 0; background-color: transparent; color: #fff"
            @click="handleMaximize"
          />
          <el-button
            size="mini"
            icon="el-icon-close"
            style="border: 0; background-color: transparent; color: #fff"
            @click="handleClose"
          />
        </div>
      </div>
    </div>
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">UIAUTO</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          class="login_input"
          v-model.trim="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          autocomplete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          class="login_input"
          v-model.trim="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          autocomplete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon
            :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
          />
        </span>
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click.native.prevent="handleLogin"
        >登录</el-button
      >

      <el-link
        href="#"
        type="info"
        size="mini"
        :underline="false"
        style="color: #eee; float: right; margin-left: 10px;"
        @click.native.prevent="handleAlteration()"
        >忘记密码</el-link
      >

      <el-link
        href="#"
        type="info"
        size="mini"
        :underline="false"
        style="color: #eee; float: right"
        @click.native.prevent="handleRegister()"
        >快速注册</el-link
      >

      <el-link
        href="#"
        type="info"
        size="mini"
        :underline="false"
        style="color: #eee"
        @click.native.prevent="setting()"
        >服务器设置</el-link
      >
    </el-form>
    <registerForm ref="registerForm" />
    <settingForm ref="settingForm" />
    <alteration ref="alteration" />
  </div>
</template>

<script>
import { globalBus } from "@/store/globalBus";
import registerForm from "./components/register-form";
const electron = require("../../utils/electron");
const { comfirmExitApp } = require("../../client/index");
import settingForm from "./components/setting-form";
import * as schedule from "../../schedule";
import { aesEncrypt } from "../../utils/encryptOrdecrypt";
import alteration from "./components/alteration/Alteration.vue";
const { BrowserWindow } = window.nodeRequire("@electron/remote");

export default {
  name: "Login",
  components: { registerForm, settingForm, alteration },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入用户名"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("密码不能少于6位"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },
      passwordType: "password",
      loading: false,
      redirect: undefined,
      otherQuery: {},
      icon: "el-icon-full-screen",
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        const query = route.query;
        if (query) {
          this.redirect = query.redirect;
          this.otherQuery = this.getOtherQuery(query);
        }
      },
      immediate: true,
    },
  },
  created() {},
  mounted() {
    if (this.loginForm.username === "") {
      this.$refs.username.focus();
    } else if (this.loginForm.password === "") {
      this.$refs.password.focus();
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", {
              username: this.loginForm.username,
              password: aesEncrypt(this.loginForm.password, "LEGION"),
            })
            .then(() => {
              globalBus.$emit("is_first_run");
              const is_first_run = localStorage.getItem("is_first_run");
              if (is_first_run === null || is_first_run === true) {
                this.redirect = "/workspace/index";
              }
              this.$router.push({ path: this.redirect || "/" });
              this.$store.state.user.name = this.loginForm.username;
              this.loading = false;
              // 重新初始化定时任务
              schedule.stopAllJob();
              schedule.init();
            })
            .catch((err) => {
              console.log("errerr", err);
              this.loading = false;
              if (err && err.error) {
                this.$message({
                  message: err.error,
                  type: "error",
                });
              } else {
                this.$message.error("请求的资源不存在");
              }
            });
        } else {
          return false;
        }
      });
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      }, {});
    },
        // 忘记密码
    handleAlteration() {
      this.$refs["alteration"] && this.$refs["alteration"].show();
    },
    // 快速注册
    handleRegister() {
      this.$refs["registerForm"] && this.$refs["registerForm"].show();
    },
    handleMinimize() {
      electron.window_minimize();
    },
    handleMaximize() {
      let mainWindow = BrowserWindow.getAllWindows()[0];
      if (!mainWindow.isMaximized()) {
        this.icon = "el-icon-copy-document";
      } else {
        this.icon = "el-icon-full-screen";
      }
      electron.window_setContentSize();
    },
    handleClose() {
      comfirmExitApp();
    },
    // 设置连接服务器信息
    setting() {
      this.$refs["settingForm"] && this.$refs["settingForm"].show();
    },
  },
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

// @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
//   .login-container .el-input input {
//     color: $cursor;
//   }
// }

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
      height: 47px;
    }
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

::v-deep .el-input__inner {
  color: #fff;
  caret-color: #fff;
  &:-webkit-autofill {
    box-shadow: 0 0 0px 1000px #283443 inset !important;
    -webkit-text-fill-color: #fff !important;
  }
}

.el-button + .el-button {
  margin: 0;
}

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 66px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>
