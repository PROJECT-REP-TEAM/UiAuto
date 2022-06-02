<template>
  <div>
    <codemirror
      :input-id="inputId"
      :property-id="propertyId"
      :value="dialog_currValue"
      :options="options"
      :name="name"
      :required="required"
      @changeValue="changeCodeValue"
    />

    <div v-for="(item, idx) in currValue" :key="idx" style="margin: 10px 0">
      <el-input
        v-if="!options.keyChoices"
        :id="'key_input' + propertyId + idx"
        v-model.trim="item.key"
        type="text"
        placeholder="键"
        @input="changeValue()"
      />
      <el-select
        v-if="options.keyChoices"
        :id="'key_select' + propertyId + idx"
        v-model="item.key"
        placeholder="键"
        @change="changeValue()"
      >
        <el-option
          v-for="choice in options.keyChoices"
          :key="choice.value"
          :label="choice.label"
          :value="choice.value"
          :disabled="choice.disabled"
        />
      </el-select>
      <el-input
        :id="'value' + propertyId + idx"
        v-model.trim="item.value"
        type="text"
        style="width: 100%; margin-top: 3px"
        placeholder="值"
        @input="changeValue()"
      />
      <el-button
        type="danger"
        icon="el-icon-delete"
        style="width: 100%; margin-top: 4px"
        @click="deleteCondition(idx)"
        >删 除</el-button
      >
    </div>
    <el-button
      v-if="!options.keyChoices || currValue.length < options.keyChoices.length"
      type="success"
      icon="el-icon-edit"
      style="width: 100%"
      @click="addCondition()"
      >新 增</el-button
    >
  </div>
</template>

<script>
import _ from "lodash";
import codemirror from "./codemirror";
export default {
  components: {
    codemirror,
  },
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
      type: String | Object,
      default: null,
    },
    options: {
      type: Object,
      default: () => {
        return {};
      },
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
      len: 0,
    };
  },
  computed: {
    currValue: {
      get() {
        // this.checkDisabled();
        var result = _.map(this.value, (value, key) => {
          const _value =
            typeof value === "object" ? JSON.stringify(value) : value;
          return { key: key, value: _value };
        });

        return result;
      },
      set(val) {
        this.changeValue(val);
      },
    },
    dialog_currValue: {
      get() {
        return JSON.stringify(this.arrayToObject(this.currValue), null, "\t");
      },
      set(val) {
        this.changeValue(val);
      },
    },
  },
  methods: {
    deleteCondition(index) {
      this.currValue.splice(index, 1);
      this.changeValue();
    },
    addCondition() {
      if (
        !_.find(this.currValue, { key: "" }) ||
        !_.find(this.currValue, { value: "" })
      ) {
        this.currValue.push({
          key: "",
          value: "",
        });
        this.changeValue();
      }
    },
    changeValue(val) {
      this.checkDisabled();
      this.len = this.currValue.length;
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: val || this.arrayToObject(this.currValue),
      });
    },
    changeCodeValue(val) {
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: JSON.parse(val.value) || this.arrayToObject(this.currValue),
      });
    },
    arrayToObject(array) {
      const result = {};
      _.each(array, (item) => {
        result[item.key] = item.value;
      });
      return result;
    },
    checkDisabled() {
      if (!this.options.keyChoices || !this.options.keyChoices.length) return;
      const self = this;
      const selectedKeys = _.map(this.currValue, "key");
      _.each(self.options.keyChoices, (keyChoice) => {
        keyChoice.disabled = false;
      });
      _.each(selectedKeys, (selectedKey) => {
        const target = _.find(self.options.keyChoices, { value: selectedKey });
        if (!target) return;
        target && (target.disabled = true);
      });
    },
  },
};
</script>
