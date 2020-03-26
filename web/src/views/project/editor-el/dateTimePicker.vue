<template>
  <div>
    <div class="dateTime-picker" v-if="options.type==='dateTime'">
      <el-date-picker type="datetime" placeholder="选择日期时间" :id="propertyId" v-model="currValue"></el-date-picker>
    </div>
    <div class="date-picker" v-if="options.type==='date'">
      <el-date-picker placeholder="选择日期" :id="propertyId" v-model="currValue" type="date"/>
    </div>
    <div class="time-picker" v-if="options.type==='time'">
      <el-time-picker placeholder="选择时间" :id="propertyId" v-model="currValue" type="time"/>
    </div>
  </div>
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
      type: Date,
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
      }
    }
  }
};
</script>

<style>
.datePicker .el-date-editor {
  width: 100%;
}
</style>
