<template>
  <div class="textEditor">
    <el-input :id="propertyId" v-model="currValue" type="textarea" autosize></el-input>
    <el-button
      size="mini"
      @click="associate"
      type="primary"
      style="width:100%;margin-top: 5px;"
    >选择变量</el-button>
    <el-dialog
      title="选择变量"
      :visible.sync="dialogFormVisible"
      width="40%"
      height="80%"
      top="5vh"
      @closed="cancel"
    >
      <el-table
        max-height="calc(100vh - 300px)"
        ref="singleTable"
        :data="returnNodeLs"
        style="width: 100%"
        highlight-current-row
        @current-change="handleCurrentChange"
      >
        <el-table-column type="index" width="50"></el-table-column>
        <!-- <el-table-column prop="operation_id" label="节点ID"></el-table-column> -->
        <el-table-column prop="label" label="节点名称"></el-table-column>
        <el-table-column prop="value" label="返回值"></el-table-column>
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
      default: {}
    },
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
    }
  },
  data() {
    return {
      returnNodeLs: [],
      dialogFormVisible: false,
      currentRow: null
    };
  },
  mounted() {
    _.each(this.editor.nodes, (node, idx) => {
      if (node.output.is_allow_global_use) {
        this.returnNodeLs.push({
          label: node.label,
          operation_id: node.operation_id,
          value: node.output.value
        });
      }
    });
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
        console.log(val);
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val
        });
      }
    }
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
