<template>
  <div class="register-form">
    <el-dialog title="快速注册" :visible.sync="showRegisterDialog" width="500px" @closed="reset">
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item style="margin: 0 40px;" prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user" style="color: #333;" />
          </span>
          <el-input v-model="form.username" autocomplete="off" type="text" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password" style="margin: 30px 40px;">
          <span class="svg-container" style="margin-left: 15px;">
            <svg-icon icon-class="password" style="color: #333;" />
          </span>
          <el-input
            ref="password1"
            v-model="form.password"
            :type="passwordType1"
            placeholder="密码不少于6位"
            auto-complete="off"
            style="color: #333333;"
          />
          <span class="show-pwd" @click="showRegistrationPwd(1)">
            <svg-icon
              :icon-class="passwordType1 === 'password' ? 'eye' : 'eye-open'"
              style="color: #333;"
            />
          </span>
        </el-form-item>
        <el-form-item prop="checkPassword" style="margin: 30px 40px;">
          <span class="svg-container" style="margin-left: 15px;">
            <svg-icon icon-class="password" style="color: #333;" />
          </span>
          <el-input
            ref="password2"
            v-model="form.checkPassword"
            :type="passwordType2"
            placeholder="请重新输入密码"
            auto-complete="off"
            style="color: #333333;"
          />
          <span class="show-pwd" @click="showRegistrationPwd(2)">
            <svg-icon
              :icon-class="passwordType2 === 'password' ? 'eye' : 'eye-open'"
              style="color: #333;"
            />
          </span>
        </el-form-item>
        <el-form-item style="margin: 30px 40px;" prop="email">
          <span class="svg-container">
            <svg-icon icon-class="email" style="color: #333;" />
          </span>
          <el-input v-model="form.email" autocomplete="off" type="email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item prop="mobile" style="margin: 30px 40px;">
          <span class="svg-container">
            <svg-icon icon-class="phone" style="color: #333;" />
          </span>
          <el-input v-model="form.mobile" placeholder="手机号" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="cerification_code" style="margin: 30px 40px;">
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
      </el-form>
      <el-button type="primary" size="max" @click="handleRegister" style="background: #2249a8;">注 册</el-button>
      <el-button size="max" @click="reset">取 消</el-button>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "RegisterLogin",
  components: {},
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
        if (this.form.checkPassword !== "") {
          this.$refs.form.validateField("checkPassword");
        }
        callback();
      }
    };
    var validateCheckPassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.form.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    const checkMobile = (rule, value, callback) => {
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
          const reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
          if (!reg.test(value)) {
            callback(new Error("请输入有效的邮箱"));
          }
        }
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
      showRegisterDialog: false,
      isSendCode: false,
      statusMsg: "发送验证码",
      passwordType1: "password",
      passwordType2: "password",
      timer: null,
      form: {
        username: "",
        password: "",
        checkPassword: "",
        email: "",
        mobile: "",
        cerification_code: ""
      },
      rules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername }
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword }
        ],
        checkPassword: [{ trigger: "blur", validator: validateCheckPassword }],
        mobile: [{ required: true, trigger: "blur", validator: checkMobile }],
        email: [{ required: true, trigger: "blur", validator: checkEmail }],
        cerification_code: [
          {
            required: true,
            trigger: "blur",
            validator: validateCerificationCode
          }
        ]
      }
    };
  },
  methods: {
    show() {
      this.showRegisterDialog = true;
    },
    reset() {
      this.form = {
        username: "",
        password: "",
        checkPassword: "",
        email: "",
        mobile: "",
        cerification_code: ""
      };
      this.showRegisterDialog = false;
      this.isSendCode = false;
      this.statusMsg = "发送验证码";
      clearInterval(this.timer);
      this.timer = null;
      this.$refs.form.resetFields();
    },
    showRegistrationPwd(count) {
      if (this[`passwordType${count}`] === "password") {
        this[`passwordType${count}`] = "";
      } else {
        this[`passwordType${count}`] = "password";
      }
      this.$nextTick(() => {
        this.$refs[`password${count}`].focus();
      });
    },
    sendMsg() {
      if (this.form.mobile) {
        let mobilePass;
        this.$refs.form.validateField("mobile", valid => {
          mobilePass = valid;
        });
        if (!mobilePass) {
          this.$store
            .dispatch("user/sendMsg", {
              type: "registered",
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
    handleRegister() {
      let usernamePass;
      this.$refs.form.validateField("username", valid => {
        usernamePass = valid;
      });
      let pwdPass;
      this.$refs.form.validateField("password", valid => {
        pwdPass = valid;
      });
      let checkPasswordPass;
      this.$refs.form.validateField("checkPassword", valid => {
        checkPasswordPass = valid;
      });
      let emailPass;
      this.$refs.form.validateField("email", valid => {
        emailPass = valid;
      });
      let mobilePass;
      this.$refs.form.validateField("mobile", valid => {
        mobilePass = valid;
      });
      let cerificationCodePass;
      this.$refs.form.validateField("cerification_code", valid => {
        cerificationCodePass = valid;
      });
      if (
        !usernamePass &&
        !pwdPass &&
        !checkPasswordPass &&
        !emailPass &&
        !mobilePass &&
        !cerificationCodePass
      ) {
        this.$store
          .dispatch("user/register", this.form)
          .then(() => {
            this.$message({
              message: "注册成功",
              type: "success"
            });
            this.reset();
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
          message:
            usernamePass ||
            pwdPass ||
            checkPasswordPass ||
            emailPass ||
            mobilePass ||
            cerificationCodePass,
          type: "error"
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
