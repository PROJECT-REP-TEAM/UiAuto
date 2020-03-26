<template>
    <div class="uiSelector">
        <el-button icon="el-icon-position" style="width: 100%;margin-bottom: 5px"
                   @click.native.prevent="select_target">目标
        </el-button>
        <!-- <el-input :id="propertyId" v-model="currValue" type="textarea" row="5" readonly="readonly"/> -->
        <!--<el-input :id="propertyId" v-model="browser_info" type="text" style="margin-top: 10px;"/>-->
        <div v-if="screenshot_file">
            <img :src="screenshot_file" style="width: 100%;">
        </div>
    </div>
</template>

<script>
    const electron = require('../../../utils/electron')
    const uiSelector = require('../../../uiselector')
    const path = window.require('path')
    const config = require('@/config/environment/index').default
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
                type: Object,
                default: null
            },
            browsers: {
                type: Array,
                default() {
                    return [{
                        label: '桌面元素',
                        value: 'Native'
                    }, {
                        label: 'Chrome 元素',
                        value: 'Chrome'
                    }, {
                        label: 'IE 元素',
                        value: 'Internet Explorer'
                    }]
                }
            },
            defaultBrowserType: {
                type: String,
                default: 'Native'
            },
            project_name: {
                type: String,
                default: ''
            }
        },
        data() {
            console.log('projectsPath>>>>>>>>>', config.projectsPath)
            return {
                browser_type: this.defaultBrowserType,
                browser_info: null,
                screenshot_dir: `${config.projectsPath}\\${this.project_name}\\screenshot\\`,
                screenshot_file: '',
                show_screentshot: true
            }
        },
        computed: {
            element: {
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
            // $('.file-selector .el-input__suffix').css('top', '-7px')
            if (this.element['element_screenshot']) {
                this.screenshot_file = this.screenshot_dir + this.element['element_screenshot']
            }
        },
        methods: {
            openBrowser() {
                console.log('openBrowser>>>>>>>>>', this.browser_type, this.project_name)
                uiSelector
                    .openBrowser({
                        browser_type: this.browser_type
                    })
                    .then(result => {
                        this.browser_info = result
                        console.warn(result, this.browser_info)
                    })
                    .catch(error => {
                        console.error(error)
                    })
            },
            async select_target() {
                this.show_screentshot = false

                const browser = await this.$store.state.project.browser;

                const browser_list = [];
                !!browser ? browser_list.push(browser) : null;

                electron.window_minimize();
                window['uiselector'].execute({
                        browsers: browser_list,
                        project_dir: this.screenshot_dir,
                        screenshot_file: this.screenshot_file
                    })
                    .then(result => {
                        electron.window_maximize()
                        this.element = result
                        this.screenshot_file = this.screenshot_dir + result['element_screenshot']
                        this.show_screentshot = true
                        this.$forceUpdate()
                        console.log(this.element, this.screenshot_file)
                    })
                    .catch(error => {
                        console.error(error)
                    })
            },
            changeValue(val) {
                console.log('changeValue>>>>>', val)
            }
        }
    }
</script>

<style>
</style>
