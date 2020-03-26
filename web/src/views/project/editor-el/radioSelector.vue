<template>
  <div>
    <el-radio-group v-model="currValue">
      <div
        class="radio-editor"
        v-for="(item, key) in options.checked"
        :key="key"
        style="margin-top: 5px;"
      >
        <el-radio
          :label="item"
          :id="propertyId  + '-' + item"
          type="text"
        >{{key}}</el-radio>
      </div>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
    //   radio: "1"
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
  }
};
</script>