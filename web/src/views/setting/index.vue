<template>
  <div
    class="visable-area"
    style="margin: 10px 10px 0 10px; background:#fff; height:calc(100vh - 60px)"
  >
    <div style="text-align:right" color="red">
      <el-button
        style="margin-top: 10px;margin-right:15px"
        type="danger"
        size="small"
        round
        @click="logOut()"
      >
        退出登录
        <!-- <font color="##66b1ff">退出登录</font> -->
      </el-button>
    </div>
    <div class="user-info" align="center">
      <img class="user-image" style="width:15%; margin:30px;" src="../../assets/images/head.png" />
      <div
        style="padding-bottom:6px;border-bottom:1px solid #eee; width:40%;font-size:22px;"
      >{{username}}</div>
    </div>
    <div class="below-info" style="padding-top:20px">
      <leftSide
        class="left-side"
        style="width:49%;display: inline-block;padding-left:10%;vertical-align:top;padding-top:15px;font-size: 14px;"
      ></leftSide>
      <!-- <center>
        <el-divider direction="vertical"></el-divider>
      </center>-->
      <rightSide
        class="right-side"
        style="width:49%;display: inline-block;padding-right:10%;padding-left:1%;vertical-align:top;font-size: 14px;"
      ></rightSide>
    </div>

    <!-- <el-container style="height: calc(100vh - 70px);">
    <el-header style="margin: 0 auto;">
      <img style="width:250px; margin:30px;" src="../../assets/images/head.png">
    </el-header>
    <el-container style="margin-top: 70px">
      <el-aside height="100%" width="50%" style="margin-top: 200px">
        <div style="margin-right:50px" align="right">
          插件路径：
          <el-input
            style="width:400px"
            id="pluginsPath"
            v-model="pluginsPath"
            @focus="openFileDialog('pluginsPath')"
            clearable
            type="text"
          />
        </div>
        <div align="center">
          <el-button style="margin-top: 62px;" type="primary">&#12288;保存&#12288;</el-button>
        </div>
      </el-aside>
      <el-divider direction="vertical"></el-divider>
      <el-main width="50%" style="margin-top: 130px">
        <div class="container" style="margin-left:30px;width:80%">
          <p align="left">当前版本：V1.1</p>
          <p align="left" style="margin-top:10px">版本更新：</p>
          <p
            align="left"
            style="margin-top:10px;marign-left"
          >UiAuto是览众全新一代RPA可视化解决方案，致力于提供一套简单方便、专业可靠、无限可能的RPA可视化最佳实践</p>
          <el-button type="primary">检查更新</el-button>
        </div>
      </el-main>
    </el-container>
    </el-container>-->
  </div>
</template>

<script>
import leftSide from "./components/left-side";
import rightSide from "./components/right-side";
import { setTimeout } from "timers";
import { closeSocket } from "@/express/socket/client/";
export default {
  name: "Setting",
  components: {
    leftSide,
    rightSide
  },
  data() {
    return {
      fits: ["fill", "contain", "cover", "none", "scale-down"],
      url: "../../assets/images/head.png",
      pluginsPath: ""
    };
  },
  mounted() {
    // document.querySelector(".below-info").style.height =
    //   document.querySelector(".visable-area").clientHeight -
    //   (document.querySelector(".visable-area").clientWidth * 0.2 + 88) +
    //   "px";
    // setTimeout(() => {
    //   console.log(document.querySelector(".visable-area").clientHeight);
    //   console.log(document.querySelector(".user-info").clientHeight);
    //   document.querySelector(".below-info").style.height =
    //     document.querySelector(".visable-area").clientHeight -
    //     document.querySelector(".user-info").clientHeight +
    //     "px";
    // }, 0);
  },
  methods: {
    openFileDialog(id) {
      var self = this;
      document.querySelector(`#${id}`).blur();
      fileSelector({ properties: ["openDirectory"] }).then(result => {
        if (Array.isArray(result)) {
          self.pluginsPath = result[0];
        }
      });
    },
    logOut() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("is_first_run");
      closeSocket();
      this.$message({
        message: "退出登录成功",
        type: "success"
      });
      this.$router.push("/login");
    }
  },
  computed: {
    username() {
      return localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).username
        : "";
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  text-align: center;
  .font {
    color: #4a90e2;
    font-size: 28px;
    margin-top: 30px;
  }
}
.el-divider--vertical {
  margin-left: 1%;
  // display: inline-block;
  float: left;
  width: 1px;
  height: 14em;
  // margin: 0 4px;
  vertical-align: middle;
  // position: absolute;
  // left:calc(50vw - 1px);
}
.el-container.is-vertical {
  -webkit-box-orient: vertical;
  -ms-flex-direction: column;
  flex-direction: column;
  margin-top: 10px;
  margin-left: 10px;
  background: #fff;
  min-height: calc(100vh - 70px);
}

body {
  overflow-y: hidden;
}
</style>
