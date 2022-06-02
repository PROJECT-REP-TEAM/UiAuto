<template>
  <div class="dateTimeRangePicker">
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
        line-height: normal;
      "
    >
      <span
        v-if="required"
        style="color: red; font-size: 16px; vertical-align: middle"
        >*</span
      >
      <span>{{ name }}</span>
    </div>
    <el-date-picker
      v-model="currValue"
      range-separator="至"
      :type="options.type"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      prefix-icon="hidden"
      style="display: table-cell;"
    />
  </div>
</template>

<script>
import $ from "jquery";
import { debug } from "util";
import { checkDataValidity } from "./util.js";

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
      type: Array,
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
    return {
      startPlaceholder: "开始日期",
      endPlaceholder: "结束日期",
      warningEl: ".dateTimeRangePicker .el-date-editor",
    };
  },

  computed: {
    currValue: {
      get() {
        this.resetPlaceholder();
        setTimeout(() => {
          checkDataValidity(
            RegExp(this.options.valid_regExp),
            this.value,
            this.warningEl
          );
        }, 0);
        return this.value;
      },
      set(val) {
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val,
        });
        checkDataValidity(
          RegExp(this.options.valid_regExp),
          val,
          this.warningEl
        );
      },
    },
  },

  methods: {
    resetPlaceholder() {
      const self = this;
      switch (this.options.type) {
        case "daterange":
          self.startPlaceholder = "开始日期";
          self.endPlaceholder = "结束日期";
          break;

        case "datetimerange":
          self.startPlaceholder = "开始时间";
          self.endPlaceholder = "结束时间";
          break;

        case "monthrange":
          self.startPlaceholder = "开始月份";
          self.endPlaceholder = "结束月份";
          break;

        default:
          break;
      }
    },
  },
};
</script>