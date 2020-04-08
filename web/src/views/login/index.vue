<template>
  <div class="login-container">
    <div style="width: 850px;margin: 6% auto 20px;">
      <img src="../../assets/images/symbol.png" style="vertical-align: sub;" />
      <span style="color: #ffffff;font-size: 40px;font-weight: 400;margin-left: 15px;">让您的工作，更加高效！</span>
    </div>
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="left-body" />

      <div class="right-body">
        <svg-icon
          icon-class="setting"
          @click="setting"
          style="width: 18px;height: 18px;color: #333;position: absolute;right: 10px;top: 10px;cursor: pointer;"
        />
        <div class="title-container">
          <h3 class="title">系统登录</h3>
        </div>

        <el-form-item prop="username" style="margin: 60px 40px 20px 40px">
          <span class="svg-container">
            <svg-icon icon-class="user" style="color: #333;" />
          </span>
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="用户名"
            name="username"
            type="text"
            auto-complete="on"
            style="color: #333333;"
          />
        </el-form-item>

        <el-form-item prop="password" style="margin: 30px 40px;">
          <span class="svg-container">
            <svg-icon icon-class="password" style="color: #333;" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            auto-complete="on"
            style="color: #333333;"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon
              :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
              style="color: #333;"
            />
          </span>
        </el-form-item>

        <div
          style="margin: 30px 40px;height: 36px;line-height: 36px;margin-bottom: 0;padding-bottom: 0"
        >
          <el-checkbox v-model="checked">7天内记住我</el-checkbox>
          <el-button
            :loading="loading"
            type="primary"
            style="float: right;width: 40%;background: #2249a8;"
            @click.native.prevent="handleLogin"
          >登录</el-button>
        </div>
        <div style="margin:10px 40px;text-align: end;">
          <el-link
            href="#"
            type="info"
            size="mini"
            :underline="false"
            style="margin-right: 10px;"
            @click.native.prevent="handleResetPassword()"
          >忘记密码</el-link>
          <el-link
            href="#"
            type="info"
            size="mini"
            :underline="false"
            style="margin-right: 10px;"
            @click.native.prevent="handleResetUsername()"
          >忘记用户名</el-link>
          <el-link
            href="#"
            type="info"
            size="mini"
            :underline="false"
            @click.native.prevent="showRegisterDialog = true"
          >快速注册</el-link>
        </div>
      </div>
    </el-form>

    <el-dialog
      title="快速注册"
      :visible.sync="showRegisterDialog"
      width="500px"
      :before-close="cancelRegister"
    >
      <el-form ref="regisForm" :model="regisForm" :rules="registerRules">
        <el-form-item style="margin: 0 40px;" prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user" style="color: #333;" />
          </span>
          <el-input v-model="regisForm.username" autocomplete="off" type="text" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password" style="margin: 30px 40px;">
          <span class="svg-container">
            <svg-icon icon-class="password" style="color: #333;" />
          </span>
          <el-input
            ref="regisPassword1"
            v-model="regisForm.password"
            :type="regisPasswordType1"
            placeholder="密码不少于6位"
            auto-complete="off"
            style="color: #333333;"
          />
          <span class="show-pwd" @click="showRegistrationPwd(1)">
            <svg-icon
              :icon-class="regisPasswordType1 === 'password' ? 'eye' : 'eye-open'"
              style="color: #333;"
            />
          </span>
        </el-form-item>
        <el-form-item prop="checkPassword" style="margin: 30px 40px;">
          <span class="svg-container">
            <svg-icon icon-class="password" style="color: #333;" />
          </span>
          <el-input
            ref="regisPassword2"
            v-model="regisForm.checkPassword"
            :type="regisPasswordType2"
            placeholder="请重新输入密码"
            auto-complete="off"
            style="color: #333333;"
          />
          <span class="show-pwd" @click="showRegistrationPwd(2)">
            <svg-icon
              :icon-class="regisPasswordType2 === 'password' ? 'eye' : 'eye-open'"
              style="color: #333;"
            />
          </span>
        </el-form-item>
        <el-form-item style="margin: 30px 40px;" prop="email">
          <span class="svg-container">
            <svg-icon icon-class="email" style="color: #333;" />
          </span>
          <el-input v-model="regisForm.email" autocomplete="off" type="email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item prop="phone" style="margin: 30px 40px;">
          <span class="svg-container">
            <svg-icon icon-class="phone" style="color: #333;" />
          </span>
          <el-input v-model="regisForm.phone" placeholder="手机号" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="code" style="margin: 30px 40px;">
          <span class="svg-container">
            <svg-icon icon-class="code" style="color: #333;" />
          </span>
          <el-input v-model="regisForm.code" maxlength="6" placeholder="验证码" autocomplete="off" />
          <el-button
            size="max"
            type="primary"
            style="position: absolute;right: 5px;top: 5px;background: #2249a8;"
            :disabled="isSendCode"
            @click="sendMsg"
          >{{ statusMsg }}</el-button>
        </el-form-item>
        <el-form-item style="border: 0;color: white;background: white;margin-right: 20px;">
          <el-button
            type="primary"
            size="max"
            @click="handleRegister"
            style="background: #2249a8;"
          >注 册</el-button>
          <el-button size="max" @click="cancelRegister">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <settingForm ref="settingForm" />
    <resetPassword ref="resetPassword" />
    <resetUsername ref="resetUsername" />
  </div>
</template>

<script>
import settingForm from "./components/setting-form";
import resetPassword from "./components/reset-password";
import resetUsername from "./components/reset-username";
import { validUsername } from "@/utils/validate";
import SocialSign from "./socialsignin";
import { globalBus } from "@/store/globalBus";
// import WelcomeAlert from './welcomeAlert'
import Cookies from "js-cookie";
const Base64 = require("js-base64").Base64;

export default {
  name: "Login",
  components: { SocialSign, settingForm, resetPassword, resetUsername },
  data() {
    const remember = Cookies.get("remember")
      ? JSON.parse(Base64.decode(Cookies.get("remember")))
      : {};
    const validateUsername = (rule, value, callback) => {
      // if (!validUsername(value)) {
      //   callback(new Error("Please enter the correct user name"));
      // } else {
      //   callback();
      // }
      callback();
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("密码不能少于6位"));
      } else {
        if (this.regisForm.checkPassword !== "") {
          this.$refs.regisForm.validateField("checkPassword");
        }
        callback();
      }
    };
    var validateCheckPassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.regisForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    const checkPhone = (rule, value, callback) => {
      if (!/^1[34578]\d{9}$/.test(value)) {
        callback(new Error("请输入正确的手机号码"));
      } else {
        callback();
      }
    };
    const checkEmail = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请正确填写邮箱"));
      } else {
        if (value !== "") {
          var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
          if (!reg.test(value)) {
            callback(new Error("请输入有效的邮箱"));
          }
        }
        callback();
      }
    };
    const validateCode = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入验证码"));
      } else if (value !== "") {
        var reg = /^\d{6}$/;
        if (!reg.test(value)) {
          callback(new Error("验证码不能少于6位纯数字"));
        }
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: remember.username || "",
        password: remember.password || ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername }
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword }
        ]
      },
      passwordType: "password",
      regisPasswordType1: "password",
      regisPasswordType2: "password",
      loading: false,
      showDialog: false,
      redirect: undefined,
      checked: false,
      showRegisterDialog: false,
      regisForm: {
        username: "",
        password: "",
        checkPassword: "",
        phone: "",
        code: "",
        email: ""
      },
      statusMsg: "发送验证码",
      registerRules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername }
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword }
        ],
        checkPassword: [{ trigger: "blur", validator: validateCheckPassword }],
        phone: [{ required: true, trigger: "blur", validator: checkPhone }],
        email: [{ required: true, trigger: "blur", validator: checkEmail }],
        code: [{ required: true, trigger: "blur", validator: validateCode }]
      },
      isSendCode: false,
      timerid: ""
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
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
    showRegistrationPwd(count) {
      if (this[`regisPasswordType${count}`] === "password") {
        this[`regisPasswordType${count}`] = "";
      } else {
        this[`regisPasswordType${count}`] = "password";
      }
      this.$nextTick(() => {
        this.$refs[`regisPassword${count}`].focus();
      });
    },
    handleLogin() {
      if (this.loginForm.username && this.loginForm.password) {
        this.loading = true;
        this.$store
          .dispatch("user/login", this.loginForm)
          .then(() => {
            // this.showDialog = true
            if (this.checked) {
              Cookies.set(
                "remember",
                Base64.encode(JSON.stringify(this.loginForm)),
                { expires: 7 }
              );
            }
            globalBus.$emit("is_first_run");
            const is_first_run = localStorage.getItem("is_first_run");
            if (is_first_run === null || is_first_run === true) {
              this.redirect = "/workspace/index";
            }
            this.$router.push({ path: this.redirect || "/" });
            // console.log('loginForm:'+this.loginForm.username);
            this.$store.state.user.name = this.loginForm.username;
            // console.log(this.$store.state.user);
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
            if (!err.isSuccess) {
              this.$message({
                message: err.error,
                type: "error"
              });
            }
          });
      } else {
        this.$message({
          message: "用户名或密码不能为空",
          type: "error"
        });
      }
    },
    handleRegister() {
      if (
        this.regisForm.username &&
        this.regisForm.phone &&
        this.regisForm.code &&
        this.regisForm.password
      ) {
        let pwdPass;
        this.$refs.regisForm.validateField("password", valid => {
          pwdPass = valid;
        });
        let phonePass;
        this.$refs.regisForm.validateField("phone", valid => {
          phonePass = valid;
        });
        let emailPass;
        this.$refs.regisForm.validateField("email", valid => {
          emailPass = valid;
        });
        if (!pwdPass && !phonePass && !emailPass) {
          this.$store
            .dispatch("user/register", this.regisForm)
            .then(() => {
              this.$message({
                message: "注册成功",
                type: "success"
              });
              this.cancelRegister();
            })
            .catch(err => {
              if (!err.isSuccess) {
                this.$message({
                  message: err.error,
                  type: "error"
                });
              }
            });
        } else {
          this.$message({
            message: "密码或手机号或邮箱格式不正确",
            type: "error"
          });
        }
      } else {
        this.$message({
          message: "用户名或密码或手机号或验证码或邮箱不能为空",
          type: "error"
        });
      }
    },
    cancelRegister() {
      this.regisForm.password = "";
      this.regisForm.username = "";
      this.statusMsg = "发送验证码";
      this.regisForm.phone = "";
      this.regisForm.code = "";
      this.regisForm.email = "";
      this.showRegisterDialog = false;
      this.$refs.regisForm.resetFields();
    },
    sendMsg() {
      if (this.regisForm.phone) {
        let phonePass;
        this.$refs.regisForm.validateField("phone", valid => {
          phonePass = valid;
        });
        if (!phonePass) {
          this.$store
            .dispatch("user/sendMsg", {
              type: "registered",
              mobile: this.regisForm.phone
            })
            .then(() => {
              const self = this;
              this.statusMsg = "验证码已发送";
              this.isSendCode = true;
              let count = 60;
              this.statusMsg = `${count--}s后重新获取`;
              this.timerid = setInterval(function() {
                self.statusMsg = `${count--}s后重新获取`;
                if (count === 0) {
                  self.isSendCode = false;
                  self.statusMsg = `重新发送`;
                  clearInterval(self.timerid);
                }
              }, 1000);
              this.$message({
                message: "验证码发送成功，请前往手机查看",
                type: "success"
              });
            })
            .catch(err => {
              if (!err.isSuccess) {
                this.$message({
                  message: err.error,
                  type: "error"
                });
              }
            });
        } else {
          this.$message({
            message: "请输入正确的手机号",
            type: "error"
          });
        }
      } else {
        this.$message({
          message: "手机号不能为空",
          type: "error"
        });
      }
    },
    // 设置连接服务器信息
    setting() {
      this.$refs["settingForm"] && this.$refs["settingForm"].show();
    },
    // 忘记密码
    handleResetPassword() {
      this.$refs["resetPassword"] && this.$refs["resetPassword"].show();
    },
    // 忘记用户名
    handleResetUsername() {
      this.$refs["resetUsername"] && this.$refs["resetUsername"].show();
    }
  }
};
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
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
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

  .login-form {
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
          margin: 70px auto 40px auto;
          text-align: center;
          font-weight: bold;
        }

        .set-language {
          color: #333;
          position: absolute;
          top: 3px;
          font-size: 18px;
          right: 20px;
          cursor: pointer;
        }
      }
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
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

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
