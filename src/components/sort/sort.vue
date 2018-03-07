<template>
  <div style="height: 100%; margin: 0">
    <v-header :name="name" :legendArr="legendArr" :myChart="firstChart"></v-header>
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

export default{
  data() {
    return {
      map: null,
      mPoint: null,
      ak: 'ZUONbpqGBsYGXNIYHicvbAbM',
      name: '点值地图视觉优化之邮贴图',
      legendArr: this.$store.state.arr,
      color: this.$store.state.color,
      myChart: {},

      // data: this.$store.state.data
      faultData:[],_coorData: [],coorData:[],geoData:[],

      rectangle_overlay: null,
      resX: null,resY: null,rStartX: null,rStartY: null,rEndX: null,rEndY: null,

      pf_alarm: [],zx_alarm: [],xt_alarm: [],dj_alarm: [],sp_alarm: [],xj_alarm: [],gm_alarm: [],wzt_alarm: [],dvr_alarm: [],
      netnodePoints: [],lgArray: [],_netnodePoints: [],_netnodePointss: [],_netnodePointsss: [],
      pfArray: [],zxArray: [],xtArray: [],djArray: [],spArray: [],xjArray: [],gmArray: [],wztArray: [],dvrArray: [],

      firstChart: {},secondChart: {},thirdChart: {},fourthChart: {},fifthChart: {},sixthChart: {},seventhChart: {},eighthChart: {},ninthChart: {},
      txt: '',
      option1: {},option2: {},option3: {},option4: {},option5: {},option6: {},option7: {},option8: {},option9: {},
    }
  },
  components: {
    'v-header': header,
    'v-filter': filter,
    'v-map': map
  },
  mounted() {
    // window.app2 = this
    /*--------------------------百度地图------------------------------- */
    MP(this.ak).then(BMap => { // 实例化地图
      this.$refs.useMap.createMap() // 引入初始化地图

      this.getData()
      // ------firstChart start----------
      this.firstChart = echarts.init(document.getElementById("box1"));
      this.txt = '设备停机'
      this.option1 = this.createOpt(this.txt,this.pfArray,this.lgArray);

      this.firstChart.setOption(this.option1);
      // -----firstChart end-----------

      // -----secondChart start-----
      this.secondChart = echarts.init(document.getElementById("box2"));
      this.txt = '视频丢失'
      this.option2 = this.createOpt(this.txt,this.zxArray,this.lgArray)

      this.secondChart.setOption(this.option2);
      // -----secondChart end-----

      // ------thirdChart start----------
      this.thirdChart = echarts.init(document.getElementById("box3"));
      this.txt = '电池测试故障'
      this.option3 = this.createOpt(this.txt,this.xtArray,this.lgArray);

      this.thirdChart.setOption(this.option3);
      // -----thirdChart end-----------

      // -----fourthChart start-----
      this.fourthChart = echarts.init(document.getElementById("box4"));
      this.txt = '接触故障'
      this.option4 = this.createOpt(this.txt,this.djArray,this.lgArray)

      this.fourthChart.setOption(this.option4);
      // -----fourthChart end-----

      // ------fifthChart start----------
      this.fifthChart = echarts.init(document.getElementById("box5"));
      this.txt = '主机停机'
      this.option5 = this.createOpt(this.txt,this.spArray,this.lgArray);

      this.fifthChart.setOption(this.option5);
      // -----fifthChart end-----------

      // -----sixthChart start-----
      this.sixthChart = echarts.init(document.getElementById("box6"));
      this.txt = '设备运行数'

      this.option6 = this.createOpt(this.txt,this.xjArray,this.lgArray)

      this.sixthChart.setOption(this.option6);
      // -----sixthChart end-----

      // ------seventhChart start----------
      this.seventhChart = echarts.init(document.getElementById("box7"));
      this.txt = '设备恢复数'
      this.option7 = this.createOpt(this.txt,this.gmArray,this.lgArray);

      this.seventhChart.setOption(this.option7);
      // -----seventhChart end-----------

      // -----eighthChart start-----
      this.eighthChart = echarts.init(document.getElementById("box8"));
      this.txt = '感应器故障'
      this.option8 = this.createOpt(this.txt,this.wztArray,this.lgArray)

      this.eighthChart.setOption(this.option8);
      // -----eighthChart end-----

      // ------ninthChart start----------
      this.ninthChart = echarts.init(document.getElementById("box9"));
      this.txt = '长距离无限发射故障'
      this.option9 = this.createOpt(this.txt,this.dvrArray,this.lgArray);

      this.ninthChart.setOption(this.option9);
      // -----ninthChart end-----------

    })

    this.init()

  },
  methods: {

    init() {
      this.legendArr.forEach((data) => {
        data.selected = true;
      })
    },

    onMap(ev) {
      this.map = ev
    },

    onPoint(ev) {
      this.mPoint = ev
    },

    // 初始化矩形symbol
    dragSymbol() {
      this.rectangle_overlay = new BMap.Marker(new BMap.Point(this.mPoint.lng,this.mPoint.lat), {
        icon: new BMap.Symbol(BMap_Symbol_SHAPE_RECTANGLE, {         //覆盖物更改为长4px，宽2px的矩形
            scale: 35,                                               //覆盖框增大比例
            strokeWeight: 2,
            strokeColor: '#3D59AB',                                      //边框大小
            strokeStyle: 'solid',                                       //边线的样式
            fillColor: "#3D59AB",                                      //覆盖框颜色
            fillOpacity: 0.2                                       //透明度
        })
      })
      this.map.addOverlay(this.rectangle_overlay)          //在地图上添加覆盖物
      this.rectangle_overlay.enableDragging()         //允许拖拽

      let bounds = this.map.getBounds();
      let geoPointLB = bounds.getSouthWest();             //左下角点地理坐标
      let geoPointRT = bounds.getNorthEast();             //右上角点地理坐标
      let pixelPointLB = this.map.pointToPixel(geoPointLB);    //左下角点像素坐标
      let pixelPointRT = this.map.pointToPixel(geoPointRT);    //右上角点像素坐标

      this.resX = (geoPointRT.lng - geoPointLB.lng) / (pixelPointRT.x - pixelPointLB.x);    //分辨率 = 经度差 / x差
      this.resY = (geoPointRT.lat - geoPointLB.lat) / (pixelPointRT.y - pixelPointLB.y);
    },

    // 获取数据、处理数据
    getData() {

      axios.get('../../../static/data/troubleData.json').then((res) => {
        let datas = res.data[0]
        this.faultData = datas.TBL_FAULT_LOG
        this._coorData = datas.TBL_NETNODE_INFO
        this.coorData = this.getNewArr(this._coorData)
        this.geoData = this.getGeoData(this.coorData,this.faultData)
        this.netnodePoints = this.getNetNode(this.geoData)
        this._netnodePoints = this.netnodePoints.slice(0,300)
        this._netnodePointss = this.netnodePoints.slice(300,600)
        this._netnodePointsss = this.netnodePoints.slice(600,1000)
        // 统计各报警数据
        this.pf_alarm = this.geoData.filter(function(item){
                return item.FAULT_SYMPTOM === "频繁报警"
            })
        this.zx_alarm = this.geoData.filter(function(item){
            return item.FAULT_SYMPTOM === "专项巡检"
        })
        this.xt_alarm = this.geoData.filter(function(item){
            return item.FAULT_SYMPTOM =="1106关机"||item.FAULT_SYMPTOM =="1106电话关机"||item.FAULT_SYMPTOM === "关机"
        })
        this.dj_alarm = this.geoData.filter(function(item){
            return item.FAULT_SYMPTOM === "不在线"
        })
        this.sp_alarm = this.geoData.filter(function(item){
            return item.FAULT_SYMPTOM === "IP对讲故障"||item.FAULT_SYMPTOM === "硬盘故障"||item.FAULT_SYMPTOM === "对讲设备不在线,"
        })
        this.xj_alarm = this.geoData.filter(function(item){
            return item.FAULT_SYMPTOM === "巡检"||item.FAULT_SYMPTOM ==="巡检安装"
        })
        this.gm_alarm = this.geoData.filter(function(item){
            return item.FAULT_SYMPTOM === "报警设备不在线,"||item.FAULT_SYMPTOM ==="报警设备不在线,11106电话无法接通"
        })
        this.wzt_alarm = this.geoData.filter(function(item){
            return item.FAULT_SYMPTOM =="1106电话空号"||item.FAULT_SYMPTOM =="1106空号"||item.FAULT_SYMPTOM =="1106卡已被用"||item.FAULT_SYMPTOM =="报警设备不在线,11106电话无法接通"||item.FAULT_SYMPTOM =="1106故障"
        })
        this.dvr_alarm = this.geoData.filter(function(item){
            return item.FAULT_SYMPTOM === "DVR不在线,"||item.FAULT_SYMPTOM ==="dvr不在线"||item.FAULT_SYMPTOM ==="DVR故障"
        })

        let self = this

        // 地图添加svg图元
        this._netnodePoints.forEach(function(points,index){
            var x = points.lng
            var y = points.lat
            var newPoint = new BMap.Point(x,y)

            var myIcon = new BMap.Icon("../../../static/img/ceshi1.svg", new BMap.Size(14,14))
            var newMarker = new BMap.Marker(newPoint,{icon:myIcon})
            self.map.addOverlay(newMarker)

            // var content = "<br/><br/>网点名：" + geoData[index].net_node_name ;
            // var infoWindow = new BMap.InfoWindow("<p style='font-size:14px;'>" + content + "</p>");
            // newMarker.addEventListener("mouseover", function () { this.openInfoWindow(infoWindow); });
        })

        this._netnodePointss.forEach(function(points,index){
            var x = points.lng
            var y = points.lat
            var newPoint = new BMap.Point(x,y)

            var myIcon = new BMap.Icon("../../../static/img/ceshi2.svg", new BMap.Size(14,14))
            var newMarker = new BMap.Marker(newPoint,{icon:myIcon})
            self.map.addOverlay(newMarker)
        })

        this._netnodePointsss.forEach(function(points,index){
            var x = points.lng
            var y = points.lat
            var newPoint = new BMap.Point(x,y)

            var myIcon = new BMap.Icon("../../../static/img/ceshi3.svg", new BMap.Size(14,14))
            var newMarker = new BMap.Marker(newPoint,{icon:myIcon})
            self.map.addOverlay(newMarker)
        })

        this.dragSymbol()

        // 拖拽响应事件处理
        this.rectangle_overlay.addEventListener('dragend', function(){
          self.rStartX = self.rectangle_overlay.getPosition().lng - (self.resX * 160);//lng值
          self.rStartY = self.rectangle_overlay.getPosition().lat - (self.resY * 80);//lat值
          self.rEndX = self.rectangle_overlay.getPosition().lng + (self.resX * 160);//lng值
          self.rEndY = self.rectangle_overlay.getPosition().lat + (self.resY * 80);//lat值

           // 过滤出框内的报警数
          self.pfArray.push(self.checkPoint(self.pf_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))
          self.zxArray.push(self.checkPoint(self.zx_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))
          self.xtArray.push(self.checkPoint(self.xt_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))
          self.djArray.push(self.checkPoint(self.dj_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))
          self.spArray.push(self.checkPoint(self.sp_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))
          self.xjArray.push(self.checkPoint(self.xj_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))
          self.gmArray.push(self.checkPoint(self.gm_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))
          self.wztArray.push(self.checkPoint(self.wzt_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))
          self.dvrArray.push(self.checkPoint(self.dvr_alarm,self.rEndY,self.rStartY,self.rStartX,self.rEndX))

          // 每拖动一次就重新刷新一次echarts图表
          self.firstChart.setOption(self.option1);
          self.secondChart.setOption(self.option2);
          self.thirdChart.setOption(self.option3);
          self.fourthChart.setOption(self.option4);
          self.fifthChart.setOption(self.option5);
          self.sixthChart.setOption(self.option6);
          self.seventhChart.setOption(self.option7);
          self.eighthChart.setOption(self.option8);
          self.ninthChart.setOption(self.option9);

          self.lgArray.push(self.pfArray.length)
        })
      })
    },

    // 对象合并
    getGeoData(coorData,faultData) {
      return faultData.map(function(item,index){
          return Object.assign(coorData[index], faultData[index])
      })
    },

    // 过滤出地图需要的数据
    getNewArr(newData) {
      return newData.map(function(item,index){
        var geo = {
            baidu_address: '',
            dimension: null,
            longitude: null,
            area:null,
            net_node_name: ''
        }
        for (var x in geo) {
            geo[x] = item[x]
        }
        return geo
      })
    },

    // 获取地图经纬度坐标
    getNetNode(geoData) {
      return geoData.map(function(item,index){
        var lng = geoData[index].longitude
        var dim = geoData[index].dimension
        return new BMap.Point(lng, dim)
      })
    },

    // 确定框内报警数
    checkPoint(points,rEndY,rStartY,rStartX,rEndX) {
      let pts = [];
      points.forEach(function(point,index){
          var y=point.dimension;
          var x=point.longitude;
          if (y >= rEndY && y <= rStartY){
              if (x >= rStartX && x <= rEndX){
                  pts.push(point);
              }
          }
      })
      return pts.length || 0;
    },

    // option滑动条组装
    createDataZoom() {
      let dataZoom = []
      return dataZoom = [
        {
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'empty',
            handleSize: 6,//滑动条的 左右2个滑动条的大小
            height: 10,//组件高度
            left: '18%', //左边的距离
            right: '12%',//右边的距离
            bottom: 3,//右边的距离
            start: 0,
            end: 100,
            handleColor: '#ddd',//滑动图标的颜色
            handleStyle: {
                borderColor: "#cacaca",
                borderWidth: "1",
                shadowBlur: 2,
                background: "#ddd",
                shadowColor: "#ddd",
            },
            fillerColor: "#3D59AB",
            backgroundColor: '#ddd',//两边未选中的滑动条区域的颜色
            showDataShadow: false,//是否显示数据阴影 默认auto
            showDetail: false,//即拖拽时候是否显示详细数值信息 默认true
            handleIcon: 'M-292,322.2c-3.2,0-6.4-0.6-9.3-1.9c-2.9-1.2-5.4-2.9-7.6-5.1s-3.9-4.8-5.1-7.6c-1.3-3-1.9-6.1-1.9-9.3c0-3.2,0.6-6.4,1.9-9.3c1.2-2.9,2.9-5.4,5.1-7.6s4.8-3.9,7.6-5.1c3-1.3,6.1-1.9,9.3-1.9c3.2,0,6.4,0.6,9.3,1.9c2.9,1.2,5.4,2.9,7.6,5.1s3.9,4.8,5.1,7.6c1.3,3,1.9,6.1,1.9,9.3c0,3.2-0.6,6.4-1.9,9.3c-1.2,2.9-2.9,5.4-5.1,7.6s-4.8,3.9-7.6,5.1C-285.6,321.5-288.8,322.2-292,322.2z',
            filterMode: 'filter',
        },{ //下面这个属性是里面拖到
            type: 'inside',
            show: true,
            xAxisIndex: [0],
            start: 1,
            end: 100
        }
      ]
    },

    // 初始化option
    createOpt(txt,datax,lgArray) {
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
                  // color: '#eee'
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
