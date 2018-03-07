<template>
  <div id="main">
    <div id="pie"></div>
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
        let receivePerson = this.removePerson(faultData)
        receivePerson = this.accumulatedPerson(receivePerson)
        let pieData = this.pieRawData(receivePerson)

        this.myChart = echarts.init(document.getElementById('pie'))
        let pieOption = this.createPieOpt(pieData)
        this.myChart.setOption(pieOption)
      })
    },

    // 过滤出记录中RECEIVE_TASK_PERSON接警人员的字段
    removePerson(faultData) {
      return faultData.map(function(item){
          let obj = {
              name: ""
          }
          if(item['RECEIVE_TASK_PERSON']){
              obj['name'] = item['RECEIVE_TASK_PERSON']
          }
          return obj
      })
    },

    // 累计各接警人员接单数
    accumulatedPerson(receivePerson){
      let obj = {}
      receivePerson.forEach(function(item){
          if(item['name'] && item['name'] != 'ceshi'){
              if(!obj[item['name']]){
                  obj[item['name']] = 1
              }else {
                  obj[item['name']]++
              }
          }
      })
      return obj
    },

    // 重组成pie需要的数组对象
    pieRawData(receivePerson) {
      let arr = [], selected = {}
      var i = 0
      for(var k in receivePerson){
          i++
          let obj = {
              name: "",
              value: null
          }
          obj['name'] = k
          obj['value'] = receivePerson[k]
          arr.push(obj)
          selected[k] = i < 6
      }
      return {
          arr: arr,
          selected: selected
      }
    },

    // 创建pie option
    createPieOpt(pieData){
      let opt = {}
      return opt = {
        title: {
            text: '接警人员接警数占比',
            x: 'left',
            textStyle: {
                fontWeight: 'bold',
                fontSize: 15
            }
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
            selected: pieData.selected
        },
        series : [
          {
              name: '姓名',
              type: 'pie',
              radius : '55%',
              center: ['40%', '50%'],
              data: pieData.arr,
              itemStyle: {
                  emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              }
          }
        ]
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
#pie {
  width: 100%;
  height: 100%;
  /* height: calc(100% - 100px); */
}
</style>
