<template>
  <div class="result">
    <div>
      <svg-icon
        icon-class="code"
        style="margin-bottom: 10px; font-size: 60px; color: #52c41a"
      />
    </div>
    <div class="title">更改密码成功</div>
    <div class="content">
      <div class="toLogin">
        <h3>
          将在<span>{{ time }}</span
          >秒后返回登录页面.
        </h3>
      </div>
    </div>
    <div class="action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "Step3",
  components: {},
  props: ["userList"],
  data() {
    return {
      time: 0,
      status: process,
    };
  },
  methods: {
    countDown() {
      let that = this;
      that.time--;
    },
  },
  mounted() {
    let that = this;
    this.$emit("finish");
    that.time = 5;
    setInterval(that.countDown, 1000);
  },
  watch: {
    time: function (newVal, oldVal) {
      if (newVal == 0) {
        this.$parent.$parent.close();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.result {
  text-align: center;
  width: 72%;
  margin: 0 auto;
  padding: 24px 0 8px;

  .icon {
    font-size: 72px;
    line-height: 72px;
    margin-bottom: 24px;
  }
  .success {
    color: #52c41a;
  }
  .error {
    color: red;
  }
  .title {
    font-size: 24px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    line-height: 32px;
    margin-bottom: 16px;
  }
  .content {
    background: #fafafa;
    padding: 0px 40px;
    border-radius: 2px;
    text-align: left;
  }
  .action {
    margin-top: 32px;
  }
}
.toLogin {
  text-align: center;
}
</style>
