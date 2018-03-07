<template>
  <div class="title">
    <h1>{{name}}</h1>
    <div class="legend-wrapper">
      <ul>
        <li v-for="(legend,index) in legendArr" v-on:mouseout="donwplay(index)" v-on:mouseover="highlight(index)" :style="styleArr[index]" @click="legendToggle(legend)">
          {{legend.name}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: { // 子组件要显式地用 props 选项声明它期待获得的数据
    legendArr: {
      type: Array,
      default: []
    },
    myChart: Object,
    name: String
  },
  created() { // 实例已经创建完成之后被调用
    this.init()
  },
  data() { // Vue 将会递归将 data 的属性转换为 getter/setter，从而让 data 的属性能够响应数据变化。
    return {
      styleArr: [],
      color: this.$store.state.color // 在组件中可使用 this 访问原型上的属性,$store 是挂载在 Vue 实例上的（即Vue.prototype）。template 拥有组件实例的上下文，可直接通过 {{ $store.state.color }} 访问
    }
  },
  methods: {
    init() {
      this.color.forEach((color) => {
        this.styleArr.push({
          background: color,
          border: '1px solid' + color
        })
      })
    },
    highlight(index) {
      // this.myChart.dispatchAction({
      //   type: 'highlight',
      //   seriesIndex: index
      // });
    },
    donwplay(index) {
      // this.myChart.dispatchAction({
      //   type: 'downplay',
      //   seriesIndex: index
      // })
    },
    legendToggle(legend) {
      legend.selected = !legend.selected
      // this.myChart.dispatchAction({
      //   type: 'legendToggleSelect',
      //   name: legend.name
      // })
      this.changeStyle()
    },
    changeStyle() {
      this.legendArr.forEach((data, index) => {
        if (data.selected) {
          this.styleArr[index].background = this.color[index]
          this.styleArr[index].border = '1px solid' + this.color[index]
        } else {
          this.styleArr[index].background = 'transparent'
          this.styleArr[index].border = '1px solid #9C8C84'
        }
      })
    }
  }
}
</script>

<style>
.title {
  position: relative;
  display: flex;
  align-items:center;
  height: 50px;
  /* line-height: 50px; */
  background-color: #F5F5F5;
  color: #3D59AB;
  width: 100%;
 }

 h1 {
    font-size: 21px;
    font-weight: bold;
    padding-left: 20px;
  }

ul {
    position: absolute;
    right: 0;
    padding-right: 20px;
    margin-top: -2px;
  }

li {
    display: inline-block;
    min-width: 59px;
    padding: 2px 10px 2px 10px;
    line-height: 20px;
    text-align: center;
    font-size: 11px;
}
li:first-child {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
}
li:last-child {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px
}
li+li {
  margin-left: -1px
}
</style>
