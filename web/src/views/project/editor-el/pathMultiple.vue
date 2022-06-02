<template>
  <div>
    <div
      style="
        background-color: #f5f7fa;
        border: 1px solid #dcdfe6;
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

    <div v-for="(item, idx) in currValue" :key="idx" class="fileSelector">
      <el-input
        :id="propertyId + idx"
        v-model="item.value"
        type="text"
        placeholder="请选择路径"
        @input="changeValue()"
      >
        <el-button
          :id="propertyId + idx"
          type="primary"
          slot="prepend"
          @click="openFileDialog(propertyId + idx, idx)"
          >选择路径</el-button
        >
        <el-button type="danger" slot="append" @click="deleteCondition(idx)"
          >删除</el-button
        >
      </el-input>
    </div>
    <el-button
      v-if="!options.keyChoices || currValue.length < options.keyChoices.length"
      type="success"
      icon="el-icon-edit"
      style="width: 100%; margin-top: 5px; margin-left: 0"
      @click="addCondition()"
      >新 增</el-button
    >
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
      type: Object,
      default: {},
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
        var result = _.map(this.value, (value, key) => {
          const _value =
            typeof value === "object" ? JSON.stringify(value) : value;
          return { value: _value };
        });
        return result;
      },
      set(val) {
        this.changeValue();
      },
    },
  },
  mounted() {},
  methods: {
    deleteCondition(index) {
      this.currValue.splice(index, 1);
      this.changeValue();
    },
    addCondition() {
      this.currValue.push({
        value: "",
      });
      this.changeValue();
    },
    changeValue(val) {
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: val || this.arrayToObject(this.currValue),
      });
    },
    arrayToObject(array) {
      const result = {};
      _.each(array, (item, idx) => {
        result[idx] = item.value;
      });
      return result;
    },
    // 打开文件
    openFileDialog(propertyId, idx) {
      var self = this;
      document.querySelector(`#${propertyId}`).blur();
      fileSelector({ properties: [self.options.select_type] }).then(
        (result) => {
          if (Array.isArray(result)) {
            self.currValue[idx].value = result[0];
            self.changeValue();
          }
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.fileSelector {
  margin-top: 5px;
}
</style>
