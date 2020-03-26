<template>
  <div class="uiScreenshot">
    <el-button icon="el-icon-picture" @click.native.prevent="begin_screenshot" class="btn-block" style="width: 100%;margin-bottom:5px;">截取屏幕</el-button>
    <!-- <el-input :id="propertyId" v-model="currValue" type="textarea" row="5" readonly="readonly"/> -->
    <!--<el-input :id="propertyId" v-model="browser_info" type="text" style="margin-top: 10px;"/>-->
    <div>
      <img v-if="image_path" :src="image_path" style="width: 100%;">
    </div>
  </div>
</template>

<script>
  const electron = require('../../../utils/electron')
const path = window.require('path')
const config = require('@/config/environment/index').default
const pyutil = window.require(path.resolve() + '/public/utils/pyutil')
export default {
  props: {
    nodeKey: {
      type: Number,
      default: null
    },
    inputId: {
      type: String,
      default: null
    },
    propertyId: {
      type: String,
      default: null
    },
    value: {
      type: String,
      default: null
    },
    project_name: {
      type: String,
      default: ''
    }
  },
  data() {
    console.log('projectsPath>>>>>>>>>', config.projectsPath)
    return {
      screenshot_dir: `${config.projectsPath}\\${this.project_name}\\screenshot\\`,
      screenshot_file: '',
      show_screentshot: true
    }
  },
  computed: {
    image_path: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('changeValue', {
          node_key: this.nodeKey,
          input_id: this.inputId,
          property_id: this.propertyId,
          value: val
        })
        // return val;
      }
    }
  },
  mounted() {

  },
  methods: {
    begin_screenshot() {
      electron.window_minimize()
      setTimeout(() => {

        window['executor'].execute_python(`${path.resolve()}\\public\\pyscript\\screenshot\\screenshot.py`, 'UI_Screenshot', {
          path: this.screenshot_dir,
          image_path: this.image_path
        })
          .then(result => {
            console.log(result)
            electron.window_maximize()
            this.image_path = result

            console.log('this.image_path', this.image_path)
          })
          .catch(err => {
            console.log(err)
          })
      }, 300)
    }
  }
}
</script>

<style>
</style>
