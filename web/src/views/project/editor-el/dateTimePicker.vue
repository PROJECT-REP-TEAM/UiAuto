<template>
  <div>
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
        line-height: normal;
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
      v-if="options.type === 'dateTime'"
      class="dateTime-picker"
      style="display: table-cell"
    >
      <el-date-picker
        :id="propertyId"
        v-model="currValue"
        type="datetime"
        placeholder="选择日期时间"
      />
    </div>
    <div
      v-if="options.type === 'date'"
      class="date-picker"
      style="display: table-cell"
    >
      <el-date-picker
        :id="propertyId"
        v-model="currValue"
        placeholder="选择日期"
        type="date"
      />
    </div>
    <div
      v-if="options.type === 'time'"
      class="time-picker"
      style="display: table-cell"
    >
      <el-time-picker
        :id="propertyId"
        v-model="currValue"
        placeholder="选择时间"
        type="time"
      />
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
      type: Date,
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
      },
    },
  },
};
</script>

<style>
.datePicker .el-date-editor {
  width: 100%;
}
</style>
