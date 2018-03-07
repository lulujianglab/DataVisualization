<template>
  <div id="main">
    <div id="treemap"></div>
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
        let customerName = this.getCustomerName(faultData)
        let duplicatedName = this.removeDuplicatedName(customerName)
        let treemapData = this.treemapData(duplicatedName)

        this.myChart = echarts.init(document.getElementById('treemap'))
        let treemapOption = this.createTreemapOpt(treemapData)
        this.myChart.setOption(treemapOption)
      })
    },

    // 过滤出记录中的CUSTOMER_NAME字段
    getCustomerName(faultData) {
      return faultData.map(function(item){
        var name = {
            CUSTOMER_NAME: ''
        }
        for (var y in name){
            name[y] = item[y]
        }
        return name
      })
    },

    // CUSTOMER_NAME字段去重累加
    removeDuplicatedName(customerName) {
      var tmp = {}
      customerName.forEach(function(item){
        if (!tmp[item['CUSTOMER_NAME']]) {
            tmp[item['CUSTOMER_NAME']] = 1
        }else {
            tmp[item['CUSTOMER_NAME']]++
        }
      })
      return tmp
    },

    // 重新组合成treemap需要的数据格式
    treemapData(duplicatedName) {
      let arr = []
      for(var key in duplicatedName) {
          var tmps = {
              name: '',
              value: null
          }
          tmps['name'] = key
          tmps['value'] = duplicatedName[key]
          arr.push(tmps)
      }
      return arr
    },

    // 创建treemap option
    createTreemapOpt(treemapData){
      let opt = {}
      return opt = {
        title: {
            text: '客户银行数量情况',
            left: 'left',
            // padding:1,
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

<style>
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
