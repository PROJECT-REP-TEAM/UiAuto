<template>
  <div class="register-form">
    <el-dialog
      title="忘记密码"
      :visible.sync="showAlterationDialog"
      width="500px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
    >
      <el-steps :active="currentTab" :process-status="status" align-center>
        <el-step title="手机验证"></el-step>
        <el-step title="更改密码"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <step1
        style="margin-top: 10px"
        v-if="currentTab === 0"
        ref="step1"
        @nextStep="nextStep"
      />
      <step2
        style="margin-top: 10px"
        v-if="currentTab === 1"
        ref="step2"
        @nextStep="nextStep"
        @prevStep="prevStep"
        :userList="userList"
      />
      <step3
        style="margin-top: 10px"
        v-if="currentTab === 2"
        ref="step3"
        @prevStep="prevStep"
        @finish="finish"
        :userList="userList"
      />
    </el-dialog>
  </div>
</template>

<script>
import step1 from "./Step1";
import step2 from "./Step2";
import step3 from "./Step3";

export default {
  name: "Alteration",
  components: {
    step1,
    step2,
    step3,
  },
  data() {
    return {
      showAlterationDialog: false,
      currentTab: 0,
      userList: {},
      status: "process",
    };
  },
  methods: {
    show() {
      this.showAlterationDialog = true;
    },
    close() {
      this.userList = {};
      this.currentTab = 0;
      this.status = "process";
      this.showAlterationDialog = false;
    },
    nextStep(data) {
      this.userList = data;
      if (this.currentTab < 4) {
        this.currentTab += 1;
      }
    },
    prevStep(data) {
      this.userList = data;
      if (this.currentTab > 0) {
        this.currentTab -= 1;
      }
    },
    finish() {
      this.status = "finish";
    },
  },
};
</script>

