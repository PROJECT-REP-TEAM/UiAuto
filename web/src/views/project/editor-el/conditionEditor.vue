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

    <div
      v-for="(item, idx) in currValue"
      :key="idx"
      class="conditionEditor"
      style="margin-top: 5px"
    >
      <el-input
        :id="propertyId + idx"
        v-model="item.name"
        type="text"
        style="width: 25%; display: table-cell"
        placeholder="标识"
        @change="changeValue()"
      />
      <el-input
        :id="propertyId + idx"
        v-model="item.expression"
        type="text"
        style="display: table-cell"
        placeholder="表达式"
        @change="changeValue()"
      />
      <!-- <el-button type="danger" icon="el-icon-delete" circle @click="deleteCondition(idx)"></el-button> -->
    </div>
    <div style="text-align: center; margin: 5px 0">
      <el-button
        type="success"
        icon="el-icon-edit"
        style="width: calc(50% - 4px)"
        @click="addCondition()"
        >新 增</el-button
      >
      <el-button
        v-if="currValue.length"
        type="danger"
        icon="el-icon-delete"
        style="width: 50%"
        @click="deleteCondition()"
        >删 除</el-button
      >
    </div>
  </div>
</template>

<script>
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
      type: Array,
      default: [],
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
      addCondition_value: 0,
    };
  },
  computed: {
    currValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.changeValue(val);
      },
    },
  },
  methods: {
    deleteCondition(index) {
      this.currValue.splice(this.currValue.length - 1, 1);
      this.changeValue();
    },
    addCondition() {
      this.currValue.push({
        name: this.addCondition_value + 1,
        expression: "",
      });
      this.changeValue();
    },
    changeValue(val) {
      this.addCondition_value = this.currValue.length;
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: val || this.currValue,
      });
    },
  },
};
</script>

<style scoped>
.el-button + .el-button {
  margin-left: 0px;
}
</style>
