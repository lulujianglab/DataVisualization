<template lang="html">
  <div class="dashboard">
    <v-header :name="name" :legendArr="legendArr"></v-header>
    <v-filter ></v-filter>
    <div class="flex-container column">
        <div class="item one" @click="clickChart('1')" style="transform: translate(-22.4%,-33.5%) scale(0.33)">
          <treemap></treemap>
        </div>
        <div class="item two" @click="clickChart('2')" style="transform: translate(-22.4%,0.5%) scale(0.33)">
          <scatter></scatter>
        </div>
        <div class="item three" @click="clickChart('3')" style="transform: translate(-22.4%,34.5%) scale(0.33)">
          <pie></pie>
        </div>
        <div class="item four active" @click="clickChart('4')" style="transform: translate(43.7%, 0) scale(1)">
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
import header from '../header/header'
import filter from '../filter/filter'

export default{
  data() {
    return {
      items: [],
      name: '点值地图视觉优化之多视图协同可视化',
      legendArr: this.$store.state.areaArr,
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() { // 初始化items的order属性
      this.items = document.querySelectorAll('.flex-container .item')
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].dataset.order = i + 1 // 使用dataset自定义属性、值
      }
      this.legendArr.forEach((data) => {
        data.selected = true
      })
    },

    clickChart(clickIndex) { // 点击事件增加active属性 原先active属性移除
      let activeItem = document.querySelector('.flex-container .active')
      let activeIndex = activeItem.dataset.order
      let clickItem = this.items[clickIndex - 1]
      if (activeIndex === clickIndex) {
        return
      }
      activeItem.classList.remove('active')
      clickItem.classList.add('active')
      this.setStyle(clickItem, activeItem)
    },

    setStyle(el1, el2) { // 移除和增加active属性的style:transform属性互换
      let transform1 = el1.style.transform
      let transform2 = el2.style.transform
      el1.style.transform = transform2
      el2.style.transform = transform1
    }
  },
  components: {
    treemap,
    scatter,
    pie,
    multipleMap,
    'v-header': header,
    'v-filter': filter,
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
}
.flex-container.column {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
    margin:  0 auto 10px auto;
    box-sizing: content-box;
    background-color: #F5F5F5;
}
.active{
    height: 100%;
    width: 67%;
    margin-left: 20px;
    line-height: 300px;
}
</style>
