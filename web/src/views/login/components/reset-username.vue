<template>
  <div class="reset-username">
    <el-dialog title="忘记用户名" :visible.sync="dialogFormVisible" width="500px" @closed="reset">
      <el-form ref="resetForm" :model="resetForm" :rules="resetRules">
        <el-form-item prop="mobile" style="margin: 30px 40px;">
          <span class="svg-container">
            <svg-icon icon-class="mobile" style="color: #333;" />
          </span>
          <el-input v-model="resetForm.mobile" placeholder="手机号" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="cerification_code" style="margin: 30px 40px;">
          <span class="svg-container">
            <svg-icon icon-class="code" style="color: #333;" />
          </span>
          <el-input
            v-model="resetForm.cerification_code"
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
        <el-form-item style="margin: 30px 40px;" v-if="showUsername">
          <span>您的用户名为：{{this.showUsername}}</span>
        </el-form-item>
        <el-form-item style="border: 0;color: white;background: white;margin-right: 20px;">
          <el-button
            type="primary"
            size="max"
            @click="handleConfirm"
            style="background: #2249a8;"
          >确 定</el-button>
          <el-button size="max" @click="dialogFormVisible = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    const validateUsername = (rule, value, callback) => {
      callback();
    };
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
      dialogFormVisible: false,
      statusMsg: "发送验证码",
      showUsername: "",
      isSendCode: false,
      timer: "",
      resetForm: {
        mobile: "",
        cerification_code: ""
      },
      resetRules: {
        mobile: [{ required: true, trigger: "blur", validator: checkMobile }],
        cerification_code: [
          { required: true, trigger: "blur", validator: validateCode }
        ]
      }
    };
  },
  methods: {
    show() {
      this.dialogFormVisible = true;
    },
    reset() {
      this.statusMsg = "发送验证码";
      this.showUsername = "";
      this.isSendCode = false;
      this.dialogFormVisible = false;
      this.resetForm = {
        mobile: "",
        cerification_code: ""
      };
      this.$refs.resetForm.resetFields();
    },
    sendMsg() {
      this.$refs.resetForm.validateField("mobile", valid => {
        if (!valid) {
          this.$store
            .dispatch("user/sendMsg", {
              type: "recover",
              mobile: this.resetForm.mobile
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
    handleConfirm() {
      let mobilePass;
      this.$refs.resetForm.validateField("mobile", valid => {
        mobilePass = valid;
      });
      let cerificationCodePass;
      this.$refs.resetForm.validateField("cerification_code", valid => {
        cerificationCodePass = valid;
      });
      if (!mobilePass && !cerificationCodePass) {
        this.$store
          .dispatch("user/smsGetUsername", this.resetForm)
          .then(res => {
            this.showUsername = res.data.username;
            this.$message({
              message: res.data.message,
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
          message: mobilePass || cerificationCodePass,
          type: "error"
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
