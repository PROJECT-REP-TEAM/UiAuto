<template>
  <el-dialog title="源代码" :visible.sync="showDialog">
    <span>//按Ctrl键进行代码提示</span>
    <span v-if="options && options.label">//{{options.label}}</span>
    <!-- <textarea
      ref="mycode"
      class="codesql"
      :id="propertyId"
      v-model="currValue"
      style="height:200px;width:100%;"
    ></textarea>-->
    <div ref="editor" style="width: 100%;height: 500px;"></div>
    <div style="margin-top:10px;text-align:right;">
      <el-button type="primary" @click="commitClick()">确定</el-button>
      <el-button @click="cancelClick()">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as monaco from "monaco-editor";
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import { StandaloneCodeEditorServiceImpl } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeServiceImpl.js';
import "codemirror/theme/yonce.css";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/hint/show-hint.css";
import { setTimeout } from "timers";

let CodeMirror = require("codemirror/lib/codemirror");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/selection/active-line");
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/javascript-hint");
export default {
  name: "codeMirror",
  data() {
    return {
      showDialog: false,
      code: "code",
      editor: ""
    };
  },
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
      type: String,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
  },
  mounted() {
    // console.log(editor)
    // let mime = "text/x-mariadb";
    // let theme = "ambiance"; //设置主题，不设置的会使用默认主题
    // let editor = CodeMirror.fromTextArea(this.$refs.mycode, {
    //   mode: mime, //选择对应代码编辑器的语言
    //   indentWithTabs: true,
    //   smartIndent: true,
    //   lineNumbers: true,
    //   matchBrackets: true,
    //   theme: theme,
    //   //autofocus: false,
    //   extraKeys: { Ctrl: "autocomplete" }, //自定义快捷键
    //   hintOptions: {
    //     //自定义提示选项
    //     tables: {
    //       users: ["name", "score", "birthDate"],
    //       countries: ["name", "population", "size"]
    //     }
    //   }
    // });
    //代码自动提示功能
    // editor.on("cursorActivity", function() {
    //   editor.showHint();
    // });
  },
  computed: {
    currValue: {
      get() {
        console.log(this.value);
        return this.value;
      },
      set(val) {
        this.$emit("changeValue", {
          input_id: this.inputId,
          property_id: this.propertyId,
          value: this.editor.getValue()
        });
      }
    }
  },
  methods: {
    openCodeModal() {
      let that = this;
      this.showDialog = true;
      if (!document.getElementById(this.propertyId)) {
        
        setTimeout(() => {
          // let mime = "javascript";
          // let theme = "yonce"; //设置主题，不设置的会使用默认主题
          // that.editor = CodeMirror.fromTextArea(this.$refs.mycode, {
          //   mode: mime, //选择对应代码编辑器的语言
          //   indentWithTabs: true,
          //   smartIndent: true,
          //   lineNumbers: true,
          //   matchBrackets: true,
          //   theme: theme,
          //   //autofocus: false,
          //   extraKeys: { Ctrl: "autocomplete" }, //自定义快捷键
          //   hintOptions: {
          //     //自定义提示选项
          //     tables: {
          //       users: ["name", "score", "birthDate"],
          //       countries: ["name", "population", "size"]
          //     }
          //   }
          // });
          if (!this.editor) {
            this.editor = monaco.editor.create(this.$refs.editor, {
              theme: "vs-dark",
              automaticLayout: true,
              language: this.options.language,
              formatOnPaste: true,
              formatOnType: true,
              links: true,
              fontSize: 16,
              folding: true,
              foldingHighlight: true,
              copyWithSyntaxHighlighting: true,
              minimap: true
            });

            this.editor.setValue(this.value);

          }
          console.log(this.editor)
        }, 0);
      }
    },
    commitClick() {
      this.$emit("changeValue", {
        input_id: this.inputId,
        property_id: this.propertyId,
        value: this.editor.getValue()
      });
      this.showDialog = false;
    },
    cancelClick() {
      this.showDialog = false;
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.el-dialog {
  width: 60%;
}
/deep/.el-dialog__body {
  padding-top: 0px;
}
.codesql {
  font-size: 11pt;
  font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono,
    DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
}
</style>