<template>
  <el-dialog
    title="编辑操作"
    :visible.sync="showDialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    @closed="reset"
  >
    <el-row :gutter="20">
      <el-col :span="8" class="title-name" style="line-height: 32px;">项目名称</el-col>
      <el-col :span="16">
        <el-input v-model="form.project_name" placeholder="请输入项目名称" :disabled="isDisabled" />
        <font v-if="isDisabled" style="float: left;font-size: 12px;color: red;">云端项目不支持修改</font>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 10px;">
      <el-col :span="8" class="title-name" style="line-height: 32px;">开启执行规则</el-col>
      <el-col :span="16">
        <el-switch
          v-model="cronOpen"
          active-text="是"
          inactive-text="否"
          style="float: left;height: 32px;"
        />
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 10px;">
      <el-col :span="8" class="title-name" style="line-height: 32px;">开启录屏</el-col>
      <el-col :span="16">
        <el-switch
          v-model="recordOpen"
          active-text="是"
          inactive-text="否"
          style="float: left;height: 32px;"
        />
      </el-col>
    </el-row>
    <el-row v-if="cronOpen" :gutter="20" style="margin-top: 10px;">

      <el-row v-if="cronOpen" :gutter="20" style="margin-top: 10px;">

        <el-col :span="8" class="title-name" style="line-height: 32px;">执行规则</el-col>
        <el-col :span="16">
          <cron v-if="showCronBox" v-model="form.cron" />
          <el-input v-model="form.cron" auto-complete="off" readonly placeholder="请输入定时策略">
            <el-button
              v-if="!showCronBox"
              slot="append"
              icon="el-icon-arrow-up"
              title="打开图形配置"
              @click="showCronBox = true"
            />
            <el-button
              v-else
              slot="append"
              icon="el-icon-arrow-down"
              title="关闭图形配置"
              @click="showCronBox = false"
            />
          </el-input>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="8" class="title-name" style="line-height: 32px;">重试(次)</el-col>
        <el-col :span="16">
          <el-input v-model="form.retry_count" placeholder="请输入重试次数" type="number" />
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="8" class="title-name" style="line-height: 32px;">重试间隔(毫秒)</el-col>
        <el-col :span="16">
          <el-input v-model="form.retry_interval" placeholder="请输入重试时间" type="number" />
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="8" class="title-name" style="line-height: 32px;">超时时间(毫秒)</el-col>
        <el-col :span="16">
          <el-input v-model="form.time_out" placeholder="请输入超时时间" type="number" />
        </el-col>
      </el-row>

    </el-row>
    <div style="margin-top: 30px;">
      <el-button
        type="primary"
        style="width: 70px;height: 32px;line-height: 7px;"
        @click="commitEdit()"
      >确定</el-button>
      <el-button
        style="width: 70px;height: 32px;line-height: 7px;color: #1890ff;border: 1px solid #1890ff;"
        @click="showDialog = false"
      >取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
const async = require('async')
const fs = window.require('fs')
const os = window.require('os')
const path = window.require('path')
const fse = window.require('fs-extra')
var decompress = window.require('decompress')
import _ from 'lodash'
import moment from 'moment'
import cron from './cron'
import environment from '@/config/environment'
import config from '@/config/environment/index'

export default {
  name: 'Edit',
  components: {
    cron
  },
  data() {
    return {
      showDialog: false,
      cronOpen: true,
      recordOpen: false,
      showCronBox: false,
      isDisabled: false,
      propProjectName: '',
      readJson: '',
      form: {
        project_name: '',
        cron: '',
        retry_count: '',
        retry_interval: '',
        time_out: ''
      },
      folderName: ''
    }
  },
  computed: {},
  mounted() {},
  methods: {
    show(params) {
      this.readJson = params.json
      this.showDialog = true
      this.propProjectName = params.json.project_name
      this.cronOpen = !!params.json.cron
      this.recordOpen = !!params.json.automatic_recording
      this.form.project_name = params.json.project_name
      this.form.cron = params.json.cron || ''
      this.form.retry_count = params.json.retry_count || ''
      this.form.retry_interval = params.json.retry_interval || ''
      this.form.time_out = params.json.time_out || ''
      this.isDisabled = params.project_type === 'cloud'
      this.folderName = params.folder_name
    },
    reset() {
      this.showDialog = false
      this.cronOpen = true
      this.recordOpen = false
      this.showCronBox = false
      this.isDisabled = false
      this.propProjectName = ''
      this.form = {
        project_name: '',
        cron: '',
        retry_count: '',
        retry_interval: '',
        time_out: ''
      }
      this.folderName = ''
    },
    commitEdit() {
      const self = this
      if (!this.cronOpen) {
        this.form.cron = ''
      }
      if (this.cronOpen && !this.cron) {
        this.cronOpen = false
      }
      if (this.form.cron === '* * * * * *') {
        this.$message({
          message: 'cron不能设置为每秒执行',
          type: 'error'
        })
        return
      }
      if (this.recordOpen) {
        this.readJson['automatic_recording'] = true
      } else {
        this.readJson['automatic_recording'] = false
      }
      _.each(
        ['cron', 'retry_count', 'retry_interval', 'time_out', 'updateAt'],
        item => {
          if (item === 'updateAt') {
            this.readJson[item] = moment().format('YYYY-MM-DD HH:mm:ss')
          } else {
            this.readJson[item] = this.form[item]
          }
        }
      )

      if (this.propProjectName !== this.form.project_name) {
        if (fs.existsSync(`${config.projectsPath}/${this.form.project_name}`)) {
          this.$message({
            message: '项目已存在',
            type: 'error'
          })
          return
        } else {
          this.$parent.delDir(`${config.projectsPath}/${this.propProjectName}`)
          this.$store.commit('project/LOCAL_PROJECT_DELETE', {
            project_name: this.propProjectName
          })
          fse.ensureDirSync(`${config.projectsPath}/${this.form.project_name}`)
          this.readJson['project_name'] = this.form.project_name
          fse.writeFileSync(
            `${config.projectsPath}/${this.form.project_name}/${this.form.project_name}.json`,
            JSON.stringify(this.readJson, null, '\t'),
            'utf8'
          )
          this.showDialog = false
          this.$parent.addProject(this.form.project_name)

          if (this.folder_name !== '') {
            this.$store.commit('project/LOCAL_PROJECT_FOLDER_DELETE', {
              folder_name: this.folderName
            })
            let json = ''
            try {
              json = fse.readJsonSync(
                `${config.projectsPath}/${this.folderName}/${this.folderName}.json`
              )
            } catch (error) {
              console.error(error)
            }
            // console.error(json)
            const projectIndex = _.findIndex(json['projects'], function(e) {
              return e === self.propProjectName
            })
            if (projectIndex !== -1) {
              json['projects'][projectIndex] = this.form.project_name
            }
            json['updateAt'] = moment().format('YYYY-MM-DD HH:mm:ss')
            fse.writeFileSync(
              `${config.projectsPath}/${this.folderName}/${this.folderName}.json`,
              JSON.stringify(json, null, '\t'),
              'utf8'
            )
            const data = {
              folder_name: this.folderName,
              project_type: json.project_type || 'folder',
              projects: json.projects || [],
              json: json,
              date: moment(json.updateAt).format('YYYY-MM-DD')
            }
            this.$store.commit('project/LOCAL_PROJECT_FOLDERS', data)
          } else {
            console.error('===============================')
          }
          this.$parent.$refs['childFolder'].showOpenFolder = false
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        }
      } else {
        fse.writeFileSync(
          `${config.projectsPath}/${this.propProjectName}/${this.propProjectName}.json`,
          JSON.stringify(this.readJson, null, '\t'),
          'utf8'
        )
        this.showDialog = false
        this.$parent.addProject(this.propProjectName)
        this.$message({
          message: '修改成功',
          type: 'success'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
