<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

// window.nodeRequire = require;
// delete window.nodeRequire;
// delete window.exports;
// delete window.module;

// const path = window.nodeRequire('path')
// const electron = window.nodeRequire('electron')

// if(electron.remote){
//   global.rootPath = path.dirname(electron.remote.app.getPath('exe'))
// }else{
//   const {app} = window.nodeRequire('electron');
//   global.rootPath = path.dirname(app.getPath('home'))
// }
// console.log(global.rootPath)
// path.resolve = ((origin) => {
//   return (...args) => {
//     if (global.rootPath.indexOf('node_modules') > -1) {
//       return origin.call(path.resolve, ...args)
//     } else {
//       return origin.call(path.resolve, global.rootPath, ...args)
//     }
//   }
// })(path.resolve)

export default {
  name: 'App',
  mounted() {
    this.$ELEMENT.size = this.$store.getters.size
  }
}
</script>

<style>
</style>
