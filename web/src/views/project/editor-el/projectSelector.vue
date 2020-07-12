<template>
  <div class="projectSelector">
    <el-select
      v-if="options.multiple===false"
      v-model="currValue"
      style="width:100%"
      placeholder="请选择"
      filterable
      allow-create
    >
      <el-option v-for="item in projectList" :key="item" :label="item" :value="item" />
    </el-select>
    <el-select
      v-if="options.multiple===true"
      v-model="currValue"
      style="width:100%"
      placeholder="请选择"
      multiple
    >
      <el-option v-for="item in projectList" :key="item" :label="item" :value="item" />
    </el-select>
  </div>
</template>

<script>
import config from "@/config/environment/index";
const fs = window.require("fs");

export default {
  props: {
    inputId: {
      type: String,
      default: null
    },
    propertyId: {
      type: String,
      default: null
    },
    value: {
      type: String | Array,
      default: null
    },
    options: {
      type: Object,
      default: null
    },
    currentProject: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      projectList: this.getProjectList()
    };
  },
  methods: {
    getProjectList() {
      let self = this;
      if (config.projectsPath) {
        // 插件目录
        this.projects_path = config.projectsPath + "/";
        var projectsPathLs = [];

        let files = fs.readdirSync(this.projects_path);
        files.forEach(function(fileName, index) {
          let file = fs.statSync(self.projects_path + "/" + fileName);
          if (file.isDirectory() && fileName !== self.currentProject) {
            projectsPathLs.push(fileName);
          }
        });

        console.log("projectsPathLs>>>>>>>>>>>>", projectsPathLs);
        return projectsPathLs;
      } else {
        return [];
      }
    }
  },
  computed: {
    currValue: {
      get() {
        // define parse function
        let parse = function(str) {
          let jsonError = false;

          while (!jsonError && !/^\d+(\.\d+)?$/.test(str)) {
            try {
              str = JSON.parse(str);
            } catch (error) {
              jsonError = true;
            }
          }

          return str;
        };

        if (this.options.multiple === false) {
          if (Array.isArray(this.value)) {
            return parse(this.value[0]);
          } else {
            return parse(this.value);
          }
        } else {
          if (Array.isArray(this.value)) {
            return _.map(this.value, val => {
              return parse(val);
            });
          } else {
            return [parse(this.value)];
          }
        }
      },
      set(val) {
        let returnValue;
        if (this.options.multiple === false) {
          if (Array.isArray(val)) {
            returnValue = `${val[0]}`;
          } else {
            returnValue = `${val}`;
          }
        } else {
          if (Array.isArray(val)) {
            returnValue = _.map(val, valItem => {
              return `${valItem}`;
            });
          } else {
            returnValue = [`${val}`];
          }
        }
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: returnValue
        });
      }
    }
  }
};
</script>
