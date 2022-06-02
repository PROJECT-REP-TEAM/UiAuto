<template>
  <div class="router-link-group">
    <div @contextmenu.prevent="showMenu($event)">
      <slot>链接列表</slot>
    </div>

    <transition name="el-fade-in">
      <ul
        v-if="vIf"
        v-show="vShow"
        v-loading="loading"
        :style="{left:left+'px',top:top+'px'}"
        class="contextmenu"
      >
        <li v-if="$scopedSlots.link1">
          <slot name="link1" />
        </li>
        <li v-if="$scopedSlots.link2">
          <slot name="link2" />
        </li>
        <li v-if="$scopedSlots.link3">
          <slot name="link3" />
        </li>
        <li v-if="$scopedSlots.link4">
          <slot name="link4" />
        </li>
        <li v-if="$scopedSlots.link5">
          <slot name="link5" />
        </li>
      </ul>
    </transition>

    <!-- <el-dropdown trigger="click">
      <span
        style="font-size:12px"
        @click.prevent
        @contextmenu.prevent="test"
      >{{scope.row[table_attribute.key]}}</span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>
          <router-link
            :to="{ name: '网银数据管理', params: { ruleId: scope.row.ruleId, acc_number: scope.row[table_attribute.key] }}"
          >查询 "{{scope.row[table_attribute.key]}}" 网银数据</router-link>
        </el-dropdown-item>
        <el-dropdown-item>
          <router-link
            :to="{ name: '网银数据管理', params: { ruleId: scope.row.ruleId, acc_number: scope.row[table_attribute.key], page: 'trade' }}"
          >查询 {{scope.row[table_attribute.key]}} 流水数据</router-link>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>-->
  </div>
</template>

<script>
import { addClass, removeClass } from '@/utils'

export default {
  name: 'RouterLinkGroup',
  props: {},
  data() {
    return {
      top: 0,
      left: 0,
      vIf: false,
      vShow: false,
      loading: true
    }
  },
  computed: {},
  watch: {
    vShow(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
        window.addEventListener('scroll', this.closeMenu)
        setTimeout(() => {
          document.body.addEventListener('contextmenu', this.closeMenu)
        }, 0)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
        document.body.removeEventListener('contextmenu', this.closeMenu)
        window.removeEventListener('scroll', this.closeMenu)
      }
    }
  },
  methods: {
    showMenu(e) {
      const menuHeight = 10 + (Object.keys(this.$scopedSlots).length - 1) * 37

      this.left = e.clientX

      if (e.clientY + menuHeight >= document.body.clientHeight) {
        this.top = e.clientY - menuHeight
      } else {
        this.top = e.clientY
      }

      this.vShow = true
      if (!this.vIf) {
        this.vIf = true
        setTimeout(() => {
          this.loading = false
        }, 500)
      }
    },
    closeMenu() {
      this.vShow = false
    }
  }
}
</script>

<style lang="scss" scoped>
.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  // position: absolute;
  position: fixed;
  list-style-type: none;
  padding: 3px 2px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
  color: #303133;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  li {
    margin: 0;
    padding: 7px 16px;
    cursor: pointer;
    &:hover {
      background: #e8f4ff;
      color: #198fff;
    }
    border-bottom: #E9E9EB solid 1px;
  }
  li:last-of-type {
    border-bottom: none;
  }
}
</style>>
