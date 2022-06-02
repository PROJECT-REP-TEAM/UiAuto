<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item prop="phone" style="margin: 18px 40px">
        <i class="el-icon-phone-outline" style="margin-left: 15px" />
        <el-input
          v-model="form.phone"
          placeholder="手机号"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item prop="smscode" style="margin: 18px 40px">
        <svg-icon icon-class="code" style="margin-left: 15px" />
        <el-input
          v-model="form.smscode"
          maxlength="6"
          placeholder="验证码"
          autocomplete="off"
        />
        <el-button
          size="max"
          type="primary"
          style="position: absolute; right: 5px; top: 5px"
          :disabled="isSendCode"
          @click="sendMsg"
          >{{ statusMsg }}</el-button
        >
      </el-form-item>
      <div style="margin: 18px 40px">
        <el-link
          href="#"
          style="margin-top: 10px"
          type="primary"
          :underline="false"
          @click.native.prevent="reset()"
          >使用已有账户登录</el-link
        >
        <el-button
          :loading="loading"
          style="float: right"
          type="primary"
          @click="nextStep()"
          >下一步</el-button
        >
      </div>
    </el-form>
  </div>
</template>

<script>
import { phoneVerification } from "@/api/user";

export default {
  name: "Step1",
  components: {},
  data() {
    const checkMobile = (rule, value, callback) => {
      if (!/^1[34578]\d{9}$/.test(value)) {
        callback(new Error("请输入正确的手机号码"));
      } else {
        callback();
      }
    };
    const validateCerificationCode = (rule, value, callback) => {
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
      isSendCode: false,
      statusMsg: "发送验证码",
      timer: null,
      form: {
        phone: "",
        smscode: "",
      },
      rules: {
        phone: [{ required: true, trigger: "blur", validator: checkMobile }],
        smscode: [
          {
            required: true,
            trigger: "blur",
            validator: validateCerificationCode,
          },
        ],
      },
    };
  },
  methods: {
    reset() {
      this.form = {
        phone: "",
        smscode: "",
      };
      this.loading = false;
      this.isSendCode = false;
      this.statusMsg = "发送验证码";
      clearInterval(this.timer);
      this.timer = null;
      this.$refs.form.resetFields();
      this.$parent.$parent.close();
    },
    sendMsg() {
      if (this.form.phone) {
        let mobilePass;
        this.$refs.form.validateField("phone", (valid) => {
          mobilePass = valid;
        });
        if (!mobilePass) {
          this.$store
            .dispatch("user/sendMsg", {
              smsmode: "2",
              mobile: this.form.phone,
            })
            .then((res) => {
              const self = this;
              this.statusMsg = "验证码已发送";
              this.isSendCode = true;
              let count = 60;
              this.statusMsg = `${count--}s后重新获取`;
              this.timer = setInterval(function () {
                self.statusMsg = `${count--}s后重新获取`;
                if (count === 0) {
                  self.isSendCode = false;
                  self.statusMsg = `重新发送`;
                  clearInterval(self.timer);
                }
              }, 1000);
              if (res.code == 500) {
                this.$message.warning(res.message);
              } else {
                this.$message.success(
                  res.message == "操作成功！"
                    ? "验证码发送成功，请前往手机查看"
                    : res.message
                );
              }
            })
            .catch((err) => {
              if (!err.isSuccess) {
                this.$message({
                  message: err.error,
                  type: "error",
                });
              }
            });
        } else {
          this.$message({
            message: "请输入正确的手机号",
            type: "error",
          });
        }
      } else {
        this.$message({
          message: "手机号不能为空",
          type: "error",
        });
      }
    },
    nextStep() {
      let that = this;
      that.loading = true;
      let smscodePass;
      this.$refs.form.validateField("smscode", (valid) => {
        smscodePass = valid;
      });
      if (!smscodePass) {
        let params = {
          phone: this.form.phone,
          smscode: this.form.smscode,
        };
        phoneVerification(params)
          .then((res) => {
            if (res.success) {
              let userList = {
                username: res.result.username,
                phone: params.phone,
                smscode: res.result.smscode,
              };
              that.loading = false;
              setTimeout(function () {
                that.$emit("nextStep", userList);
              }, 0);
            } else {
              that.loading = false;
              this.$message.error(res.message);
            }
          })
          .catch((err) => {
            that.loading = false;
            this.$message.error(err.error);
          });
      } else {
        that.loading = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-form-item__content {
  border: 1px solid #eee;
}
::v-deep .el-input__inner {
  color: #000 !important;
  caret-color: #000 !important;
  &:-webkit-autofill {
    box-shadow: 0 0 0px 1000px #283443 inset !important;
    -webkit-text-fill-color: #000 !important;
  }
}
</style>
