<template>
  <div class="stringShower">{{ value }}</div>
</template>

<script>
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
    }
  }
}
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
