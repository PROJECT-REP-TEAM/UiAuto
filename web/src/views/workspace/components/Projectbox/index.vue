<template>
  <div class="board-column">
    <div
      class="board-column-header"
      @mouseenter="showFolderOperate = true"
      @mouseleave="showFolderOperate = false"
    >
      {{ headerText }}
      <transition name="slide-fade">
        <span v-if="headerText != '未分类' && showFolderOperate">
          <el-divider direction="vertical"></el-divider>
          <el-link
            icon="el-icon-delete"
            :underline="false"
            @click.stop="handleDisband()"
            >全部移出</el-link
          >
          <el-divider direction="vertical"></el-divider>
          <el-link
            icon="el-icon-delete"
            :underline="false"
            @click.stop="handleDeleteFolder()"
            >全部删除</el-link
          >
        </span>
      </transition>
    </div>

    <draggable
      :list="list"
      style="overflow: auto; background-color: #ffffff"
      class="board-column-content el-row"
      :set-data="setData"
      @add="addOrRemove"
      @remove="addOrRemove"
      :sort="false"
      :forceFallback="true"
      :filter="removeClass"
      :fallbackTolerance="1"
      :group="group"
    >
      <div
        class="
          el-col
          el-col-24
          el-col-xs-24
          el-col-sm-12
          el-col-md-6
          el-col-lg-6
          el-col-xl-6
        "
        v-for="element in list"
        :key="element.project_name"
      >
        <div
          class="card-panel"
          @click="handleSetLineChartData(element)"
          @mouseenter="enterFile(element.project_name)"
          @mouseleave="leaveFile()"
        >
          <div class="card-panel-icon-wrapper icon-clipboard">
            <!-- <svg-icon icon-class="file-regular" class-name="card-panel-icon" /> -->
            <font-awesome-icon
              icon="fa-solid fa-file"
              style="font-size: 50px"
            />
          </div>
          <div
            class="card-panel-description"
            style="position: absolute; left: 100px; top: auto"
          >
            <div class="card-panel-text">{{ element.name }}</div>
            <div
              class="card-panel-text"
              style="font-size: 12px; color: #999999"
            >
              {{ element.json.project_name || "--" }}
            </div>
            <div class="card-panel-num">{{ element.date }}</div>
          </div>
          <transition name="slide-fade">
            <div
              style="position: absolute; right: 0; margin: 6px 20px"
              v-if="showFileOperate && showCurrent === element.project_name"
            >
              <el-link
                icon="el-icon-setting"
                :underline="false"
                @click.stop="handleOperate(element)"
                >操作</el-link
              >
            </div>
          </transition>
        </div>
      </div>
      <div
        role="group"
        class="
          js-remove
          el-col
          el-col-24
          el-col-xs-24
          el-col-sm-12
          el-col-md-6
          el-col-lg-6
          el-col-xl-6
        "
      >
        <div class="card-panel" @click="createProjectByfolder()">
          <div
            class="card-panel-icon-wrapper icon-clipboard"
            style="font-size: 40px"
          >
            <i class="el-icon-plus" />
          </div>
          <div
            class="card-panel-description"
            style="position: absolute; left: 100px; top: auto"
          >
            <div
              style="
                font-weight: bold;
                margin: 21px 21px 21px 0px;
                margin-left: 0px;
                font-size: 20px;
                color: #454545;
              "
            >
              新建项目
            </div>
          </div>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import config from "@/config/environment/index";
import _ from "lodash";
import moment from "moment";
const fse = window.nodeRequire("fs-extra");

export default {
  name: "DragKanbanDemo",
  components: {
    draggable,
  },
  data() {
    return {
      showFolderOperate: false,
      showFileOperate: false,
      showCurrent: "",
      removeClass: ".js-remove, .js-edit",
    };
  },
  props: {
    headerText: {
      type: String,
      default: "Header",
    },
    group: {
      type: String,
      default: "",
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    list: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  methods: {
    // 操作
    handleOperate(project) {
      this.$parent.$parent.$parent.handleOperate(project, this.headerText);
    },
    setData(dataTransfer) {
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
      dataTransfer.setData("Text", "");
    },
    // 移入或移出
    addOrRemove(evt) {
      if (this.headerText !== "未分类") {
        let json = fse.readJsonSync(
          `${config.projectsPath}/${this.headerText}/${this.headerText}.json`
        );

        json["projects"] = _.map(this.list, "project_name");
        json["projects_name"] = _.map(this.list, "name");
        json["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

        fse.writeFileSync(
          `${config.projectsPath}/${this.headerText}/${this.headerText}.json`,
          JSON.stringify(json, null, "\t"),
          "utf8"
        );
      }
    },
    // 文件夹中新建项目
    createProjectByfolder() {
      this.$parent.$parent.$parent.createModel.createProjectByfolder = true;
      this.$parent.$parent.$parent.createModel.folderName = this.headerText;
      this.$parent.$parent.$parent.createModel.showCreateDialog = true;
    },
    // 查看
    handleSetLineChartData(project) {
      this.$parent.$parent.$parent.handleSetLineChartData(project);
    },
    // 解散文件夹中的项目
    handleDisband() {
      this.$confirm(
        `确认解散分类 ${this.headerText}？此操作不会删除分类中的项目。`,
        "提示",
        {
          type: "warning",
        }
      )
        .then(() => {
          this.$parent.$parent.$parent.handleDeleteFolder(
            `${config.projectsPath}/${this.headerText}`
          );
          this.$parent.$parent.$parent.getProjectList();
          this.$message({
            type: "success",
            message: `成功解散分类 ${this.headerText}`,
          });
        })
        .catch(() => {});
    },
    // 删除文件夹及文件夹中的所有项目
    handleDeleteFolder() {
      this.$confirm(`确认删除分类 ${this.headerText} 中所有项目？`, "提示", {
        type: "warning",
      })
        .then(() => {
          this.$parent.$parent.$parent.handleDeleteFolder(
            `${config.projectsPath}/${this.headerText}`
          );
          _.each(_.map(this.list, "project_name"), (item) => {
            this.$parent.$parent.$parent.handleDeleteFolder(
              `${config.projectsPath}/${item}`
            );
          });
        })
        .catch(() => {});
    },
    // 鼠标进入文件事件
    enterFile(project_name) {
      this.showFileOperate = true;
      this.showCurrent = project_name;
    },
    // 鼠标离开文件事件
    leaveFile() {
      this.showFileOperate = false;
      this.showCurrent = "";
    },
  },
};
</script>
<style lang="scss" scoped>
.create-project {
  padding-left: 10px;
  padding-right: 10px;
}
.board-column {
  background-color: #ffffff;

  .board-column-header {
    height: 50px;
    line-height: 50px;
    overflow: hidden;
    padding: 0 20px;
    background: #d2d6da;
    color: #757272;
    font-size: 20px;
  }

  .board-column-content {
    // padding-right: 20px;
    // padding-bottom: 20px;
    // padding-left: 20px;
  }
  .board-item {
    // cursor: pointer;
    height: 200px;
    background-color: #fff;
    text-align: left;
    line-height: 54px;
    padding: 5px 10px;
    // margin-top: 20px;
    box-sizing: border-box;
    box-shadow: 0px 1px 3px 0 rgba(0, 0, 0, 0.2);
    border: 1px solid #1890ff;
  }
  .card-panel-col-created {
    margin-bottom: 0;
    padding-right: 0 !important;
  }

  .card-panel-col {
    padding-right: 0 !important;
  }

  .card-panel {
    height: 120px;
    cursor: pointer;
    padding: 5px 10px;
    // margin-top: 20px;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #999999;
    background: #fff;
    box-shadow: 1px 0 0 0 #e8e8e8, 0 1px 0 0 #e8e8e8, 1px 1px 0 0 #e8e8e8,
      inset 1px 0 0 0 #e8e8e8, inset 0 1px 0 0 #e8e8e8;
    // border: 1px solid #c3bdbd;
    // border-radius: 4px;
    -webkit-user-select: none; /*webkit浏览器*/
    user-select: none;

    &:hover {
      box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-edit {
        background: #40c9c6;
      }

      .icon-clipboard {
        background: #36a3f7;
      }

      .icon-close {
        background: #f4516c;
      }
    }

    .icon-edit {
      color: #40c9c6;
    }

    .icon-clipboard {
      color: #36a3f7;
    }

    .icon-close {
      color: #f4516c;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 15px 0 0 0;
      padding: 16px;
      //   transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      width: calc(100% - 130px);
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 18px;
        color: #454545;
        font-size: 16px;
        margin-bottom: 6px;
      }

      .card-panel-num {
        margin-bottom: 6px;
        font-size: 14px;
      }
    }
  }
}
</style>

