<template>
  <div id="main">
    <div id="scatter"></div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      myChart: {},
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
  mounted() {
    this.getData()
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
    getData() {
      axios.get('static/data/troubleData.json').then((res) => {
        let data = res.data[0]
        let faultData = data.TBL_FAULT_LOG

        // 取随机个数
        Array.prototype.random = function () {
          var idx = Math.floor((Math.random()*this.length))
          var n = this.splice(idx,1)[0]
          return n
        }
        let i=0, newArr=[]
        if (this.diffData === 0) {
          faultData = []
        }  else if(this.diffData === 2) {
          if(this.numArr){
            let numlen = 600-100*(5-this.numArr)
            while(i++< numlen) {
              newArr.push(faultData.random())
            }
          } else{
            newArr = []
          }           
          faultData = newArr
        } else if(this.diffData === 3) {
          if(this.numArr){
            let numlen = 900-100*(5-this.numArr)
            while(i++< numlen) {
              newArr.push(faultData.random())
            }
          } else{
            newArr = []
          }
          faultData = newArr
        } else { 
          if(this.numArr){
            if(this.numArr===5){
              newArr = faultData
            }else{
              let numlen = faultData.length-100*(5-this.numArr)
              while(i++< numlen) {
                newArr.push(faultData.random())
              }
            }           
          } else{
            newArr = []
          } 
          faultData = newArr
        } 

        let fourData = this.removefourData(faultData)
        fourData = this.mapData(fourData)
        let fiveData = this.removefiveData(faultData)
        fiveData = this.mapData(fiveData)
        let mixedData = this.removemixedData(faultData)
        mixedData = this.mapmixedData(mixedData)

        this.myChart = echarts.init(document.getElementById("scatter"))
        let scatterOption = this.createScatterOpt(fourData, fiveData, mixedData)
        this.myChart.setOption(scatterOption)
      })
    },

    // 过滤出报修和完成时间都在月份的记录
    removefourData(faultData) {
      return faultData.filter((item) => {
          return item.REPORT_TIME && item.REPORT_TIME.slice(5,7) === '04' && item.FINISH_TIME && item.FINISH_TIME.slice(5,7) === '04'
      })
    },

    // 过滤出报修和完成时间都在5月份的记录
    removefiveData(faultData) {
      return faultData.filter((item) => {
          return item.REPORT_TIME && item.REPORT_TIME.slice(5,7) === '05' && item.FINISH_TIME && item.FINISH_TIME.slice(5,7) === '05'
      })
    },

    // 过滤出报修在4月份和完成时间在5月份的记录
    removemixedData(faultData) {
      return faultData.filter((item) => {
          return item.REPORT_TIME && item.REPORT_TIME.slice(5,7) === '04' && item.FINISH_TIME && item.FINISH_TIME.slice(5,7) === '05'
      })
    },

    // 对4、5月份和4/5月份的数据记录过滤出REPORT_TIME、FINISH_TIME、FINISH_TIME与REPORT_TIME之差、FAULT_SYMPTOM
    mapData(arr){
      return arr.map((item) => {
          return [item.REPORT_TIME.slice(8,10),item.FINISH_TIME.slice(8,10),Number(item.FINISH_TIME.slice(8,10))-Number(item.REPORT_TIME.slice(8,10)),item.FAULT_SYMPTOM]
      })
    },
    mapmixedData(arr){
      return arr.map((item) => {
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
            data: ['9月份', '10月份', '9月份报修10月份完成']
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
            name: '9月份',
            data: fourData,
            type: 'scatter',
            symbolSize: (data) => {
                return data[2]
            },
            label: {
              emphasis: {
                show: true,
                formatter: (param) => {
                    return param.data[3]
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
              name: '10月份',
              data: fiveData,
              type: 'scatter',
              symbolSize: (data) => {
                  return data[2]
              },
              label: {
                emphasis: {
                  show: true,
                  formatter: (param) => {
                      return param.data[3]
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
              name: '9月份报修10月份完成',
              data: mixedData,
              type: 'scatter',
              symbolSize: (data) => {
                  return data[2]
              },
              label: {
                emphasis: {
                  show: true,
                  formatter: (param) => {
                      return param.data[3]
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

<style scoped>
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
