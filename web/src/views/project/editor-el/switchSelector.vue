<template>
  <div class="switchSelector">
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
        height: 30px;
        line-height: 30px;
        color: #909399;
        border: 1px solid #dcdfe6;
        border-radius: 0 4px 4px 0;
        padding: 0 10px;
      "
    >
      <el-switch :id="propertyId" v-model="currValue" />
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
      type: Boolean,
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
