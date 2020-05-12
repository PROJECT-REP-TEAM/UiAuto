<template>
  <div class="wrap" id="wrapId">
    <!-- 工具栏 -->
    <div id="toolbar" class="toolbar navbar">
      <!-- <i data-command="undo" class="command el-icon el-icon-arrow-left" title="撤回"></i>
      <i data-command="redo" class="command el-icon el-icon-arrow-right" title="重做"></i>
      <i data-command="delete" class="command el-icon el-icon-delete" title="删除"></i>
      <i data-command="zoomOut" class="command el-icon el-icon-zoom-out" title="缩小"></i>
      <i data-command="zoomIn" class="command el-icon el-icon-zoom-in" title="放大"></i>
      <i data-command="save" class="command el-icon el-icon-upload" title="保存"></i>-->
      <div class="left-menu">
        项目
        <span v-if="projectName">/ {{projectName}}</span>
      </div>
      <div class="middle-menu">
        <el-button size="mini" @click="openBrowser('Chrome')">
          <img
            src="../../assets/images/chrome.png"
            width="12"
            height="12"
            style="vertical-align: text-top;"
          />&nbsp;
          启动Chrome
        </el-button>
      </div>
      <div
        style="position: fixed;font-size: 14px;color: red;line-height: 40px;left: 45%;"
        v-if="!hasModificationRights"
      >您没有权限修改本云端项目</div>
      <div class="right-menu">
        <div class="right-menu-item" @click="executecurrentNode">
          <img src="../../assets/images/run.png" class="icon" />
          <span class="icon-text">执行当前节点</span>
        </div>
        <div class="right-menu-item" @click="toolClick('run')">
          <img src="../../assets/images/run.png" class="icon" />
          <span class="icon-text">执行</span>
        </div>
        <div data-command="save" class="command right-menu-item">
          <img src="../../assets/images/save.png" class="icon" />
          <span class="icon-text">保存</span>
        </div>
        <div class="right-menu-item" @click="toolClick('stop')">
          <img src="../../assets/images/stop.png" class="icon" />
          <span class="icon-text">停止</span>
        </div>
      </div>
    </div>
    <el-row :gutter="20">
      <el-col
        :span="4"
        v-loading="loading"
        element-loading-text
        element-loading-spinner="none"
        element-loading-background="rgba(255, 255, 255, 0.5)"
      >
        <!-- 元素面板栏 -->
        <div id="itempannel" class="ph left" v-bind:class="{ filter: !hasModificationRights }">
          <el-input
            placeholder="插件搜索"
            style="padding: 5px 5px 0;"
            v-model="pluginSearchInput"
            @input="pluginSearch(pluginSearchInput)"
          >
            <i slot="suffix" class="el-input__icon el-icon-aim" style="padding: 5px;"></i>
          </el-input>

          <div v-if="searchPluginLs.length" style="padding: 10px;height: 93%;overflow: scroll;">
            <div>
              <div
                class="getItem"
                v-for="(item, idx) in searchPluginLs"
                :key="idx"
                :data-type="item.data_type"
                :data-shape="item.data_shape"
                :data-shape-type="item.data_shape_type"
                :data-size="item.data_size"
                :data-label="item.data_label"
                :data-color="item.data_color"
                :data-operation_id="item.operation_id"
                :data-plugin_id="item.plugin_id"
                :data-input="item.input"
                :data-output="item.output"
                :data-version="item.version"
                :data-operation-name="item.operation_name"
                :data-category-name="item.category_name"
                :data-language="item.language"
                :data-attribution-name="item.attribution_name"
              >
                <div
                  class="leftItem"
                  v-bind:style="{ background: item.background_color}"
                  v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                >
                  <div
                    style="width: calc(100% - 35px);height: 100%;padding: 0 0 0 35px;float: left;overflow: hidden;"
                  >{{item.data_label}}</div>
                  <svg
                    v-if="item.language==='nodejs'"
                    t="1565963200375"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="4393"
                    style="float:right;"
                    v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                  >
                    <path
                      d="M875.2 262.3L546.7 72.7c-20.7-11.8-48.3-11.8-69 0L148.8 262.3c-21.5 12.2-34.5 34.9-34.5 59.7v379.2c0 24.8 13.4 47.9 34.5 60.1l86.1 49.5c41.8 20.7 56.8 20.7 75.9 20.7 62.1 0 97.4-37.8 97.4-102.7V354.4c0-5.3-4.1-9.3-9.3-9.3h-41.4c-5.3 0-9.3 4.1-9.3 9.3v374.3c0 28.8-30 57.7-78.8 33.3l-90.1-52c-3.2-2-5.3-5.3-5.3-8.9V321.9c0-3.7 2-7.3 5.3-8.9l328.1-190c3.2-1.6 7.3-1.6 10.2 0l328.5 189.6c3.2 1.6 5.3 5.3 5.3 8.9v379.2c0 3.7-2 7.3-4.9 8.9L517.9 899.3c-2.8 1.6-7.3 1.6-10.2 0l-84.4-49.9c-2.4-1.2-5.7-1.6-8.1-0.4-23.1 13.4-27.6 15-49.5 22.7-5.7 1.6-13.4 4.9 2.8 14.2l109.6 65c10.6 6.1 22.3 9.3 34.5 9.3 11.8-0.4 24-3.2 34.1-9.7l328.5-189.6c21.1-12.2 34.5-34.9 34.5-59.7V321.9c0-24.3-13.4-47.5-34.5-59.6z"
                      fill="#689F63"
                      p-id="4394"
                    />
                    <path
                      d="M614.1 641.1c-86.9 0-106-21.9-112.5-65-0.8-4.9-4.5-8.1-9.3-8.1h-42.6c-5.3 0-9.3 4.1-9.3 9.3 0 55.2 30 121.4 173.8 121.4l-0.4-0.4c103.9 0 163.6-41 163.6-112.5 0-70.6-47.9-89.7-149-103.1-101.9-13.4-112.5-20.3-112.5-44.3 0-19.5 8.9-45.9 84.4-45.9 67.8 0 92.6 14.6 102.7 60.1 1.2 4.1 4.9 7.3 9.3 7.3H755c2.4 0 5.3-0.8 6.9-2.8 1.6-2 2.8-4.5 2.4-7.3-6.9-78.4-58.9-114.9-164-114.9-93.4 0-149.4 39.4-149.4 105.6 0 71.9 55.6 91.8 145.8 100.7 107.6 10.6 116.1 26.4 116.1 47.5 0 36.5-29.3 52.4-98.7 52.4z"
                      fill="#689F63"
                      p-id="4395"
                    />
                  </svg>
                  <svg
                    v-if="item.language==='python'"
                    t="1572263765671"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="4139"
                    id="mx_n_1572263765672"
                    data-spm-anchor-id="a313x.7781069.0.i18"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    style="float:right;"
                    v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                  >
                    <path
                      d="M386.92 498.112a130.632 130.632 0 0 1 23.172-2.082l-6.244-0.03h207.646c9.006 0 17.612-1.234 25.816-3.508 38.74-10.726 66.69-45.074 66.69-87.326v-174.448c0-49.664-42.3-86.968-92.578-95.212-31.862-5.248-78.516-7.654-110.178-7.498-31.658 0.172-61.962 2.808-88.554 7.498C334.286 149.152 320 177.856 320 230.718V288h192v32H257.64c-71.256 0-129.076 85.142-129.626 190.484-0.004 0.506-0.014 1.01-0.014 1.516 0 19.046 1.88 37.44 5.37 54.808C149.296 646.14 198.902 704 257.64 704H288v-91.87c0-53.654 40.292-103.466 98.92-114.018z m20.392-244.108c-19.184 0-34.768-15.57-34.768-34.806 0-19.328 15.548-35.04 34.768-35.04 19.148 0 34.798 15.71 34.798 35.04 0.002 19.236-15.618 34.806-34.798 34.806z"
                      p-id="4140"
                      fill="#0075AA"
                      data-spm-anchor-id="a313x.7781069.0.i13"
                      class
                    />
                    <path
                      d="M887.902 445.086C869.56 372.042 822.066 320 766.36 320H736v81.344c0 67.83-44.572 116.948-98.978 125.362a107.886 107.886 0 0 1-16.602 1.292H412.702a102.82 102.82 0 0 0-26.098 3.344C348.36 541.378 320 573.2 320 614.472v174.454c0 49.664 49.954 78.852 98.962 93.102 58.654 17.062 122.534 20.136 192.732 0C658.3 868.708 704 841.786 704 788.926V736h-192v-32h254.36c50.48 0 94.214-42.73 115.628-105.098C890.948 572.808 896 543.282 896 512c0-23.536-2.866-46.076-8.098-66.914zM615.734 765.64c19.18 0 34.762 15.57 34.762 34.8 0 19.3-15.582 35.042-34.762 35.042-19.154 0-34.798-15.742-34.798-35.042 0-19.26 15.612-34.8 34.798-34.8z"
                      p-id="4141"
                      fill="#FFD400"
                      data-spm-anchor-id="a313x.7781069.0.i16"
                      class
                    />
                  </svg>
                  <svg
                    v-if="item.language==='java'"
                    t="1572767890841"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="2391"
                    data-spm-anchor-id="a313x.7781069.0.i2"
                    style="float:right;"
                    v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                  >
                    <path
                      d="M701.72245 245.828637s-162.696653 40.05327-190.648146 134.112978c-27.951493 94.059708 107.42585 114.379856 24.790581 191.957666 0 0 71.165674-36.847202 71.165675-85.796181s-67.37258-73.73956-48.316797-120.746836c19.055783-47.097588 143.008687-119.527627 143.008687-119.527627z"
                      fill="#E83418"
                      p-id="2392"
                      data-spm-anchor-id="a313x.7781069.0.i1"
                      class="selected"
                    />
                    <path
                      d="M594.2966 68.501477s64.843851 74.371742-34.950655 184.326322-185.590687 106.116329-55.948141 286.017375c0 0-141.11214-93.427526-103.5876-183.69414s234.539666-126.481633 194.486396-286.649557z"
                      fill="#E83418"
                      p-id="2393"
                    />
                    <path
                      d="M408.073731 545.79918s-88.324911 23.526216-88.324911 38.788905c0 15.262689 223.702253 34.318472 370.549191-7.631345 0 0-102.323235 46.375094-266.284253 46.375094s-251.06672-48.903823-15.940027-77.532654zM371.226529 645.593685s-45.110729 12.056621-45.110729 29.893196c0 17.791419 96.588438 69.269127 331.760286 12.688804 0 0-30.525378-15.894871-35.582837-21.629669 0 0-324.761124 46.42025-251.06672-20.952331zM390.282312 738.389029s-65.476033 55.270803 207.1752 20.320148l45.110729 22.894033s-73.73956 29.215857-163.328835 29.215858-175.385457-38.111567-88.957094-72.430039zM322.27755 804.497244s-81.370904 15.262689-81.370905 33.054108 125.217269 34.950655 275.812145 34.950654 291.074834-26.054946 256.756361-61.637782c0 0 15.894871 6.999162 15.894871 18.423601s-36.847202 64.843851-333.656832 64.84385-266.916435-44.478547-266.916436-44.478546 7.044318-34.363628 133.480796-45.155885z"
                      fill="#06509B"
                      p-id="2394"
                      data-spm-anchor-id="a313x.7781069.0.i0"
                      class="selected"
                    />
                    <path
                      d="M303.221767 910.613573s366.710941 52.742073 523.040613-54.63862c0 0 12.056621 62.269965-228.172686 76.900471s-294.867928-22.261851-294.867927-22.261851zM708.08943 552.798342s81.370904-17.159236 81.370904 48.948979-99.162323 105.484147-99.162323 105.484147 136.641707-21.629669 136.641708-110.586762-118.850289-43.846364-118.850289-43.846364z"
                      fill="#06509B"
                      p-id="2395"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- <el-collapse
            v-else
            style="width: calc(100% - 20px);margin: 10px;height: 94%;float:left;overflow-y: auto;overflow-x: hidden;border: none;"
          >-->
          <!-- v-model="activeNames" -->
          <!-- <el-collapse-item
              v-for="leftItem in leftList"
              :key="leftItem.id"
              :title="leftItem.title"
              :name="leftItem.id"
              style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
            >
              <div
                class="getItem"
                v-for="(item,idx) in leftItem.msg"
                :key="idx"
                :data-type="item.data_type"
                :data-shape="item.data_shape"
                :data-shape-type="item.data_shape_type"
                :data-size="item.data_size"
                :data-label="item.data_label"
                :data-color="item.data_color"
                :data-operation_id="item.operation_id"
                :data-plugin_id="item.plugin_id"
                :data-input="item.input"
                :data-output="item.output"
                :data-version="item.version"
                :data-operation-name="item.operation_name"
                :data-category-name="item.category_name"
                :data-language="item.language"
              >
                <div
                  class="leftItem"
                  v-bind:style="{ background: item.background_color}"
                  v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                >
                  <div
                    style="width: calc(100% - 35px);padding: 0 0 0 35px;float: left;overflow: hidden;"
                  >{{item.data_label}}</div>
                  <svg
                    v-if="item.language==='nodejs'"
                    t="1565963200375"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="4393"
                    style="float:right;"
                    v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                  >
                    <path
                      d="M875.2 262.3L546.7 72.7c-20.7-11.8-48.3-11.8-69 0L148.8 262.3c-21.5 12.2-34.5 34.9-34.5 59.7v379.2c0 24.8 13.4 47.9 34.5 60.1l86.1 49.5c41.8 20.7 56.8 20.7 75.9 20.7 62.1 0 97.4-37.8 97.4-102.7V354.4c0-5.3-4.1-9.3-9.3-9.3h-41.4c-5.3 0-9.3 4.1-9.3 9.3v374.3c0 28.8-30 57.7-78.8 33.3l-90.1-52c-3.2-2-5.3-5.3-5.3-8.9V321.9c0-3.7 2-7.3 5.3-8.9l328.1-190c3.2-1.6 7.3-1.6 10.2 0l328.5 189.6c3.2 1.6 5.3 5.3 5.3 8.9v379.2c0 3.7-2 7.3-4.9 8.9L517.9 899.3c-2.8 1.6-7.3 1.6-10.2 0l-84.4-49.9c-2.4-1.2-5.7-1.6-8.1-0.4-23.1 13.4-27.6 15-49.5 22.7-5.7 1.6-13.4 4.9 2.8 14.2l109.6 65c10.6 6.1 22.3 9.3 34.5 9.3 11.8-0.4 24-3.2 34.1-9.7l328.5-189.6c21.1-12.2 34.5-34.9 34.5-59.7V321.9c0-24.3-13.4-47.5-34.5-59.6z"
                      fill="#689F63"
                      p-id="4394"
                    />
                    <path
                      d="M614.1 641.1c-86.9 0-106-21.9-112.5-65-0.8-4.9-4.5-8.1-9.3-8.1h-42.6c-5.3 0-9.3 4.1-9.3 9.3 0 55.2 30 121.4 173.8 121.4l-0.4-0.4c103.9 0 163.6-41 163.6-112.5 0-70.6-47.9-89.7-149-103.1-101.9-13.4-112.5-20.3-112.5-44.3 0-19.5 8.9-45.9 84.4-45.9 67.8 0 92.6 14.6 102.7 60.1 1.2 4.1 4.9 7.3 9.3 7.3H755c2.4 0 5.3-0.8 6.9-2.8 1.6-2 2.8-4.5 2.4-7.3-6.9-78.4-58.9-114.9-164-114.9-93.4 0-149.4 39.4-149.4 105.6 0 71.9 55.6 91.8 145.8 100.7 107.6 10.6 116.1 26.4 116.1 47.5 0 36.5-29.3 52.4-98.7 52.4z"
                      fill="#689F63"
                      p-id="4395"
                    />
                  </svg>
                  <svg
                    v-if="item.language==='python'"
                    t="1572263765671"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="4139"
                    id="mx_n_1572263765672"
                    data-spm-anchor-id="a313x.7781069.0.i18"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    style="float:right;"
                    v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                  >
                    <path
                      d="M386.92 498.112a130.632 130.632 0 0 1 23.172-2.082l-6.244-0.03h207.646c9.006 0 17.612-1.234 25.816-3.508 38.74-10.726 66.69-45.074 66.69-87.326v-174.448c0-49.664-42.3-86.968-92.578-95.212-31.862-5.248-78.516-7.654-110.178-7.498-31.658 0.172-61.962 2.808-88.554 7.498C334.286 149.152 320 177.856 320 230.718V288h192v32H257.64c-71.256 0-129.076 85.142-129.626 190.484-0.004 0.506-0.014 1.01-0.014 1.516 0 19.046 1.88 37.44 5.37 54.808C149.296 646.14 198.902 704 257.64 704H288v-91.87c0-53.654 40.292-103.466 98.92-114.018z m20.392-244.108c-19.184 0-34.768-15.57-34.768-34.806 0-19.328 15.548-35.04 34.768-35.04 19.148 0 34.798 15.71 34.798 35.04 0.002 19.236-15.618 34.806-34.798 34.806z"
                      p-id="4140"
                      fill="#0075AA"
                      data-spm-anchor-id="a313x.7781069.0.i13"
                      class
                    />
                    <path
                      d="M887.902 445.086C869.56 372.042 822.066 320 766.36 320H736v81.344c0 67.83-44.572 116.948-98.978 125.362a107.886 107.886 0 0 1-16.602 1.292H412.702a102.82 102.82 0 0 0-26.098 3.344C348.36 541.378 320 573.2 320 614.472v174.454c0 49.664 49.954 78.852 98.962 93.102 58.654 17.062 122.534 20.136 192.732 0C658.3 868.708 704 841.786 704 788.926V736h-192v-32h254.36c50.48 0 94.214-42.73 115.628-105.098C890.948 572.808 896 543.282 896 512c0-23.536-2.866-46.076-8.098-66.914zM615.734 765.64c19.18 0 34.762 15.57 34.762 34.8 0 19.3-15.582 35.042-34.762 35.042-19.154 0-34.798-15.742-34.798-35.042 0-19.26 15.612-34.8 34.798-34.8z"
                      p-id="4141"
                      fill="#FFD400"
                      data-spm-anchor-id="a313x.7781069.0.i16"
                      class
                    />
                  </svg>
                </div>
              </div>
          </el-collapse-item>-->
          <!-- </el-collapse> -->

          <el-menu
            v-else
            class="el-menu-vertical-demo"
            style="height: 94%;border: none;overflow: scroll;"
            :unique-opened="true"
            ref="multipleSubmenu"
          >
            <el-submenu
              v-for="(leftItem, leftIdx) in leftList"
              :key="leftItem.id"
              :index="''+(leftIdx + 1)"
              style="padding: 0 10px;"
            >
              <template slot="title">
                <span>{{leftItem.title}}</span>
              </template>

              <span v-for="(msg,msgIdx) in leftItem.msg" :key="msgIdx">
                <el-submenu :index="''+(leftIdx + 1)+'-'+''+(msgIdx+1)">
                  <template slot="title">{{msg.child_title}}</template>
                  <el-menu-item
                    v-for="(item,idx) in msg.child_msg"
                    :key="idx"
                    :index="''+(leftIdx + 1)+'-'+''+(msgIdx+1)+'-'+''+(idx+1)"
                    v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                    style="padding: 0;min-width: 100%;"
                    class="getItem"
                    :data-type="item.data_type"
                    :data-shape="item.data_shape"
                    :data-shape-type="item.data_shape_type"
                    :data-size="item.data_size"
                    :data-label="item.data_label"
                    :data-color="item.data_color"
                    :data-operation_id="item.operation_id"
                    :data-plugin_id="item.plugin_id"
                    :data-input="item.input"
                    :data-output="item.output"
                    :data-version="item.version"
                    :data-operation-name="item.operation_name"
                    :data-category-name="item.category_name"
                    :data-language="item.language"
                    :data-attribution-name="item.attribution_name"
                  >
                    <div
                      class="leftItem"
                      v-bind:style="{ background: item.background_color}"
                      v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                    >
                      <div
                        style="width: calc(100% - 35px);padding: 0 0 0 35px;float: left;overflow: hidden;"
                      >{{item.data_label}}</div>
                      <svg
                        v-if="item.language==='nodejs'"
                        t="1565963200375"
                        class="icon"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="4393"
                        style="float:right;"
                        v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                      >
                        <path
                          d="M875.2 262.3L546.7 72.7c-20.7-11.8-48.3-11.8-69 0L148.8 262.3c-21.5 12.2-34.5 34.9-34.5 59.7v379.2c0 24.8 13.4 47.9 34.5 60.1l86.1 49.5c41.8 20.7 56.8 20.7 75.9 20.7 62.1 0 97.4-37.8 97.4-102.7V354.4c0-5.3-4.1-9.3-9.3-9.3h-41.4c-5.3 0-9.3 4.1-9.3 9.3v374.3c0 28.8-30 57.7-78.8 33.3l-90.1-52c-3.2-2-5.3-5.3-5.3-8.9V321.9c0-3.7 2-7.3 5.3-8.9l328.1-190c3.2-1.6 7.3-1.6 10.2 0l328.5 189.6c3.2 1.6 5.3 5.3 5.3 8.9v379.2c0 3.7-2 7.3-4.9 8.9L517.9 899.3c-2.8 1.6-7.3 1.6-10.2 0l-84.4-49.9c-2.4-1.2-5.7-1.6-8.1-0.4-23.1 13.4-27.6 15-49.5 22.7-5.7 1.6-13.4 4.9 2.8 14.2l109.6 65c10.6 6.1 22.3 9.3 34.5 9.3 11.8-0.4 24-3.2 34.1-9.7l328.5-189.6c21.1-12.2 34.5-34.9 34.5-59.7V321.9c0-24.3-13.4-47.5-34.5-59.6z"
                          fill="#689F63"
                          p-id="4394"
                        />
                        <path
                          d="M614.1 641.1c-86.9 0-106-21.9-112.5-65-0.8-4.9-4.5-8.1-9.3-8.1h-42.6c-5.3 0-9.3 4.1-9.3 9.3 0 55.2 30 121.4 173.8 121.4l-0.4-0.4c103.9 0 163.6-41 163.6-112.5 0-70.6-47.9-89.7-149-103.1-101.9-13.4-112.5-20.3-112.5-44.3 0-19.5 8.9-45.9 84.4-45.9 67.8 0 92.6 14.6 102.7 60.1 1.2 4.1 4.9 7.3 9.3 7.3H755c2.4 0 5.3-0.8 6.9-2.8 1.6-2 2.8-4.5 2.4-7.3-6.9-78.4-58.9-114.9-164-114.9-93.4 0-149.4 39.4-149.4 105.6 0 71.9 55.6 91.8 145.8 100.7 107.6 10.6 116.1 26.4 116.1 47.5 0 36.5-29.3 52.4-98.7 52.4z"
                          fill="#689F63"
                          p-id="4395"
                        />
                      </svg>
                      <svg
                        v-if="item.language==='java'"
                        t="1572767890841"
                        class="icon"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="2391"
                        data-spm-anchor-id="a313x.7781069.0.i2"
                        style="float:right;"
                        v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                      >
                        <path
                          d="M701.72245 245.828637s-162.696653 40.05327-190.648146 134.112978c-27.951493 94.059708 107.42585 114.379856 24.790581 191.957666 0 0 71.165674-36.847202 71.165675-85.796181s-67.37258-73.73956-48.316797-120.746836c19.055783-47.097588 143.008687-119.527627 143.008687-119.527627z"
                          fill="#E83418"
                          p-id="2392"
                          data-spm-anchor-id="a313x.7781069.0.i1"
                          class="selected"
                        />
                        <path
                          d="M594.2966 68.501477s64.843851 74.371742-34.950655 184.326322-185.590687 106.116329-55.948141 286.017375c0 0-141.11214-93.427526-103.5876-183.69414s234.539666-126.481633 194.486396-286.649557z"
                          fill="#E83418"
                          p-id="2393"
                        />
                        <path
                          d="M408.073731 545.79918s-88.324911 23.526216-88.324911 38.788905c0 15.262689 223.702253 34.318472 370.549191-7.631345 0 0-102.323235 46.375094-266.284253 46.375094s-251.06672-48.903823-15.940027-77.532654zM371.226529 645.593685s-45.110729 12.056621-45.110729 29.893196c0 17.791419 96.588438 69.269127 331.760286 12.688804 0 0-30.525378-15.894871-35.582837-21.629669 0 0-324.761124 46.42025-251.06672-20.952331zM390.282312 738.389029s-65.476033 55.270803 207.1752 20.320148l45.110729 22.894033s-73.73956 29.215857-163.328835 29.215858-175.385457-38.111567-88.957094-72.430039zM322.27755 804.497244s-81.370904 15.262689-81.370905 33.054108 125.217269 34.950655 275.812145 34.950654 291.074834-26.054946 256.756361-61.637782c0 0 15.894871 6.999162 15.894871 18.423601s-36.847202 64.843851-333.656832 64.84385-266.916435-44.478547-266.916436-44.478546 7.044318-34.363628 133.480796-45.155885z"
                          fill="#06509B"
                          p-id="2394"
                          data-spm-anchor-id="a313x.7781069.0.i0"
                          class="selected"
                        />
                        <path
                          d="M303.221767 910.613573s366.710941 52.742073 523.040613-54.63862c0 0 12.056621 62.269965-228.172686 76.900471s-294.867928-22.261851-294.867927-22.261851zM708.08943 552.798342s81.370904-17.159236 81.370904 48.948979-99.162323 105.484147-99.162323 105.484147 136.641707-21.629669 136.641708-110.586762-118.850289-43.846364-118.850289-43.846364z"
                          fill="#06509B"
                          p-id="2395"
                        />
                      </svg>
                      <svg
                        v-if="item.language==='python'"
                        t="1572263765671"
                        class="icon"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="4139"
                        id="mx_n_1572263765672"
                        data-spm-anchor-id="a313x.7781069.0.i18"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        style="float:right;"
                        v-bind:class="{ mini: size == 'mini', medium: size == 'medium', default: size == 'default', small: size == 'small'  }"
                      >
                        <path
                          d="M386.92 498.112a130.632 130.632 0 0 1 23.172-2.082l-6.244-0.03h207.646c9.006 0 17.612-1.234 25.816-3.508 38.74-10.726 66.69-45.074 66.69-87.326v-174.448c0-49.664-42.3-86.968-92.578-95.212-31.862-5.248-78.516-7.654-110.178-7.498-31.658 0.172-61.962 2.808-88.554 7.498C334.286 149.152 320 177.856 320 230.718V288h192v32H257.64c-71.256 0-129.076 85.142-129.626 190.484-0.004 0.506-0.014 1.01-0.014 1.516 0 19.046 1.88 37.44 5.37 54.808C149.296 646.14 198.902 704 257.64 704H288v-91.87c0-53.654 40.292-103.466 98.92-114.018z m20.392-244.108c-19.184 0-34.768-15.57-34.768-34.806 0-19.328 15.548-35.04 34.768-35.04 19.148 0 34.798 15.71 34.798 35.04 0.002 19.236-15.618 34.806-34.798 34.806z"
                          p-id="4140"
                          fill="#0075AA"
                          data-spm-anchor-id="a313x.7781069.0.i13"
                          class
                        />
                        <path
                          d="M887.902 445.086C869.56 372.042 822.066 320 766.36 320H736v81.344c0 67.83-44.572 116.948-98.978 125.362a107.886 107.886 0 0 1-16.602 1.292H412.702a102.82 102.82 0 0 0-26.098 3.344C348.36 541.378 320 573.2 320 614.472v174.454c0 49.664 49.954 78.852 98.962 93.102 58.654 17.062 122.534 20.136 192.732 0C658.3 868.708 704 841.786 704 788.926V736h-192v-32h254.36c50.48 0 94.214-42.73 115.628-105.098C890.948 572.808 896 543.282 896 512c0-23.536-2.866-46.076-8.098-66.914zM615.734 765.64c19.18 0 34.762 15.57 34.762 34.8 0 19.3-15.582 35.042-34.762 35.042-19.154 0-34.798-15.742-34.798-35.042 0-19.26 15.612-34.8 34.798-34.8z"
                          p-id="4141"
                          fill="#FFD400"
                          data-spm-anchor-id="a313x.7781069.0.i16"
                          class
                        />
                      </svg>
                    </div>
                  </el-menu-item>
                </el-submenu>
              </span>
            </el-submenu>
          </el-menu>
        </div>
      </el-col>
      <el-col :span="15">
        <!-- 主画布 -->
        <div
          id="page"
          class="main-canvas"
          v-loading="loading"
          element-loading-text="正在执行，请稍候…"
          element-loading-background="rgba(255, 255, 255, 0.5)"
        ></div>
        <!-- <div id="xterm"></div> -->
        <div
          id="logMessageId"
          style="height:194px;background: #475058;color: #eee;overflow: auto;padding: 10px;"
        >
          <div id="logMessageBox">
            <div v-for="(item,idx) in logMessage" :key="idx">
              <span v-if="item.type === 'warn'" style="color: #fec171" v-text="item.line"></span>
              <span v-else-if="item.type === 'error'" style="color: #e65d6e" v-text="item.line"></span>
              <span v-else-if="item.type === 'success'" style="color: green" v-text="item.line"></span>
              <span v-else-if="item.type === 'log'" v-text="item.line"></span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col
        :span="5"
        v-loading="loading"
        element-loading-text
        element-loading-spinner="none"
        element-loading-background="rgba(255, 255, 255, 0.5)"
      >
        <div class="ph right">
          <!-- 详细面板 -->
          <div
            id="detailpannel"
            class="detailpannel"
            v-bind:class="{ filter: !hasModificationRights }"
          >
            <div v-if="isShowDescription">
              <div
                class="panel-title"
                style="margin-top: 10px;font-size: 13px;font-weight: 500;"
              >项目描述</div>
              <el-input
                type="textarea"
                v-model="description"
                :autosize="{ minRows: 8, maxRows: 30}"
                style="padding: 10px 10px 0 10px;"
              ></el-input>
              <div style="border-bottom: 1px solid #EBEEF5;margin: 0 10px;"></div>
            </div>
            <div v-if="operationName">
              <div class="panel-title" style="margin-top: 10px;font-size: 13px;font-weight: 500;">
                插件名称
                <span style="float:right;margin-right:10px;">V{{version}}</span>
              </div>
              <div class="block-container">
                <el-input
                  v-if="language==='nodejs'"
                  prefix-icon="el-icon-skl-java-script"
                  v-model="plugin_info"
                  :disabled="true"
                >
                  <el-button slot="append" icon="el-icon-aim" @click="findPlugin"></el-button>
                </el-input>
                <el-input
                  v-if="language==='python'"
                  prefix-icon=" el-icon-skl-logo-python"
                  v-model="plugin_info"
                  :disabled="true"
                >
                  <el-button slot="append" icon="el-icon-aim" @click="findPlugin"></el-button>
                </el-input>
                <el-input
                  v-if="language==='java'"
                  prefix-icon=" el-icon-skl-java"
                  v-model="plugin_info"
                  :disabled="true"
                >
                  <el-button slot="append" icon="el-icon-aim" @click="findPlugin"></el-button>
                </el-input>
              </div>
              <div style="border-bottom: 1px solid #EBEEF5;margin: 0 10px;"></div>
            </div>
            <div v-if="nodeLineLabelShow">
              <div
                class="panel-title"
                style="margin-top: 10px;font-size: 13px;font-weight: 500;"
              >节点名称</div>
              <div class="block-container">
                <el-input v-model="nodeLabel" @change="changeValue('line')" placeholder="请输入内容"></el-input>
              </div>
            </div>
            <div>
              <el-collapse
                v-if="nodeLabelShow"
                v-model="active_tag"
                style="width: calc(100% - 20px);margin: 0 10px;height: 100%;float:left;"
              >
                <el-collapse-item
                  v-for="inputItem in store_input"
                  :key="inputItem.id"
                  :title="inputItem.name"
                  :name="inputItem.name"
                >
                  <div class="getItem" v-for="(item,idx) in inputItem.properties" :key="idx">
                    <template v-if="handleShowIf(item)">
                      <div class="panel-title">
                        <span>{{item.name}}</span>
                        <span
                          v-if="item.required"
                          style="color:red;font-size: 16px;vertical-align: middle;"
                        >*</span>
                      </div>
                      <div class="block-container">
                        <textEditor
                          v-if="item.type==='text'"
                          :editor="editor.getCurrentPage().save()"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <dateTimeRangePicker
                          v-if="item.type==='dateTimeRange'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <passwordEditor
                          v-if="item.type==='password'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <stringShower
                          v-if="item.type==='string'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                        />
                        <pathSelector
                          v-if="item.type==='path'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <pathMultiple
                          v-if="item.type==='pathMultiple'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <conditionEditor
                          v-if="item.type==='conditions'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <jsonEditor
                          v-if="item.type==='json'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <colorPicker
                          v-if="item.type==='color'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <radioEditor
                          v-if="item.type==='radio'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <checkboxEditor
                          v-if="item.type==='checkbox'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <inputNumberEditor
                          v-if="item.type==='inputNumber'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <selectPicker
                          v-if="item.type==='select'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <switchSelector
                          v-if="item.type==='switch'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <sliderEditor
                          v-if="item.type==='slider'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <dateTimePicker
                          v-if="item.type==='dateTime'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        />
                        <uiSelector
                          v-if="item.type==='uiselector'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          :browsers="item.browsers"
                          :project_name="projectName"
                          @changeValue="changeValue"
                        />
                        <el-button v-if="item.type==='code'" @click="codeClick" type="primary">代码编辑器</el-button>
                        <codemirror
                          v-if="item.type==='code'"
                          ref="code"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                          :language="language"
                        ></codemirror>
                        <ui-screenshot
                          v-if="item.type==='uiScreenshot'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :project_name="projectName"
                          @changeValue="changeValue"
                        ></ui-screenshot>
                        <projectSelector
                          v-if="item.type==='projectSelector'"
                          :input-id="inputItem.id"
                          :property-id="item.id"
                          :value="item.value"
                          :options="item.options"
                          @changeValue="changeValue"
                        ></projectSelector>
                      </div>
                    </template>
                  </div>
                </el-collapse-item>
                <el-collapse-item
                  v-if="JSON.stringify(output) !== '{}' && output.is_allow_global_use"
                  class="params-editor-title"
                  title="组件返回值"
                  name="组件返回值"
                >
                  <div id="output_div">
                    <span
                      class="params-editor-el"
                      style="margin-left: 10px;"
                    >{{ output.description }}</span>
                    <el-input
                      id="output_input"
                      v-model="output.value"
                      @change="changeValue('output')"
                      type="text"
                      style="padding: 10px;"
                    ></el-input>
                  </div>
                </el-collapse-item>
                <el-collapse-item class="params-editor-title" title="通用属性" name="通用属性">
                  <div
                    id="general_div"
                    v-for="generalItem in store_general_property"
                    :key="generalItem.id"
                  >
                    <span class="params-editor-el" style="margin-left: 10px;">{{generalItem.name}}</span>
                    <!-- <span style="color:red;font-size: 16px;vertical-align: middle;">*</span> -->
                    <el-input
                      :id="generalItem.id"
                      type="number"
                      v-model="generalItem.value"
                      @change="changeValue(generalItem.id)"
                      style="padding: 10px;"
                    ></el-input>
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
      </el-col>
    </el-row>
  </div>
</template>
<script>
import UiScreenshot from "./editor-el/uiScreenshot";
const electron = require("../../utils/electron");
var os = window.require("os");
// var pty = window.require("node-pty");
// var Terminal = window.require("xterm").Terminal;
const fs = window.require("fs");
const path = window.require("path");
const fse = window.require("fs-extra");
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
import * as ui_selector from "../../uiselector";
import { constants } from "crypto";
const { stop, views } = window.require(
  path.normalize(path.resolve() + "/public/runner/child_process_cache")
);

import { uploadTask, editTask } from "@/api/task";
import { getProjectPermission } from "@/api/role";

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
    projectSelector
  },
  data() {
    var leftList = this.readDir();
    return {
      dialogFormVisible: false,
      size: this.$store.getters.size,
      input: "",
      logMessage: [],
      output: {},
      graph: null,
      loading: false,
      nodeData: "",
      nodeLabel: "",
      operationName: "",
      categoryName: "",
      attributionName: "",
      language: "",
      version: "",
      isShowDescription: true,
      description: "",
      projectName: "",
      projectType: "",
      leftList: leftList,
      nodeLabelShow: false,
      nodeLineLabelShow: false,
      executeJobId: "",
      activeNames: _.map(leftList, "id"),
      hasModificationRights: true,
      general_property: [
        { id: "retry_count", value: "1", name: "重试次数" },
        { id: "retry_interval", value: "50", name: "重试时间间隔(ms)" },
        { id: "execution_timeout", value: "50000", name: "执行超时时间(ms)" },
        {
          id: "delayed_execution_time",
          value: "50",
          name: "延迟执行时间(ms)"
        },
        {
          id: "waiting_time_after_execution",
          value: "50",
          name: "执行后等待时间"
        }
      ],
      searchPluginLs: [],
      pluginSearchInput: "",
      currentNode: {}
    };
  },
  mounted() {
    // 重启执行器
    delete window.require.cache[
      path.normalize(
        path.resolve() + "/public/base_integration/uiauto_executor/executor.js"
      )
    ];
    window["executor"] = window.require(
      path.normalize(
        path.resolve() + "/public/base_integration/uiauto_executor/executor.js"
      )
    );
    if (window["executor"].hasOwnProperty("restart")) {
      window["executor"].restart();
    }
    // execute = executor.execute;
    // 重启选择器
    delete window.require.cache[
      path.normalize(
        path.resolve() + "/public/base_integration/uiauto_uiselector/index.js"
      )
    ];
    window["uiselector"] = window.require(
      path.normalize(
        path.resolve() + "/public/base_integration/uiauto_uiselector/index.js"
      )
    );
    window["uiselector"].restart_process();

    $(".ph").height($(".main-container").height() - 62);
    $(".main-canvas").height($(".main-container").height() - 255);
    this.projectName = this.$route.query.projectName;
    this.projectType = this.$route.query.projectType;
    this.description = JSON.parse(
      fs.readFileSync(
        `${config.projectsPath}/${this.projectName}/${this.projectName}.json`,
        "utf-8"
      )
    ).description;
    if (this.projectType === "cloud") {
      // 访问接口是否有权限修改项目
      getProjectPermission({
        roleName: JSON.parse(localStorage.getItem("user")).role
      })
        .then(getProjectPermissionRes => {
          if (getProjectPermissionRes && getProjectPermissionRes.data.length) {
            if (!_.includes(getProjectPermissionRes.data, this.projectName)) {
              this.hasModificationRights = false;
            }
          } else {
            this.hasModificationRights = false;
          }
        })
        .catch(() => {
          this.hasModificationRights = false;
        });
    }
    this.initG6Editor();
    this.initTerminal();
  },
  methods: {
    openBrowser(val) {
      window["uiselector"]
        .open_browser({
          browser_type: val
        })
        .then(async result => {
          console.log(".>>>>>>>>>>>>>>>>..........", result);
          await this.$store.commit("project/BROWSER", {
            type: val,
            browser_info: result
          });
        })
        .catch(error => {
          console.error(error);
        });
    },
    handleShowIf(item) {
      // filter
      if (!item.show_if) return true;

      // define values
      let $input = {};

      // 整理store_input_obj
      _.each(this.store_input, input_group => {
        let group_id = input_group.id;
        $input[group_id] = {};
        _.each(input_group.properties, property => {
          $input[group_id][property.id] = property.value;
        });
      });

      try {
        // 检查对应关系
        let result = !!eval(item.show_if);
        return result;
      } catch (error) {
        return false;
      }
    },
    checkShowIfValue(input, item) {
      // filter
      if (!item.show_if) return true;

      // define values
      let $input = {};

      _.each(input, input_group => {
        let group_id = input_group.id;
        $input[group_id] = {};
        _.each(input_group.properties, property => {
          $input[group_id][property.id] = property.value;
        });
      });

      try {
        // 检查对应关系
        let result = !!eval(item.show_if);
        return result;
      } catch (error) {
        return false;
      }
    },
    toolClick(val) {
      if (val === "run") {
        if (this.projectType === "cloud") {
          this.execute();
        } else {
          this.saveGraph("run").then(saveGraphRes => {
            if (saveGraphRes) {
              this.execute();
            }
          });
        }
      } else if (val === "stop") {
        // stop(this.projectName);
        window["executor"].restart();
        this.loading = false;
        this.$message({
          message: "停止成功",
          type: "success"
        });
        let postBody = {
          id: this.executeJobId,
          value: {
            status: "fail",
            message: JSON.stringify(
              `${moment().format("YYYY-MM-DD HH:mm:ss")} [log] 手动停止`
            )
          }
        };
        editTask(postBody);
      }
    },
    execute() {
      let self = this;
      if (!this.loading) {
        this.loading = true;
        electron.window_minimize();
        // if (this.projectType === "cloud") {
        uploadTask({
          uploadData: [
            {
              project_code: this.projectName,
              project_name: this.projectName,
              status: "running",
              deviceId: JSON.parse(
                fs.readFileSync(`${os.homedir()}/.uiauto/uiauto.conf`, "utf8")
              ).deviceId,
              project_type: "local"
            }
          ]
        })
          .then(uploadTaskRes => {
            self.executeJobId = uploadTaskRes.data[0].id;
            window["executor"]
              .execute(
                this.projectName,
                {
                  uiauto_browser: _.pick(this.$store.state.project.browser, [
                    "executor_url",
                    "session_id"
                  ])
                },
                newLogs => {
                  this.logMessage = _.concat(this.logMessage, newLogs);
                  setTimeout(() => {
                    $("#logMessageId").scrollTop(
                      $("#logMessageBox")[0].offsetHeight
                    );
                  }, 0);
                }
              )
              .then(res => {
                console.log("-=-=-=执行成功-=-=-=-=");
                console.log(res);
                self.loading = false;
                electron.window_maximize();
                let postBody = {
                  id: uploadTaskRes.data[0].id,
                  value: {
                    status: "success",
                    message:
                      JSON.stringify(res).length > 2500
                        ? `${JSON.stringify(res).slice(0, 2500)}..."`
                        : JSON.stringify(res)
                  }
                };
                editTask(postBody);
              })
              .catch(err => {
                console.log("-=-=-=执行出错-=-=-=-=");
                console.log(err);
                self.loading = false;
                electron.window_maximize();
                this.$message({
                  message: "执行出错",
                  type: "warning"
                });
                let postBody = {
                  id: uploadTaskRes.data[0].id,
                  value: {
                    status: "fail",
                    message:
                      JSON.stringify(err) === "{}"
                        ? ""
                        : JSON.stringify(err).length > 2500
                        ? `${JSON.stringify(err).slice(0, 2500)}..."`
                        : JSON.stringify(err)
                  }
                };
                editTask(postBody);
              });
          })
          .catch(err => {
            console.log(err);
            this.loading = false;
            electron.window_maximize();
            this.$message({
              message: "执行出错",
              type: "warning"
            });
            let postBody = {
              id: uploadTaskRes.data[0].id,
              value: {
                status: "fail",
                message: JSON.stringify(err)
              }
            };
            editTask(postBody);
          });
        // } else {
        //   execute(this.projectName, {
        //     // silent: true
        //   })
        //     .then(res => {
        //       console.log("-=-=-=执行成功-=-=-=-=");
        //       console.log(res);
        //       self.loading = false;
        //       electron.window_maximize();
        //     })
        //     .catch(err => {
        //       console.log("-=-=-=执行失败-=-=-=-=");
        //       console.warn(err);
        //       self.loading = false;
        //       electron.window_maximize();
        //       this.$message({
        //         message: "执行出错",
        //         type: "warning"
        //       });
        //     });
        // }
      } else {
        this.$message({
          message: "正在执行，请稍候…",
          type: "warning"
        });
      }
    },
    readDir() {
      // 插件目录
      const plugins_path = config.pluginsPath + "/";

      // 过滤无用文件后的插件文件夹名列表
      var file_name_list = _.difference(fs.readdirSync(plugins_path), [
        "list.json"
      ]);

      let shapeList = null;
      let conventionHeight = null;
      if (this.$store.getters.size == "mini") {
        shapeList = require("@/views/project/miniNodeConfig.json");
        conventionHeight = 29;
      } else if (this.$store.getters.size == "small") {
        shapeList = require("@/views/project/smallNodeConfig.json");
        conventionHeight = 39;
      } else {
        shapeList = require("@/views/project/mediumNodeConfig.json");
        conventionHeight = 48;
      }

      // 整理list
      var list = [];
      _.each(file_name_list, file_name => {
        var package_json_path = plugins_path + file_name + "/package.json";
        if (fs.existsSync(package_json_path)) {
          var package_json = fse.readJsonSync(package_json_path);
          var operations = package_json.uiauto_config.operations;
          _.each(operations, operation => {
            // var target = _.find(list, { id: operation.category_id });
            var target = _.find(list, {
              id:
                operation.attribution_id ||
                package_json.uiauto_config.attribution_id
            });
            var nameLength = operation.operation_name.length + 2;
            var target_msg = {
              operation_id: operation.operation_id,
              category_id: operation.category_id,
              plugin_id: package_json.id,
              data_label: operation.operation_name,
              data_type: "node",
              data_shape: shapeList[operation.type].data_shape,
              data_shape_type: operation.type,
              data_size:
                operation.type == "Convention"
                  ? `${nameLength * 16} * ${conventionHeight}`
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
                package_json.uiauto_config.attribution_name
            };
            if (target) {
              target.msg.push(target_msg);
            } else {
              list.push({
                title:
                  operation.attribution_name ||
                  package_json.uiauto_config.attribution_name,
                id:
                  operation.attribution_id ||
                  package_json.uiauto_config.attribution_id,
                msg: [target_msg]
              });
            }
          });
        }
      });
      let returnList = [];
      _.each(list, (listItem, idx) => {
        returnList = [];
        _.each(listItem.msg, msgItem => {
          let target = _.find(returnList, { child_id: msgItem.category_id });
          let target_msg = msgItem;
          if (target) {
            target.child_msg.push(target_msg);
          } else {
            returnList.push({
              child_title: msgItem.category_name,
              child_id: msgItem.category_id,
              child_msg: [target_msg]
            });
          }
        });
        list[idx].msg = returnList;
      });
      return list;
    },
    // 画布保存方法
    saveGraph(type) {
      let self = this;
      let saveFn = function(resolve, reject) {
        var general_property_temporary = [
          { id: "retry_count", value: "1", name: "重试次数" },
          { id: "retry_interval", value: "50", name: "重试时间间隔(ms)" },
          {
            id: "execution_timeout",
            value: "50000",
            name: "执行超时时间(ms)"
          },
          {
            id: "delayed_execution_time",
            value: "50",
            name: "延迟执行时间(ms)"
          },
          {
            id: "waiting_time_after_execution",
            value: "50",
            name: "执行后等待时间"
          }
        ];
        // 获取当前page
        const page = self.editor.getCurrentPage();
        // 保存画布
        const data = page.save();
        // 收集必填项未填值信息
        let errorMessage = [];
        _.each(data.nodes, node => {
          if (!node.general_property) {
            node.general_property = general_property_temporary;
          }
          typeof node.output === "string" &&
            (node.output = JSON.parse(node.output));
          typeof node.input === "string" &&
            (node.input = JSON.parse(node.input));
          if (node.input.length) {
            _.each(node.input, inputItem => {
              if (
                inputItem.id === "required_params" &&
                inputItem.properties.length
              ) {
                _.each(inputItem.properties, propertiesItem => {
                  if (
                    propertiesItem.required &&
                    !propertiesItem.value &&
                    self.checkShowIfValue(node.input, propertiesItem)
                  ) {
                    errorMessage.push({
                      label: node.label,
                      properties_name: propertiesItem.name,
                      value: propertiesItem.value
                    });
                  }
                });
              }
            });
          }
        });
        var cron = "";
        var retry_count = "";
        var retry_interval = "";
        var time_out = "";
        var description = "";
        var createAt = "";
        var automatic_recording = "";
        try {
          var json = fse.readJsonSync(
            `${config.projectsPath}/${self.projectName}/${self.projectName}.json`
          );
          cron = json.cron;
          retry_count = json.retry_count;
          retry_interval = json.retry_interval;
          time_out = json.time_out;
          description = json.description;
          createAt = json.createAt;
          automatic_recording = json.automatic_recording;
        } catch (error) {}
        var writeJson = _.extend(
          { project_name: self.projectName },
          { createAt: createAt },
          { updateAt: moment().format("YYYY-MM-DD HH:mm:ss") },
          { project_type: self.projectType },
          { cron: cron },
          { automatic_recording: automatic_recording },
          { retry_count: retry_count },
          { retry_interval: retry_interval },
          { time_out: time_out },
          { description: self.description || description },
          data
        );

        if (errorMessage.length) {
          let confirmText = _.map(_.chunk(errorMessage, 5)[0], msg => {
            return `节点：${msg.label}  属性：${msg.properties_name}值为空`;
          });
          _.chunk(errorMessage, 5).length > 1 &&
            confirmText.push(`...等${errorMessage.length - 5}个`);

          const newDatas = [];
          const h = self.$createElement;
          for (const i in confirmText) {
            newDatas.push(h("p", null, confirmText[i]));
          }
          self
            .$confirm("提示", {
              title: "提示",
              message: h("div", null, newDatas),
              showCancelButton: true,
              confirmButtonText: "继续",
              cancelButtonText: "取消",
              type: "warning"
            })
            .then(() => {
              fs.writeFileSync(
                `${config.projectsPath}/${self.projectName}/${self.projectName}.json`,
                JSON.stringify(writeJson, null, "\t"),
                "utf8"
              );

              if (type === "save") {
                self.$message({
                  message: "保存成功",
                  type: "success"
                });
              }

              resolve(true);
            })
            .catch(() => {
              reject(false);
            });
        } else {
          fs.writeFileSync(
            `${config.projectsPath}/${self.projectName}/${self.projectName}.json`,
            JSON.stringify(writeJson, null, "\t"),
            "utf8"
          );

          if (type === "save") {
            self.$message({
              message: "保存成功",
              type: "success"
            });
          }
          resolve(true);
        }
      };

      return new Promise((resolve, reject) => {
        if (this.projectType === "cloud") {
          if (!this.hasModificationRights) {
            this.$message({
              message: "您没有权限修改本云端项目",
              type: "error"
            });
            reject(false);
          } else {
            saveFn(resolve, reject);
          }
        } else {
          saveFn(resolve, reject);
        }
      });
    },
    // 修改Node的label
    changeValue(obj) {
      let self = this;
      let conventionHeight = null;
      if (this.$store.getters.size == "mini") {
        conventionHeight = 29;
      } else if (this.$store.getters.size == "small") {
        conventionHeight = 39;
      } else {
        conventionHeight = 48;
      }
      if (obj == "line") {
        const editor = this.editor;
        editor.executeCommand(() => {
          const page = editor.getCurrentPage();
          const selectedItems = page.getSelected();
          selectedItems.forEach(item => {
            page.update(item.id, {
              label: self.nodeLabel,
              size: `${(self.nodeLabel.length + 2) * 16} * ${conventionHeight}`
            });
          });
        });
      } else {
        if (obj == "output") {
          const editor = this.editor;
          editor.executeCommand(() => {
            const page = editor.getCurrentPage();
            const selectedItems = page.getSelected();
            selectedItems.forEach(item => {
              page.update(item.id, {
                output: self.output
              });
            });
          });
        } else if (
          [
            "retry_count",
            "retry_interval",
            "execution_timeout",
            "delayed_execution_time",
            "waiting_time_after_execution"
          ].includes(obj)
        ) {
          const editor = this.editor;
          editor.executeCommand(() => {
            const page = editor.getCurrentPage();
            const selectedItems = page.getSelected();
            selectedItems.forEach(item => {
              page.update(item.id, {
                general_property: self.general_property
              });
            });
          });
        } else {
          var targetInputGroup = _.find(self.store_input, { id: obj.input_id });
          var targetInputProperty = _.find(targetInputGroup.properties, {
            id: obj.property_id
          });
          targetInputProperty.value = obj.value;
          const editor = this.editor;
          editor.executeCommand(() => {
            const page = editor.getCurrentPage();
            const selectedItems = page.getSelected();
            selectedItems.forEach(item => {
              page.update(item.id, {
                input: self.input
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
        // 快捷键：Ctrl+shirt+s
        shortcutCodes: [["ctrlKey", "shiftKey", "s"]]
      });

      // 主画布
      // Mind 思维导图
      // Koni 网络图、拓扑图
      // Flow 流程图
      const page = new G6Editor.Flow({
        graph: {
          container: "page"
        }
      });

      // 设置边样式，内置3种样式
      // flow-polylinels
      // flow-polyline-round
      // flow-smooth
      page.getGraph().edge({
        shape: "flow-polyline"
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
              text: model.label
            }
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
              stroke: "red"
            }
          });
        }
      });

      // 元素面板栏
      const itempannel = new G6Editor.Itempannel({
        container: "itempannel"
      });

      // 工具栏
      const toolbar = new G6Editor.Toolbar({
        container: "toolbar"
      });

      // 详细面板
      const detailpannel = new G6Editor.Detailpannel({
        container: "detailpannel"
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
      // editor.add(minimap);

      // 获取当前page
      const currentPage = editor.getCurrentPage();
      // 监听鼠标按下事件
      currentPage.on("mousedown", ev => {
        self.nodeLabelShow = false;
        self.nodeLineLabelShow = false;
        self.operationName = "";
        self.categoryName = "";
        self.attributionName = "";
        self.language = "";
        self.version = "";
      });
      // 监听连线事件
      currentPage.on("dragedge:beforeshowanchor", ev => {
        let source = ev.source;
        let sourceId = ev.source.id;
        let target = ev.target;
        let targetId = target.model.id;
        //每个结点不能连自身
        if (sourceId == targetId) {
          ev.cancel = true;
        }
      });
      // 监听选择变化 (选中)
      currentPage.on("afteritemselected", ev => {
        // 选择对象为Node节点
        if (ev.item.isNode) {
          // 获取属性
          const nm = ev.item.getModel();
          self.currentNode = nm;
          var general_property_temporary = [
            { id: "retry_count", value: "1", name: "重试次数" },
            { id: "retry_interval", value: "50", name: "重试时间间隔(ms)" },
            {
              id: "execution_timeout",
              value: "50000",
              name: "执行超时时间(ms)"
            },
            {
              id: "delayed_execution_time",
              value: "50",
              name: "延迟执行时间(ms)"
            },
            {
              id: "waiting_time_after_execution",
              value: "50",
              name: "执行后等待时间"
            }
          ];
          typeof nm.input === "string" && (nm.input = JSON.parse(nm.input));
          typeof nm.output === "string" && (nm.output = JSON.parse(nm.output));
          self.input = nm.input;
          self.output = nm.output;
          self.general_property =
            nm.general_property || general_property_temporary;
          self.nodeLabelShow = true;
          self.nodeLineLabelShow = true;
          self.nodeLabel = nm.label;
          self.operationName = nm.operationName;
          self.categoryName = nm.categoryName;
          self.attributionName = nm.attributionName;
          self.language = nm.language;
          self.version = nm.version;
          self.isShowDescription = false;
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
      currentPage.on("afteritemunselected", e => {
        self.currentNode = {};
        self.operationName = "";
        self.categoryName = "";
        self.attributionName = "";
        self.language = "";
        self.version = "";
        self.isShowDescription = true;
      });

      try {
        var readFile = JSON.parse(
          fs.readFileSync(
            `${config.projectsPath}/${this.projectName}/${this.projectName}.json`,
            "utf-8"
          )
        );
        let data = {
          nodes: readFile.nodes,
          edges: readFile.edges
        };
        const curPage = self.editor.getCurrentPage();
        curPage.read(data);
      } catch (error) {}
    },
    initTerminal() {
      let { init } =
        window.require(
          path.normalize(
            path.resolve() +
              "/public/base_integration/uiauto_logMonitor/logMonitor.js"
          )
        ) ||
        window.require(
          path.normalize(path.resolve() + "/global/logMonitor.js")
        );
      init(
        this.projectName,
        historyLogs => {
          this.logMessage = _.concat(this.logMessage, historyLogs);
          this.logMessage.push("=======   历史日志   =======");
        },
        newLogs => {
          this.logMessage = _.concat(this.logMessage, newLogs);
          setTimeout(() => {
            $("#logMessageId").scrollTop($("#logMessageBox")[0].offsetHeight);
          }, 0);
        }
      );
    },
    // 打开代码编辑器界面
    codeClick() {
      this.$refs.code[0].openCodeModal();
    },
    // 插件搜索
    pluginSearch(value) {
      this.searchPluginLs = [];
      if (value) {
        const searchName = value.replace(/\s+/g, "");
        if (searchName) {
          _.each(this.leftList, item => {
            if (item.title && item.title.indexOf(searchName) > -1) {
              this.searchPluginLs = _.concat(
                this.searchPluginLs,
                _.flattenDeep(_.map(item.msg, "child_msg"))
              );
            }
          });
          _.each(
            _.flattenDeep(
              _.map(_.flattenDeep(_.map(this.leftList, "msg")), "child_msg")
            ),
            (item, idx) => {
              if (item.data_label.indexOf(searchName) > -1) {
                this.searchPluginLs.push(item);
              }
            }
          );
        }
      }
      this.searchPluginLs = _.compact(
        _.unionWith(this.searchPluginLs, _.isEqual)
      );
    },
    // 执行当前节点
    async executecurrentNode() {
      if (JSON.stringify(this.currentNode) == "{}") {
        this.$message.error("请选择需要执行的节点");
      } else {
        let projectJson = await fse.readJsonSync(
          `${config.projectsPath}/${this.projectName}/${this.projectName}.json`
        );
        // 原先进入时的json
        let projectObj = {};
        if (projectJson.nodes) {
          projectObj.nodes = projectJson.nodes;
        }
        if (projectJson.edges) {
          projectObj.edges = projectJson.edges;
        }
        // 当前json
        let projectOtherObj = await this.editor.getCurrentPage().save();
        if (!_.isEqual(projectObj, projectOtherObj)) {
          this.$confirm(
            "检测到未保存的内容，请先保存修改后再执行",
            "确认信息",
            {
              showClose: false,
              closeOnClickModal: false,
              confirmButtonText: "保存",
              cancelButtonText: "取消"
            }
          )
            .then(() => {
              this.saveGraph("save").then(res => {
                if (res) {
                  electron.window_minimize();
                  window["executor"]
                    .execute_node(
                      this.projectName,
                      {
                        uiauto_browser: _.pick(
                          this.$store.state.project.browser,
                          ["executor_url", "session_id"]
                        ),
                        node_id: this.currentNode.id
                      },
                      newLogs => {
                        this.logMessage = _.concat(this.logMessage, newLogs);
                        setTimeout(() => {
                          $("#logMessageId").scrollTop(
                            $("#logMessageBox")[0].offsetHeight
                          );
                        }, 0);
                      }
                    )
                    .then(result => {
                      electron.window_maximize();
                      console.log("执行当前节点成功", result);
                      this.$message.success("执行当前节点成功");
                    })
                    .catch(err => {
                      console.log("执行当前节点出错", err);
                      electron.window_maximize();
                      this.$message.error("执行当前节点出错");
                    });
                }
              });
            })
            .catch(() => {});
        } else {
          console.log("projectName>>>>>>>>", this.projectName);
          electron.window_minimize();
          window["executor"]
            .execute_node(
              this.projectName,
              {
                uiauto_browser: _.pick(this.$store.state.project.browser, [
                  "executor_url",
                  "session_id"
                ]),
                node_id: this.currentNode.id
              },
              newLogs => {
                this.logMessage = _.concat(this.logMessage, newLogs);
                setTimeout(() => {
                  $("#logMessageId").scrollTop(
                    $("#logMessageBox")[0].offsetHeight
                  );
                }, 0);
              }
            )
            .then(result => {
              electron.window_maximize();
              console.log("执行当前节点成功", result);
              this.$message.success("执行当前节点成功");
            })
            .catch(err => {
              electron.window_maximize();
              console.log("执行当前节点出错", err);
              this.$message.error("执行当前节点出错");
            });
        }
      }
    },
    findPlugin() {
      try {
        let attributionName_index =
          _.findIndex(this.leftList, { title: this.attributionName }) + 1;
        let categoryName_index =
          _.findIndex(
            _.find(this.leftList, { title: this.attributionName }).msg,
            { child_title: this.categoryName }
          ) + 1;
        this.$refs.multipleSubmenu.open(
          `${attributionName_index}-${categoryName_index}`
        );
      } catch (error) {
        this.pluginSearchInput = this.operationName;
        this.pluginSearch(this.operationName);
      }
    },
    viewProjectDescription() {
      this.dialogFormVisible = true;
    }
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
        return _.map(this.input, "name").concat(["组件返回值"]);
      },
      set() {
        return _.map(this.input, "name").concat(["组件返回值"]);
      }
    }
  },
  async beforeRouteLeave(to, from, next) {
    if (this.projectType === "cloud" && !this.hasModificationRights) {
      // window.ptyProcess.kill();
      next();
    } else {
      let projectJson = fse.readJsonSync(
        `${config.projectsPath}/${this.projectName}/${this.projectName}.json`
      );
      // 原先进入时的json
      let projectObj = {};
      if (projectJson.nodes) {
        projectObj.nodes = projectJson.nodes;
      }
      if (projectJson.edges) {
        projectObj.edges = projectJson.edges;
      }
      // 当前json
      let projectOtherObj = await this.editor.getCurrentPage().save();

      let general_property_temporary = [
        { id: "retry_count", value: "1", name: "重试次数" },
        { id: "retry_interval", value: "50", name: "重试时间间隔(ms)" },
        {
          id: "execution_timeout",
          value: "50000",
          name: "执行超时时间(ms)"
        },
        {
          id: "delayed_execution_time",
          value: "50",
          name: "延迟执行时间(ms)"
        },
        {
          id: "waiting_time_after_execution",
          value: "50",
          name: "执行后等待时间"
        }
      ];
      await _.each(projectOtherObj.nodes, node => {
        if (!node.general_property) {
          node.general_property = general_property_temporary;
        }
      });
      if (
        !_.isEqual(projectObj, projectOtherObj) ||
        this.description != projectJson.description
      ) {
        this.$confirm(
          "检测到未保存的内容，是否在离开页面前保存修改？",
          "确认信息",
          {
            showClose: false,
            closeOnClickModal: false,
            confirmButtonText: "保存离开",
            cancelButtonText: "直接离开"
          }
        )
          .then(() => {
            this.saveGraph("save").then(res => {
              if (res) {
                // window.ptyProcess.kill();
                next();
              }
            });
          })
          .catch(() => {
            // window.ptyProcess.kill();
            next();
          });
      } else {
        // window.ptyProcess.kill();
        next();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  display: none;
}
// ---------终端样式开始----------
/deep/.xterm {
  font-feature-settings: "liga" 0;
  position: relative;
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
}

/deep/.xterm.focus,
.xterm:focus {
  outline: none;
}

/deep/.xterm .xterm-helpers {
  position: absolute;
  top: 0;
  /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
  z-index: 10;
}

/deep/.xterm .xterm-helper-textarea {
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

/deep/.xterm .composition-view {
  /* TODO: Composition position got messed up somewhere */
  background: #000;
  color: #fff;
  display: none;
  position: absolute;
  white-space: nowrap;
  z-index: 1;
}

/deep/.xterm .composition-view.active {
  display: block;
}

/deep/.xterm .xterm-viewport {
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

/deep/.xterm .xterm-screen {
  position: relative;
}

/deep/.xterm .xterm-screen canvas {
  position: absolute;
  left: 0;
  top: 0;
}

/deep/.xterm .xterm-scroll-area {
  visibility: hidden;
}

/deep/.xterm-char-measure-element {
  display: inline-block;
  visibility: hidden;
  position: absolute;
  top: 0;
  left: -9999em;
  line-height: normal;
}

/deep/.xterm {
  cursor: text;
}

/deep/.xterm.enable-mouse-events {
  /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
  cursor: default;
}

/deep/.xterm.xterm-cursor-pointer {
  cursor: pointer;
}

/deep/.xterm.column-select.focus {
  /* Column selection mode */
  cursor: crosshair;
}

/deep/.xterm .xterm-accessibility,
.xterm .xterm-message {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  color: transparent;
}

/deep/.xterm .live-region {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/deep/.xterm-dim {
  opacity: 0.5;
}

/deep/.xterm-underline {
  text-decoration: underline;
}

// ---------终端样式结束----------

/deep/.el-collapse-item__content {
  padding-bottom: 0px;
}
/deep/ .el-col-15 {
  padding: 0 !important;
  border-top: 10px solid #eee;
}
/deep/ .el-row {
  margin-left: 0px !important;
  margin-right: 0px !important;
}
/deep/ .el-collapse-item__header {
  height: 35px;
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
  height: calc(100vh);
  border: 1px solid #eee;
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
  margin-top: 10px;
}
.left .getItem {
  /* float: left; */
  width: 100%;
  /* height: 100px; */
  /* margin-left: 15px;
    display: flex; */
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
  // background: #3a71a8;
  width: 100%;
  text-align: center;
  color: #fff;
  border-radius: 7px;
  margin: 5px auto;
}
.right {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
.detailpannel {
  flex: 1;
  overflow: scroll;
}
.filter {
  // filter: blur(1px) contrast(0.9);
  pointer-events: none;
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
</style>
