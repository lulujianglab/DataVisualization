<template>
<div id="main">
  <v-header :name="name" :legendArr="legendArr"></v-header>
  <v-filter ></v-filter>
  <div id="container"></div>
</div>
</template>

<script>
import axios from 'axios'
import {MP} from '../../map.js'
import header from '../header/header'
import filter from '../filter/filter'

export default{
  data(){
    return {
      ak: 'ZUONbpqGBsYGXNIYHicvbAbM',
      name: "点值地图视觉优化之平行坐标图",
      legendArr: [],
      rawData: [],
      mapData: [],
      myChart: null,
    }
  },
  components: {
    'v-header': header,
    'v-filter': filter
  },
  mounted() {
    this.getData()
    MP(this.ak).then(BMap => {
      this.myChart = echarts.init(document.getElementById("container"))
      let schema = ["baidu_address","MONTH","REPORT_TIME","FINISH_TIME","CUSTOMER_NAME","FAULT_SYMPTOM","ADDRESS","AREA","TASK_STATE","DEGREE_OF_ACUTE"]
      let option = this.createOpt(this.rawData,schema,this.mapData)
      this.myChart.setOption(option)
    })
  },
  methods: {
    getData() {
      axios.get('../../../static/data/troubleData.json').then((res) => {
        let datas = res.data[0]
        let myData = datas.TBL_FAULT_LOG
        let geoCoor = datas.TBL_NETNODE_INFO
        geoCoor = this.getNewArr(geoCoor)
        let doulDatas = this.getGeoData(geoCoor,myData)
        let newData = this.getNewData(doulDatas)
        let geoCoordMap = this.getGeoCoor(geoCoor)
        this.rawData = this.getRawData(newData)
        this.mapData = this.makeMapData(geoCoordMap,this.rawData)
      })
    },

    getGeoData(geoCoor,myData) {
      return myData.map((item,index) => {
        return Object.assign(geoCoor[index], myData[index])
      })
    },

    getNewData(doulDatas){
      return doulDatas.filter((item) => {
        let patt = new RegExp("区"||"市")
        return patt.test(item["baidu_address"]) && item["REPORT_TIME"] && item["FINISH_TIME"] && item["FAULT_SYMPTOM"] && item["CUSTOMER_NAME"] && item["area"] && item["TASK_STATE"] && item["DEGREE_OF_ACUTE"]

      })
    },

    getNewArr(geoCoor) {
      return geoCoor.map((item,index) => {
        let geo = {
          baidu_address: '',
          dimension: null,
          longitude: null,
          area:null
        }
        for (let x in geo) {
          geo[x] = item[x]
        }
        return geo
      })
    },

    getGeoCoor(geoCoor) {
      let _geoCoordMap = {}
      if(geoCoor){
        geoCoor.forEach((item) => {
          let arr = []
          let key = item["baidu_address"]
          arr.push(item["longitude"], item["dimension"])
          _geoCoordMap[key] = arr
        })
      }
      return _geoCoordMap
    },

    getRawData(newData) {
        return newData.map((item,index) => {
            let newArr = []
            newArr.push(item["baidu_address"], item["REPORT_TIME"].slice(5,7), item["REPORT_TIME"].slice(8,10), item["FINISH_TIME"].slice(8,10), item["CUSTOMER_NAME"], item["FAULT_SYMPTOM"], (item["baidu_address"].match(/市(\S*?)区/)[1] + "区"), item["area"], item["TASK_STATE"], item["DEGREE_OF_ACUTE"])
            return newArr
        })
    },

    makeMapData(geoCoordMap,rawData) {
      return rawData.map((item,index) => {
          let geoCoord = geoCoordMap[rawData[index][0]]
          if (geoCoord) {
              return {
                  name: rawData[index][0],
                  value: geoCoord.concat(rawData[index].slice(1))
              }
          }
      })
    },

    createOpt(rawData,schema,mapData) {
      let opt = {}
      return opt={
        title: {
            left: 'center',
            top: 5,
            itemGap: 0,
            textStyle: {
                color: '#3D59AB'
            },
            z: 200
        },
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
              let value = (params.value + '').split('.')
              value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,') + '.' + value[1]
              return params.seriesName + '<br/>' + params.name + ' : ' + value
          }
        },
        toolbox: {
          show: true,
          left: 'right',
          iconStyle: {
              normal: {
                  borderColor: '#3D59AB'
              }
          },
          feature: { // 存放组件
          },
          z: 202
        },
        brush: {
          geoIndex: 0,
          brushLink: 'all', // 不同系列间，选中的项可以联动
          inBrush: {
              opacity: 1,
              symbolSize: 14
          },
          outOfBrush: {
              color: '#000',
              opacity: 0.2
          },
          z: 0
        },
        bmap: {
          center: [116.404, 39.875],
          zoom: 12,
          silent: true,
          // roam: true,
          left: '6%',
          top: 40,
          bottom: '54%',
          right: '14%',
          mapStyle: {
            'styleJson': [{
              "featureType": "all",
              "elementType": "all",
              "stylers": {
                "lightness": 10,
                "saturation": -100
              }
            }]
          }
        },
        parallelAxis: [ //inverse 是否反向坐标轴
          {dim: 1, name: schema[1], inverse: true, min:4, max: 5, nameLocation: 'end'},
          {dim: 2, name: schema[2], inverse: true, max: 31, nameLocation: 'end'},
          {dim: 3, name: schema[3], inverse: true, max: 31, nameLocation: 'end'},
          {dim: 4, name: schema[4], type: 'category', data: ['交通银行', '平安银行', '中国银行', '建设银行', '招商银行', '中信银行', '民生银行', '光大银行', '广发银行', '工商银行','农村商业银行','邮储']},
          {dim: 5, name: schema[5], type: 'category', data: ['报警设备不在线,', 'DVR不在线,', '掉电', '无状态报告', '观摩演示', '巡检', '磁盘故障', '1106电话已关机', '专项巡检', '频繁报警']},
          {dim: 6, name: schema[6], type: 'category', data: ['昌平区', '丰台区', '海淀区', '东城区', '宣武区','崇文区','怀柔区','朝阳区', '顺义区', '通州区', '西城区','平谷区','门头沟区','石景山区','房山区','大兴区']},
          {dim: 7, name: schema[7]},
          {dim: 8, name: schema[8]},
          {dim: 9, name: schema[9]}, // 类目数组，在类目轴type为category时
        ],
        visualMap: { // 视觉映射组件
          show: true,
          min: 10,
          max: 30,
          dimension: 2,
          inRange: {
              color: ['#fec42c','#80F1BE','#dd4444'].reverse(),
          }
        },
        grid: [{
          show: true,
          left: 0,
          right: 0,
          top: '58%',
          bottom: 0,
          // left: '55%',
          // right: 0,
          // top: 0,
          // bottom: 0,
          borderColor: 'transparent',
          backgroundColor: '#404a59',
          z: 99
        }, {
          show: true,
          left: 0,
          right: 0,
          top: 0,
          height: 38,
          borderColor: 'transparent',
          backgroundColor: '#F5F5F5',
          z: 199
        }],
        parallel: {
          top: '60%',
          left: 60,
          right: 60,
          bottom: 85,
          // top: 50,
          // left: '55%',
          // right: 80,
          // bottom: 65,
          axisExpandable: true,
          axisExpandCenter: 15,
          axisExpandCount: 10,
          axisExpandWidth: 60,
          axisExpandTriggerOn: 'mousemove',
          z: 100,
          parallelAxisDefault: {
            type: 'value',
            nameLocation: 'start',
            nameGap: 20,
            // nameRotate: 15,
            nameTextStyle: {
              color: '#fff',
              fontSize: 10
            },
            axisLine: { //坐标 轴线
              lineStyle: {
                  color: '#aaa'
              }
            },
            axisTick: { // 坐标轴刻度相关设置
              lineStyle: {
                  color: '#777'
              }
            },
            axisLabel: { // 坐标轴刻度标签的相关设置
              textStyle: {
                  color: '#fff'
              }
            },
            nameTruncate: {
              maxWidth: 170
            },
            splitNumber: 3,
            tooltip: {
              show: true
            },
            axisLine: {
              lineStyle: {
                width: 1,
                color: 'rgba(255,255,255,0.3)'
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            z: 100
          }
        },
        series: [{
          name: '各ATM机故障点',
          type: 'scatter',
          coordinateSystem: 'bmap',
          symbolSize: 8,
          data: mapData,
          activeOpacity: 1,
          label: {
            normal: {
                formatter: '{b}',
                position: 'right',
                show: false
            },
            emphasis: {
                show: true
            }
          },
          symbolSize: 10,
          itemStyle: {
            normal: {
              borderColor: '#fff',
              color: '#3D59AB',
            }
          }
        },{
          name: 'parallel',
          type: 'parallel',
          smooth: true,
          lineStyle: {
            normal: {
              color: '#3D59AB',
              width: 0.5,
            }
          },
          z: 300,
          blendMode: 'lighter',
          data: rawData
        }]
      }
    }
  }
}
</script>

<style>
#main {
  height: 100%;
  margin: 0;
}
#container {
  height: 100%;
  margin-top: -17px
}
</style>
