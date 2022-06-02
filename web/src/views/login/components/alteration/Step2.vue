<template>
  <div>
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
      <div style="margin: 18px 40px">
        <el-button type="primary" @click="prevStep()">上一步</el-button>
        <el-button
          :loading="loading"
          style="float: right"
          type="primary"
          @click="nextStep()"
          >提交</el-button
        >
      </div>
    </el-form>
  </div>
</template>

<script>
import { passwordChange } from "@/api/user";

export default {
  name: "Step2",
  components: {},
  props: ["userList"],
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
    return {
      loading: false,
      passwordType1: "password",
      passwordType2: "password",
      form: {
        username: "",
        password: "",
        checkPassword: "",
      },
      rules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
        checkPassword: [{ trigger: "blur", validator: validateCheckPassword }],
      },
    };
  },
  methods: {
    nextStep() {
      let that = this;
      that.loading = true;
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
      let usernameSamePass;
      if(that.form.username !== that.userList.username){
        usernameSamePass = "非该手机号注册用户！"
      }
      if (!usernamePass && !pwdPass && !checkPasswordPass && !usernameSamePass) {
        let params = {
          username: that.form.username,
          password: that.form.password,
          smscode: that.userList.smscode,
          phone: that.userList.phone,
        };
        passwordChange(params)
          .then((res) => {
            if (res.success) {
              let userList = {
                username: that.userList.username,
              };
              setTimeout(function () {
                that.loading = false;
                that.$emit("nextStep", userList);
              }, 1500);
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
        this.$message({
          message: usernamePass || pwdPass || checkPasswordPass || usernameSamePass,
          type: "error",
        });
      }
    },
    prevStep() {
      this.$emit("prevStep", this.userList);
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
