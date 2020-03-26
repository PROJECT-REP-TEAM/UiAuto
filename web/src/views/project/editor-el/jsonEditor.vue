<template>
  <div>
    <el-button style="margin-bottom: 5px;" @click="senior()">高级</el-button>
    <codemirror
      ref="code"
      :input-id="inputId"
      :property-id="propertyId"
      :value="dialog_currValue"
      :options="options"
      @changeValue="changeCodeValue"
    ></codemirror>
    <div class="jsonEditor" v-for="(item, idx) in currValue" :key="idx">
      <el-input
        :id="'key_input' + propertyId + idx"
        v-model="item.key"
        type="text"
        style="width:95%;"
        @input="changeValue()"
        v-if="!options.keyChoices"
        placeholder="键"
      />
      <el-select
        :id="'key_select' + propertyId + idx"
        v-if="options.keyChoices"
        v-model="item.key"
        @change="changeValue()"
        style="width:95%"
        placeholder="键"
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
        v-model="item.value"
        type="text"
        style="width:95%;margin-top:3px"
        @input="changeValue()"
        placeholder="值"
      />
      <el-button
        type="danger"
        icon="el-icon-delete"
        style="width:95%;margin-top:4px"
        @click="deleteCondition(idx)"
      ></el-button>
    </div>
    <div style="text-align: center;margin: 5px 0;">
      <el-button
        v-if="!options.keyChoices || currValue.length < options.keyChoices.length"
        type="success"
        icon="el-icon-edit"
        circle
        @click="addCondition()"
      ></el-button>
      <!-- <el-button v-if="currValue.length" type="danger" icon="el-icon-delete" circle @click="deleteCondition()"></el-button> -->
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import codemirror from "./codemirror";
export default {
  components: {
    codemirror
  },
  data() {
    return {
      len: 0
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
      type: Object,
      default: {}
    },
    options: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  computed: {
    currValue: {
      get() {
        // this.checkDisabled();
        var result = _.map(this.value, (value, key) => {
          let _value =
            typeof value === "object" ? JSON.stringify(value) : value;
          return { key: key, value: _value };
        });

        return result;
      },
      set(val) {
        this.changeValue(val);
      }
    },
    dialog_currValue: {
      get() {
        return JSON.stringify(this.arrayToObject(this.currValue), null, "\t");
      },
      set(val) {
        this.changeValue(val);
      }
    }
  },
  methods: {
    deleteCondition(index) {
      this.currValue.splice(index, 1);
      this.changeValue();
    },
    addCondition() {
      this.currValue.push({
        key: "",
        value: ""
      });
      this.changeValue();
    },
    changeValue(val) {
      this.checkDisabled();
      this.len = this.currValue.length;
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: val || this.arrayToObject(this.currValue)
      });
    },
    changeCodeValue(val) {
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: JSON.parse(val.value) || this.arrayToObject(this.currValue)
      });
    },
    arrayToObject(array) {
      let result = {};
      _.each(array, item => {
        result[item.key] = item.value;
      });
      return result;
    },
    checkDisabled() {
      if (!this.options.keyChoices || !this.options.keyChoices.length) return;
      let self = this;
      let selectedKeys = _.map(this.currValue, "key");
      _.each(self.options.keyChoices, keyChoice => {
        keyChoice.disabled = false;
      });
      _.each(selectedKeys, selectedKey => {
        let target = _.find(self.options.keyChoices, { value: selectedKey });
        if (!target) return;
        target && (target.disabled = true);
      });
    },
    senior() {
      this.$refs.code.openCodeModal();
    }
  }
};
</script>

<style>
.jsonEditor {
  border: 2px dashed #ddd;
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 15px;
  text-align: center;
}
/* .el-input__inner {
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 0px;
  border-bottom: 1px solid #cccccc;
  padding-left: 0;
  height: unset;
  line-height: unset;
} */
</style>
