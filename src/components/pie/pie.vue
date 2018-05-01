<template>
  <div id="main">
    <div id="pie"></div>
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
            // console.log(diffDay)
            if (diffDay <=5 ) {
              this.diffData = 2 // 随机400个数
            } else {
              this.diffData = 3 // 随机800个数
            }
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

        let receivePerson = this.removePerson(faultData)
        receivePerson = this.accumulatedPerson(receivePerson)
        let pieData = this.pieRawData(receivePerson)

        this.myChart = echarts.init(document.getElementById('pie'))
        let pieOption = this.createPieOpt(pieData)
        this.myChart.setOption(pieOption)
      })
    },

    removePerson(faultData) { // 过滤出记录中RECEIVE_TASK_PERSON接警人员的字段
      return faultData.map((item) => {
          let obj = {
              name: ""
          }
          if(item['RECEIVE_TASK_PERSON']){
              obj['name'] = item['RECEIVE_TASK_PERSON']
          }
          return obj
      })
    },

    accumulatedPerson(receivePerson){ // 累计各接警人员接单数
      let obj = {}
      receivePerson.forEach((item) => {
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

    pieRawData(receivePerson) { // 重组成pie需要的数组对象
      let arr = [], selected = {}
      let i = 0
      for(let k in receivePerson){
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

    createPieOpt(pieData){ // 创建pie option
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

<style scoped>
#main {
  height: 100%;
  background-color: #F5F5F5;
}
#pie {
  width: 100%;
  height: 100%;
  /* height: calc( 100% - 100px ); */
}
</style>
