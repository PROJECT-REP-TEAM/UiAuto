<template>
  <div id="wrapId" class="wrap">
    <!-- 工具栏 -->
    <div id="toolbar" class="toolbar navbar">
      <el-button
        v-if="queryData.currentProjectName"
        type="primary"
        size="mini"
        style="margin: 6px 0 6px 15px; float: left"
        @click="backToMain"
        >返回主流程
      </el-button>
      <div class="left-menu">
        项目
        <span v-if="projectJson.name">/ {{ projectJson.name }}</span>
      </div>
      <div class="right-menu">
        <div class="right-menu-item" @click="openGlobalVariableDialog">
          <img src="../../assets/images/global-variable.png" class="icon" />
          <span class="icon-text">全局变量</span>
        </div>
        <div class="right-menu-item" @click="updateVersionFn">
          <img src="../../assets/images/update.png" class="icon" />
          <span class="icon-text">使用最新插件</span>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="right-menu-item" @click="handleDetection()">
          <img src="../../assets/images/detection.png" class="icon" />
          <span class="icon-text">依赖检测(F4)</span>
        </div>
        <div class="right-menu-item" @click="toolClick('run')">
          <img src="../../assets/images/run.png" class="icon" />
          <span class="icon-text">执行(F5)</span>
        </div>
        <div class="right-menu-item" @click="executecurrentNode">
          <img src="../../assets/images/run.png" class="icon" />
          <span class="icon-text">执行当前节点(F6)</span>
        </div>
        <div data-command="save" class="command right-menu-item">
          <img src="../../assets/images/save.png" class="icon" />
          <span class="icon-text">保存(ctrl+s)</span>
        </div>
        <div class="right-menu-item" @click="toolClick('stop')">
          <img src="../../assets/images/stop.png" class="icon" />
          <span class="icon-text">停止(F9)</span>
        </div>
      </div>
    </div>
    <!-- 右键菜单 -->
    <div id="contextmenu" style="display: none">
      <div data-status="node-selected" class="menu">
        <el-button size="mini" data-command="copy" class="command"
          >复制</el-button
        >
        <el-button size="mini" data-command="paste" class="command"
          >粘贴</el-button
        >
        <el-button size="mini" data-command="delete" class="command"
          >删除</el-button
        >
      </div>
      <div data-status="multi-selected" class="menu">
        <el-button size="mini" data-command="copy" class="command"
          >复制</el-button
        >
        <el-button size="mini" data-command="paste" class="command"
          >粘贴</el-button
        >
        <el-button size="mini" data-command="delete" class="command"
          >删除</el-button
        >
      </div>
    </div>

    <split-pane
      split="vertical"
      :default-percent="15"
      :max-percent="30"
      @resize="resize"
    >
      <template slot="paneL">
        <div id="itempannel" class="ph left">
          <el-input
            placeholder="插件搜索"
            v-model.trim="filterText"
            clearable
            id="search_plugin"
          />
          <el-tree
            :data="treeData"
            :props="defaultProps"
            :filter-node-method="filterNode"
            onselectstart="return false;"
            style="
              font-size: 14px;
              height: calc(100% - 42px);
              overflow-y: scroll;
            "
            ref="tree"
          >
            <span
              class="custom-tree-node getItem"
              slot-scope="{ node, data }"
              :data-type="data.data_type"
              :data-shape="data.data_shape"
              :data-shape-type="data.data_shape_type"
              :data-size="data.data_size"
              :data-label="data.data_label"
              :data-color="data.data_color"
              :data-operation_id="data.operation_id"
              :data-plugin_id="data.plugin_id"
              :data-input="data.input"
              :data-output="data.output"
              :data-version="data.version"
              :data-operation-name="data.operation_name"
              :data-category-name="data.category_name"
              :data-language="data.language"
              :data-attribution-name="data.attribution_name"
              @click="handleOpenBrowser(node.label)"
            >
              <!-- <i :class="data.icon"></i> -->
              <font-awesome-icon v-if="data.icon" :icon="data.icon" />
              {{ node.label }}
            </span>
          </el-tree>
        </div>
      </template>
      <template slot="paneR">
        <split-pane split="vertical" :default-percent="75" @resize="resize">
          <template slot="paneL">
            <split-pane
              split="horizontal"
              :default-percent="70"
              @resize="resize"
            >
              <template slot="paneL">
                <!-- 主画布 -->
                <div
                  id="page"
                  ref="page"
                  v-loading="loading"
                  class="main-canvas"
                  element-loading-text="正在执行，请稍候…"
                  element-loading-background="rgba(255, 255, 255, 0.5)"
                  style="margin-top: 7px; height: 100%"
                />
              </template>
              <template slot="paneR">
                <!-- <div id="xterm"></div> -->
                <div
                  id="logMessageId"
                  style="
                    height: calc(100% - 40px);
                    background: #475058;
                    color: #eee;
                    overflow: auto;
                    padding: 10px;
                  "
                >
                  <div id="logMessageBox">
                    <div v-for="(item, idx) in logMessage" :key="idx">
                      <span
                        v-if="item.type === 'warn'"
                        style="color: #fec171"
                        v-text="item.line"
                      />
                      <span
                        v-else-if="item.type === 'error'"
                        style="color: #e65d6e"
                        v-text="item.line"
                      />
                      <span
                        v-else-if="item.type === 'success'"
                        style="color: green"
                        v-text="item.line"
                      />
                      <span
                        v-else-if="item.type === 'log'"
                        v-text="item.line"
                      />
                      <span
                        v-else-if="item.type === 'info'"
                        style="color: #4169e1"
                        v-text="item.line"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </split-pane>
          </template>
          <template slot="paneR">
            <div class="ph right">
              <!-- 详细面板 -->
              <div id="detailpannel" style="overflow-y: scroll">
                <div v-if="isShowDescription">
                  <div
                    class="panel-title"
                    style="margin-top: 10px; font-size: 13px; font-weight: 500"
                  >
                    项目描述
                  </div>
                  <el-input
                    v-model="description"
                    type="textarea"
                    :autosize="{ minRows: 8, maxRows: 30 }"
                    style="padding: 10px 10px 0 10px"
                  />
                  <div
                    style="border-bottom: 1px solid #ebeef5; margin: 0 10px"
                  />
                </div>
                <div v-if="operationName">
                  <div
                    class="panel-title"
                    style="margin-top: 10px; font-size: 13px; font-weight: 500"
                  >
                    <font style="line-height: 25px">插件名称</font>
                    <el-select
                      v-model="version"
                      placeholder="版本"
                      size="mini"
                      style="float: right; width: 100px; margin-right: 10px"
                      @change="changePluginVersion"
                    >
                      <el-option
                        v-for="item in currentPluginVersionLs"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </div>
                  <div class="block-container">
                    <el-input
                      v-if="language === 'nodejs'"
                      v-model="plugin_info"
                      prefix-icon="el-icon-skl-java-script"
                      :disabled="true"
                    >
                      <el-button
                        slot="append"
                        icon="el-icon-aim"
                        @click="findPlugin"
                      />
                    </el-input>
                    <el-input
                      v-if="language === 'python'"
                      v-model="plugin_info"
                      prefix-icon=" el-icon-skl-logo-python"
                      :disabled="true"
                    >
                      <el-button
                        slot="append"
                        icon="el-icon-aim"
                        @click="findPlugin"
                      />
                    </el-input>
                    <el-input
                      v-if="language === 'java'"
                      v-model="plugin_info"
                      prefix-icon=" el-icon-skl-java"
                      :disabled="true"
                    >
                      <el-button
                        slot="append"
                        icon="el-icon-aim"
                        @click="findPlugin"
                      />
                    </el-input>
                  </div>
                  <div
                    style="border-bottom: 1px solid #ebeef5; margin: 0 10px"
                  />
                </div>
                <div v-if="nodeLineLabelShow">
                  <div
                    class="panel-title"
                    style="margin-top: 10px; font-size: 13px; font-weight: 500"
                  >
                    节点名称
                  </div>
                  <div class="block-container">
                    <el-input
                      v-model="nodeLabel"
                      placeholder="请输入内容"
                      @change="changeValue('line')"
                    />
                  </div>
                </div>
                <div>
                  <el-collapse
                    v-if="nodeLabelShow"
                    v-model="active_tag"
                    style="
                      width: calc(100% - 20px);
                      margin: 0 10px;
                      height: 100%;
                      float: left;
                    "
                  >
                    <el-collapse-item
                      v-for="inputItem in store_input"
                      :key="inputItem.id"
                      :title="inputItem.name"
                      :name="inputItem.name"
                    >
                      <div
                        v-for="(item, idx) in inputItem.properties"
                        :key="idx"
                        class="getItem"
                      >
                        <template v-if="handleShowIf(item)">
                          <el-row style="padding: 5px 10px">
                            <textEditor
                              v-if="item.type === 'text'"
                              :editor="editor.getCurrentPage().save()"
                              :global-variable="global_variable"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <pathSelector
                              v-if="item.type === 'path'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <pathMultiple
                              v-if="item.type === 'pathMultiple'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <switchSelector
                              v-if="item.type === 'switch'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <selectPicker
                              v-if="item.type === 'select'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <codemirror
                              v-if="item.type === 'code'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :language="language"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <passwordEditor
                              v-if="item.type === 'password'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <dateTimeRangePicker
                              v-if="item.type === 'dateTimeRange'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <dateTimePicker
                              v-if="item.type === 'dateTime'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <stringShower
                              v-if="item.type === 'string'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                            />
                            <inputNumberEditor
                              v-if="item.type === 'inputNumber'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <colorPicker
                              v-if="item.type === 'color'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <projectSelector
                              v-if="item.type === 'projectSelector'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :current-project="projectJson.project_name"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <ui-screenshot
                              v-if="item.type === 'uiScreenshot'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :projectName="projectJson.project_name"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <uiSelector
                              v-if="item.type === 'uiselector'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :browsers="item.browsers"
                              :projectName="projectJson.project_name"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <tinymce
                              v-if="item.type === 'tinymce'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <checkboxEditor
                              v-if="item.type === 'checkbox'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <sliderEditor
                              v-if="item.type === 'slider'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <jsonEditor
                              v-if="item.type === 'json'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <radioEditor
                              v-if="item.type === 'radio'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                            <conditionEditor
                              v-if="item.type === 'conditions'"
                              :input-id="inputItem.id"
                              :property-id="item.id"
                              :value="item.value"
                              :options="item.options"
                              :name="item.name"
                              :required="item.required"
                              @changeValue="changeValue"
                            />
                          </el-row>
                        </template>
                      </div>
                    </el-collapse-item>
                    <el-collapse-item
                      v-if="
                        JSON.stringify(output) !== '{}' &&
                        output.is_allow_global_use
                      "
                      class="params-editor-title"
                      title="组件返回值"
                      name="组件返回值"
                    >
                      <el-input
                        id="output_input"
                        v-model="output.value"
                        type="text"
                        style="padding: 10px"
                        @change="changeValue('output')"
                      >
                        <template slot="prepend">{{
                          output.description
                        }}</template>
                      </el-input>
                      <!-- <div id="output_div">
                        <span
                          class="params-editor-el"
                          style="margin-left: 10px"
                          >{{ output.description }}</span
                        >
                        <el-input
                          id="output_input"
                          v-model="output.value"
                          type="text"
                          style="padding: 10px"
                          @change="changeValue('output')"
                        />
                      </div> -->
                    </el-collapse-item>
                    <el-collapse-item
                      class="params-editor-title"
                      title="通用属性"
                      name="通用属性"
                    >
                      <div
                        v-for="generalItem in store_general_property"
                        id="general_div"
                        :key="generalItem.id"
                      >
                        <el-input
                          :id="generalItem.id"
                          v-model="generalItem.value"
                          type="number"
                          style="padding: 10px"
                          @change="changeValue(generalItem.id)"
                        >
                          <template slot="prepend">{{
                            generalItem.name
                          }}</template>
                        </el-input>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>
              <!-- 缩略图 -->
              <!-- <div class="minimap" id="minimapId"> -->
              <!-- <div class="panel-title">缩略图</div> -->
              <!-- <div id="minimap"></div> -->
              <!-- </div> -->
            </div>
          </template>
        </split-pane>
      </template>
    </split-pane>

    <el-dialog
      title="全局变量编辑"
      :visible.sync="globalVariableDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="60%"
      top="2vh"
      @close="handleCloseGlobalVariableDialog"
    >
      <el-divider content-position="left">全局变量</el-divider>
      <el-button size="mini" type="primary" @click="addGlobalVariable"
        >新 增</el-button
      >
      <div style="height: 20vh; overflow: scroll">
        <div
          v-for="(row, index) in global_variable"
          :key="index"
          style="margin: 10px 0"
        >
          <el-input
            v-model="row.key"
            class="filter-item"
            style="width: 125px"
            size="mini"
            placeholder="属性名"
          />

          <el-select
            slot="prepend"
            v-model="row.type"
            placeholder="类型"
            style="width: 100px"
            size="mini"
          >
            <el-option label="文本" value="text" />
            <el-option label="密码" value="password" />
            <el-option label="日期" value="date" />
            <el-option label="数字" value="number" />
            <el-option label="数组" value="array" />
            <el-option label="JSON" value="json" />
          </el-select>

          <el-date-picker
            v-if="row.type == 'date'"
            v-model="row.value"
            type="date"
            size="mini"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            style="width: 330px"
          />

          <el-input
            v-if="row.type != 'date'"
            v-model="row.value"
            placeholder="属性值"
            size="mini"
            style="width: 330px"
            :type="row.type"
          />

          <el-button
            size="mini"
            :icon="
              checkNewExtendEl(row) ? 'el-icon-delete' : 'el-icon-circle-close'
            "
            @click="handleDelete(index)"
          />
        </div>
      </div>

      <el-divider content-position="left">节点变量</el-divider>
      <el-table
        ref="singleTable"
        height="20vh"
        :data="node_variable"
        style="width: 100%"
        highlight-current-row
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="label" label="节点名称" />
        <el-table-column prop="value" label="返回值" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseGlobalVariableDialog">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="执行时参数"
      :visible.sync="executeParamsDialog"
      width="40%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleExecuteParamsDialog"
    >
      <el-form label-width="100px">
        <el-form-item
          v-for="(item, index) in execute_params"
          :key="index"
          :label="item.keyName"
          style="margin-bottom: 8px"
        >
          <el-input
            v-model.trim="item.value"
            :placeholder="'请输入' + item.keyName"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleExecuteParamsDialog">取 消</el-button>
        <el-button type="primary" @click="handleExecuteParamsConfirm"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      title="依赖检测"
      :visible.sync="detectionDialog"
      width="60%"
      top="10vh"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleDetectionDialog"
    >
      <el-table v-loading="detectionLoading" border lazy :data="detectionData">
        <el-table-column
          prop="plugin_id"
          align="center"
          label="插件ID"
          show-overflow-tooltip
        />
        <el-table-column
          prop="version"
          align="center"
          label="插件版本"
          show-overflow-tooltip
        />
        <el-table-column
          prop="message"
          align="center"
          label="信息"
          show-overflow-tooltip
          ><template slot-scope="scope">
            {{
              scope.row.message
                ? scope.row.message
                : plugin_status[scope.row.plugin_id + scope.row.version]
                ? plugin_status[scope.row.plugin_id + scope.row.version]
                    .buttonText
                : download_plugin[scope.row.plugin_id + scope.row.version] &&
                  download_plugin[scope.row.plugin_id + scope.row.version]
                    .errLog
            }}
          </template></el-table-column
        >
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDetectionDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
const socket = require("../../express/socket/client");
const electron = require("../../utils/electron");
var os = window.nodeRequire("os");
const fs = window.nodeRequire("fs");
const path = window.nodeRequire("path");
const fse = window.nodeRequire("fs-extra");
const { app } = window.nodeRequire("@electron/remote");
const async = require("async");
import config from "@/config/environment/index";
import _ from "lodash";
import $ from "jquery";
import moment from "moment";
import G6Editor from "@antv/g6-editor";
import textEditor from "./editor-el/textEditor";
import colorPicker from "./editor-el/colorPicker";
import radioEditor from "./editor-el/radioEditor";
import stringShower from "./editor-el/stringShower";
import pathSelector from "./editor-el/pathSelector";
import pathMultiple from "./editor-el/pathMultiple";
import selectPicker from "./editor-el/selectPicker";
import sliderEditor from "./editor-el/sliderEditor";
import checkboxEditor from "./editor-el/checkboxEditor";
import passwordEditor from "./editor-el/passwordEditor";
import switchSelector from "./editor-el/switchSelector";
import dateTimePicker from "./editor-el/dateTimePicker";
import conditionEditor from "./editor-el/conditionEditor";
import inputNumberEditor from "./editor-el/inputNumberEditor";
import dateTimeRangePicker from "./editor-el/dateTimeRangePicker";
import jsonEditor from "./editor-el/jsonEditor";
import uiSelector from "./editor-el/uiSelector";
import codemirror from "./editor-el/codemirror";
import uiScreenshot from "./editor-el/uiScreenshot";
import projectSelector from "./editor-el/projectSelector";
import tinymce from "./editor-el/tinymce";
import * as ui_selector from "../../uiselector";
import { updateLog } from "@/api/task";
import { pluginViews } from "@/api/plugin";
const { executeDownload } = require("@/utils/electron.js");
import splitPane from "vue-splitpane";
import elementResizeDetectorMaker from "element-resize-detector";
let erd = elementResizeDetectorMaker();

export default {
  components: {
    uiScreenshot,
    codemirror,
    jsonEditor,
    textEditor,
    uiSelector,
    colorPicker,
    radioEditor,
    stringShower,
    pathSelector,
    pathMultiple,
    selectPicker,
    sliderEditor,
    checkboxEditor,
    passwordEditor,
    switchSelector,
    dateTimePicker,
    conditionEditor,
    inputNumberEditor,
    dateTimeRangePicker,
    projectSelector,
    tinymce,
    splitPane,
  },
  data() {
    return {
      dialogVisible: false,
      size: this.$store.getters.size,
      input: "",
      logMessage: [],
      output: {},
      graph: null,
      loading: false,
      projectJson: {},
      nodeLabel: "",
      operationName: "",
      categoryName: "",
      attributionName: "",
      language: "",
      version: "",
      isShowDescription: true,
      description: "",
      projectType: "",
      nodeLabelShow: false,
      nodeLineLabelShow: false,
      general_property: [
        { id: "retry_count", value: "1", name: "重试次数" },
        { id: "retry_interval", value: "50", name: "重试时间间隔(ms)" },
        { id: "execution_timeout", value: "50000", name: "执行超时时间(ms)" },
        {
          id: "delayed_execution_time",
          value: "50",
          name: "延迟执行时间(ms)",
        },
        {
          id: "waiting_time_after_execution",
          value: "50",
          name: "执行后等待时间",
        },
      ],
      currentNode: {},
      localLastPlugin: [],
      localAllPlugin: [],
      localProjectsLs: [],
      queryData: {},
      currentPluginVersionLsInfo: [],
      currentPluginVersionLs: [],
      // 当前选中节点信息内存（谨慎：会影响内存）
      currentNmModel: null,
      globalVariableDialog: false,
      global_variable: [],
      node_variable: [],
      filterText: "",
      treeData: [
        // {
        //   label: "内置浏览器",
        //   children: [
        //     {
        //       icon: "fa-brands fa-chrome",
        //       label: "启动谷歌浏览器",
        //     },
        //     {
        //       icon: "fa-brands fa-internet-explorer",
        //       label: "启动IE浏览器",
        //     },
        //   ],
        // },
      ],
      defaultProps: {
        children: "children",
        label: "label",
      },
      general_property_temporary: [
        { id: "retry_count", value: "1", name: "重试次数" },
        { id: "retry_interval", value: "50", name: "重试时间间隔(ms)" },
        {
          id: "execution_timeout",
          value: "50000",
          name: "执行超时时间(ms)",
        },
        {
          id: "delayed_execution_time",
          value: "50",
          name: "延迟执行时间(ms)",
        },
        {
          id: "waiting_time_after_execution",
          value: "50",
          name: "执行后等待时间",
        },
      ],
      // 依赖检测
      detectionDialog: false,
      detectionLoading: false,
      detectionData: [],
      // 执行时参数
      executeParamsDialog: false,
      execute_params: [],
    };
  },
  computed: {
    plugin_info() {
      return this.categoryName + "--" + this.operationName;
    },
    store_input() {
      return this.input;
    },
    store_output() {
      return this.output;
    },
    store_general_property() {
      return this.general_property;
    },
    active_tag: {
      get() {
        return _.map(this.input, "name").concat(["组件返回值", "通用属性"]);
      },
      set() {
        return _.map(this.input, "name").concat(["组件返回值", "通用属性"]);
      },
    },
    download_plugin() {
      return this.$store.state.plugin.pluginDownload;
    },
    plugin_status() {
      return this.$store.state.plugin.pluginStatus;
    },
  },
  created: function () {
    let self = this;
    document.onkeydown = function (e) {
      let key = window.event.keyCode;
      if (key == 115) {
        // F4 依赖检测
        self.handleDetection();
      } else if (key == 116) {
        // F5 执行
        self.toolClick("run");
      } else if (key == 117) {
        // F6 执行当前节点
        self.executecurrentNode();
      } else if (key == 118) {
        // F7
      } else if (key == 120) {
        // F9 停止
        self.toolClick("stop");
      }
    };
  },
  mounted() {
    // 重启执行器
    // delete window.nodeRequire.cache[
    //   path.normalize(
    //     path.resolve() + "/public/base_integration/uiauto_executor/executor.js"
    //   )
    // ];
    // window["executor"] = window.nodeRequire(
    //   path.normalize(
    //     path.resolve() + "/public/base_integration/uiauto_executor/executor.js"
    //   )
    // );
    // if (window["executor"].hasOwnProperty("restart")) {
    //   window["executor"].restart();
    // }
    // // 重启选择器
    // if (os.platform() === "win32") {
    //   delete window.nodeRequire.cache[
    //     path.normalize(
    //       path.resolve() + "/public/base_integration/uiauto_uiselector/index.js"
    //     )
    //   ];
    //   window["uiselector"] = window.nodeRequire(
    //     path.normalize(
    //       path.resolve() + "/public/base_integration/uiauto_uiselector/index.js"
    //     )
    //   );
    //   window["uiselector"].restart_process();
    // } else {
    //   delete window.nodeRequire.cache[
    //     path.normalize(
    //       path.resolve() +
    //         "/public/base_integration/uiauto_uiselector_ukylin/index.js"
    //     )
    //   ];
    //   window["uiselector"] = window.nodeRequire(
    //     path.normalize(
    //       path.resolve() +
    //         "/public/base_integration/uiauto_uiselector_ukylin/index.js"
    //     )
    //   );
    //   // window["uiselector"].restart_process();
    // }

    erd.listenTo($(".main-container"), (page_element) => {
      $(".ph").height(page_element.offsetHeight - 79);
    });

    this.queryData = this.$route.query;
    this.getPluginLs().then((res) => {
      this.treeData = _.concat(this.treeData, res);
    });
    this.projectJson = JSON.parse(
      fs.readFileSync(
        `${config.projectsPath}/${this.queryData.redirectProjectName}/${this.queryData.redirectProjectName}.json`,
        "utf-8"
      )
    );
    this.projectType = this.projectJson.project_type;
    this.description = this.projectJson.description;
    this.global_variable = _.cloneDeep(this.projectJson.global_variable) || [];
    this.execute_params = this.projectJson.execute_params || [];
    this.initG6Editor();
    this.initTerminal();
    this.getProjectList();
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      if (!data.label) return false;
      return data.label.indexOf(value) !== -1;
    },
    resize(e) {
      this.resizeFn();
    },
    resizeFn: _.debounce(function (value) {
      window.dispatchEvent(new Event("resize"));
    }, 100),
    // 左侧插件集
    async getPluginLs() {
      let pluginLs = [];
      // 本地插件集
      this.localAllPlugin = _.map(
        _.difference(fs.readdirSync(`${config.pluginsPath}/`), [
          "list.json",
          "npm_i.sh",
          ".DS_Store",
        ]),
        (file_name) => {
          if (
            fs.lstatSync(`${config.pluginsPath}/${file_name}`).isDirectory()
          ) {
            return {
              plugin_id: file_name,
              version: _.difference(
                fs.readdirSync(`${config.pluginsPath}/${file_name}`),
                [".DS_Store"]
              ),
              type: "local",
            };
          }
        }
      );
      this.localLastPlugin = _.map(
        _.difference(fs.readdirSync(`${config.pluginsPath}/`), [
          "list.json",
          "npm_i.sh",
          ".DS_Store",
        ]),
        (file_name) => {
          if (
            fs.lstatSync(`${config.pluginsPath}/${file_name}`).isDirectory()
          ) {
            const versionLs = _.difference(
              fs.readdirSync(`${config.pluginsPath}/${file_name}`),
              [".DS_Store"]
            ).sort(this.versionFn);
            return {
              plugin_id: file_name,
              version: versionLs[versionLs.length - 1],
              type: "local",
            };
          }
          return {
            plugin_id: file_name,
            version: 0,
            type: "local",
          };
        }
      );

      pluginLs = _.concat(pluginLs, this.localLastPlugin);

      let shapeList = null;
      let conventionHeight = null;
      if (this.size == "mini") {
        shapeList = require("@/views/project/miniNodeConfig.json");
        conventionHeight = 29;
      } else if (this.size == "small") {
        shapeList = require("@/views/project/smallNodeConfig.json");
        conventionHeight = 39;
      } else {
        shapeList = require("@/views/project/mediumNodeConfig.json");
        conventionHeight = 48;
      }

      // 整理list
      const list = [];
      _.each(pluginLs, (item) => {
        let package_json = "";
        let operations = "";
        let package_json_path =
          (package_json_path = `${config.pluginsPath}/${item.plugin_id}/${item.version}/package.json`);
        if (fs.existsSync(package_json_path)) {
          package_json = fse.readJsonSync(package_json_path);
          operations = package_json.uiauto_config.operations;
        }

        _.each(operations, (operation) => {
          const target = _.find(list, {
            id:
              operation.attribution_id ||
              package_json.uiauto_config.attribution_id,
          });
          const target_msg = {
            label: operation.operation_name,
            operation_id: operation.operation_id,
            category_id: operation.category_id,
            plugin_id: package_json.id,
            data_label: operation.operation_name,
            data_type: "node",
            data_shape: shapeList[operation.type].data_shape,
            data_shape_type: operation.type,
            data_size:
              operation.type == "Convention"
                ? `${
                    (operation.operation_name.length + 2) * 16
                  } * ${conventionHeight}`
                : shapeList[operation.type].data_size,
            data_color: shapeList[operation.type].data_color,
            background_color: operation.background_color || "#3a71a8",
            input: JSON.stringify(operation.input),
            output: JSON.stringify(operation.output),
            operation_name: operation.operation_name,
            category_name: operation.category_name,
            version: package_json.version,
            language: package_json.language,
            attribution_name:
              operation.attribution_name ||
              package_json.uiauto_config.attribution_name,
            type: item.type,
            update: item.update,
          };
          if (target) {
            target.children.push(target_msg);
          } else {
            list.push({
              type: item.type,
              label:
                operation.attribution_name ||
                package_json.uiauto_config.attribution_name,
              id:
                operation.attribution_id ||
                package_json.uiauto_config.attribution_id,
              children: [target_msg],
            });
          }
        });
      });
      let returnList = [];
      _.each(list, (listItem, idx) => {
        returnList = [];
        _.each(listItem.children, (msgItem) => {
          const target = _.find(returnList, { id: msgItem.category_id });
          if (target) {
            target.children.push(msgItem);
          } else {
            returnList.push({
              label: msgItem.category_name,
              id: msgItem.category_id,
              children: [msgItem],
              type: _.find(pluginLs, { plugin_id: msgItem.plugin_id })
                ? _.find(pluginLs, { plugin_id: msgItem.plugin_id }).type
                : "",
            });
          }
        });
        list[idx].children = returnList;
      });
      return list;
    },
    // 获取本地项目集
    getProjectList() {
      const self = this;
      if (config.projectsPath) {
        const files = _.difference(fs.readdirSync(`${config.projectsPath}/`), [
          ".DS_Store",
        ]);
        files.forEach(function (fileName, index) {
          const file = fs.statSync(`${config.projectsPath}/${fileName}`);
          if (file.isDirectory()) {
            if (
              fs.existsSync(
                `${config.projectsPath}/${fileName}/${fileName}.json`
              )
            ) {
              let json = fse.readJsonSync(
                `${config.projectsPath}/${fileName}/${fileName}.json`
              );
              if (json.project_type !== "folder") {
                self.localProjectsLs.push({
                  project_name: json.project_name,
                  project_type: json.project_type,
                });
              }
            }
          }
        });
      }
    },
    openBrowser(val) {
      window["executor"]
        .execute_python(
          path.normalize(
            `${path.resolve()}/public/base_integration/uiauto_executor/base/browser.py`
          ),
          "open_browser",
          {
            browser_type: val,
            webdriver_dir: path.normalize(
              os.platform()
                ? `${path.resolve()}\\env\\webdriver\\win32\\`
                : `${path.resolve()}/env/webdriver/linux/`
            ),
          }
        )
        .then(async (result) => {
          fs.writeFileSync(
            path.normalize(`${os.homedir()}/.uiauto/browser.json`),
            JSON.stringify(result)
          );
        })
        .catch((error) => {
          console.error(error);
        });
    },
    handleShowIf(item) {
      // filter
      if (!item.show_if) return true;

      // define values
      const $input = {};

      // 整理store_input_obj
      _.each(this.store_input, (input_group) => {
        const group_id = input_group.id;
        $input[group_id] = {};
        _.each(input_group.properties, (property) => {
          $input[group_id][property.id] = property.value;
        });
      });

      try {
        // 检查对应关系
        const result = !!eval(item.show_if);
        return result;
      } catch (error) {
        return false;
      }
    },
    checkShowIfValue(input, item) {
      // filter
      if (!item.show_if) return true;

      // define values
      const $input = {};

      _.each(input, (input_group) => {
        const group_id = input_group.id;
        $input[group_id] = {};
        _.each(input_group.properties, (property) => {
          $input[group_id][property.id] = property.value;
        });
      });

      try {
        // 检查对应关系
        const result = !!eval(item.show_if);
        return result;
      } catch (error) {
        return false;
      }
    },
    toolClick(val) {
      if (val === "run") {
        this.saveGraph("run").then((saveGraphRes) => {
          if (saveGraphRes) {
            if (this.execute_params.length) {
              this.executeParamsDialog = true;
            } else {
              this.execute();
            }
          }
        });
      } else if (val === "stop") {
        window["executor"].restart();
        this.loading = false;
        this.$message.success("停止成功");
        this.$store.commit("socket/ACTUATOR_STATUS", {
          actuatorStatus: "free",
        });
      }
    },
    execute() {
      if (this.$store.state.socket.actuatorStatus != "running") {
        this.$store.commit("socket/ACTUATOR_STATUS", {
          actuatorStatus: "running",
        });
        const self = this;
        if (!this.loading) {
          this.loading = true;
          electron.window_minimize();

          let browser_info = {};
          const browser_info_path = path.normalize(
            `${os.homedir()}/.uiauto/browser.json`
          );
          if (fs.existsSync(browser_info_path)) {
            browser_info = JSON.parse(fs.readFileSync(browser_info_path));
          }

          window["executor"]
            .execute(
              this.projectJson.project_name,
              _.assign(
                {
                  uiauto_browser: browser_info,
                  uiauto_task_id: null,
                },
                _.zipObject(
                  _.map(this.global_variable, "key"),
                  _.map(this.global_variable, "value")
                ),
                _.zipObject(
                  _.map(this.execute_params, "key"),
                  _.map(this.execute_params, "value")
                )
              ),
              {
                newCB: (newLogs) => {
                  this.logMessage = _.concat(this.logMessage, newLogs);
                  setTimeout(() => {
                    $("#logMessageId").scrollTop(
                      $("#logMessageBox")[0].offsetHeight
                    );
                  }, 0);
                },
                updateLog: updateLog,
                socket_client: socket.getSocketClient(),
              }
            )
            .then((res) => {
              console.log("-=-=-=执行成功-=-=-=-=");
              console.log(res);
              self.loading = false;
              electron.window_maximize();
              this.$store.commit("socket/ACTUATOR_STATUS", {
                actuatorStatus: "free",
              });
            })
            .catch((err) => {
              console.log("-=-=-=执行出错-=-=-=-=");
              console.log(err);
              self.loading = false;
              electron.window_maximize();
              this.$message.warning("执行出错");
              this.$store.commit("socket/ACTUATOR_STATUS", {
                actuatorStatus: "free",
              });
            });
        } else {
          this.$message.warning("正在执行，请稍候…");
        }
      } else {
        this.$message.warning(
          "有任务正在执行，请等待任务完成后或者停止当前任务再执行"
        );
      }
    },
    // 画布保存方法
    saveGraph(type) {
      const self = this;
      const saveFn = function (resolve, reject) {
        // 获取当前page
        const page = self.editor.getCurrentPage();
        // 保存画布
        const data = page.save();
        // 收集必填项未填值信息
        const errorMessage = [];
        _.each(data.nodes, (node) => {
          if (!node.general_property) {
            node.general_property = self.general_property_temporary;
          }
          typeof node.output === "string" &&
            (node.output = JSON.parse(node.output));
          typeof node.input === "string" &&
            (node.input = JSON.parse(node.input));
          if (node.input.length) {
            _.each(node.input, (inputItem) => {
              if (
                inputItem.id === "required_params" &&
                inputItem.properties.length
              ) {
                _.each(inputItem.properties, (propertiesItem) => {
                  if (
                    propertiesItem.required &&
                    !propertiesItem.value &&
                    self.checkShowIfValue(node.input, propertiesItem)
                  ) {
                    errorMessage.push({
                      label: node.label,
                      properties_name: propertiesItem.name,
                      value: propertiesItem.value,
                    });
                  }
                });
              }
            });
          }
        });

        var writeJson = _.extend(
          { project_name: self.projectJson.project_name },
          { name: self.projectJson.name },
          { createAt: self.projectJson.createAt },
          { updateAt: moment().format("YYYY-MM-DD HH:mm:ss") },
          { project_type: self.projectType },
          { cron: self.projectJson.cron },
          { automatic_recording: self.projectJson.automatic_recording },
          { record_file_path: self.projectJson.record_file_path },
          { retry_count: self.projectJson.retry_count },
          { retry_interval: self.projectJson.retry_interval },
          { time_out: self.projectJson.time_out },
          { description: self.description },
          { global_variable: self.global_variable },
          { isExecuteParams: self.projectJson.isExecuteParams },
          { execute_params: self.projectJson.execute_params },
          data
        );

        if (errorMessage.length) {
          const confirmText = _.map(_.chunk(errorMessage, 5)[0], (msg) => {
            return `节点：${msg.label}  属性：${msg.properties_name}值为空`;
          });
          _.chunk(errorMessage, 5).length > 1 &&
            confirmText.push(`...等${errorMessage.length - 5}个`);

          const newDatas = [];
          for (const i in confirmText) {
            newDatas.push(self.$createElement("p", null, confirmText[i]));
          }
          self
            .$confirm("提示", {
              title: "提示",
              message: self.$createElement("div", null, newDatas),
              showCancelButton: true,
              confirmButtonText: "继续",
              cancelButtonText: "取消",
              type: "warning",
            })
            .then(() => {
              fs.writeFileSync(
                `${config.projectsPath}/${self.projectJson.project_name}/${self.projectJson.project_name}.json`,
                JSON.stringify(writeJson, null, "\t"),
                "utf8"
              );
              // 更新全局projectJson
              self.projectJson = writeJson;
              type === "save" && self.$message.success("保存成功");

              resolve(true);
            })
            .catch(() => {
              reject(false);
            });
        } else {
          fs.writeFileSync(
            `${config.projectsPath}/${self.projectJson.project_name}/${self.projectJson.project_name}.json`,
            JSON.stringify(writeJson, null, "\t"),
            "utf8"
          );

          // 更新全局projectJson
          self.projectJson = writeJson;
          type === "save" && self.$message.success("保存成功");

          resolve(true);
        }
      };

      return new Promise((resolve, reject) => {
        saveFn(resolve, reject);
      });
    },
    // 修改Node的label
    changeValue(obj) {
      const self = this;
      let conventionHeight = null;
      if (this.size == "mini") {
        conventionHeight = 29;
      } else if (this.size == "small") {
        conventionHeight = 39;
      } else {
        conventionHeight = 48;
      }
      if (obj == "line") {
        const editor = this.editor;
        editor.executeCommand(() => {
          const page = editor.getCurrentPage();
          const selectedItems = page.getSelected();
          selectedItems.forEach((item) => {
            page.update(item.id, {
              label: self.nodeLabel,
              size: `${(self.nodeLabel.length + 2) * 16} * ${conventionHeight}`,
            });
          });
        });
      } else {
        if (obj == "output") {
          const editor = this.editor;
          editor.executeCommand(() => {
            const page = editor.getCurrentPage();
            const selectedItems = page.getSelected();
            selectedItems.forEach((item) => {
              page.update(item.id, {
                output: self.output,
              });
            });
          });
        } else if (
          [
            "retry_count",
            "retry_interval",
            "execution_timeout",
            "delayed_execution_time",
            "waiting_time_after_execution",
          ].includes(obj)
        ) {
          const editor = this.editor;
          editor.executeCommand(() => {
            const page = editor.getCurrentPage();
            const selectedItems = page.getSelected();
            selectedItems.forEach((item) => {
              page.update(item.id, {
                general_property: self.general_property,
              });
            });
          });
        } else {
          var targetInputGroup = _.find(self.store_input, { id: obj.input_id });
          var targetInputProperty = _.find(targetInputGroup.properties, {
            id: obj.property_id,
          });
          targetInputProperty.value = obj.value;
          const editor = this.editor;
          editor.executeCommand(() => {
            const page = editor.getCurrentPage();
            const selectedItems = page.getSelected();
            selectedItems.forEach((item) => {
              page.update(item.id, {
                input: self.input,
              });
            });
          });
        }
      }
    },
    // 初始化
    initG6Editor() {
      // this
      const self = this;
      // G6Editor
      const editor = new G6Editor();
      // editor挂载到Vue
      this.editor = editor;
      // Flow
      const Flow = G6Editor.Flow;
      // Command
      const Command = G6Editor.Command;

      // 关闭体验改进计划打点请求
      G6Editor.track(false);

      // 定义Save命令
      Command.registerCommand("save", {
        // 命令是否进入队列，默认是 true
        queue: false,
        // 命令是否可用
        enable(eidtor) {
          return true;
        },
        // 正向命令
        execute(eidtor) {
          self.saveGraph("save");
        },
        // 快捷键：Ctrl + S
        shortcutCodes: [
          ["metaKey", "s"],
          ["ctrlKey", "s"],
        ],
      });

      // 主画布
      // Mind 思维导图
      // Koni 网络图、拓扑图
      // Flow 流程图
      const page = new G6Editor.Flow({
        graph: {
          container: "page",
        },
        shortcut: {
          // 开启自定义命令保存的快捷键
          save: true,
        },
      });

      // 设置边样式，内置3种样式
      // flow-polylinels
      // flow-polyline-round
      // flow-smooth
      page.getGraph().edge({
        shape: "flow-polyline",
      });

      // 自定义节点
      Flow.registerNode("customNode", {
        draw(item) {
          const group = item.getGraphicGroup();
          const model = item.getModel();
          group.addShape("text", {
            attrs: {
              x: 0,
              y: 0,
              fill: "#333",
              text: model.label,
            },
          });
          // group.addShape("text", {
          //   attrs: {
          //     x: 0,
          //     y: 0,
          //     fill: "#333",
          //     text: " (" + model.x + ", " + model.y + ") \n 原点是组的图坐标",
          //     textBaseline: "top"
          //   }
          // });

          return group.addShape("rect", {
            attrs: {
              x: 0,
              y: 0,
              width: 44,
              height: 44,
              stroke: "red",
            },
          });
        },
      });

      // 元素面板栏
      const itempannel = new G6Editor.Itempannel({
        container: "itempannel",
      });

      // 工具栏
      const toolbar = new G6Editor.Toolbar({
        container: "toolbar",
      });

      // 详细面板
      const detailpannel = new G6Editor.Detailpannel({
        container: "detailpannel",
      });

      // 右键菜单
      const contextmenu = new G6Editor.Contextmenu({
        container: "contextmenu",
      });

      // 缩略图
      // const minimap = new G6Editor.Minimap({
      //   container: "minimap",
      //   height: document.getElementById("minimapId").offsetHeight,
      //   width: document.getElementById("minimapId").offsetWidth
      // });
      // 组件挂载到Editor
      editor.add(page);
      editor.add(itempannel);
      editor.add(toolbar);
      editor.add(detailpannel);
      editor.add(contextmenu);
      // editor.add(minimap);
      // 挂载到window，方便调试
      window.editor = editor;

      // 获取当前page
      const currentPage = editor.getCurrentPage();
      currentPage.on("afterchange", (e) => {
        if (e.action === "add") {
          if (e.model.shapeType === "Start" || e.model.shapeType === "End") {
            const nodes = this.editor.getCurrentPage().getNodes();
            for (const item of nodes) {
              if (
                item.model.shapeType === e.model.shapeType &&
                item.model.id !== e.model.id
              ) {
                this.editor.getCurrentPage().remove(e.item);
                this.$message.warning("只能有一个开始节点或结束节点");
              }
            }
          }
        }
      });
      // 监听鼠标按下事件
      currentPage.on("mousedown", (ev) => {
        self.nodeLabelShow = false;
        self.nodeLineLabelShow = false;
        self.operationName = "";
        self.categoryName = "";
        self.attributionName = "";
        self.language = "";
        self.version = "";
      });

      // 监听节点双击
      currentPage.on("node:dblclick", (ev) => {
        if (ev.item.isNode) {
          if (
            !this.queryData.currentProjectName &&
            !this.queryData.currentProjectType
          ) {
            const subprocess_project_name =
              ev.item.model.input[0].properties[0].value;
            if (ev.item.model.shapeType === "Subprocess") {
              this.$confirm(
                `是否编辑子流程(${subprocess_project_name})?`,
                "提示",
                {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                }
              )
                .then(() => {
                  const target = _.find(this.localProjectsLs, {
                    project_name: subprocess_project_name,
                  });
                  if (target) {
                    this.saveGraph("save").then((res) => {
                      if (res) {
                        this.$router.push({
                          path: "/project",
                          query: {
                            currentProjectName: this.projectJson.project_name,
                            currentProjectType: this.projectType,
                            redirectProjectName: target.project_name,
                            redirectProjectType: target.project_type,
                          },
                        });
                      }
                    });
                  } else {
                    this.$message.warning(
                      `本地未存在${subprocess_project_name}项目`
                    );
                  }
                })
                .catch(() => {});
            }
          } else {
            this.$message.warning(`您已在子流程中，无法继续跳转其它子流程`);
          }
        }
      });

      // 监听连线事件
      currentPage.on("dragedge:beforeshowanchor", (ev) => {
        const source = ev.source;
        const sourceId = ev.source.id;
        const target = ev.target;
        const targetId = target.model.id;
        // 每个结点不能连自身
        if (sourceId == targetId) {
          ev.cancel = true;
        }
      });
      // 监听选择变化 (选中)
      currentPage.on("afteritemselected", (ev) => {
        // 选择对象为Node节点
        if (ev.item.isNode) {
          // 获取属性
          const nm = _.cloneDeep(ev.item.getModel());
          self.currentNmModel = ev.item.getModel();
          self.currentNode = nm;
          typeof nm.input === "string" && (nm.input = JSON.parse(nm.input));
          typeof nm.output === "string" && (nm.output = JSON.parse(nm.output));
          self.input = nm.input;
          self.output = nm.output;
          self.general_property =
            nm.general_property || _.cloneDeep(self.general_property_temporary);
          self.nodeLabelShow = true;
          self.nodeLineLabelShow = true;
          self.nodeLabel = nm.label;
          self.operationName = nm.operationName;
          self.categoryName = nm.categoryName;
          self.attributionName = nm.attributionName;
          self.language = nm.language;
          self.version = nm.version;
          self.isShowDescription = false;
          self.findPluginVersionLs(nm.plugin_id);
        }

        // 选择对象为Edge节点
        if (ev.item.isEdge) {
          // 获取属性
          const nm = ev.item.getModel();
          self.nodeLineLabelShow = true;
          self.nodeLabelShow = false;
          self.nodeLabel = nm.label;
          self.operationName = "";
          self.categoryName = "";
          self.attributionName = "";
          self.language = "";
          self.version = "";
          self.isShowDescription = false;
        }
      });

      // 监听选择变化 (取消选中)
      currentPage.on("afteritemunselected", (e) => {
        self.currentNode = {};
        self.operationName = "";
        self.categoryName = "";
        self.attributionName = "";
        self.language = "";
        self.version = "";
        self.isShowDescription = true;
      });

      try {
        const data = {
          nodes: this.projectJson.nodes,
          edges: this.projectJson.edges,
        };
        const curPage = self.editor.getCurrentPage();
        curPage.read(data);
      } catch (error) {}
    },
    initTerminal() {
      let initFn;
      if (os.platform() == "darwin" && path.resolve() == "/") {
        const { init } =
          window.nodeRequire(
            path.normalize(
              app.getPath("exe") +
                "../../../public/base_integration/uiauto_logMonitor/logMonitor.js"
            )
          ) ||
          window.nodeRequire(
            path.normalize(app.getPath("exe") + "../../../global/logMonitor.js")
          );
        initFn = init;
      } else {
        const { init } =
          window.nodeRequire(
            path.normalize(
              path.resolve() +
                "/public/base_integration/uiauto_logMonitor/logMonitor.js"
            )
          ) ||
          window.nodeRequire(
            path.normalize(path.resolve() + "/global/logMonitor.js")
          );
        initFn = init;
      }

      initFn(
        this.projectJson.project_name,
        (historyLogs) => {
          this.logMessage = _.concat(this.logMessage, historyLogs);
          this.logMessage.push("=======   历史日志   =======");
        },
        (newLogs) => {
          this.logMessage = _.concat(this.logMessage, newLogs);
          setTimeout(() => {
            $("#logMessageId").scrollTop($("#logMessageBox")[0].offsetHeight);
          }, 0);
        }
      );
    },
    // 执行当前节点
    async executecurrentNode() {
      if (this.$store.state.socket.actuatorStatus != "running") {
        if (JSON.stringify(this.currentNode) == "{}") {
          this.$message.error("请选择需要执行的节点");
        } else {
          this.saveGraph("save").then((res) => {
            if (res) {
              let browser_info = {};
              const browser_info_path = path.normalize(
                `${os.homedir()}/.uiauto/browser.json`
              );
              if (fs.existsSync(browser_info_path)) {
                browser_info = JSON.parse(fs.readFileSync(browser_info_path));
              }

              electron.window_minimize();
              window["executor"]
                .execute_node(
                  this.projectJson.project_name,
                  {
                    uiauto_browser: browser_info,
                    node_id: this.currentNode.id,
                  },
                  {
                    newCB: (newLogs) => {
                      this.logMessage = _.concat(this.logMessage, newLogs);
                      setTimeout(() => {
                        $("#logMessageId").scrollTop(
                          $("#logMessageBox")[0].offsetHeight
                        );
                      }, 0);
                    },
                  }
                )
                .then((result) => {
                  electron.window_maximize();
                  console.log("执行当前节点成功", result);
                  this.$message.success("执行当前节点成功");
                })
                .catch((err) => {
                  console.log("执行当前节点出错", err);
                  electron.window_maximize();
                  this.$message.error("执行当前节点出错");
                });
            }
          });
        }
      } else {
        this.$message.warning(
          "有任务正在执行，请等待任务完成后或者停止当前任务再执行"
        );
      }
    },
    // 更新项目插件版本号
    async updateVersionFn() {
      let base_integration_path;
      if (os.platform() == "darwin" && path.resolve() == "/") {
        base_integration_path = path.normalize(
          app.getPath("exe") + "../../../public/base_integration/"
        );
      } else {
        base_integration_path = path.join(
          path.resolve(),
          "/public/base_integration/"
        );
      }
      const base_integration_file_list = _.map(
        _.difference(fs.readdirSync(base_integration_path), [".DS_Store"]),
        (file_name) => {
          return {
            plugin_id: fs.existsSync(
              `${base_integration_path}${file_name}/package.json`
            )
              ? fse.readJsonSync(
                  `${base_integration_path}${file_name}/package.json`
                ).id
              : file_name,
            version: fs.existsSync(
              `${base_integration_path}${file_name}/package.json`
            )
              ? fse.readJsonSync(
                  `${base_integration_path}${file_name}/package.json`
                ).version
              : "",
          };
        }
      );

      const plugins_path = config.pluginsPath + "/";
      let file_name_list = _.map(
        _.difference(fs.readdirSync(plugins_path), [
          "list.json",
          "npm_i.sh",
          ".DS_Store",
        ]),
        (file_name) => {
          if (
            fs.lstatSync(`${config.pluginsPath}/${file_name}`).isDirectory()
          ) {
            const versionLs = _.difference(
              fs.readdirSync(`${plugins_path}${file_name}`),
              [".DS_Store"]
            ).sort(this.versionFn);
            return {
              plugin_id: file_name,
              version: versionLs[versionLs.length - 1],
            };
          }
          return {
            plugin_id: file_name,
            version: 0,
          };
        }
      );
      file_name_list = _.concat(file_name_list, base_integration_file_list);
      // 当前json
      const projectJson = _.cloneDeep(
        await this.editor.getCurrentPage().save()
      );

      this.$confirm("此操作将使用本地插件库最新插件版本号, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          _.each(projectJson.nodes, (item) => {
            const target = _.find(file_name_list, {
              plugin_id: item.plugin_id,
            });
            if (target) {
              item.version = target.version;
            }
          });
          const curPage = this.editor.getCurrentPage();
          curPage.read(projectJson);
          this.saveGraph("save");
        })
        .catch(() => {});
    },
    // 版本号排序
    versionFn(str1, str2) {
      var arr1 = str1.split(".");
      var arr2 = str2.split(".");
      var minLen = Math.min(arr1.length, arr2.length);
      var maxLen = Math.max(arr1.length, arr2.length);

      for (let i = 0; i < minLen; i++) {
        if (parseInt(arr1[i]) > parseInt(arr2[i])) {
          return 1;
        } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
          return -1;
        }
        if (i + 1 == minLen) {
          if (arr1.length > arr2.length) {
            return 1;
          } else {
            return -1;
          }
        }
      }
    },
    findPlugin() {
      this.filterText = this.operationName;
    },
    // 返回主流程
    backToMain() {
      this.saveGraph("save").then((res) => {
        if (res) {
          this.$router.push({
            path: "/project",
            query: {
              currentProjectName: "",
              currentProjectType: "",
              redirectProjectName: this.queryData.currentProjectName,
              redirectProjectType: this.queryData.currentProjectType,
            },
          });
        }
      });
    },
    async findPluginVersionLs(plugin_id) {
      if (fs.existsSync(`${config.pluginsPath}/${plugin_id}/`)) {
        this.currentPluginVersionLsInfo = _.map(
          _.difference(fs.readdirSync(`${config.pluginsPath}/${plugin_id}/`), [
            "list.json",
            "npm_i.sh",
            ".DS_Store",
          ]),
          (version) => {
            if (
              fs
                .lstatSync(`${config.pluginsPath}/${plugin_id}/${version}`)
                .isDirectory()
            ) {
              const package_json_path = `${config.pluginsPath}/${plugin_id}/${version}/package.json`;
              let package_json = "";
              if (fs.existsSync(package_json_path)) {
                package_json = fse.readJsonSync(package_json_path);
              }
              return {
                plugin_id: plugin_id,
                version: version,
                plugin_package_json: package_json,
                type: "local",
              };
            }
          }
        );
      }
      this.currentPluginVersionLs = _.map(
        this.currentPluginVersionLsInfo,
        "version"
      ).sort(this.versionFn);
    },
    changePluginVersion() {
      const cloneNmModel = _.cloneDeep(this.currentNmModel);
      const targetVersionInfo = _.find(
        _.find(this.currentPluginVersionLsInfo, { version: this.version })
          .plugin_package_json.uiauto_config.operations,
        { operation_id: this.currentNmModel.operation_id }
      );
      this.input = targetVersionInfo.input;
      this.output = targetVersionInfo.output;
      // 改变内存版本号（影响全局）
      this.currentNmModel.version = this.version;
      this.currentNmModel.input = this.input;
      this.currentNmModel.output = this.output;
      // 原本存在值则在新插件赋值
      _.each(this.currentNmModel.input, (attributes_item) => {
        _.each(attributes_item.properties, (item) => {
          const find_attributes_item = _.find(cloneNmModel.input, {
            id: attributes_item.id,
          });
          const findValue =
            find_attributes_item &&
            _.find(find_attributes_item.properties, { id: item.id });
          if (findValue && findValue.value) {
            item.value = findValue.value;
          }
        });
      });
      this.currentNmModel.output.value = cloneNmModel.output.value
        ? cloneNmModel.output.value
        : this.currentNmModel.output.value;
    },
    addGlobalVariable() {
      if (
        _.find(this.global_variable, { key: "" }) ||
        _.find(this.global_variable, { value: "" })
      ) {
        return this.$message.error("存在未填写值");
      }
      this.global_variable.push({
        key: "",
        type: "text",
        value: "",
      });
    },
    checkNewExtendEl(row) {
      return row.key && row.type && row.value;
    },
    handleDelete(index) {
      this.global_variable.splice(index, 1);
    },
    handleConfirm() {
      if (
        _.uniq(_.map(this.global_variable, "key")).length !=
        this.global_variable.length
      ) {
        return this.$message.error("存在相同属性名");
      }
      if (
        _.find(this.global_variable, {
          key: "",
        }) ||
        _.find(this.global_variable, {
          value: "",
        })
      ) {
        return this.$message.error("存在未填写值");
      }
      this.globalVariableDialog = false;
    },
    openGlobalVariableDialog() {
      // 使右边属性栏刷新数据
      this.nodeLabelShow = false;
      this.nodeLineLabelShow = false;
      this.operationName = "";
      this.categoryName = "";
      this.attributionName = "";
      this.language = "";
      this.version = "";

      this.globalVariableDialog = true;

      _.each(this.editor.getCurrentPage().save().nodes, (item) => {
        if (item.output.is_allow_global_use) {
          this.node_variable.push({
            label: item.label,
            operation_id: item.operation_id,
            value: item.output.value,
          });
        }
      });
    },
    handleCloseGlobalVariableDialog() {
      this.globalVariableDialog = false;
      this.node_variable = [];
      _.remove(this.global_variable, (item) => {
        return !item.key || !item.value;
      });
    },
    handleOpenBrowser(label) {
      if (label == "启动谷歌浏览器") {
        this.openBrowser("Chrome");
      } else if (label == "启动IE浏览器") {
        this.openBrowser("Internet Explorer");
      }
    },
    // 依赖检测
    async handleDetection() {
      this.detectionDialog = true;
      this.detectionLoading = true;

      // 当前项目所依赖的 插件-版本 集合
      let plugin_version_list = [];
      _.each(this.projectJson.nodes, (item) => {
        if (
          !_.find(plugin_version_list, {
            plugin_id: item.plugin_id,
            version: item.version,
          })
        ) {
          plugin_version_list.push({
            plugin_id: item.plugin_id,
            version: item.version,
          });
        }
      });
      this.detectionData = plugin_version_list;

      // 整理需要下载安装的插件
      let need_download_plugin = [];
      let target_need_download_plugin = [];
      _.each(plugin_version_list, (p_v_item) => {
        if (
          !fs.existsSync(`${config.pluginsPath}/${p_v_item.plugin_id}`) ||
          !fs.existsSync(
            `${config.pluginsPath}/${p_v_item.plugin_id}/${p_v_item.version}`
          )
        ) {
          need_download_plugin.push(p_v_item);
        }
      });

      _.each(this.detectionData, (item) => {
        let target = _.find(need_download_plugin, {
          plugin_id: item.plugin_id,
          version: item.version,
        });
        !target && (item.message = `本地已安装`);
      });

      this.detectionLoading = false;
      if (need_download_plugin.length) {
        // 整理插件下载信息
        let _pluginViews = (
          await pluginViews({
            needs: "all",
            PluginIds: _.map(need_download_plugin, "plugin_id").join(","),
          })
        ).result;
        if (_pluginViews.length) {
          _.each(need_download_plugin, (item) => {
            let temp = _.find(_pluginViews, {
              pluginId: item.plugin_id,
              version: item.version,
            });
            if (temp) {
              target_need_download_plugin.push(temp);
            } else {
              let index = _.findIndex(this.detectionData, {
                plugin_id: item.plugin_id,
                version: item.version,
              });
              if (index) {
                this.$set(this.detectionData, index, {
                  plugin_id: item.plugin_id,
                  version: item.version,
                  message: `线上插件库未找到该版本插件`,
                });
              }
            }
          });
        } else {
          _.each(need_download_plugin, (item) => {
            let index = _.findIndex(this.detectionData, {
              plugin_id: item.plugin_id,
              version: item.version,
            });
            if (index) {
              this.$set(this.detectionData, index, {
                plugin_id: item.plugin_id,
                version: item.version,
                message: `线上插件库未找到该版本插件`,
              });
            }
          });
        }
      }

      if (target_need_download_plugin.length) {
        async.mapSeries(
          target_need_download_plugin,
          (item, cb) => {
            let _item = _.cloneDeep(item);
            _item.plugin_id = item.pluginId;
            _item.isUiautoBaseIntegration = eval(item.isUiautoBaseIntegration);
            executeDownload(_item)
              .then((res) => {
                cb(null, {
                  plugin_id: item.pluginId,
                  version: item.version,
                });
              })
              .catch((err) => {
                cb(null, {
                  plugin_id: item.pluginId,
                  version: item.version,
                });
              });
          },
          (err, res) => {
            this.$forceUpdate();
          }
        );
      }
    },
    // 关闭依赖检测框
    handleDetectionDialog() {
      this.detectionDialog = false;
      this.detectionData = [];
    },
    // 关闭执行参数框
    handleExecuteParamsDialog() {
      this.executeParamsDialog = false;
    },
    handleExecuteParamsConfirm() {
      if (
        _.compact(_.map(this.execute_params, "key")).length !=
        _.compact(_.map(this.execute_params, "value")).length
      ) {
        return this.$message.error("存在未填写值");
      } else {
        this.executeParamsDialog = false;
        this.execute();
      }
    },
  },
  async beforeRouteLeave(to, from, next) {
    // 按键恢复
    document.onkeydown = function (event) {
      var e = event || window.event;
      e.returnValue = true;
    };

    // 移除监听
    erd.uninstall($(".main-container"));

    const projectObj = {};
    if (this.projectJson.nodes) {
      projectObj.nodes = this.projectJson.nodes;
    }
    if (this.projectJson.edges) {
      projectObj.edges = this.projectJson.edges;
    }
    // 当前json
    const projectOtherObj = await this.editor.getCurrentPage().save();

    _.each(projectOtherObj.nodes, (node_item) => {
      typeof node_item.input === "string" &&
        (node_item.input = JSON.parse(node_item.input));
      typeof node_item.output === "string" &&
        (node_item.output = JSON.parse(node_item.output));
    });

    await _.each(projectOtherObj.nodes, (node) => {
      if (!node.general_property) {
        node.general_property = this.general_property_temporary;
      }
    });

    if (
      !_.isEqual(projectObj, projectOtherObj) ||
      this.description != this.projectJson.description ||
      !_.isEqual(this.global_variable, this.projectJson.global_variable)
    ) {
      this.$confirm(
        "检测到未保存的内容，是否在离开页面前保存修改？",
        "确认信息",
        {
          showClose: false,
          closeOnClickModal: false,
          confirmButtonText: "保存离开",
          cancelButtonText: "直接离开",
        }
      )
        .then(() => {
          this.saveGraph("save").then((res) => {
            if (res) {
              next();
            }
          });
        })
        .catch(() => {
          next();
        });
    } else {
      next();
    }
  },
};
</script>

<style lang="scss">
.el-tree-node {
  margin: 5px 0;
}

.el-tooltip__popper {
  font-size: 10px;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.splitter-pane-resizer {
  background: #fff !important;
}
</style>

<style lang="scss" scoped>
::-webkit-scrollbar {
  display: none;
}

::v-deep .el-input__inner {
  border-radius: 0;
}

::v-deep .el-dialog__body {
  padding: 5px 20px;
}

// ---------终端样式开始----------
::v-deep .xterm {
  font-feature-settings: "liga" 0;
  position: relative;
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
}

::v-deep .xterm.focus,
.xterm:focus {
  outline: none;
}

::v-deep .xterm .xterm-helpers {
  position: absolute;
  top: 0;
  /**
       * The z-index of the helpers must be higher than the canvases in order for
       * IMEs to appear on top.
       */
  z-index: 10;
}

::v-deep .xterm .xterm-helper-textarea {
  /*
       * HACK: to fix IE's blinking cursor
       * Move textarea out of the screen to the far left, so that the cursor is not visible.
       */
  position: absolute;
  opacity: 0;
  left: -9999em;
  top: 0;
  width: 0;
  height: 0;
  z-index: -10;
  /** Prevent wrapping so the IME appears against the textarea at the correct position */
  white-space: nowrap;
  overflow: hidden;
  resize: none;
}

::v-deep .xterm .composition-view {
  /* TODO: Composition position got messed up somewhere */
  background: #000;
  color: #fff;
  display: none;
  position: absolute;
  white-space: nowrap;
  z-index: 1;
}

::v-deep .xterm .composition-view.active {
  display: block;
}

::v-deep .xterm .xterm-viewport {
  /* On OS X this is required in order for the scroll bar to appear fully opaque */
  background-color: #000;
  overflow-y: scroll;
  cursor: default;
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
}

::v-deep .xterm .xterm-screen {
  position: relative;
}

::v-deep .xterm .xterm-screen canvas {
  position: absolute;
  left: 0;
  top: 0;
}

::v-deep .xterm .xterm-scroll-area {
  visibility: hidden;
}

::v-deep .xterm-char-measure-element {
  display: inline-block;
  visibility: hidden;
  position: absolute;
  top: 0;
  left: -9999em;
  line-height: normal;
}

::v-deep .xterm {
  cursor: text;
}

::v-deep .xterm.enable-mouse-events {
  /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
  cursor: default;
}

::v-deep .xterm.xterm-cursor-pointer {
  cursor: pointer;
}

::v-deep .xterm.column-select.focus {
  /* Column selection mode */
  cursor: crosshair;
}

::v-deep .xterm .xterm-accessibility,
.xterm .xterm-message {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  color: transparent;
}

::v-deep .xterm .live-region {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

::v-deep .xterm-dim {
  opacity: 0.5;
}

::v-deep .xterm-underline {
  text-decoration: underline;
}

// ---------终端样式结束----------

::v-deep .el-collapse-item__content {
  padding-bottom: 0px;
}

::v-deep .el-col-15 {
  padding: 0 !important;
  border-top: 10px solid #eee;
}

::v-deep .el-row {
  margin-left: 0px !important;
  margin-right: 0px !important;
}

::v-deep .el-collapse-item__header {
  height: 35px;
}

::v-deep .el-input-group__prepend {
  padding: 0 10px;
}

::v-deep .el-input-group__prepend {
  color: #303133;
}

.navbar {
  height: 40px;
  overflow: hidden;
  position: relative;
  background: #fff;

  .left-menu {
    float: left;
    height: 100%;
    line-height: 40px;
    font-size: 14px;
    margin-left: 15px;
  }

  .middle-menu {
    float: left;
    height: 100%;
    line-height: 64px;
    font-size: 18px;
    margin-left: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 40px;
    font-size: 14px;
    margin-right: 1%;

    .right-menu-item {
      display: inline-block;
      height: 100%;
      margin: 0 8px;

      .icon {
        vertical-align: middle;
      }

      .icon-text {
        vertical-align: middle;
      }
    }

    .right-menu-item:active {
      color: #3a71a8;
    }

    .right-menu-item:hover {
      cursor: pointer;
    }
  }
}

.wrap {
  height: calc(100vh - 35px);
  overflow: hidden;
}

.ph {
  background-color: #fff;
}

.main-canvas {
  background-color: #fff;
}

.el-icon {
  font-size: 20px;
  margin-right: 20px;
  cursor: pointer;
}

.el-icon:hover {
  color: blue;
}

.left {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  margin-top: 7px;
  margin-left: 5px;
}

.left .getItem {
  width: 100%;
  justify-content: center;
  align-items: center;
}

.mini {
  height: 25px;
  line-height: 25px;
  font-size: 10px;
}

.small {
  height: 30px;
  line-height: 30px;
  font-size: 11px;
}

.default {
  height: 35px;
  line-height: 35px;
  font-size: 12px;
}

.medium {
  height: 35px;
  line-height: 35px;
  font-size: 12px;
}

.left .leftItem {
  width: 100%;
  color: #fff;
  margin: 5px auto;
}

.right {
  display: flex;
  flex-direction: column;
  margin-top: 7px;
  margin-right: 5px;
}

.minimap {
  height: 226px;
}

.panel-title {
  margin-left: 10px;
  font-size: 12px;
}

.block-container {
  padding: 10px;
}

.child-process {
  pointer-events: none;

  .el-dialog {
    pointer-events: auto;
  }
}

::v-deep #search_plugin {
  border-top: 0px;
  border-left: 0px;
  border-right: 0px;
}
</style>
