<template>
  <div class="fileSelector">
    <el-input type="text" :id="propertyId" v-model.trim="currValue" placeholder="请选择路径">
      <template slot="prepend"
        ><div
          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          <span
            v-if="required"
            style="color: red; font-size: 16px; vertical-align: middle"
            >*</span
          >
          <span>{{ name }}</span>
        </div></template
      >
      <el-button
        slot="append"
        :id="propertyId"
        @click="openFileDialog(propertyId)"
        style="padding: 4px"
        >选择路径</el-button
      >
    </el-input>
  </div>
</template>

<script>
var { fileSelector } = require("@/utils/electron.js");
export default {
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
    name: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: true,
    },
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
        // return val;
      },
    },
  },
  mounted() {
    // $('.file-selector .el-input__suffix').css('top', '-7px')
  },
  methods: {
    // 打开文件
    openFileDialog(propertyId) {
      var self = this;
      document.querySelector(`#${propertyId}`).blur();
      fileSelector({ properties: [self.options.select_type] }).then(
        (result) => {
          if (Array.isArray(result)) {
            self.currValue = result[0];
          }
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
/* file-selector>.el-input__inner {
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 0px;
  border-bottom: 1px solid #cccccc;
  padding-left: 0;
  height: unset;
  line-height: unset;
}
file-selector>.el-input__suffix {
  top: -7px !important;
} */
</style>
