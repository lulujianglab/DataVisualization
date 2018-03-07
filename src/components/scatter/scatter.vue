<template>
  <div id="main">
    <div id="scatter"></div>
  </div>
</template>

<script>
import axios from 'axios'
import echarts from 'echarts'

export default {
  data() {
    return {
      myChart: {}
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      axios.get('../../../static/data/troubleData.json').then((res) => {
        let data = res.data[0]
        let faultData = data.TBL_FAULT_LOG
        let fourData = this.removefourData(faultData)
        fourData = this.mapData(fourData)
        let fiveData = this.removefiveData(faultData)
        fiveData = this.mapData(fiveData)
        let mixedData = this.removemixedData(faultData)
        mixedData = this.mapmixedData(mixedData)

        this.myChart = echarts.init(document.getElementById("scatter"));
        let scatterOption = this.createScatterOpt(fourData, fiveData, mixedData)
        this.myChart.setOption(scatterOption);
      })
    },

    // 过滤出报修和完成时间都在月份的记录
    removefourData(faultData) {
      return faultData.filter(function(item){
          return item.REPORT_TIME && item.REPORT_TIME.slice(5,7) === '04' && item.FINISH_TIME && item.FINISH_TIME.slice(5,7) === '04'
      })
    },

    // 过滤出报修和完成时间都在5月份的记录
    removefiveData(faultData) {
      return faultData.filter(function(item){
          return item.REPORT_TIME && item.REPORT_TIME.slice(5,7) === '05' && item.FINISH_TIME && item.FINISH_TIME.slice(5,7) === '05'
      })
    },

    // 过滤出报修在4月份和完成时间在5月份的记录
    removemixedData(faultData) {
      return faultData.filter(function(item){
          return item.REPORT_TIME && item.REPORT_TIME.slice(5,7) === '04' && item.FINISH_TIME && item.FINISH_TIME.slice(5,7) === '05'
      })
    },

    // 对4、5月份和4/5月份的数据记录过滤出REPORT_TIME、FINISH_TIME、FINISH_TIME与REPORT_TIME之差、FAULT_SYMPTOM
    mapData(arr){
      return arr.map(function(item){
          return [item.REPORT_TIME.slice(8,10),item.FINISH_TIME.slice(8,10),Number(item.FINISH_TIME.slice(8,10))-Number(item.REPORT_TIME.slice(8,10)),item.FAULT_SYMPTOM]
      })
    },
    mapmixedData(arr){
      return arr.map(function(item){
          return [item.REPORT_TIME.slice(8,10),item.FINISH_TIME.slice(8,10),30-Number(item.REPORT_TIME.slice(8,10))+Number(item.FINISH_TIME.slice(8,10)),item.FAULT_SYMPTOM]
      })
    },

    // 创建scatter option
    createScatterOpt(fourData, fiveData, mixedData){
      let opt = {}
      return opt = {
        title: {
            text: 'ATM机故障报修时间和完成时间',
            left: 'left',
            // padding:1,
            textStyle: {
                fontWeight: 'bold',
                fontSize: 15
            }
        },
        legend: {
            right: 10,
            data: ['4月份', '5月份', '4月份报修5月份完成']
        },
        xAxis: {
            splitLine: {
                show: false
            }
        },
        yAxis: {
            splitLine: {
                show: false
            },
            scale: true
        },
          series: [{
            name: '4月份',
            data: fourData,
            type: 'scatter',
            symbolSize: function (data) {
                return data[2]
            },
            label: {
              emphasis: {
                show: true,
                formatter: function (param) {
                    return param.data[3];
                },
                position: 'top'
              }
            },
            itemStyle: {
              normal: {
                shadowBlur: 10,
                shadowColor: '#F5F5F5',
                shadowOffsetY: 5,
                color: '#fec42c'
              }
            }
          }, {
              name: '5月份',
              data: fiveData,
              type: 'scatter',
              symbolSize: function (data) {
                  return data[2]
              },
              label: {
                emphasis: {
                  show: true,
                  formatter: function (param) {
                      return param.data[3];
                  },
                  position: 'top'
                }
              },
              itemStyle: {
                normal: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(25, 100, 150, 0.5)',
                  shadowOffsetY: 5,
                  color: '#80F1BE'
                }
              }
          }, {
              name: '4月份报修5月份完成',
              data: mixedData,
              type: 'scatter',
              symbolSize: function (data) {
                  return data[2]
              },
              label: {
                emphasis: {
                  show: true,
                  formatter: function (param) {
                      return param.data[3];
                  },
                  position: 'top'
                }
              },
              itemStyle: {
                normal: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(120, 36, 50, 0.5)',
                  shadowOffsetY: 5,
                  color: '#dd4444'
                }
              }
          }]
      }
    }
  }
}
</script>

<style>
#main {
  height: 100%;
  background-color: #F5F5F5;
}
#scatter {
  width: 100%;
  height: 100%;
  /* height: calc(100% - 100px); */
}
</style>
