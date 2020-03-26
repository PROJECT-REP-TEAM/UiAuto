<template>
  <div class="social-signup-container">
    <div v-show="!isCreate" class="sign-btn" @click="createHandleClick('create')">
      <div class="create-svg-container">
        <svg-icon icon-class="edit" class="icon" />
      </div>
      <div>{{ $t('welcomeAlert.create') }}</div>
    </div>
    <div v-show="!isCreate" class="sign-btn" @click="openHandleClick('open')">
      <div class="open-svg-container">
        <svg-icon icon-class="clipboard" class="icon" />
      </div>
      <div>{{ $t('welcomeAlert.open') }}</div>
    </div>
    <div v-show="!isCreate" class="sign-btn" @click="closeHandleClick('close')">
      <div class="close-svg-container">
        <svg-icon icon-class="close" class="icon" />
      </div>
      <div>{{ $t('welcomeAlert.close') }}</div>
    </div>
    <div v-show="isCreate">
      <b style="font-size:16px">新建项目名:</b>
      <input v-model="projectName" style="width:350px;height:32px">
      <button
        class="el-button el-button--success el-button--small"
        style="font-size:14px"
        @click="commitHandleClick()"
      >确定</button>
      <button
        class="el-button el-button--small"
        style="font-size:14px"
        @click="cancelHandleClick()"
      >取消</button>
      <br>
      <br>
      <br>
    </div>
  </div>
</template>

<script>
// import openWindow from '@/utils/openWindow'
// const { app } = require('electron');
// import { EventBus } from '../../assets/bus.js'

export default {
  name: 'WelcomeAlert',
  props: ['loginForm'],
  data() {
    return {
      projectName: '',
      isCreate: false
    }
  },
  methods: {
    createHandleClick(thirdpart) {
      this.isCreate = true
    },
    openHandleClick(thirdpart) {
      alert('open files~~~')
    },
    closeHandleClick(thirdpart) {
      // app.quit();
      alert('ok')
    },
    commitHandleClick() {
      console.log(this.projectName)
      if (this.projectName === '') {
        alert('请输入项目名')
      } else {
        this.$router.push({
          // path: this.redirect || '/',
          query: { projectName: this.projectName }
        })
        window.location.reload()
      // EventBus.$emit("getProjectName", this.projectName);
      }
    },
    cancelHandleClick() {
      this.projectName = ''
      this.isCreate = false
    }
  }
}
</script>

<style lang="scss" scoped>
.social-signup-container {
  margin: 20px 0;
  .sign-btn {
    display: inline-block;
    cursor: pointer;
    margin: 0 25px;
  }
  .icon {
    color: #fff;
    font-size: 36px;
    margin-top: 10px;
  }
  .create-svg-container,
  .open-svg-container,
  .close-svg-container {
    display: inline-block;
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    padding-top: 1px;
    border-radius: 4px;
    margin-bottom: 5px;
  }
  .create-svg-container {
    background-color: #24da70;
  }
  .open-svg-container {
    background-color: #6ba2d6;
  }
  .close-svg-container {
    background-color: rgb(245, 34, 45);
  }
}
</style>
