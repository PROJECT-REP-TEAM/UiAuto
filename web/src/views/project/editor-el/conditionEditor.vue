<template>
  <div>
    <div
      class="conditionEditor"
      v-for="(item, idx) in currValue"
      :key="idx"
      style="margin-top: 5px;"
    >
      <el-input
        :id="propertyId  + idx"
        v-model="item.name"
        type="text"
        style="width:25%;"
        @change="changeValue()"
        placeholder="名"
      />
      <el-input
        :id="propertyId  + idx"
        v-model="item.expression"
        type="text"
        style="width:70%;"
        @change="changeValue()"
        placeholder="表达式"
      />
      <!-- <el-button type="danger" icon="el-icon-delete" circle @click="deleteCondition(idx)"></el-button> -->
    </div>
    <div style="text-align: center;margin: 5px 0;">
      <el-button type="success" icon="el-icon-edit" circle @click="addCondition()"></el-button>
      <el-button
        v-if="currValue.length"
        type="danger"
        icon="el-icon-delete"
        circle
        @click="deleteCondition()"
      ></el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      addCondition_value: 0
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
      type: Array,
      default: []
    }
  },
  computed: {
    currValue: {
      get() {
        return this.value;
      },
      set(val) {
        console.warn(val);
        this.changeValue(val);
      }
    }
  },
  methods: {
    deleteCondition(index) {
      this.currValue.splice(this.currValue.length - 1, 1);
      this.changeValue();
    },
    addCondition() {
      this.currValue.push({
        name: this.addCondition_value + 1,
        expression: ""
      });
      this.changeValue();
    },
    changeValue(val) {
      console.error(val);
      this.addCondition_value = this.currValue.length;
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: val || this.currValue
      });
    }
  }
};
</script>

<style>
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
