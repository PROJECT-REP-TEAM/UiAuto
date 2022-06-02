<template>
  <div class="textEditor">
    <el-input
      type="text"
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
      <el-button slot="append" @click="associate" style="padding: 4px"
        >选择变量</el-button
      >
    </el-input>

    <el-dialog
      title="选择变量"
      :visible.sync="dialogFormVisible"
      width="50%"
      height="80%"
      top="5vh"
      @closed="cancel"
    >
      <el-table
        ref="singleTable"
        height="calc(100vh - 300px)"
        :data="returnNodeLs"
        style="width: 100%"
        highlight-current-row
        @current-change="handleCurrentChange"
        @row-dblclick="setCurrent"
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="label" label="节点名称" />
        <el-table-column prop="value" label="返回值" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">离 开</el-button>
        <el-button type="primary" @click="setCurrent()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
      default: {},
    },
    globalVariable: {
      type: Array,
      default: [],
    },
    inputId: {
      type: String,
      default: null,
    },
    propertyId: {
      type: String,
      default: null,
    },
    value: {
      type: String | Array,
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
      returnNodeLs: [],
      dialogFormVisible: false,
      currentRow: null,
    };
  },
  computed: {
    currValue: {
      get() {
        return this.value;
        if (Array.isArray(JSON.parse(this.value))) {
          return JSON.parse(this.value);
        } else {
          return this.value;
        }
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
  mounted() {
    _.each(this.editor.nodes, (node, idx) => {
      typeof node.output === "string" &&
        (node.output = JSON.parse(node.output));
      if (node.output.is_allow_global_use) {
        this.returnNodeLs.push({
          label: node.label,
          operation_id: node.operation_id,
          value: node.output.value,
        });
      }
    });
    _.each(this.globalVariable, (item) => {
      this.returnNodeLs.push({
        label: `${item.key} - ${item.value}（全局变量）`,
        value: item.key,
      });
    });
  },
  methods: {
    cancel() {
      this.currentRow = null;
      this.$refs.singleTable.setCurrentRow();
    },
    // 联想返回值节点
    associate() {
      this.dialogFormVisible = true;
    },
    // 选择返回值
    setCurrent() {
      if (this.currentRow) {
        this.currValue = "${" + this.currentRow.value + "}";
        this.dialogFormVisible = false;
      }
    },
    handleCurrentChange(val) {
      this.currentRow = val;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 0 20px;
}
</style>
