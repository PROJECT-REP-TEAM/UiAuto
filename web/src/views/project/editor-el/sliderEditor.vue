<template>
  <div class="sliderEditor">
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
        line-height: 38px;
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
        padding: 0 10px;
        vertical-align: bottom;
      "
    >
      <el-slider
        :id="propertyId"
        v-model="currValue"
        type="slider"
        :format-tooltip="formatTooltip"
        :max="privateOptions.max"
        :min="privateOptions.min"
        :step="privateOptions.step"
      />
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
      type: Number,
      default: null,
    },
    options: {
      type: Object,
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
  data() {
    return {};
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
          value: val,
        });
      },
    },
    privateOptions: {
      get() {
        var options = this.options;
        options.precision = options.precision || 1;
        options.max = options.max || 100;
        options.min = options.min || 0;
        return options;
      },
      set(val) {
        console.warn("you don't allow to set options");
      },
    },
  },
  methods: {
    formatTooltip(val) {
      var precision = this.options.precision || 1;
      return val / precision;
    },
  },
};
</script>
