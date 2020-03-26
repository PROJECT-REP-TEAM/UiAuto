<template>
  <div>
    <div class="fileSelector" v-for="(item, idx) in currValue" :key="idx">
      <el-input
        :id="propertyId + idx"
        v-model="item.value"
        @input="changeValue()"
        type="text"
        placeholder="请选择路径"
      ></el-input>
      <el-button
        style="width: 100%;margin-top: 8px;"
        :id="propertyId + idx"
        type="primary"
        @click="openFileDialog(propertyId + idx, idx)"
      >选择路径</el-button>
      <el-button
        type="danger"
        icon="el-icon-delete"
        style="width:100%;margin-top:5px;margin-left: 0;"
        @click="deleteCondition(idx)"
      ></el-button>
    </div>
    <div style="text-align: center;margin: 5px 0;">
      <el-button
        v-if="!options.keyChoices || currValue.length < options.keyChoices.length"
        type="success"
        icon="el-icon-edit"
        circle
        @click="addCondition()"
      ></el-button>
    </div>
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
      type: Object,
      default: {}
    },
    options: {
      type: Object,
      default: null
    }
  },
  computed: {
    currValue: {
      get() {
        var result = _.map(this.value, (value, key) => {
          let _value =
            typeof value === "object" ? JSON.stringify(value) : value;
          return { value: _value };
        });
        return result;
      },
      set(val) {
        this.changeValue();
      }
    }
  },
  mounted() {},
  methods: {
    deleteCondition(index) {
      this.currValue.splice(index, 1);
      this.changeValue();
    },
    addCondition() {
      this.currValue.push({
        value: ""
      });
      this.changeValue();
    },
    changeValue(val) {
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: val || this.arrayToObject(this.currValue)
      });
    },
    arrayToObject(array) {
      let result = {};
      _.each(array, (item, idx) => {
        result[idx] = item.value;
      });
      return result;
    },
    // 打开文件
    openFileDialog(propertyId, idx) {
      var self = this;
      document.querySelector(`#${propertyId}`).blur();
      fileSelector({ properties: [self.options.select_type] }).then(result => {
        if (Array.isArray(result)) {
          self.currValue[idx].value = result[0];
          self.changeValue();
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
  margin-top: 5px;
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
