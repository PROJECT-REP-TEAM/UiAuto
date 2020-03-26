<template>
  <div class="selectPicker">
    <el-select
      v-if="options.multiple===false"
      v-model="currValue"
      style="width:100%"
      placeholder="请选择"
    >
      <el-option
        v-for="item in options.choices"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      v-if="options.multiple===true"
      v-model="currValue"
      style="width:100%"
      placeholder="请选择"
      multiple
    >
      <el-option
        v-for="item in options.choices"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
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
      type: String | Array,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
  },
  method: {},
  computed: {
    currValue: {
      get() {
        // define parse function
        let parse = function(str) {
          let jsonError = false;

          while (!jsonError && !/^\d+(\.\d+)?$/.test(str)) {
            try {
              str = JSON.parse(str);
            } catch (error) {
              jsonError = true;
            }
          }

          return str;
        };
        
        if (this.options.multiple === false) {
          if (Array.isArray(this.value)) {
            return parse(this.value[0]);
          } else {
            return parse(this.value);
          }
        } else {
          if (Array.isArray(this.value)) {
            return _.map(this.value, val => {
              return parse(val);
            });
          } else {
            return [parse(this.value)];
          }
        }
      },
      set(val) {
        let returnValue;
        if (this.options.multiple === false) {
          if (Array.isArray(val)) {
            returnValue = `${val[0]}`;
          } else {
            returnValue = `${val}`;
          }
        } else {
          if (Array.isArray(val)) {
            returnValue = _.map(val, valItem => {
              return `${valItem}`;
            });
          } else {
            returnValue = [`${val}`];
          }
        }
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: returnValue
        });
      }
    }
  }
};
</script>
