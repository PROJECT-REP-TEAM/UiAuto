<template>
  <div class="dateTimeRangePicker">
    <el-date-picker
      v-model="currValue"
      range-separator="至"
      :type="options.type"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      prefix-icon="hidden"
    ></el-date-picker>
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
      default: null
    },
    propertyId: {
      type: String,
      default: null
    },
    value: {
      type: Array,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      startPlaceholder: "开始日期",
      endPlaceholder: "结束日期",
      warningEl: ".dateTimeRangePicker .el-date-editor"
    };
  },

  computed: {
    currValue: {
      get() {
        this.resetPlaceholder();
        setTimeout(() => {
          checkDataValidity(RegExp(this.options.valid_regExp), this.value, this.warningEl)
        }, 0);
        return this.value;
      },
      set(val) {
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val
        });
        checkDataValidity(RegExp(this.options.valid_regExp), val, this.warningEl);
      }
    }
  },

  methods: {
    resetPlaceholder() {
      console.error(this.options);
      let self = this;
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
    }
  }
};
</script>

<style>
.dateTimeRangePicker {
  width: 100%;
}

.dateTimeRangePicker > .el-date-editor {
  width: 100%;
  padding: 3px 4px;
}
.dateTimeRangePicker > .el-date-editor > .el-range-separator {
  width: unset !important;
}

.hidden {
  display: none;
}

.el-range-separator ~ .el-range-input {
  border-right: 0.5px solid #ddd;
}
</style>
