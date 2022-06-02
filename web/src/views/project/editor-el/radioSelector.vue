<template>
  <div>
    <el-radio-group v-model="currValue">
      <div
        v-for="(item, key) in options.checked"
        :key="key"
        class="radio-editor"
        style="margin-top: 5px;"
      >
        <el-radio
          :id="propertyId + '-' + item"
          :label="item"
          type="text"
        >{{ key }}</el-radio>
      </div>
    </el-radio-group>
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
  data() {
    return {
    //   radio: "1"
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
