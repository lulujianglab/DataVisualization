<template lang="html">
  <div class="dashboard">
    <div class="flex-container column">
      <div class="item one" @click="clickChart('1')" style="transform: translate(-22.4%,-33.5%) scale(0.33)">
          <treemap></treemap>
        </div>
        <div class="item two" @click="clickChart('2')" style="transform: translate(-22.4%,0.5%) scale(0.33)">
          <scatter></scatter>
        </div>
        <div class="item three active" @click="clickChart('3')" style="transform: translate(-22.4%,34.5%) scale(0.33)">
          <pie></pie>
        </div>
        <div class="item four " @click="clickChart('4')" style="transform: translate(43.7%, 0) scale(1)">
          <multipleMap></multipleMap>
        </div>
    </div>
  </div>
</template>

<script>
import treemap from '../treemap/treemap'
import scatter from '../scatter/scatter'
import pie from '../pie/pie'
import multipleMap from '../multipleMap/multipleMap'

export default{
  data() {
    return {

    }
  },
  components: {
    treemap,
    scatter,
    pie,
    multipleMap
  }
}
</script>

<style>
*{
  box-sizing: border-box;
}
.dashboard{
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
    padding-top: 5%;
    background-color: #F5F5F5;
}
.item{
    padding: 0px;
    margin: 0px;
    width: 68%;
    height: 100%;
    position: absolute;
    transform: scale(0.33);
    text-align: center;
    transition:all 0.8s;
    /* background: rgba(32, 32, 35, 0.5); */
}
.flex-container.column {
    position: relative;
    height: 90%;
    width: 90%;
    overflow: hidden;
    margin:  0 auto 100px auto;
    box-sizing: content-box;
}
.active{
    height: 100%;
    width: 69%;
    margin-left: 10px;
    line-height: 300px;
}
</style>
