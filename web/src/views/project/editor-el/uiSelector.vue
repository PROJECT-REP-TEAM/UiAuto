<template>
  <div class="uiSelector">
    <div
      style="
        background-color: #f5f7fa;
        display: table-cell;
        border: 1px solid #dcdfe6;
        border-right: 0px;
        border-radius: 4px 0 0 4px;
        padding: 0 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
      "
    >
      <span
        v-if="required"
        style="color: red; font-size: 16px; vertical-align: middle"
        >*</span
      >
      <span>{{ name }}</span>
    </div>

    <div
      style="
        display: table-cell;
        width: 80%;
        color: #fff;
        text-align: center;
        background-color: #f5f7fa;
        color: #909399;
        border: 1px solid #dcdfe6;
        border-radius: 0 4px 4px 0;
        font-weight: 500;
        cursor: pointer;
        line-height: 30px;
        vertical-align: middle;
      "
      @click="select_target"
    >
      <el-icon class="el-icon-position"></el-icon> 目标
    </div>

    <!-- <el-avatar
      v-if="screenshot_file"
      shape="square"
      :size="32"
      fit="fill"
      style="vertical-align: top; display: table-cell"
      :src="screenshot_file"
      @click.native.prevent="dialogVisible = true"
    ></el-avatar> -->
    <div
      v-if="screenshot_file"
      style="vertical-align: middle; display: table-cell"
      @click="dialogVisible = true"
    >
      <img style="width: 50px" :src="screenshot_file" />
    </div>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="screenshot_file" />
    </el-dialog>
  </div>
</template>

<script>
const electron = require("../../../utils/electron");
const uiSelector = require("../../../uiselector");
const path = window.nodeRequire("path");
const config = require("@/config/environment/index").default;
export default {
  props: {
    nodeKey: {
      type: Number,
      default: null,
    },
    inputId: {
      type: String,
      default: null,
    },
    propertyId: {
      type: String,
      default: null,
    },
    value: {
      type: String | Object,
      default: null,
    },
    browsers: {
      type: Array,
      default() {
        return [
          {
            label: "桌面元素",
            value: "Native",
          },
          {
            label: "Chrome 元素",
            value: "Chrome",
          },
          {
            label: "IE 元素",
            value: "Internet Explorer",
          },
        ];
      },
    },
    defaultBrowserType: {
      type: String,
      default: "Native",
    },
    projectName: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      browser_type: this.defaultBrowserType,
      browser_info: null,
      screenshot_dir: `${config.projectsPath}\\${this.projectName}\\screenshot\\`,
      screenshot_file: "",
      show_screentshot: true,
      dialogVisible: false,
    };
  },
  computed: {
    element: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("changeValue", {
          node_key: this.nodeKey,
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val,
        });
      },
    },
  },
  mounted() {
    // $('.file-selector .el-input__suffix').css('top', '-7px')
    if (this.element["element_screenshot"]) {
      this.screenshot_file = this.element["element_screenshot"];
    }
  },
  methods: {
    openBrowser() {
      uiSelector
        .openBrowser({
          browser_type: this.browser_type,
        })
        .then((result) => {
          this.browser_info = result;
          console.warn(result, this.browser_info);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    async select_target() {
      this.show_screentshot = false;

      const browser = await this.$store.state.project.browser;

      const browser_list = [];
      browser ? browser_list.push(browser) : null;

      if (window["uiselector"]) {
        electron.window_minimize();
        window["uiselector"]
          .execute({
            browsers: browser_list,
            project_dir: this.screenshot_dir,
            screenshot_file: this.screenshot_file,
          })
          .then((result) => {
            electron.window_maximize();
            if (result) {
              this.element = result;
              this.screenshot_file = result["element_screenshot"];
              this.show_screentshot = true;
              this.$forceUpdate();
              console.log(this.element, this.screenshot_file);
            }
          })
          .catch((error) => {
            electron.window_maximize();
            console.error(error);
          });
      } else {
        this.$message.error("当前环境不支持选择器");
      }
    },
    changeValue(val) {
      console.log("changeValue>>>>>", val);
    },
  },
};
</script>

<style>
</style>
