<template>
  <div style="height: 100%; margin: 0">
    <v-header :name="name" :legendArr="legendArr"></v-header>
    <v-filter ></v-filter>
    <div id="main">
    <v-map ref="useMap" @map="onMap" @point="onPoint"></v-map>
    </div>
    <div id="container">
        <div id="box1"></div>
        <div id="box2"></div>
        <div id="box3"></div>
        <div id="box4"></div>
        <div id="box5"></div>
        <div id="box6"></div>
        <div id="box7"></div>
        <div id="box8"></div>
        <div id="box9"></div>
    </div>
  </div>
  </template>

<script>
import axios from 'axios'
import {MP} from '../../map.js'
import header from '../header/header'
import filter from '../filter/filter'
import map from '../map/map'
import echarts from 'echarts'

export default{
  data() {
    return {
      map: null,
      mPoint: null,
      ak: 'ZUONbpqGBsYGXNIYHicvbAbM',
      name: '点值地图视觉优化之邮贴图',
      legendArr: this.$store.state.arr,
      rectangle_overlay: null,
      resX: null,resY: null,
    }
  },
  components: {
    'v-header': header,
    'v-filter': filter,
    'v-map': map
  },
  mounted() {
    /*--------------------------百度地图------------------------------- */
    MP(this.ak).then(BMap => { // 实例化地图
      this.$refs.useMap.createMap() // 引入初始化地图

      this.getData()
    })
    this.init()
  },
  methods: {
    init() {
      this.legendArr.forEach((data) => {
        data.selected = true
      })
    },

    onMap(ev) {
      this.map = ev
    },

    onPoint(ev) {
      this.mPoint = ev
    },

    dragSymbol() { // 初始化矩形symbol
      this.rectangle_overlay = new BMap.Marker(new BMap.Point(this.mPoint.lng,this.mPoint.lat), {
        icon: new BMap.Symbol(BMap_Symbol_SHAPE_RECTANGLE, { // 覆盖物更改为长4px，宽2px的矩形
            scale: 35, // 覆盖框增大比例
            strokeWeight: 2,
            strokeColor: '#3D59AB', // 边框大小
            strokeStyle: 'solid', // 边线的样式
            fillColor: "#3D59AB", // 覆盖框颜色
            fillOpacity: 0.2 // 透明度
        })
      })
      this.map.addOverlay(this.rectangle_overlay) // 在地图上添加覆盖物
      this.rectangle_overlay.enableDragging() // 允许拖拽

      let bounds = this.map.getBounds()
      let geoPointLB = bounds.getSouthWest() // 左下角点地理坐标
      let geoPointRT = bounds.getNorthEast() // 右上角点地理坐标
      let pixelPointLB = this.map.pointToPixel(geoPointLB) // 左下角点像素坐标
      let pixelPointRT = this.map.pointToPixel(geoPointRT) // 右上角点像素坐标

      this.resX = (geoPointRT.lng - geoPointLB.lng) / (pixelPointRT.x - pixelPointLB.x) // 分辨率 = 经度差 / x差
      this.resY = (geoPointRT.lat - geoPointLB.lat) / (pixelPointRT.y - pixelPointLB.y)
    },


    getData() { // 获取数据、处理数据
      axios.get('../../../static/data/troubleData.json').then((res) => {
        let datas = res.data[0]
        let faultData = datas.TBL_FAULT_LOG
        let coorData = datas.TBL_NETNODE_INFO
        coorData = this.getNewArr(coorData)
        let geoData = this.getGeoData(coorData,faultData)
        let netnodePoints = this.getNetNode(geoData)

        let alarm= [] // 统计各报警数据
        alarm[0] = this.getAlarmData(geoData,"频繁报警")
        alarm[1] = this.getAlarmData(geoData,"专项巡检")
        alarm[2] = this.getAlarmData(geoData,"1106关机").concat(this.getAlarmData(geoData,"1106电话关机")).concat(this.getAlarmData(geoData,"关机"))
        alarm[3] = this.getAlarmData(geoData,"不在线")
        alarm[4] = this.getAlarmData(geoData,"IP对讲故障").concat(this.getAlarmData(geoData,"硬盘故障")).concat(this.getAlarmData(geoData,"对讲设备不在线,"))
        alarm[5] = this.getAlarmData(geoData,"巡检").concat(this.getAlarmData(geoData,"巡检安装"))
        alarm[6] = this.getAlarmData(geoData,"报警设备不在线,").concat(this.getAlarmData(geoData,"报警设备不在线,11106电话无法接通"))
        alarm[7] = this.getAlarmData(geoData,"1106电话空号").concat(this.getAlarmData(geoData,"1106空号")).concat(this.getAlarmData(geoData,"1106卡已被用")).concat(this.getAlarmData(geoData,"1106故障"))
        alarm[8] = this.getAlarmData(geoData,"DVR不在线,").concat(this.getAlarmData(geoData,"dvr不在线")).concat(this.getAlarmData(geoData,"DVR故障"))

        netnodePoints.forEach((points,index) => { // 地图添加svg图元
          let x = points.lng
          let y = points.lat
          let newPoint = new BMap.Point(x,y)
          let newMarker = {}
          if (index < 300) {
            let myIcon = new BMap.Icon("../../../static/img/ceshi1.svg", new BMap.Size(14,14))
             newMarker = new BMap.Marker(newPoint,{icon:myIcon})
          }else if (index > 300 && index < 600) {
            let myIcon = new BMap.Icon("../../../static/img/ceshi2.svg", new BMap.Size(14,14))
             newMarker = new BMap.Marker(newPoint,{icon:myIcon})
          }else {
            let myIcon = new BMap.Icon("../../../static/img/ceshi3.svg", new BMap.Size(14,14))
             newMarker = new BMap.Marker(newPoint,{icon:myIcon})
          }
          this.map.addOverlay(newMarker)
        })

        this.dragSymbol()

        let alarmArr =  new Array(9)
        for(let i = 0;i < alarmArr.length; i++){ // 定义矩形框内点的数组
          alarmArr[i] = new Array()
        }

        let lgArray = [] // 定义矩形框拖动的次数

        let chartArr =  new Array(9)
        for(let i = 0;i < alarmArr.length; i++){ // 定义邮贴图chart的个数
          chartArr[i] = {}
        }

        let optArr =  new Array(9)
        for(let i = 0;i < optArr.length; i++){ // 定义邮贴图option的个数
          optArr[i] = {}
        }

        let txtArr = ['设备停机','视频丢失','电池测试故障','接触故障','主机停机','设备运行数','设备恢复数','感应器故障','长距离无限发射故障']

        let childrens=this.delSpaceDom()

        for(let i = 0; i < 9; i++){ // 遍历生成邮贴图
          chartArr[i] = echarts.init(childrens[i]);
          optArr[i] = this.createOpt(txtArr[i],alarmArr[i],lgArray);
          chartArr[i].setOption(optArr[i]);
        }

        this.rectangle_overlay.addEventListener('dragend', () => { // 拖拽响应事件处理
          let rStartX = this.rectangle_overlay.getPosition().lng - (this.resX * 160) // lng值
          let rStartY = this.rectangle_overlay.getPosition().lat - (this.resY * 80) // lat值
          let rEndX = this.rectangle_overlay.getPosition().lng + (this.resX * 160) // lng值
          let rEndY = this.rectangle_overlay.getPosition().lat + (this.resY * 80) // lat值

          for(let i = 0; i < 9; i++){ // 过滤出框内的报警数
            alarmArr[i].push(this.checkPoint(alarm[i],rEndY,rStartY,rStartX,rEndX))
          }

          for(let i = 0; i < 9; i++){ // 每拖动一次就重新刷新一次echarts图表
            chartArr[i].setOption(optArr[i])
          }

          lgArray.push(alarmArr[0].length)
        })
      })
    },

    getGeoData(coorData,faultData) { // 地理坐标对象合并
      return faultData.map((item,index) => {
          return Object.assign(coorData[index], faultData[index])
      })
    },

    getNewArr(newData) { // 过滤出地图需要的数据
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

    getNetNode(geoData) { // 获取地图经纬度坐标
      return geoData.map((item,index) => {
        let lng = geoData[index].longitude
        let dim = geoData[index].dimension
        return new BMap.Point(lng, dim)
      })
    },

    checkPoint(points,rEndY,rStartY,rStartX,rEndX) { // 确定框内报警数
      let pts = []
      points.forEach((point,index) => {
          let y=point.dimension
          let x=point.longitude
          if (y >= rEndY && y <= rStartY){
              if (x >= rStartX && x <= rEndX){
                  pts.push(point)
              }
          }
      })
      return pts.length || 0
    },

    getAlarmData(geoData,alarmStr){ // 过滤出各报警类型的记录
      return geoData.filter((item) => {
        return item.FAULT_SYMPTOM === alarmStr
      })
    },

    delSpaceDom() { // 过滤出div子节点个数
      let parentNode = document.getElementById('container')
      let sub_child = parentNode.childNodes
      for (let i = 0; i < sub_child.length; i++) {
        if(sub_child[i].nodeName == '#text'){
          parentNode.removeChild(sub_child[i])
        }
      }
      return parentNode.childNodes
    },

    createDataZoom() { // option滑动条组装
      let dataZoom = []
      return dataZoom = [
        {
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'empty',
            handleSize: 6, // 滑动条的 左右2个滑动条的大小
            height: 10, // 组件高度
            left: '18%', // 左边的距离
            right: '12%', // 右边的距离
            bottom: 3, // 右边的距离
            start: 0,
            end: 100,
            handleColor: '#ddd', // 滑动图标的颜色
            handleStyle: {
                borderColor: "#cacaca",
                borderWidth: "1",
                shadowBlur: 2,
                background: "#ddd",
                shadowColor: "#ddd",
            },
            fillerColor: "#3D59AB",
            backgroundColor: '#ddd', // 两边未选中的滑动条区域的颜色
            showDataShadow: false, // 是否显示数据阴影 默认auto
            showDetail: false, // 即拖拽时候是否显示详细数值信息 默认true
            handleIcon: 'M-292,322.2c-3.2,0-6.4-0.6-9.3-1.9c-2.9-1.2-5.4-2.9-7.6-5.1s-3.9-4.8-5.1-7.6c-1.3-3-1.9-6.1-1.9-9.3c0-3.2,0.6-6.4,1.9-9.3c1.2-2.9,2.9-5.4,5.1-7.6s4.8-3.9,7.6-5.1c3-1.3,6.1-1.9,9.3-1.9c3.2,0,6.4,0.6,9.3,1.9c2.9,1.2,5.4,2.9,7.6,5.1s3.9,4.8,5.1,7.6c1.3,3,1.9,6.1,1.9,9.3c0,3.2-0.6,6.4-1.9,9.3c-1.2,2.9-2.9,5.4-5.1,7.6s-4.8,3.9-7.6,5.1C-285.6,321.5-288.8,322.2-292,322.2z',
            filterMode: 'filter',
        },{ // 下面这个属性是里面拖到
            type: 'inside',
            show: true,
            xAxisIndex: [0],
            start: 1,
            end: 100
        }
      ]
    },

    createOpt(txt,datax,lgArray) { // 初始化option
      let option = {}
      return option = {
          title : {
              text: txt,
              x:'center',
              textStyle: {
                  padding:5,
                  fontSize:'6px',
                  fontStyle:'normal',
                  fontWeight:'bold',
              }
          },
          tooltip: {
              trigger: 'axis'
          },
          grid: {
              left: '2%',
              right: '10%',
              top: '12%',
              bottom: '10%',
              containLabel: true
          },
          toolbox: {
              show : true,
              feature : {
                          magicType : {
                                      show: true,
                                      title:"切换",
                                      type: ['line', 'bar']
                                      },
                          // saveAsImage : {show: true}
                      },
              itemSize:13, //工具栏 icon 的大小

          },
          xAxis: {
              type: 'category',
              splitLine: {
                  show: false
              },
              axisLabel: {
                  show: false
              },
              axisTick:{
                  show:false
              },
              data: lgArray
          },
          yAxis: {
              type: 'value',
              splitLine: {
                  show: false
              },
              axisLabel: {
                  show: false
              },
              axisTick:{
                  show:false
              },
          },
          dataZoom: this.createDataZoom(),
          series: [{
              data: datax,
              type: 'line',
              itemStyle: {
              normal: {
                  color: '#3D59AB'
              },
              labelLine: {
                  normal: {
                      show: false
                  }
              },
          },
              smooth: true
          }]
      }
    }
  }
}
</script>

<style>
#main {
  height: 100%;
  width: 52%;
  float: left;
  background-color: #F5F5F5;
}
#container {
  width: 48%;
  height:100%;
  float: right;
  background-color: #F5F5F5;
}
#box1,#box2,#box3,#box4,#box5,#box6,#box7,#box8,#box9 {
            width: 30%;
            display: inline-block;
            height: 180px;
            margin: 1%;
        }
</style>
