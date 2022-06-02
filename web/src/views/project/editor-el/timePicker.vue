<template>
  <div class="timePicker">
    <el-time-picker
      :id="propertyId"
      v-model="currValue"
      placeholder="选择时间"
      type="time"
    />
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
    }
  },

  computed: {
    currValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('changeValue', {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val
        })
      }
    }
  }
}
</script>
