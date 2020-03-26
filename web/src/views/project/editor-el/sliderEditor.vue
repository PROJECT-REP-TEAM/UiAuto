<template>
  <div class="sliderEditor">
    <div class="block">
      <el-slider
        :id="propertyId"
        v-model="currValue"
        type="slider"
        :format-tooltip="formatTooltip"
        :max="privateOptions.max"
        :min="privateOptions.min"
        :step="privateOptions.step"
      ></el-slider>
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
        return this.value;
      },
      set(val) {
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val
        });
      }
    },
    privateOptions: {
      get() {
        var options = this.options
        options.precision = options.precision || 1
        options.max = options.max || 100
        options.min = options.min || 0
        return options
      },
      set(val) {
        console.warn("you don't allow to set options")
      }
    }
  },
  methods: {
    formatTooltip(val) {
      var precision = this.options.precision || 1
      return val / precision
    }
  }
};
</script>