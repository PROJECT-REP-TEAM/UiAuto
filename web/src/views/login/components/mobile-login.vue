<template>
  <div class="mobile-login" style="margin: 0 40px;">
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item prop="mobile" style="margin-top: 30px;">
        <span class="svg-container">
          <svg-icon icon-class="mobile" style="color: #333;" />
        </span>
        <el-input v-model="form.mobile" placeholder="手机号" autocomplete="off" />
      </el-form-item>
      <el-form-item prop="cerification_code" style="margin-top: 20px;">
        <span class="svg-container">
          <svg-icon icon-class="code" style="color: #333;" />
        </span>
        <el-input
          v-model="form.cerification_code"
          maxlength="6"
          placeholder="验证码"
          autocomplete="off"
        />
        <el-button
          size="max"
          type="primary"
          style="position: absolute;right: 5px;top: 5px;background: #2249a8;"
          :disabled="isSendCode"
          @click="sendMsg"
        >{{ statusMsg }}</el-button>
      </el-form-item>
      <el-button
        :loading="loading"
        size="max"
        type="primary"
        style="width: 100%;background: #2249a8;margin-bottom: 20px;"
        @click.native.prevent="handleLogin"
      >登录</el-button>
      <div style="text-align: end;">
        <el-link
          href="#"
          type="info"
          size="mini"
          :underline="false"
          @click.native.prevent="handleRegister()"
        >快速注册</el-link>
      </div>
    </el-form>
    <registerForm ref="registerForm" />
  </div>
</template>

<script>
import registerForm from "./register-form";
import { globalBus } from "@/store/globalBus";

export default {
  name: "MobileLogin",
  components: { registerForm },
  data() {
    const checkMobile = (rule, value, callback) => {
      if (!/^1[34578]\d{9}$/.test(value)) {
        callback(new Error("请输入正确的手机号码"));
      } else {
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
      loading: false,
      redirect: null,
      isSendCode: false,
      statusMsg: "发送验证码",
      form: {
        mobile: "",
        cerification_code: ""
      },
      rules: {
        mobile: [{ required: true, trigger: "blur", validator: checkMobile }],
        cerification_code: [
          { required: true, trigger: "blur", validator: validateCode }
        ]
      }
    };
  },
  methods: {
    // 登录
    handleLogin() {
      let mobilePass;
      this.$refs.form.validateField("mobile", valid => {
        mobilePass = valid;
      });
      let cerificationCodePass;
      this.$refs.form.validateField("cerification_code", valid => {
        cerificationCodePass = valid;
      });
      if (!mobilePass && !cerificationCodePass) {
        this.loading = true;
        this.$store
          .dispatch("user/smsLogin", this.form)
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
          message: mobilePass || cerificationCodePass,
          type: "error"
        });
      }
    },
    // 获取验证码
    sendMsg() {
      this.$refs.form.validateField("mobile", valid => {
        if (!valid) {
          this.$store
            .dispatch("user/sendMsg", {
              type: "recover",
              mobile: this.form.mobile
            })
            .then(() => {
              const self = this;
              this.statusMsg = "验证码已发送";
              this.isSendCode = true;
              let count = 60;
              this.statusMsg = `${count--}s后重新获取`;
              this.timer = setInterval(function() {
                self.statusMsg = `${count--}s后重新获取`;
                if (count === 0) {
                  self.isSendCode = false;
                  self.statusMsg = `重新发送`;
                  clearInterval(self.timer);
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
            message: valid,
            type: "error"
          });
        }
      });
    },
    // 快速注册
    handleRegister() {
      this.$refs["registerForm"] && this.$refs["registerForm"].show();
    }
  }
};
</script>
<style lang="scss" scoped>
.svg-container {
  margin-left: 15px;
}
</style>
