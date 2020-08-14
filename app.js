App({
  onLaunch () {
    // wx.cloud.init({
    //   env: 'envid',
    //   traceUser: true,
    // })
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systeminfo = res
        this.globalData.isIPhoneX = /iphonex/gi.test(res.model.replace(/\s+/, ''))
      },
    })
  },
  globalData: {
    // 是否保持常亮，离开小程序失效
    keepscreenon:false,
    systeminfo: {},
    isIPhoneX: false,
    key: '8abcf2dadd514778b3abcccfaacb18f1',
    weatherIconUrl: './img/weather-icon-S2/64/',
    requestUrl: {
      weather: 'https://devapi.heweather.net/v7/weather/now',
      hourly: 'https://devapi.heweather.net/v7/indices/1d',
    },
  },
})