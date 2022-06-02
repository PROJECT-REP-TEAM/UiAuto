<template>
  <div class="register-form">
    <el-dialog
      title="快速注册"
      :visible.sync="showRegisterDialog"
      width="500px"
      @closed="reset"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
    >
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item style="margin: 0 40px" prop="username">
          <i class="el-icon-user" style="margin-left: 15px" />
          <el-input
            v-model="form.username"
            autocomplete="off"
            type="text"
            placeholder="用户名"
          />
        </el-form-item>
        <el-form-item prop="password" style="margin: 18px 40px">
          <i class="el-icon-lock" style="margin-left: 15px" />
          <el-input
            ref="password1"
            v-model="form.password"
            :type="passwordType1"
            placeholder="密码不少于6位"
            auto-complete="off"
            style="color: #333333; width: 80%"
          />
          <span class="show-pwd" @click="showRegistrationPwd(1)">
            <svg-icon
              :icon-class="passwordType1 === 'password' ? 'eye' : 'eye-open'"
              style="color: #333"
            />
          </span>
        </el-form-item>
        <el-form-item prop="checkPassword" style="margin: 18px 40px">
          <i class="el-icon-lock" style="margin-left: 15px" />
          <el-input
            ref="password2"
            v-model="form.checkPassword"
            :type="passwordType2"
            placeholder="请重新输入密码"
            auto-complete="off"
            style="color: #333333; width: 80%"
          />
          <span class="show-pwd" @click="showRegistrationPwd(2)">
            <svg-icon
              :icon-class="passwordType2 === 'password' ? 'eye' : 'eye-open'"
              style="color: #333"
            />
          </span>
        </el-form-item>
        <!-- <el-form-item style="margin: 30px 40px;" prop="email">
          <span class="svg-container">
            <svg-icon icon-class="email" style="color: #333;" />
          </span>
          <el-input v-model="form.email" autocomplete="off" type="email" placeholder="邮箱" />
        </el-form-item> -->
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
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button size="max" @click="reset">取 消</el-button>
        <el-button type="primary" size="max" @click="handleRegister"
          >注 册</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { register } from "@/api/user";

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
          const reg =
            /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9](\w|\-)+\.([a-zA-Z]{2,4})$/;
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
        // email: '',
        phone: "",
        smscode: "",
      },
      rules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
        checkPassword: [{ trigger: "blur", validator: validateCheckPassword }],
        phone: [{ required: true, trigger: "blur", validator: checkMobile }],
        // email: [{ required: true, trigger: 'blur', validator: checkEmail }],
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
    show() {
      this.showRegisterDialog = true;
    },
    reset() {
      this.form = {
        username: "",
        password: "",
        checkPassword: "",
        // email: '',
        phone: "",
        smscode: "",
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
      if (this.form.phone) {
        let mobilePass;
        this.$refs.form.validateField("phone", (valid) => {
          mobilePass = valid;
        });
        if (!mobilePass) {
          this.$store
            .dispatch("user/sendMsg", {
              smsmode: "1",
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
                this.$message.success(res.message == '操作成功！' ? "验证码发送成功，请前往手机查看" : res.message);
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
    handleRegister() {
      let usernamePass;
      this.$refs.form.validateField("username", (valid) => {
        usernamePass = valid;
      });
      let pwdPass;
      this.$refs.form.validateField("password", (valid) => {
        pwdPass = valid;
      });
      let checkPasswordPass;
      this.$refs.form.validateField("checkPassword", (valid) => {
        checkPasswordPass = valid;
      });
      // let emailPass
      // this.$refs.form.validateField('email', valid => {
      //   emailPass = valid
      // })
      let mobilePass;
      this.$refs.form.validateField("phone", (valid) => {
        mobilePass = valid;
      });
      let cerificationCodePass;
      this.$refs.form.validateField("smscode", (valid) => {
        cerificationCodePass = valid;
      });
      if (
        !usernamePass &&
        !pwdPass &&
        !checkPasswordPass &&
        // !emailPass &&
        !mobilePass &&
        !cerificationCodePass
      ) {
        register(_.extend(this.form, { platform: "uiauto" }))
          .then((res) => {
            if (res.success) {
              this.$message.success("注册成功");
              this.reset();
            } else {
              this.$message.error(res.message);
            }
          })
          .catch((err) => {
            this.$message.error(err.error);
          });
      } else {
        this.$message({
          message:
            usernamePass ||
            pwdPass ||
            checkPasswordPass ||
            // emailPass ||
            mobilePass ||
            cerificationCodePass,
          type: "error",
        });
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
