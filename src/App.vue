<template>
  <div id="app">
    <router-view class="router-view"></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted () {
    console.log(111)
  },
  created() {
  },
  methods: {
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  position: absolute;
  height: 100%;
  width: 100%
}
</style>
