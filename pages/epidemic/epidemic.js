let utils = require('../../utils/utils')
Page({
  data:{
    epidemicData:[],
    lastUpdateTime:"",
    epideicChinaTotal:[],  //累计
    epideicChinaAdd:[]
  },
  onLoad: function(options) {
    this.getEpidemicData()
  },
    // 疫情数据
    getEpidemicData: function () {
      var that = this;
      var url = "https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5";
      wx.request({
        url: url,
        success: function (res) {
          // console.log(JSON.parse(res.data.data))
          var newEpidemicData = JSON.parse(res.data.data)
          var lastUpdateTime = newEpidemicData.lastUpdateTime
          that.setData({
            epidemicData:newEpidemicData,
            lastUpdateTime:newEpidemicData.lastUpdateTime,
            epideicChinaTotal:newEpidemicData.chinaTotal,
            epideicChinaAdd:newEpidemicData.chinaAdd
          });
          console.log(lastUpdateTime)
        },
        fail: function (res) {
          wx.showToast({
            title: '查询失败',
            icon: 'none',
          })
        },
        complete: function (res) { },
      })
    },
    
})