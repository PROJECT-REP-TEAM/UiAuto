<template>
  <div class="passwordEditor">
    <el-input
      type="password"
      :id="propertyId"
      v-model.trim="currValue"
      :placeholder="'请填写' + name"
    >
      <template slot="prepend"
        ><div
          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          <span
            v-if="required"
            style="color: red; font-size: 16px; vertical-align: middle"
            >*</span
          >
          <span>{{ name }}</span>
        </div></template
      >
    </el-input>
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
      type: String,
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
  },
};
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
