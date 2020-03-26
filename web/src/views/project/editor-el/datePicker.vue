<template>
  <div class="datePicker">
      <el-date-picker
         placeholder="选择日期"
        :id="propertyId" 
        v-model="currValue" 
        type="date"
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
      type: String,
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
};
</script>