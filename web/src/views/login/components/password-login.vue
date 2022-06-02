<template>
  <div class="password-login" style="margin: 0 40px">
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item prop="username" style="margin-top: 30px">
        <i class="el-icon-user" style="margin-left: 15px" />
        <el-input
          ref="username"
          v-model="form.username"
          placeholder="用户名"
          name="username"
          type="text"
          auto-complete="on"
          style="color: #333333"
        />
      </el-form-item>
      <el-form-item prop="password">
        <i class="el-icon-lock" style="margin-left: 15px" />
        <el-input
          ref="password"
          v-model="form.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          auto-complete="on"
          style="color: #333333; width: 83%"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon
            :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
            style="color: #333"
          />
        </span>
      </el-form-item>
      <el-button
        :loading="loading"
        size="max"
        type="primary"
        style="width: 100%; background: #2249a8; margin-bottom: 20px"
        @click.native.prevent="handleLogin"
        >登录</el-button
      >
      <div style="text-align: end">
        <div style="text-align: end">
          <!-- <el-link
            href="#"
            type="info"
            size="mini"
            :underline="false"
            style="margin-right: 10px"
            @click.native.prevent="handleResetPassword()"
            >忘记密码</el-link
          >
          <el-link
            href="#"
            type="info"
            size="mini"
            :underline="false"
            style="margin-right: 10px"
            @click.native.prevent="handleResetUsername()"
            >忘记用户名</el-link
          > -->
          <el-link
            href="#"
            type="info"
            size="mini"
            :underline="false"
            @click.native.prevent="handleRegister()"
            >快速注册</el-link
          >
        </div>
      </div>
    </el-form>
    <resetPassword ref="resetPassword" />
    <resetUsername ref="resetUsername" />
    <registerForm ref="registerForm" />
  </div>
</template>

<script>
import resetPassword from "./reset-password";
import resetUsername from "./reset-username";
import registerForm from "./register-form";
import { globalBus } from "@/store/globalBus";

export default {
  name: "PasswordLogin",
  components: { resetPassword, resetUsername, registerForm },
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
      loading: false,
      redirect: null,
      passwordType: "password",
      form: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },
    };
  },
  methods: {
    // 显示/隐藏密码
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
    // 登录
    handleLogin() {
      let usernamePass;
      this.$refs.form.validateField("username", (valid) => {
        usernamePass = valid;
      });
      let passwordPass;
      this.$refs.form.validateField("password", (valid) => {
        passwordPass = valid;
      });
      if (!usernamePass && !passwordPass) {
        this.loading = true;
        this.$store
          .dispatch("user/login", this.form)
          .then(() => {
            globalBus.$emit("is_first_run");
            const is_first_run = localStorage.getItem("is_first_run");
            if (is_first_run === null || is_first_run === true) {
              this.redirect = "/workspace/index";
            }
            this.$router.push({ path: this.redirect || "/" });
            this.$store.state.user.name = this.form.username;
            this.loading = false;
          })
          .catch((err) => {
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
        this.$message({
          message: usernamePass || passwordPass,
          type: "error",
        });
      }
    },
    // 忘记密码
    handleResetPassword() {
      this.$refs["resetPassword"] && this.$refs["resetPassword"].show();
    },
    // 忘记用户名
    handleResetUsername() {
      this.$refs["resetUsername"] && this.$refs["resetUsername"].show();
    },
    // 快速注册
    handleRegister() {
      this.$refs["registerForm"] && this.$refs["registerForm"].show();
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
