<template>
  <div class="switchSelector">
    <el-switch :id="propertyId" v-model="currValue" type="date" style="display: block"></el-switch>
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
      type: Boolean,
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