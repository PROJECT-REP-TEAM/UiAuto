<template>
  <div class="uiauto-preview">
    <el-dialog
      title="预览"
      width="80vw"
      top="2vh"
      :visible.sync="dialogFormVisible"
      @closed="reset"
    >
      <el-row :gutter="10">
        <el-col :span="19">
          <div style="height: 88vh; border: 2px solid #dfe4ed">
            <!-- 主画布 -->
            <div
              id="page"
              v-loading="loading"
              class="main-canvas"
              element-loading-text="加载中"
              style="height: 100%"
            />
          </div>
        </el-col>
        <el-col :span="5">
          <div
            style="
              height: 88vh;
              border: 2px solid #dfe4ed;
              padding: 10px;
              overflow: scroll;
            "
          >
            <div v-if="pluginDetail.isExist">
              <div
                class="panel-title"
                style="font-size: 13px; font-weight: 500; color: #303133"
              >
                插件名称
                <span style="float: right">V{{ pluginDetail.version }}</span>
              </div>
              <el-input
                v-model="pluginDetail.name"
                :disabled="true"
                size="mini"
                style="margin-top: 10px"
              />
              <div style="border-bottom: 1px solid #ebeef5; margin: 10px 0" />
            </div>
            <div v-if="nodeDetail.isExist">
              <div
                class="panel-title"
                style="font-size: 13px; font-weight: 500; color: #303133"
              >
                节点名称
              </div>
              <el-input
                v-model="nodeDetail.name"
                :disabled="true"
                size="mini"
                style="margin: 10px 0"
              />
            </div>
            <el-collapse v-if="attributesList.isExist" v-model="active_tag">
              <el-collapse-item
                v-for="inputItem in attributesList.input"
                :key="inputItem.id"
                :title="inputItem.name"
                :name="inputItem.name"
              >
                <div v-for="(item, idx) in inputItem.properties" :key="idx">
                  <template v-if="handleShowIf(item, attributesList.input)">
                    <span style="margin-left: 5px">{{ item.name }}</span>
                    <span
                      v-if="item.required"
                      style="color: red; font-size: 13px; vertical-align: sub"
                      >*</span
                    >
                    <el-input
                      v-if="item.type === 'select'"
                      :id="item.id"
                      v-model="
                        _.find(item.options.choices, { value: item.value })
                          .label
                      "
                      :disabled="true"
                      size="mini"
                      type="textarea"
                      autosize
                      style="margin-bottom: 5px"
                    />
                    <el-input
                      v-else-if="item.type === 'conditions'"
                      :id="item.id"
                      v-model="conditionsValue"
                      :disabled="true"
                      size="mini"
                      type="textarea"
                      autosize
                      style="margin-bottom: 5px"
                    />
                    <el-input
                      v-else
                      :id="item.id"
                      v-model="item.value"
                      :disabled="true"
                      size="mini"
                      type="textarea"
                      autosize
                      style="margin-bottom: 5px"
                    />
                  </template>
                </div>
              </el-collapse-item>
              <el-collapse-item
                v-if="
                  JSON.stringify(attributesList.output) !== '{}' &&
                  attributesList.output.is_allow_global_use
                "
                title="组件返回值"
                name="组件返回值"
              >
                <div>
                  <span style="margin-left: 5px">{{
                    attributesList.output.description
                  }}</span>
                  <el-input
                    v-model="attributesList.output.value"
                    :disabled="true"
                    size="mini"
                    style="margin: 5px 0"
                  />
                </div>
              </el-collapse-item>
              <el-collapse-item title="通用属性" name="通用属性">
                <div
                  v-for="item in attributesList.commonAttributes"
                  :key="item.id"
                >
                  <span style="margin-left: 5px">{{ item.name }}</span>
                  <el-input
                    :id="item.id"
                    v-model="item.value"
                    :disabled="true"
                    size="mini"
                    style="margin: 5px 0"
                  />
                </div>
              </el-collapse-item>
            </el-collapse>
            <div v-if="description.isExist">
              <span>项目描述：{{ description.content }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
      <font
        style="
          font-size: 10px;
          color: rgb(153, 153, 153);
          float: right;
          margin-top: 5px;
        "
        >仅支持预览，不支持修改等操作</font
      >
    </el-dialog>
  </div>
</template>

<script>
import G6Editor from "@antv/g6-editor";
import config from "@/config/environment/index";
const fs = window.nodeRequire("fs");
const fse = window.nodeRequire("fs-extra");

export default {
  data() {
    return {
      dialogFormVisible: false,
      projectData: {},
      editor: null,
      loading: false,
      // 插件详情
      pluginDetail: {
        isExist: false,
        version: "",
        name: "",
      },
      // 节点详情
      nodeDetail: {
        isExist: false,
        name: "",
      },
      // 属性列表
      attributesList: {
        isExist: false,
        input: [],
        output: {},
        // 通用属性
        commonAttributes: [],
      },
      // 项目描述
      description: {
        isExist: true,
        content: "",
      },
    };
  },
  computed: {
    active_tag: {
      get() {
        return _.map(this.attributesList.input, "name").concat([
          "组件返回值",
          "通用属性",
        ]);
      },
      set() {
        return _.map(this.attributesList.input, "name").concat([
          "组件返回值",
          "通用属性",
        ]);
      },
    },
    conditionsValue() {
      return JSON.stringify(
        _.reduce(
          _.find(
            _.find(this.attributesList.input, { name: "必填属性" }).properties,
            { type: "conditions" }
          ).value,
          function (obj, param) {
            obj[param.name] = param.expression;
            return obj;
          },
          {}
        )
      );
    },
  },
  methods: {
    async show(projectName) {
      this.loading = true;
      this.projectData = fse.readJsonSync(
        `${config.storePath}/${projectName}/${projectName}.json`
      );
      this.dialogFormVisible = true;
      setTimeout(() => {
        this.initG6Editor();
        this.loading = false;
      }, 1000);
    },
    reset() {
      this.editor.destroy();
      this.loading = false;
      this.resetAttributes();
      this.description = {
        isExist: true,
        content: "",
      };
    },
    resetAttributes() {
      this.pluginDetail = {
        isExist: false,
        version: "",
        name: "",
      };
      this.nodeDetail = {
        isExist: false,
        name: "",
      };
      this.attributesList = {
        isExist: false,
        input: [],
        output: {},
        commonAttributes: [],
      };
    },
    initG6Editor() {
      const editor = new G6Editor();
      this.editor = editor;

      const page = new G6Editor.Flow({
        graph: {
          container: "page",
        },
      });
      // page.changeMode("move");

      // 组件挂载到Editor
      editor.add(page);

      // 加载传入的nodes、edfes
      const curPage = editor.getCurrentPage();
      curPage.read(this.projectData);

      const currentPage = editor.getCurrentPage();
      // 监听选择变化 (选中)
      currentPage.on("afteritemselected", (ev) => {
        // 选择对象为Node节点
        if (ev.item.isNode) {
          const nm = ev.item.getModel();
          this.pluginDetail.isExist = true;
          this.pluginDetail.version = nm.version;
          this.pluginDetail.name =
            nm.categoryName && nm.operationName
              ? `${nm.categoryName}--${nm.operationName}`
              : nm.label;
          this.nodeDetail.isExist = true;
          this.nodeDetail.name = nm.label;
          this.attributesList.isExist = true;
          this.attributesList.input = nm.input;
          this.attributesList.output = nm.output;
          this.attributesList.commonAttributes = nm.general_property;
          this.description.isExist = false;
        }
        // 选择对象为Edge节点
        if (ev.item.isEdge) {
          const nm = ev.item.getModel();
          this.nodeDetail.isExist = true;
          this.nodeDetail.name = nm.label;
          this.description.isExist = false;
        }
      });

      // 监听选择变化 (取消选中)
      currentPage.on("afteritemunselected", (e) => {
        this.description.isExist = true;
        this.resetAttributes();
      });
    },
    handleShowIf(item, store_input) {
      if (!item.show_if) return true;
      const $input = {};

      _.each(store_input, (input_group) => {
        const group_id = input_group.id;
        $input[group_id] = {};
        _.each(input_group.properties, (property) => {
          $input[group_id][property.id] = property.value;
        });
      });

      try {
        const result = !!eval(item.show_if);
        return result;
      } catch (error) {
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep.el-dialog__body {
  padding: 10px;
}
::v-deep.el-collapse-item__header {
  height: 35px;
}
::v-deep.el-collapse-item__content {
  padding-bottom: 5px;
}
</style>
