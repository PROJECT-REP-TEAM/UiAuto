<template>
  <div class="components-container">
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
        width: 100%;
        color: #fff;
        text-align: center;
        background-color: #f5f7fa;
        color: #909399;
        border: 1px solid #dcdfe6;
        border-radius: 0 4px 4px 0;
        font-weight: 500;
        cursor: pointer;
      "
      @click="tinymceInit"
    >
      富文本编辑器
    </div>

    <el-dialog
      title="富文本"
      :visible.sync="showDialog"
      :before-close="handleClose"
      width="90%"
      top="10vh"
    >
      <!-- <tinymce v-model="currValue" :height="500" /> -->
      <Editor id="tinymce" v-model="currValue" :init="init" />

      <div style="margin-top: 10px; text-align: right">
        <el-button @click="handleClose()">取消</el-button>
        <el-button type="primary" @click="commitClick()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import Tinymce from "./Tinymce/index.vue";
import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/themes/silver/theme";
import "tinymce/plugins/code";
import "tinymce/plugins/table";
// import "tinymce/plugins/image";
// import "tinymce/plugins/link";
// import "tinymce/plugins/lists";
// import "tinymce/plugins/wordcount";
// import "tinymce/plugins/contextmenu";
// import "tinymce/plugins/colorpicker";
// import "tinymce/plugins/textcolor";
import zh_CN from "./Tinymce/zh_CN";

export default {
  name: "TinymceDemo",
  components: { Editor },
  // components: { Tinymce },
  props: {
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
    options: {
      type: Object,
      default: null,
    },
    language: {
      type: String,
      default: null,
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
      showDialog: false,
      init: {
        selector: "#tinymce",
        language_url: zh_CN,
        language: "zh_CN",
        skin_url: "./tinymce/skins/ui/oxide",
        height: 700,
        plugins: "code table",
        // "link lists image code table colorpicker textcolor wordcount contextmenu",
        toolbar:
          "bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo | link unlink image code | removeformat",
        branding: false,
      },
    };
  },
  computed: {
    currValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val,
        });
      },
    },
  },
  methods: {
    handleClose() {
      this.$confirm("确认关闭？").then((_) => {
        this.showDialog = false;
      });
    },
    commitClick() {
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: this.currValue,
      });
      this.showDialog = false;
    },
    tinymceInit() {
      tinymce.init({});
      this.showDialog = true;
      this.$nextTick(() => {
        document.getElementsByClassName(
          "tox-tinymce-aux"
        )[0].style.zIndex = 9999;
      });
    },
  },
};
</script>

<style scoped>
</style>

