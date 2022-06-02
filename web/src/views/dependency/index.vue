<!--
 * @Author: Bobol_Lum
 * @LastEditors: chenzy
 * @Description:
 * @Date: 2019-04-28 11:21:11
 * @LastEditTime: 2019-07-18 11:16:46
 -->
<template>
  <div class="app-main-content">
    <!-- <div v-for="dependency in dependencies" :key="dependency.title">
      <img :src="dependency.background">
    </div>-->
    <!-- 别删，拼命 -->
    <div
      v-for="dependency in dependencies"
      :key="dependency.title"
      style="display:inline-block;margin-top:20px;margin-left:20px;"
    >
      <div
        :style="{display:'inline-block',width:'300px',height:'177px',background:'url('+dependency.background+') no-repeat'}"
      >
        <div style="padding:20px;height:100%;position:relative">
          <div class="title">{{ dependency.title }}</div>
          <div class="version">版本号：{{ dependency.version || '无' }}</div>
          <div v-show="dependency.name === 'chrome'" class="version">ChromeDriver：{{ dependency.driver_version || '无' }}</div>
          <div v-show="dependency.name !== 'chrome'" class="version">&nbsp;</div>
          <!-- <a
           v-bind:class="downloadBtnText[dependency.name] === '已安装' || downloadBtnText[dependency.name] === '已下载' ? 'aLink-disable' : 'aLink'"
           v-bind:class="'aLink'"
            v-bind:class="downloadBtnText[dependency.name] === '已安装' ? 'aLink-disable' : 'aLink'"
            target="_blank"
            disabled="true"
            :href="downloadBtnText[dependency.name] === '已安装' ? 'javascript:void(0)' : dependency.download_url"
          >{{downloadBtnText[dependency.name]}}</a>-->
          <el-button
            target="_blank"
            :class="downloadBtnText[dependency.name] === '已安装' || downloadBtnText[dependency.name] === '已下载' ? 'aLink-disable' : 'aLink'"
            :disabled="downloadBtnText[dependency.name] === '已安装' || downloadBtnText[dependency.name] === '已下载'"
            :loading="depandenciesDowload[dependency.name].downloading ? depandenciesDowload[dependency.name].downloading : false"
            style="padding: 0px 0px;"
          >{{ downloadBtnText[dependency.name] }}</el-button>
          <el-button
            v-if="!dependency.version && depandenciesDowload[dependency.name].isdownloaded && dependency.name !== 'selenium'"
            class="aLink"
            style="left: 90px; padding: 0px 0px;"
            target="_blank"
            :disabled="depandenciesDowload[dependency.name].installing"
            :loading="depandenciesDowload[dependency.name].installing"
            @click="installDependency(dependency)"
          >{{ depandenciesDowload[dependency.name].installing ? '安装中' : depandenciesDowload[dependency.name].installed ? '已安装' : '安装' }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

var spawn = window.nodeRequire('child_process').spawn
var exec = window.nodeRequire('child_process').exec
var execSync = window.nodeRequire('child_process').execSync
var os = window.nodeRequire('os')
var path = window.nodeRequire('path')
var fs = window.nodeRequire('fs')
import config from '@/config/environment/index'
import { globalBus } from '@/store/globalBus'

var { dependencyDownload } = require('@/utils/electron.js')
const decompress = window.nodeRequire('decompress')

export default {
  name: 'Dependency',
  components: {},
  data() {
    return {
      dependencies: [
        {
          name: 'node',
          background: require('../../assets/images/nodejs_background.png'),
          title: 'Node.js',
          filename: 'node-v10.16.0-x64.msi',
          version: '',
          download_url:
            os.arch() == 'x64'
              ? 'http://cdn.npm.taobao.org/dist/node/v10.16.0/node-v10.16.0-x64.msi'
              : 'http://cdn.npm.taobao.org/dist/node/v10.16.0/node-v10.16.0-x86.msi'
          // download_url: "http://nodejs.cn/download/"
        },
        {
          name: 'python',
          background: require('../../assets/images/python_background.png'),
          title: 'Python',
          filename: 'Python3.6.8_20190818.zip',
          download_url:
            'http://pwb9l70fu.bkt.clouddn.com/Python3.6.8_20190818.zip',
          // version: window.process.versions.python,
          // download_url: "https://www.python.org/downloads/"
          filePath: path.normalize(
            config.pluginsPath +
              '/..' +
              '/dependencies/Python3.6.8_20190816.zip'
          )
        },
        {
          name: 'chrome',
          background: require('../../assets/images/chrome_background.png'),
          title: 'Chrome',
          filename: 'ChromeSetup.exe',
          version: '',
          download_url:
            'https://dl.google.com/tag/s/appguid%3D%7B8A69D345-D564-463C-AFF1-A69D9E530F96%7D%26iid%3D%7B980AB9C1-00E5-3F58-102C-3101AF5FA3DE%7D%26lang%3Dzh-CN%26browser%3D4%26usagestats%3D1%26appname%3DGoogle%2520Chrome%26needsadmin%3Dprefers%26ap%3Dx64-stable-statsdef_1%26installdataindex%3Dempty/update2/installers/ChromeSetup.exe'
          // download_url: "https://www.google.cn/chrome/"
        }
        // {
        //   name: "selenium",
        //   background: require("../../assets/images/Selenium_background.png"),
        //   title: "Selenium",
        //   version: ""
        //   // download_url: "https://www.seleniumhq.org/download/"
        // }
        // {
        //   name: "autoit",
        //   background: require("../../assets/images/Autoit_background.png"),
        //   title: "Autoit",
        //   version: "",
        //   download_url: "https://www.autoitscript.com/site/autoit/downloads/"
        // }
      ],
      requirement: {
        node: '54.1.2',
        python: '54.1.2',
        chrome: '54.1.2'
        // selenium: "54.1.2"
        // autoit: "54.1.2"
      }
    }
  },
  computed: {
    downloadBtnText() {
      var downloadBtnText = {}
      _.forIn(this.requirement, (require_version, name) => {
        var target_version = _.find(this.dependencies, { name: name }).version
        console.log('aaaaa')
        console.log(target_version)
        console.log(this.depandenciesDowload[name])
        // console.log(name, ":", require_version.replace(/\./g,''), ",", target_version.replace(/\./g,''))
        var str = ''
        var install = ''
        if (target_version == undefined || target_version == '') {
          if (this.depandenciesDowload[name].isdownloaded == true) {
            str = '已下载'
            install = '安装'
          } else if (
            this.depandenciesDowload[name].isdownloaded == false &&
            this.depandenciesDowload[name].downloading == true
          ) {
            str = '下载中'
          } else {
            str = '下载'
          }
        } else {
          str = '已安装'
        }
        // else if (
        //   parseInt(target_version.replace(/\./g, ""))< parseInt(require_version.replace(/\./g, ""))
        // ) {
        //   str = "更新";
        // }
        downloadBtnText[name + 'isdownloaded'] = install
        downloadBtnText[name] = str
      })
      // console.log(downloadBtnText);
      return downloadBtnText
    },
    depandenciesDowload() {
      console.log('depandenciesDowload', this.$store.state.dependency)
      return this.$store.state.dependency
    }
  },
  created() {
    this.checkDepandenciesVersion()
    /*global Bus.$on("is_first_run", () => {
      if (
        _.compact(_.map(this.dependencies, "version")).length ===
        this.dependencies.length
      ) {
        console.log("当前环境不需要自动下载环境依赖");
        localStorage.setItem("is_first_run", false);
      }
    });*/
  },
  mounted() {

  },
  methods: {
    checkDepandenciesVersion() {
      // var checkVersionSync = function(command, regExp) {
      //   return new Promise((resolve, reject) => {
      //     exec(command, (err, stdout, stderr) => {
      //       if (err) {
      //         console.error(err);
      //         reject(err);
      //       } else if (stdout) {
      //         console.warn("checkVersionSync")
      //         let version = stdout.match(regExp)[0];
      //         console.log(version);
      //         resolve(version);
      //       } else if (stderr) {
      //         console.warn("checkVersionSync")
      //         let version = stderr.match(regExp)[0];
      //         console.log(version);
      //         resolve(version);
      //       }
      //     });
      //   });
      // };
      // console.error("checkDepandenciesVersion");
      const self = this
      _.each(this.dependencies, async(dependency, didx) => {
        // node
        if (dependency.name === 'node') {
          // dependency.version = window.process.versions.node;
          // self.depandencies[didx]
          dependency.version = window.process.versions.node
        }

        // python
        else if (dependency.name === 'python') {
          try {
            const stdout = execSync(
              path.join(path.resolve() + `/env/python/${os.platform()}/${os.platform() === 'win32' ? 'python.exe' : 'bin/python3'}`) +
                ' --version'
            ).toString()
            console.log('stdout>>>>>>', stdout)
            if (stdout) {
              const version = stdout.match(/[\d]*\.[\d]*\.[\d]*/)[0]
              this.$set(dependency, 'version', version)
              dependency.version = version
            }
            // dependency.version = await checkVersionSync(
            //   "python --version",
            //   /[\d]*\.[\d]*\.[\d]*/
            // );
          } catch (error) {
            const downloadParams = {
              name: dependency.name,
              downloading: false,
              isdownloaded: true
            }
            this.$store.dispatch('dependency/dependencyDownload', downloadParams)
            this.installDependency(dependency)
          }
        }

        // chrome
        else if (dependency.name === 'chrome') {
          try {
            let shell_result = execSync('REG QUERY "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Google Chrome" /v version')
            shell_result = shell_result.toString('UTF-8')
            shell_result = shell_result.split('    ')
            dependency.version = shell_result[shell_result.length - 1]

            let version = shell_result[shell_result.length - 1].split('.')
            version = _.slice(version, 0, version.length - 1).join('.')
            console.log('version>>>>>>>>>>>>>', version)

            const driver_path = path.join(path.resolve(), '/env/webdriver/win32/chromedriver.exe')
            const driver_shell = execSync(driver_path + ' --version')
            dependency.driver_version = driver_shell.toString().split(' ')[1]
            console.log('driver_version>>>>>>>>>>>>>>', driver_shell.toString())
          } catch (e) {
            console.log(e)
          }
        }

        // selenium
        else if (dependency.name === 'selenium') {
          exec('pip show selenium', (err, stdout, stderr) => {
            console.log('selenium')
            console.log(stdout)
            if (stdout) {
              const version = stdout.match(/[\d]*\.[\d]*\.[\d]*/)[0]
              console.log(version)
              dependency.version = version
            }
          })
        }
      })
      // exec("pip3 show selenium", (err, stdout, stderr) => {
      //   console.log("selenium");
      //   console.log(stdout);
      //   let version = stdout.match(/[\d]*\.[\d]*\.[\d]*/)[0];
      //   console.log(version);
      //   var target = _.find(this.dependencies, { name: "selenium" });
      //   if (target) {
      //     target.version = version;
      //     this.dependencies = _.cloneDeep(this.dependencies);
      //   }
      // });
      // var python_verson_process = spawn("python", ["--version"]);

      // python_verson_process.stderr.on("data", data => {
      //   data += "";
      //   let version = data.match(/[\d]*\.[\d]*\.[\d]*/)[0];
      //   console.log("python", data);
      //   var target = _.find(this.dependencies, { name: "python" });
      //   if (target) {
      //     target.version = version;
      //     this.dependencies = _.cloneDeep(this.dependencies);
      //   }
      // });
    },
    download(dependency) {
      return new Promise((resolve, reject) => {
        console.log('download')
        if (dependency.name === 'selenium') {
          var version = ''
          exec('python --version', (err, stdout, stderr) => {
            console.log('python')
            console.log(stdout)
            console.log(stderr)
            if (stderr) {
              version = stderr.match(/[\d]*\.[\d]*\.[\d]*/)[0]
              dependency.version = version
            }
          })
          if (version === '' || version === undefined) {
            this.$message({
              showClose: true,
              message: '检测到系统没有安装python，请先安装python',
              type: 'warning'
            })
          } else {
            const downloadParams = {
              name: dependency.name,
              downloading: true,
              isdownloaded: false
            }
            this.$store
              .dispatch('dependency/dependencyDownload', downloadParams)
              .then(result => {
                exec('pip install selenium', (err, stdout, stderr) => {
                  console.log(err)
                  console.log(stdout)
                  console.log(stderr)
                  if (err != null) {
                    const downloadParams = {
                      name: dependency.name,
                      downloading: false,
                      isdownloaded: false
                    }
                    this.$store.dispatch(
                      'dependency/dependencyDownload',
                      downloadParams
                    )
                  } else {
                    const downloadParams = {
                      name: dependency.name,
                      downloading: false,
                      isdownloaded: true
                    }
                    this.$store.dispatch(
                      'dependency/dependencyDownload',
                      downloadParams
                    )
                  }
                })
              })
          }
        } else {
          const downloadParams = {
            name: dependency.name,
            downloading: true,
            isdownloaded: false
          }
          this.$store
            .dispatch('dependency/dependencyDownload', downloadParams)
            .then(result => {
              console.log('after', result)
              console.log(this.depandenciesDowload[dependency.name])

              dependencyDownload({
                dependency: dependency,
                listener_name: 'downstate' + dependency.filename,
                downloadPath: dependency.download_url,
                configPath: path.normalize(
                  config.pluginsPath + '/..' + '/dependencies/'
                )
              })
                .then(praw => {
                  console.log('download sueccess')
                  resolve()
                })
                .catch(err => {
                  const downloadParams = {
                    name: dependency.name,
                    downloading: false,
                    isdownloaded: false
                  }
                  this.$store
                    .dispatch('dependency/dependencyDownload', downloadParams)
                    .then(result => {
                      console.log('err after')
                      console.log(this.depandenciesDowload[dependency.name])
                    })
                })
            })
        }
      })
    },
    async installDependency(dependency) {
      try {
        console.log('installDependency')
        const filePath = this.depandenciesDowload[dependency.name].filePath
        console.log(filePath)
        await this.$store.dispatch('dependency/dependencyDownload', {
          name: dependency.name,
          installing: true
        })
        if (dependency.name === 'python') {
          console.log(dependency)
          if (!fs.existsSync(path.join(path.resolve() + '/env/python/'))) {
            fs.mkdirSync(path.join(path.resolve() + '/env/python/'))
          }
          if (
            !fs.existsSync(path.join(path.resolve() + '/env/python/win32/'))
          ) {
            fs.mkdirSync(path.join(path.resolve() + '/env/python/win32/'))
          }
          decompress(
            path.join(path.resolve(), '/env/python.zip'),
            path.join(path.resolve() + '/env/python/win32/'),
            {
              map: file => {
                return file
              }
            }
          )
            .then(async files => {
              console.log('done!')
              await this.$store.dispatch('dependency/dependencyDownload', {
                name: dependency.name,
                installing: false,
                installed: true
              })
              this.checkDepandenciesVersion()
            })
            .catch(async err => {
              console.log('解压python环境包出错：', err)
              await this.$store.dispatch('dependency/dependencyDownload', {
                name: dependency.name,
                installing: false,
                installed: false
              })
            })
        } else {
          exec(filePath, (err, stdout, stderr) => {
            console.log('installDependency')
            console.log(stdout)
          })
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  background-color: #f0f2f5;
  padding: 20px;
}

::v-deep .el-card {
  border-radius: 5px;
  border: 1px solid #cccccc;
}

.panel-group {
  margin-left: 0px !important;
  margin-right: 20px !important;
  padding-top: 20px;
}

.card-panel-col {
  padding-right: 0px !important;
  margin-bottom: 20px;
}

.title {
  // font-size: 18px;
  // color: #ffffff;
  font-family: PingFangSC-Semibold;
  font-size: 18px;
  color: #ffffff;
  letter-spacing: 1.5px;
}

.aLink {
  font-size: 12px;
  color: white;
  background-color: initial;
  border: 1px solid;
  width: 60px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  border-radius: 4px;
  position: absolute;
  display: inline-block;
  bottom: 20px;
  left: 20px;
}

.aLink-disable {
  font-size: 12px;
  color: #999;
  background: #eee;
  border: 1px solid #eee;
  width: 60px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  border-radius: 4px;
  position: absolute;
  display: inline-block;
  bottom: 20px;
  left: 20px;
}

.aLink:focus,
.aLink:hover {
  background: #fff;
  border-color: #fff;
  color: #999;
}

.aLink:active {
  background: #eee;
  border-color: #eee;
  color: #999;
}

.app-main-content {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  height: calc(100vh - 60px);
  background: #fff;
}

.version {
  font-size: 16px;
  color: #ffffff;
  letter-spacing: 0.53px;
  margin-top: 10px;
}

.filter-container {
  margin-bottom: 10px;
}

.main-canvas {
  background-color: #fff;
}
</style>
