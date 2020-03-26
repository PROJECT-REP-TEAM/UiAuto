<template>
  <div class="fileSelector">
    <el-input :id="propertyId" v-model="currValue" type="text" placeholder='请选择路径'>
      <!-- <el-button slot="append" icon="el-icon-more" @click="associate"></el-button>s -->
    </el-input>
    <!-- <span>{{currValue || '请选择路径'}}</span> -->
    <el-button
      style="width: 100%;margin-top: 8px;"
      :id="propertyId"
      type="primary"
      @click="openFileDialog(propertyId)"
    >选择路径</el-button>
  </div>
</template>

<script>
var { fileSelector } = require("@/utils/electron.js");
export default {
  props: {
    inputId: {
      type: String,
      default: null
    },
    propertyId: {
      type: String,
      default: null
    },
    value: {
      type: String,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
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
          value: val
        });
        // return val;
      }
    }
  },
  mounted() {
    // $('.file-selector .el-input__suffix').css('top', '-7px')
  },
  methods: {
    // 打开文件
    openFileDialog(propertyId) {
      var self = this;
      document.querySelector(`#${propertyId}`).blur();
      fileSelector({ properties: [self.options.select_type] }).then(result => {
        if (Array.isArray(result)) {
          self.currValue = result[0];
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.fileSelector {
  border: 1px dashed #ccc;
  padding: 8px;
  border-radius: 5px;
  font-size: 11px;
  color: #999;
}
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
