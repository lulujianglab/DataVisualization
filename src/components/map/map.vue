
<template>
  <div id="allmap"></div>
</template>

<script>
export default{

  data() {
    return {
      map: null,
      mPoint: null
    }
  },

  methods: {
    createMap() {
      this.map = new BMap.Map("allmap") // 创建Map实例
      this.$emit('map',this.map)
      this.mPoint = new BMap.Point(116.404, 39.915) // 设置地图的区域
      this.$emit('point',this.mPoint)
      let myStyleJson=[{ // 地图底色
        "featureType": "all",
        "elementType": "all",
        "stylers": {
                  "lightness": 10,
                  "saturation": -100
        }
      }]
      this.map.setMapStyle({styleJson: myStyleJson })
      this.map.enableContinuousZoom() // 启用地图惯性拖拽，默认禁用
      this.map.addControl(new BMap.MapTypeControl()) // 添加地图类型控件
      this.map.addControl(new BMap.NavigationControl()) // 添加默认缩放平移控件
      this.map.enableScrollWheelZoom() // 启用滚轮放大缩小，默认禁用
      this.map.centerAndZoom(this.mPoint,13) // 区域，及滚轮的伸缩
      this.map.addControl(new BMap.OverviewMapControl()) // 添加默认缩略地图控件
      // map.addControl(new BMap.OverviewMapControl({ isOpen: true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT })) // 右下角，打开
    },
  }
}
</script>

<style scoped>
#allmap {
  /* width: 52%; */
  height: 100%;
  /* float: left;
  background-color: #F5F5F5; */
}
</style>
