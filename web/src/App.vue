<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  mounted() {
    this.$ELEMENT.size = this.$store.getters.size;
  }
};
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>