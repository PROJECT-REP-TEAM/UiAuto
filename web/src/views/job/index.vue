<template>
  <div class="app-main-content" style="padding: 0 10px;">
    <div class="filter-container">
      <el-row>
        <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8" class="advanced-search-groups">
          项目名称：
          <el-input
            v-model="listQuery.project_name"
            placeholder="项目名称"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="handleFilter()"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="7" :xl="7" class="advanced-search-groups">
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
        <el-col :xs="24" :sm="24" :md="24" :lg="9" :xl="9" class="advanced-search-groups">
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
      <el-table-column fixed="right" align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" slot="reference" @click="logFn(scope.row.id)">日志</el-button>
        </template>
      </el-table-column>
    </el-table>
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

    <el-dialog
      width="70%"
      title="日志详情"
      :visible.sync="innerVisible"
      append-to-body
      @closed="cancel"
    >
      <el-table
        v-infinite-scroll="detailLogLoadMore"
        :data="detailLogTableData"
        style="width: 100%"
        height="calc(40vh)"
        size="mini"
      >
        <el-table-column type="index" />
        <el-table-column prop="bank_name" label="类型" width="100">
          <template slot-scope="{row}">
            <el-tag
              :type="['primary', 'warning', 'danger', 'success'][['info', 'warn', 'fail', 'success'].indexOf(row.status)]"
              effect="dark"
              size="mini"
            >{{ ['信息', '警告', '失败', '成功'][['info', 'warn', 'fail', 'success'].indexOf(row.status)] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip></el-table-column>
        <el-table-column prop="updatedAt" label="创建时间" min-width="150" show-overflow-tooltip />
        <div slot="append" style="text-align: center">
          <!--在此处添加你想要插入在表格最后一行的内容-->
          <div
            v-if="detailLogIsMore"
            v-loading="true"
            element-loading-spinner="el-icon-loading"
            style="height:40px;line-height:40px"
          >&nbsp;</div>
          <div v-else style="height:40px;line-height:40px;color:#ccc">--- 已经到底了 ---</div>
        </div>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { taskList, uiautoLogList } from "@/api/task";
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
        project_name: "",
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
      ],
      innerVisible: false,
      detailLogTableData: [],
      detailLogPageIndex: 1,
      detailLogPageSize: 10,
      detailLogIsMore: false,
      detailLogWhere: {}
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
      listQuery.project_name &&
        (_where.project_name = { $like: `%${listQuery.project_name}%` });
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
    cancel() {
      this.innerVisible = false;
      this.detailLogTableData = [];
      this.detailLogPageIndex = 1;
      this.detailLogPageSize = 10;
      this.detailLogIsMore = false;
      this.detailLogWhere = {};
    },
    logFn(taskId) {
      this.innerVisible = true;
      this.detailLogLoadList(taskId);
    },
    detailLogLoadList(taskId) {
      this.detailLogWhere = { taskId: taskId };
      uiautoLogList({
        pageIndex: this.detailLogPageIndex,
        pageSize: this.detailLogPageSize,
        where: this.detailLogWhere,
        order: [
          ["createdAt", "DESC"],
          ["id", "DESC"]
        ]
      }).then(({ data }) => {
        this.detailLogTableData = data.list;
        this.detailLogPageIndex = data.pageIndex;
        this.detailLogPageSize = data.pageSize;
        this.detailLogIsMore = data.isMore;
      });
    },
    getRemote: _.debounce(function() {
      if (this.detailLogIsMore) {
        this.detailLogPageIndex++;
        uiautoLogList({
          pageIndex: this.detailLogPageIndex,
          pageSize: this.detailLogPageSize,
          where: this.detailLogWhere,
          order: [
            ["createdAt", "DESC"],
            ["id", "DESC"]
          ]
        }).then(({ data }) => {
          this.detailLogTableData = this.detailLogTableData.concat(data.list);
          this.detailLogPageIndex = data.pageIndex;
          this.detailLogPageSize = data.pageSize;
          this.detailLogIsMore = data.isMore;
        });
      }
    }, 500),
    detailLogLoadMore() {
      this.getRemote();
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
