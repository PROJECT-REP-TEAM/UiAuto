<template>
  <div class="stringShower">
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
        background-color: #f5f7fa;
        color: #909399;
        border: 1px solid #dcdfe6;
        border-radius: 0 4px 4px 0;
      "
    >
      {{ value }}
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
};
</script>

<style>
.string-shower {
  border: 0.5px solid #ddd;
  border-radius: 4px;
  padding: 5px 15px;
  font-size: 14px;
  font-family: sans-serif;
  color: #606266;
}

/* .string-shower,
.string-shower>.el-input__inner {
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 0px;
  border-bottom: 1px solid #cccccc;
  padding-left: 0;
  height: unset;
  line-height: unset;
} */
</style>
