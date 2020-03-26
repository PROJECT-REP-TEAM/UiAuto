<template>
  <div class="colorPicker">
    <el-color-picker
      :id="propertyId"
      v-model="currValue"
      show-alpha
      :predefine="options.predefineColors"
      style="width:100%"
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
  },
  data() {
    return {
    //   predefineColors: [
    //     "#ff4500",
    //     "#ff8c00",
    //     "#ffd700",
    //     "#90ee90",
    //     "#00ced1",
    //     "#1e90ff",
    //     "#c71585",
    //     "rgba(255, 69, 0, 0.68)",
    //     "rgb(255, 120, 0)",
    //     "hsv(51, 100, 98)",
    //     "hsva(120, 40, 94, 0.5)",
    //     "hsl(181, 100%, 37%)",
    //     "hsla(209, 100%, 56%, 0.73)",
    //     "#c7158577"
    //   ]
    };
  }
};
</script>

<style>
.el-color-picker__trigger {
    width:100%
}
</style>
