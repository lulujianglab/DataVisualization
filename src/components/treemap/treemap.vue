<template>
  <div id="main">
    <div id="treemap"></div>
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
              this.diffData = 3 // 随机800个数
            }
          } else {
            let diffDay = parseInt(endTime.slice(5,7)) - parseInt(startTime.slice(5,7))
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

        // 取随机数        
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

        let customerName = this.getCustomerName(faultData)
        let duplicatedName = this.removeDuplicatedName(customerName)
        let treemapData = this.treemapData(duplicatedName)
       
        this.myChart = echarts.init(document.getElementById('treemap'))
        let treemapOption = this.createTreemapOpt(treemapData)
        this.myChart.setOption(treemapOption)
      })
    },

    getCustomerName(faultData) { // 过滤出记录中的CUSTOMER_NAME字段
      return faultData.map((item) => {
        let name = {
            CUSTOMER_NAME: ''
        }
        for (let y in name){
            name[y] = item[y]
        }
        return name
      })
    },

    removeDuplicatedName(customerName) { // CUSTOMER_NAME字段去重累加
      let tmp = {}
      customerName.forEach((item) => {
        if (!tmp[item['CUSTOMER_NAME']]) {
            tmp[item['CUSTOMER_NAME']] = 1
        }else {
            tmp[item['CUSTOMER_NAME']]++
        }
      })
      return tmp
    },

    treemapData(duplicatedName) { // 重新组合成treemap需要的数据格式
      let arr = []
      for(let key in duplicatedName) {
          let tmps = {
              name: '',
              value: null
          }
          tmps['name'] = key
          tmps['value'] = duplicatedName[key]
          arr.push(tmps)
      }
      return arr
    },

    createTreemapOpt(treemapData){ // 创建treemap option
      let opt = {}
      return opt = {
        title: {
            text: '客户银行数量情况',
            left: 'left',
            textStyle: {
                fontWeight: 'bold',
                fontSize: 15
            }
        },
        tooltip: {},
        series: [{
          name: 'option',
          type: 'treemap',
          visibleMin: 300,
          data: treemapData,
          leafDepth: 2,
          levels: [
            {
              itemStyle: {
                normal: {
                  borderColor: '#555',
                  borderWidth: 4,
                  gapWidth: 4
                }
              }
            },
            {
              colorSaturation: [0.3, 0.6],
              itemStyle: {
                normal: {
                  borderColorSaturation: 0.7,
                  gapWidth: 1,
                  borderWidth: 2
                }
              }
            },
            {
              colorSaturation: [0.3, 0.5],
              itemStyle: {
                normal: {
                  borderColorSaturation: 0.6,
                  gapWidth: 1
                }
              }
            },
            {
              colorSaturation: [0.3, 0.5]
            }
          ]
        }]
      }
    }
  }
}
</script>

<style scoped>
#main {
  height: 100%;
  width: 100%;
  background-color: #F5F5F5;
}
#treemap {
  width: 100%;
  height: 100%;
  /* height: calc(100% - 100px); */
}
</style>
