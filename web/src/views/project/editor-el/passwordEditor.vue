<template>
  <div class="passwordEditor">
    <el-input :id="propertyId" v-model="currValue" type="password" />
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
}
</script>

<style>
/* password-editor>.el-input__inner {
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 0px;
  border-bottom: 1px solid #cccccc;
  padding-left: 0;
} */
</style>
