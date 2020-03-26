<template>
  <div class="inputNumberEditor">
    <el-input-number
      :step="1"
      :id="propertyId"
      v-model="currValue"
      style="width:100%"
    ></el-input-number>
  </div>
</template>
<script>
export default {
  data() {
    return {
    };
  },
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
      type: Number,
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