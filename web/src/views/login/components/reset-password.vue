<template>
  <div class="reset-password">
    <el-dialog title="忘记密码" :visible.sync="dialogFormVisible" width="500px" @closed="reset">
      <el-form ref="resetForm" :model="resetForm" :rules="resetRules" style="margin: 0 40px;">
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" style="color: #333;margin-left: 15px;" />
          </span>
          <el-input
            ref="resetPassword"
            v-model="resetForm.password"
            :type="passwordType"
            placeholder="密码不少于6位"
            auto-complete="off"
            style="color: #333333;"
          />
          <span class="show-pwd" @click="showPwd()">
            <svg-icon
              :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
              style="color: #333;"
            />
          </span>
        </el-form-item>
        <el-form-item prop="mobile" style="margin-top: 20px;">
          <span class="svg-container">
            <svg-icon icon-class="mobile" style="color: #333;" />
          </span>
          <el-input v-model="resetForm.mobile" placeholder="手机号" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="cerification_code" style="margin-top: 20px;">
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
      </el-form>
      <el-button type="primary" size="max" style="background: #2249a8;" @click="handleReset">确 定</el-button>
      <el-button size="max" @click="dialogFormVisible = false">取 消</el-button>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    const checkMobile = (rule, value, callback) => {
      if (!/^1[34578]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入验证码'))
      } else if (value !== '') {
        var reg = /^\d{6}$/
        if (!reg.test(value)) {
          callback(new Error('验证码不能少于6位纯数字'))
        }
      } else {
        callback()
      }
    }
    return {
      dialogFormVisible: false,
      passwordType: 'password',
      statusMsg: '发送验证码',
      isSendCode: false,
      timer: null,
      resetForm: {
        password: '',
        mobile: '',
        cerification_code: ''
      },
      resetRules: {
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ],
        mobile: [{ required: true, trigger: 'blur', validator: checkMobile }],
        cerification_code: [
          { required: true, trigger: 'blur', validator: validateCode }
        ]
      }
    }
  },
  methods: {
    show() {
      this.dialogFormVisible = true
    },
    reset() {
      this.dialogFormVisible = false
      this.statusMsg = '发送验证码'
      this.isSendCode = false
      this.passwordType = 'password'
      clearInterval(this.timer)
      this.timer = null
      this.resetForm = {
        password: '',
        mobile: '',
        cerification_code: ''
      }
      this.$refs.resetForm.resetFields()
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs[`resetPassword`].focus()
      })
    },
    sendMsg() {
      this.$refs.resetForm.validateField('mobile', valid => {
        if (!valid) {
          this.$store
            .dispatch('user/sendMsg', {
              type: 'recover',
              mobile: this.resetForm.mobile
            })
            .then(() => {
              const self = this
              this.statusMsg = '验证码已发送'
              this.isSendCode = true
              let count = 60
              this.statusMsg = `${count--}s后重新获取`
              this.timer = setInterval(function() {
                self.statusMsg = `${count--}s后重新获取`
                if (count === 0) {
                  self.isSendCode = false
                  self.statusMsg = `重新发送`
                  clearInterval(self.timer)
                }
              }, 1000)
              this.$message({
                message: '验证码发送成功，请前往手机查看',
                type: 'success'
              })
            })
            .catch(err => {
              if (!err.isSuccess) {
                this.$message({
                  message: err.error,
                  type: 'error'
                })
              }
            })
        } else {
          this.$message({
            message: valid,
            type: 'error'
          })
        }
      })
    },
    handleReset() {
      let pwdPass
      this.$refs.resetForm.validateField('password', valid => {
        pwdPass = valid
      })
      let mobilePass
      this.$refs.resetForm.validateField('mobile', valid => {
        mobilePass = valid
      })
      let cerificationCodePass
      this.$refs.resetForm.validateField('cerification_code', valid => {
        cerificationCodePass = valid
      })
      if (!pwdPass && !mobilePass && !cerificationCodePass) {
        this.$store
          .dispatch('user/smsRecoverPassword', this.resetForm)
          .then(() => {
            this.$message({
              message: '密码重置成功',
              type: 'success'
            })
            this.reset()
          })
          .catch(err => {
            if (!err.isSuccess) {
              this.$message({
                message: err.error,
                type: 'error'
              })
            }
          })
      } else {
        this.$message({
          message: pwdPass || mobilePass || cerificationCodePass,
          type: 'error'
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
