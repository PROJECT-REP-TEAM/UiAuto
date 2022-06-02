<template>
  <div style="background: #fff">
    <el-table v-loading="loading" border :data="dataSource">
      <el-table-column type="index" align="center" width="50" />
      <el-table-column
        prop="projectName"
        align="center"
        label="项目标识"
        show-overflow-tooltip
      />
      <el-table-column
        prop="name"
        align="center"
        label="项目名称"
        show-overflow-tooltip
      />
      <el-table-column
        prop="latestVersion"
        align="center"
        label="最新版本号"
        show-overflow-tooltip
      />
      <el-table-column
        prop="author"
        align="center"
        label="项目作者"
        show-overflow-tooltip
      />
      <el-table-column
        prop="uploader"
        align="center"
        label="上传者"
        show-overflow-tooltip
      />
      <el-table-column
        prop="remark"
        align="center"
        label="备注"
        show-overflow-tooltip
      />
      <el-table-column fixed="right" align="center" label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="handleCollect(scope.row)"
            >下载</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageNo"
      :limit.sync="pageSize"
      @pagination="getTableData"
    />
  </div>
</template>

<script>
import { getStoreList, addCollect } from "@/api/application";
import Pagination from "@/components/Pagination";
import config from "@/config/environment/index";

export default {
  components: { Pagination },
  data() {
    return {
      loading: false,
      dataSource: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    getTableData() {
      this.loading = true;
      getStoreList({
        optType: "all",
        status: "public",
        column: "createTime",
        order: "desc",
        pageNo: this.pageNo,
        pageSize: this.pageSize,
      }).then((getProjectNameRes) => {
        this.loading = false;
        if (getProjectNameRes.success) {
          this.dataSource = getProjectNameRes.result.records;
          this.total = getProjectNameRes.result.total;
        } else {
          this.$message.error(getProjectNameRes.message);
        }
      });
    },
    handleCollect(row) {
      addCollect(row).then((res) => {
        if (res.success) {
          this.$message.success("下载成功");
        }
      });
    },
  },
};
</script>
