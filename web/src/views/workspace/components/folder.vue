<template>
  <div>
    <el-dialog
      title="新建文件夹"
      :visible.sync="showDialog_create_folder"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div style="height: 32px;margin-bottom: 12px;">
        <span class="title-name">文件夹名称：</span>
        <input
          v-model="folderName"
          maxlength="100"
          clearable
          style="vertical-align: middle;resize: none;word-wrap:normal;overflow:hidden;width: 70%;height: 32px;line-height: 24px;border-radius: 5px;border: 1px solid #ccc;"
        >
      </div>
      <div style="margin-top: 30px;">
        <el-button
          type="primary"
          style="width: 70px;height: 32px;line-height: 7px;"
          @click="commitCreateFolder()"
        >确定</el-button>
        <el-button
          style="width: 70px;height: 32px;line-height: 7px;color: #1890ff;border: 1px solid #1890ff;"
          @click="cancelCreateFolder()"
        >取消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="重命名文件夹"
      :visible.sync="showDialog_rename_folder"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="6" class="title-name" style="line-height: 32px;">文件夹新名称</el-col>
        <el-col :span="18">
          <el-input v-model="folderNewName" auto-complete="off" placeholder="请输入文件夹名称" />
        </el-col>
      </el-row>
      <div style="margin-top: 30px;">
        <el-button
          type="primary"
          style="width: 70px;height: 32px;line-height: 7px;"
          @click="commitRenameFolder()"
        >确定</el-button>
        <el-button
          style="width: 70px;height: 32px;line-height: 7px;color: #1890ff;border: 1px solid #1890ff;"
          @click="cancelRenameFolder()"
        >取消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="提示"
      :visible.sync="showProjectMove"
      width="30%"
      center
    >
      <span style="font-size: large">确定将项目 {{ dropData.projectName }} 移动到文件夹 {{ dropData.folderName }} 下吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showProjectMove = false">取 消</el-button>
        <el-button type="primary" @click="moveProject">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="tempFolderName"
      :visible.sync="showOpenFolder"
      width="50%"
      center
    >
      <el-row :gutter="24" style="margin-bottom: 5px;" type="flex" justify="end">
        <el-col :span="6" align="right">
          <el-button type="primary" icon="el-icon-circle-plus" size="mini" @click="showCreateProject">新建项目</el-button>
        </el-col>
      </el-row>
      <el-table
        border
        style="width: 100%;"
        :data="openFolderInfo"
        fit
      >
        <el-table-column prop="project_name" align="center" label="项目名称" draggable="true" />
        <el-table-column
          fixed="right"
          align="center"
          label="操作"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="editClick(scope.row)">编辑</el-button>
            <el-button
              type="success"
              size="mini"
              @click="handleSetLineChartData(scope.row)"
            >查看</el-button>
            <el-button type="info" size="mini" @click="download(scope.row)">导出</el-button>
            <el-button type="warning" size="mini" @click="outFolder(scope.row)">移出</el-button>
            <el-button type="danger" size="mini" @click="deleteProject(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog
      title="提示"
      :visible.sync="showDeleteFolder"
      width="30%"
    >
      <span style="font-size: large">此操作将永久删除文件夹 {{ dropData.folderName }} ，是否继续？</span>
      <el-checkbox v-if="showDeleteProject" v-model="isDelete"><span style="color: red">该文件夹不为空，是否同时删除文件夹内容？</span></el-checkbox>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDeleteFolder = false">取 消</el-button>
        <el-button type="primary" @click="deleteFolder">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
import project from '../../../store/modules/project'

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
  name: 'Folder',
  components: [],
  data() {
    return {
      projects_path: '',
      showDialog_create_folder: false,
      folderName: '',
      folders: [],
      showDialog_rename_folder: false,
      folderNewName: '',
      showProjectMove: false,
      dropData: '',
      tempFolders: [],
      folderJson: {},
      folderInfo: '',
      openFolderInfo: '',
      showOpenFolder: false,
      tempFolderName: '',
      showDeleteFolder: false,
      isDelete: false,
      deleteInfo: '',
      showDeleteProject: false
    }
  },
  computed: {},
  mounted() {
    this.getFolderList()
  },
  methods: {
    // 创建项目文件夹
    createFolder() {
      this.showDialog_create_folder = true
    },
    addFolder(folderItem) {
      const self = this
      self.projects_path = config.projectsPath + '/'
      var json = ''
      try {
        json = fse.readJsonSync(
          `${self.projects_path}/${folderItem}/${folderItem}.json`
        )
      } catch (error) {
        // console.error(error)
      }
      const initialStatus = {
        folder_name: json.folder_name,
        project_type: json.project_type || 'folder',
        projects: json.projects || [],
        json: json,
        date: moment(json.updatedAt).format('YYYY-MM-DD')
      }
      this.$store.commit('project/LOCAL_PROJECT_FOLDERS', initialStatus)
    },
    getFolderList() {
      const self = this
      if (config.projectsPath) {
        // 插件目录
        self.projects_path = config.projectsPath + '/'
        var folders = []
        var json = ''
        // var projects = []

        const files = fs.readdirSync(self.projects_path)
        files.forEach(function(fileName, index) {
          const file = fs.statSync(self.projects_path + '\\' + fileName)
          if (file.isDirectory()) {
            json = fse.readJsonSync(
              `${self.projects_path}/${fileName}/${fileName}.json`
            )
            if (json.project_type === 'folder') {
              folders.push(fileName)
            }
          }
        })
        // console.error(projects)
        this.tempFolders = _.each(folders, (folderItem, idx) => {
          this.addFolder(folderItem)
        })
      }
    },
    commitCreateFolder() {
      const self = this
      if (!this.folderName.trim()) {
        this.$parent.message('文件夹名称不能为空', 'warning')
      } else {
        if (!config.projectsPath) {
          this.$parent.message('请先到系统管理设置项目路径', 'warning')
          return
        }
        try {
          fs.accessSync(
            this.$parent.projects_path +
            this.folderName +
            '/' +
            this.folderName +
            '.json',
            fs.F_OK
          )
          let index = _.findIndex(this.$parent.local_folderLs, function(e) {
            return e.folder_name === self.folderName
          })
          if (index >= 0) {
            this.$parent.message('已存在同名文件夹', 'warning')
            return
          }
          index = _.findIndex(this.$parent.projectLs, function(e) {
            return e.project_name === self.folderName
          })
          if (index >= 0) {
            this.$parent.message('已存在同名项目', 'warning')
            return
          }
        } catch (e) {
          if (!fs.existsSync(this.$parent.projects_path + this.folderName)) {
            fse.ensureDirSync(this.$parent.projects_path + this.folderName)
            var writeJson = _.extend(
              { folder_name: this.folderName },
              { project_type: 'folder' },
              { projects: [] },
              { createAt: moment().format('YYYY-MM-DD HH:mm:ss') },
              { updateAt: moment().format('YYYY-MM-DD HH:mm:ss') },
            )
            fse.writeJsonSync(
              `${this.$parent.projects_path}${this.folderName}/${this.folderName}.json`,
              writeJson,
              'utf8'
            )
            this.addFolder(this.folderName)
          }
        }
        this.cancelCreateFolder()
      }
    },
    // 取消创建文件夹
    cancelCreateFolder() {
      this.folderName = ''
      this.showDialog_create_folder = false
    },
    // 鼠标进入文件夹事件
    enterFolder(folder) {
      this.$parent.show = true
      this.$parent.showCurrent = folder.folder_name
    },
    // 鼠标离开文件夹事件
    leaveFolder(folder) {
      this.$parent.show = false
      this.$parent.showCurrent = ''
    },
    // 文件夹重命名
    editFolder(folder) {
      var json = ''
      try {
        json = fse.readJsonSync(
          `${this.$parent.projects_path}/${folder.folder_name}/${folder.folder_name}.json`
        )
      } catch (error) { () => {} }
      this.folderInfo = json
      this.folderNewName = json.folder_name
      this.showDialog_rename_folder = true
    },
    commitRenameFolder() {
      if (!this.folderNewName.trim()) {
        this.$parent.message('文件夹名称不能为空', 'warning')
      } else {
        var self = this
        _.each(
          ['folder_name', 'project_type', 'projects', 'createAt', 'updateAt'],
          item => {
            if (item === 'updateAt') {
              self.folderJson[item] = moment().format('YYYY-MM-DD HH:mm:ss')
            } else {
              self.folderJson[item] = self.folderInfo[item]
            }
          }
        )
        if (this.folderInfo.folder_name !== this.folderNewName) {
          if (fs.existsSync(`${config.projectsPath}/${this.folderNewName}`)) {
            this.$message({
              message: '文件夹已存在',
              type: 'error'
            })
            return
          } else {
            this.$parent.delDir(`${config.projectsPath}/${this.folderInfo.folder_name}`)
            this.$store.commit('project/LOCAL_PROJECT_FOLDER_DELETE', this.folderInfo)
            fse.ensureDirSync(`${config.projectsPath}/${this.folderNewName}`)
            self.folderJson['folder_name'] = this.folderNewName
            fse.writeFileSync(
              `${config.projectsPath}/${this.folderNewName}/${this.folderNewName}.json`,
              JSON.stringify(self.folderJson, null, '\t'),
              'utf8'
            )
            this.addFolder(this.folderNewName)
            this.$message({
              message: '修改成功',
              type: 'success'
            })
          }
          this.folderNewName = ''
          this.showDialog_rename_folder = false
        } else {
          fse.writeFileSync(
            `${config.projectsPath}/${this.folderInfo.folder_name}/${this.folderInfo.folder_name}.json`,
            JSON.stringify(this.folderJson, null, '\t'),
            'utf8'
          )
          this.folderNewName = ''
          this.showDialog_rename_folder = false
          this.addFolder(this.folderInfo.folder_name)
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        }
      }
    },
    cancelRenameFolder() {
      this.folderNewName = ''
      this.showDialog_rename_folder = false
    },
    // 删除文件夹
    deleteFolder() {
      try {
        if (this.isDelete) {
          var self = this
          _.each(self.deleteInfo.projects, project => {
            this.$parent.delDir(this.$parent.projects_path + project)
            this.$store.commit('project/LOCAL_PROJECT_DELETE', { project_name: project })
          })
        }
        this.$parent.delDir(this.$parent.projects_path + this.deleteInfo.folder_name)
        this.$message({
          type: 'success',
          message: '删除成功'
        })
        this.$store.commit('project/LOCAL_PROJECT_FOLDER_DELETE', this.deleteInfo)
      } catch (err) {
        console.log(err)
        this.$message({
          type: `${err === 'cancel' ? 'info' : 'error'}`,
          message: `${
            err === 'cancel' ? '已取消删除' : '文件被占用，请稍后再试'
          }`
        })
      }

      this.showDeleteFolder = false
      this.showDeleteProject = false
      this.isDelete = false
      this.deleteInfo = ''
    },
    // 项目拖拽
    dragstart(event, data) {
      console.log('dragstart======================')
      event.dataTransfer.setData('item', data)
    },
    dragend(event) {
      console.log('dragend==========================')
      event.dataTransfer.clearData()
    },
    drog(event, data) {
      event.preventDefault()
      console.log('droping==============================')
      const project_name = event.dataTransfer.getData('item')
      // this.dropData = data
      console.log('project: ', project_name)
      // this.showProjectMove = true
      this.dropData = {
        folderName: data,
        projectName: project_name
      }
      this.moveProject()
    },
    moveProject() {
      try {
        const self = this
        self.projects_path = config.projectsPath + '/'
        let json = ''
        try {
          json = fse.readJsonSync(
            `${self.projects_path}/${this.dropData.folderName}/${this.dropData.folderName}.json`
          )
        } catch (error) { () => {} }

        const index = _.findIndex(json.projects, function(element) {
          return element === self.dropData.projectName
        })
        if (index !== -1) {
          this.$message({
            message: `文件夹 ${this.dropData.folderName} 中已存在项目 ${this.dropData.projectName}`,
            type: 'warning'
          })
          return
        }

        json['projects'].push(this.dropData.projectName)
        json['updateAt'] = moment().format('YYYY-MM-DD HH:mm:ss')

        fse.writeFileSync(
          `${self.projects_path}/${this.dropData.folderName}/${this.dropData.folderName}.json`,
          JSON.stringify(json, null, '\t'),
          'utf8'
        )
        this.$store.commit('project/LOCAL_PROJECT_FOLDER_DELETE', { folder_name: this.dropData.folderName })

        const data = {
          folder_name: this.dropData.folderName,
          project_type: json.project_type || 'folder',
          projects: json.projects || [],
          json: json,
          date: moment(json.updateAt).format('YYYY-MM-DD')
        }
        this.$store.commit('project/LOCAL_PROJECT_FOLDERS', data)

        this.$message({
          type: 'success',
          message: '移动成功'
        })
        this.showProjectMove = false
        this.dropData = ''
      } catch (e) {
        this.$message({
          type: 'error',
          message: '移动失败'
        })
      }
    },
    outFolder(params) {
      // console.error(params)
      this.$confirm(`是否将项目 ${params.project_name} 移出文件夹 ${params.folder_name}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // this.delDir(this.projects_path + item.project_name)
          var projectLs = []
          const folderLs = this.$parent.local_folderLs
          const index = _.findIndex(folderLs, function(element) {
            return element.folder_name === params.folder_name
          })
          // console.error(folderLs)
          this.$store.commit('project/LOCAL_PROJECT_FOLDER_DELETE', params)
          let json = ''
          try {
            json = fse.readJsonSync(
              `${config.projectsPath}/${params.folder_name}/${params.folder_name}.json`
            )
          } catch (error) {
            console.error(error)
          }
          if (index !== -1) {
            projectLs = folderLs[index].projects
          } else {
            projectLs = json.projects
          }
          // console.error(json)
          json['projects'] = _.pull(projectLs, params.project_name)
          json['updateAt'] = moment().format('YYYY-MM-DD HH:mm:ss')
          fse.writeFileSync(
            `${config.projectsPath}/${params.folder_name}/${params.folder_name}.json`,
            JSON.stringify(json, null, '\t'),
            'utf8'
          )
          const data = {
            folder_name: params.folder_name,
            project_type: json.project_type || 'folder',
            projects: json.projects || [],
            json: json,
            date: moment(json.updateAt).format('YYYY-MM-DD')
          }
          this.$store.commit('project/LOCAL_PROJECT_FOLDERS', data)

          this.$message({
            type: 'success',
            message: '移出成功'
          })
          // this.$store.commit('project/LOCAL_PROJECT_DELETE', item)
          this.showOpenFolder = false
        })
        .catch(err => {
          console.log(err)
          this.$message({
            type: `${err === 'cancel' ? 'info' : 'error'}`,
            message: `${
              err === 'cancel' ? '已取消移出' : '文件被占用，请稍后再试'
            }`
          })
        })
    },
    openFolder(folder) {
      const self = this
      self.projects_path = config.projectsPath + '/'
      this.tempFolderName = ''
      this.showOpenFolder = true
      const folderLs = this.$parent.local_folderLs
      const projectLs = this.$parent.local_folder_projects

      // console.error(folderLs)
      let json = ''

      if (folderLs.length) {
        const index = _.findIndex(folderLs, function(e) {
          return e.folder_name === folder.folder_name
        })
        if (index !== -1) {
          this.tempFolderName = folderLs[index].folder_name
          const arr = []
          _.each(folderLs[index].projects, project => {
            const projectIndex = _.findIndex(projectLs, function(e) {
              return e === project
            })
            if (projectIndex !== -1) {
              // json = projectLs[projectIndex].json
              try {
                json = fse.readJsonSync(
                  `${self.projects_path}/${project}/${project}.json`
                )
              } catch (error) {
                // console.error(error)
              }
              arr.push({
                project_name: project,
                folder_name: folderLs[index].folder_name,
                folder_info: folderLs[index].json,
                date: moment(json.updatedAt).format('YYYY-MM-DD'),
                project_type: json.project_type || '',
                json: json
              })
            }
          })
          this.openFolderInfo = arr
        }
      }
    },
    editClick(params) {
      this.$parent.editClick(params)
    },
    handleSetLineChartData(params) {
      this.$parent.handleSetLineChartData(params)
    },
    download(params) {
      this.$parent.download(params)
    },
    deleteProject(params) {
      this.$parent.deleteProject(params)
    },
    showCreateProject() {
      this.$parent.showDialog = true
    }
  }
}
</script>

<style scoped>

</style>
