<template>
  <div id="main">
    <div id="title">
      <h2>{{name}}</h2>
    </div>
    <v-map ref="useMap" @map="onMap" @point="onPoint"></v-map>
  </div>
</template>

<script>
import axios from 'axios'
import {MP} from '../../../static/js/map.js'
import map from '../map/map'

export default{
  data(){
    return {
      map: null,
      mPoint: null,
      ak: 'ZUONbpqGBsYGXNIYHicvbAbM',
      name: '北京市ATM机故障聚合分布',
      diffData: null,
      numArr: 5
    }
  },
  props: {
    diffTime: {
      startTime: '',
      endTime: ''
    },
    diffNum: null
  },
  components: {
    'v-map': map,
  },
  mounted() {
    MP(this.ak).then(BMap => {
      this.$refs.useMap.createMap() // 引入初始化地图

      this.getData()
    })
  },
  watch: {
    diffTime: {
      handler(cur) {
        // 只显示2017年的数据
        let startTime = cur.startTime ? cur.startTime : '2017-04-12'
        let endTime = cur.endTime ? cur.endTime : '2017-05-27'
        if (startTime === '2017-04-12' && endTime === '2017-05-27') {
          this.diffData = 1 //  不改变值
        } else if (startTime > endTime){
          this.diffData = 0 // 值为0
        } else if (startTime.slice(0,4) < '2017' && endTime.slice(0,4) > '2017') {
          this.diffData = 1 //  不改变值
        }else { // 改变值
          let startYear = startTime.slice(0,4)
          let endYear = endTime.slice(0,4)
          if (startTime.slice(0,4) !== '2017' && endTime.slice(0,4) === '2017') {
            if(endTime.slice(5,7) <= 5) {
              this.diffData = 2 // 随机400个数
            } else {
              this.diffData = 3 // 随机800个数
            }
          } else if(endTime.slice(0,4) !== '2017' && startTime.slice(0,4) === '2017') {
            if(startTime.slice(5,7) <= 5) {
              this.diffData = 2 // 随机400个数
            } else {
              this.diffData = 3 // 随机8000个数
            }
          } else {
            let diffDay = parseInt(endTime.slice(5,7)) - parseInt(startTime.slice(5,7))
            if (diffDay <=5 ) {
              this.diffData = 2 // 随机400个数
            } else {
              this.diffData = 3 // 随机800个数
            }
            // console.log(diffDay)
          }
        }
        this.getData()
      },
      deep:true
    },
    diffNum(cur) {
      this.numArr = cur
      this.getData()
    }
  },
  methods: {
    getData(){
      axios.get('static/data/troubleData.json').then((res) => {
        let datas = res.data[0]
        let faultData = datas.TBL_FAULT_LOG
        let coorData = datas.TBL_NETNODE_INFO
        coorData = this.getNewArr(coorData)
        let geoData = this.getGeoData(coorData,faultData)

        // 取随机个数
        Array.prototype.random = function () {
          var idx = Math.floor((Math.random()*this.length))
          var n = this.splice(idx,1)[0]
          return n
        }
        let i=0, newArr=[]
        if (this.diffData === 0) {
          geoData = []
        }  else if(this.diffData === 2) {
          if(this.numArr){
            let numlen = 600-100*(5-this.numArr)
            while(i++< numlen) {
              newArr.push(geoData.random())
            }
          } else{
            newArr = []
          }           
          geoData = newArr
        } else if(this.diffData === 3) {
          if(this.numArr){
            let numlen = 900-100*(5-this.numArr)
            while(i++< numlen) {
              newArr.push(geoData.random())
            }
          } else{
            newArr = []
          }
          geoData = newArr
        } else { 
          if(this.numArr){
            let numlen = geoData.length-100*(5-this.numArr)
            while(i++< numlen) {
              newArr.push(geoData.random())
            }                      
          } else{
            newArr = []
          } 
          geoData = newArr
        }  
        // console.log(geoData.length)

        let markers = this.getNetNode(geoData)
        if(markers.length) {
          let options = {
            markers:          markers,
            gridSize:         100,
            isAverangeCenter: true
        }
        let markerClusterer = new BMapLib.MarkerClusterer(this.map, options)
        }      
      })
    },

    onMap(ev) {
      this.map = ev
    },

    onPoint(ev) {
      this.mPoint = ev
    },

    getGeoData(coorData,faultData) { // 整合数组对象
      return faultData.map((item,index) => {
        return Object.assign(coorData[index], faultData[index])
      })
    },

    getNewArr(newData) { // 过滤数组对象元素
      return newData.map((item,index) => {
        let geo = {
            baidu_address: '',
            dimension: null,
            longitude: null,
            area:null,
            net_node_name: ''
        }
        for (let x in geo) {
            geo[x] = item[x]
        }
        return geo
      })
    },

    getNetNode(geoData) { // 转换地理经纬度坐标
      return geoData.map((item,index) => {
          let lng = geoData[index].longitude
          let dim = geoData[index].dimension
          let tmpPoint = new BMap.Point(lng, dim)
          return new BMap.Marker(tmpPoint)
      })
    }
  }
}
</script>

<style scoped>
#main {
  height: 100%;
}
#title {
  position: relative;
  display: flex;
  align-items:center;
  height: 50px;
  background-color: #F5F5F5;
  width: 100%;
 }

 h2 {
    font-size: 15px;
    font-weight: bold;
  }
</style>
