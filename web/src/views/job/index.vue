<template>
  <div class="app-main-content" style="padding: 0 10px;">
    <div class="filter-container">
      <el-row>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" class="advanced-search-groups">
          项目名称：
          <el-input
            v-model="listQuery.name"
            placeholder="项目名称"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="handleFilter()"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="7" :lg="7" :xl="7" class="advanced-search-groups">
          任务状态：
          <el-select
            v-model="listQuery.status"
            class="filter-item"
            placeholder="任务状态"
            @change="handleFilter()"
          >
            <el-option
              v-for="item in sortOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="11" :lg="11" :xl="11" class="advanced-search-groups">
          任务时间：
          <el-date-picker
            v-model="listQuery.createdAt"
            type="datetimerange"
            align="right"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-col>
        <el-col
          align="right"
          :xs="24"
          :sm="24"
          :md="24"
          :lg="24"
          :xl="24"
          class="advanced-search-operations"
        >
          <el-button
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            @click="handleFilter()"
          >搜索</el-button>
        </el-col>
      </el-row>
    </div>
    <el-table border style="width: 100%" :data="taskList" v-loading="loading">
      <el-table-column prop="id" align="center" label="任务ID"></el-table-column>
      <el-table-column prop="project_name" align="center" label="项目名称"></el-table-column>
      <el-table-column label="任务状态" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.status=='running'" effect="dark">运行中</el-tag>
          <el-tag v-if="scope.row.status=='success'" effect="dark" type="success">成功</el-tag>
          <el-tag v-if="scope.row.status=='todo'" effect="dark" type="primary">待执行</el-tag>
          <el-tag v-if="scope.row.status=='fail'" effect="dark" type="danger">失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" align="center" label="任务时间"></el-table-column>
      <!-- <el-table-column prop="message" align="center" label="错误信息"></el-table-column> -->
      <el-table-column prop="message" fixed="right" align="center" label="错误信息">
        <template slot-scope="scope">
          <el-button
            type="primary"
            slot="reference"
            v-if="scope.row.status=='fail'"
            @click="viewClick(scope.row.message)"
          >查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="详情信息"
      :visible.sync="showDialog"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="5vh"
    >
      <el-table
        border
        style="width: 100%"
        :data="message"
        :show-header="false"
        max-height="calc(100vh - 200px)"
      >
        <el-table-column>
          <template slot-scope="{row}">
            <font v-if="row.log.indexOf('[error]') > -1" style="color: red;">{{row.log}}</font>
            <font v-else>{{row.log}}</font>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <div style="width: 100%;">
      <center>
        <pagination
          style="display: inline-block;"
          :total="total"
          :page.sync="listQuery.pageIndex"
          :limit.sync="listQuery.pageSize"
          @pagination="getList(listQuery)"
        />
      </center>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { taskList } from "@/api/task";
import Pagination from "@/components/Pagination";

export default {
  name: "Job",
  components: {
    Pagination
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      message: [],
      total: 0,
      listQuery: {
        name: "",
        status: "all",
        createdAt: [
          new Date(moment().format("YYYY-MM-DD 00:00:00")),
          new Date(moment().format("YYYY-MM-DD 23:59:59"))
        ],
        pageIndex: 1,
        pageSize: 10
      },
      taskList: [],
      sortOptions: [
        { label: "全部", key: "all" },
        { label: "运行中", key: "running" },
        { label: "成功", key: "success" },
        { label: "失败", key: "fail" }
      ]
    };
  },
  created() {
    this.getList(this.listQuery);
  },
  mounted() {},
  methods: {
    // 获取任务列表信息
    getList(listQuery) {
      this.loading = true;
      let _where = {};
      listQuery.name && (_where.name = { $like: `%${listQuery.name}%` });
      if (listQuery.createdAt) {
        const timeLimit = _.map(listQuery.createdAt, function(timeLimit) {
          return moment(timeLimit).format("YYYY-MM-DD HH:mm:ss");
        });
        _where.createdAt = { $between: timeLimit };
      }
      if (listQuery.status !== "all") {
        _where.status = listQuery.status;
      }
      let postBody = {
        where: _where,
        pageIndex: listQuery.pageIndex,
        pageSize: listQuery.pageSize
      };
      taskList(postBody).then(taskListRes => {
        this.loading = false;
        if (taskListRes.data) {
          this.taskList = taskListRes.data.list;
          this.total = taskListRes.data.total;
          this.pageIndex = taskListRes.data.pageIndex;
          this.pageSize = taskListRes.data.pageSize;
        }
      });
    },
    // 筛选
    handleFilter() {
      this.listQuery.pageIndex = 1;
      this.getList(this.listQuery);
    },
    // 刷新
    refresh() {
      this.getList(this.listQuery);
    },
    viewClick(data) {
      if (JSON.parse(data)) {
        _.each(_.compact(JSON.parse(data).split("\n")), item => {
          if (item !== " ") {
            this.message.push({ log: item });
          }
        });
      }
      console.log(this.message);
      // this.message = JSON.parse(data).split("\n");
      this.showDialog = true;
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.el-select-dropdown__item {
  font-size: 12px;
}
.app-main-content {
  margin: 10px;
  height: 100%;
  background: #fff;

  .advanced-search-groups {
    padding: 8px 12px;
    font-size: 12px;
  }

  .filter-container {
    margin-bottom: 10px;
  }
}
</style>
