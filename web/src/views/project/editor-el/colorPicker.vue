<template>
  <div class="colorPicker">
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
    <div style="display: table-cell; vertical-align: bottom">
      <el-color-picker
        :id="propertyId"
        v-model="currValue"
        color-format="rgb"
      />
    </div>

    <el-input
      id="input"
      v-model="colorRGB"
      disabled
      style="display: table-cell"
    />
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
  data() {
    return {};
  },
  computed: {
    currValue: {
      get() {
        return this.value.replace("[", "rgb(").replace("]", ")");
      },
      set(val) {
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val.replace("rgb(", "[").replace(")", "]"),
        });
      },
    },
    colorRGB: {
      get() {
        return this.value.replace("rgb(", "[").replace(")", "]");
      },
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep #input {
  border-left: 0px;
}
</style>