<template>
  <div class="uiScreenshot">
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
      "
      @click="begin_screenshot"
    >
      <icon class="el-icon-picture"></icon> 截取屏幕
    </div>

    <el-avatar
      v-if="image_path"
      shape="square"
      :size="30"
      fit="fill"
      style="vertical-align: top; display: table-cell"
      :src="image_path"
      @click.native.prevent="dialogVisible = true"
    ></el-avatar>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="image_path" />
    </el-dialog>
  </div>
</template>

<script>
const electron = require("../../../utils/electron");
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
      type: String,
      default: null,
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
      screenshot_dir: `${config.projectsPath}\\${this.projectName}\\screenshot\\`,
      screenshot_file: "",
      show_screentshot: true,
      dialogVisible: false,
    };
  },
  computed: {
    image_path: {
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
        // return val;
      },
    },
  },
  mounted() {},
  methods: {
    begin_screenshot() {
      electron.window_minimize();
      setTimeout(() => {
        window["executor"]
          .execute_python(
            `${path.resolve()}\\public\\pyscript\\screenshot\\screenshot.py`,
            "UI_Screenshot",
            {
              path: this.screenshot_dir,
              image_path: this.image_path,
            }
          )
          .then((result) => {
            electron.window_maximize();
            this.image_path = result;
          })
          .catch((err) => {
            console.log(err);
          });
      }, 300);
    },
  },
};
</script>

<style>
</style>
