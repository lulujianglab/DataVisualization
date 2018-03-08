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
import {MP} from '../../map.js'
import map from '../map/map'

export default{
  data(){
    return {
      map: null,
      mPoint: null,
      ak: 'ZUONbpqGBsYGXNIYHicvbAbM',
      name: '北京市ATM机故障聚合分布'
    }
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
  methods: {
    getData(){
      axios.get('../../../static/data/troubleData.json').then((res) => {
        let datas = res.data[0]
        let faultData = datas.TBL_FAULT_LOG
        let coorData = datas.TBL_NETNODE_INFO
        coorData = this.getNewArr(coorData)
        let geoData = this.getGeoData(coorData,faultData)
        let markers = this.getNetNode(geoData)
        let options = {
            markers:          markers,
            gridSize:         100,
            isAverangeCenter: true
        }
        let markerClusterer = new BMapLib.MarkerClusterer(this.map, options)
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

<style>
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
