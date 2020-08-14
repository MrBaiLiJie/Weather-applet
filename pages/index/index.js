let utils = require('../../utils/utils')
let globalData = getApp().globalData
const key = globalData.key
let SYSTEMINFO = globalData.systeminfo
// 引用百度地图微信小程序JSAPI模块 
var bmap = require('../../data/bMap-wx.js'); 
Page({
  data: {
    isIPhoneX: globalData.isIPhoneX,
    message: '',
    cityDatas: {},
    hourlyDatas: [],
    weatherIconUrl: globalData.weatherIconUrl,
    detailsDic: {
      key: ['temp', 'feelsLike', 'humidity', 'precip', 'windDir', 'wind360', 'windScale', 'windSpeed', 'vis', 'pressure', 'cloud', 'dew'],
      val: {
        temp: '温度(℃)',
        feelsLike: '体感温度(℃)',
        humidity: '相对湿度(%)',
        precip: '降水量(mm)',
        windDir: '风向',
        wind360: '风向角度(deg)',
        windScale: '风力(级)',
        windSpeed: '风速(mk/h)',
        vis: '能见度(km)',
        pressure: '气压(mb)',
        cloud: '云量',
        dew:'露点温度'
      },
    },
    lifestyles: {
      'comf': '舒适度指数',
      'cw': '洗车指数',
      'drsg': '穿衣指数',
      'flu': '感冒指数',
      'sport': '运动指数',
      'trav': '旅游指数',
      'uv': '紫外线指数',
      'air': '空气污染扩散条件指数',
      'ac': '空调开启指数',
      'ag': '过敏指数',
      'gl': '太阳镜指数',
      'mu': '化妆指数',
      'airc': '晾晒指数',
      'ptfc': '交通指数',
      'fsh': '钓鱼指数',
      'spi': '防晒指数',
    },
    // 用来清空 input
    searchText: '',
    // 是否已经弹出
    hasPopped: false,
    animationMain: {},
    animationOne: {},
    animationTwo: {},
    animationThree: {},
    // 是否切换了城市
    located: true,
    // 需要查询的城市
    searchCity: '',
    setting: {},
    bcgImgList: [
      {
        src: '/img/beach-bird-birds-235787.jpg',
        topColor: '#393836'
      },
      {
        src: '/img/heliushulinfengjing_7283795.jpg',
        topColor: '#0085e5'
      },
      // {
      //   src: '/img/5c4d456275792.jpg',
      //   topColor: '#2d2225'
      // },
      {
        src: '/img/8268e60ca71e79e9449f5b9ef98c45fb.jpg',
        topColor: '#004a89'
      },
      {
        src: '/img/17cd567662bafc8d63d73d41444585d2.jpg',
        topColor: '#009ffe'
      },
      {
        src: '/img/beautiful-cold-dawn-547115.jpg',
        topColor: '#ffa5bc'
      }
    ],
    bcgImgIndex: 0,
    bcgImg: '',
    bcgImgAreaShow: false,
    bcgColor: '#2d2225',
    // 粗暴直接：移除后再创建，达到初始化组件的作用
    showHeartbeat: true,
    // heartbeat 时禁止搜索，防止动画执行
    enableSearch: true,
    openSettingButtonShow: false,
    shareInfo: {},
  },
  success (data, location) {
    this.setData({
      openSettingButtonShow: false,
      searchCity: location,
    })
    wx.stopPullDownRefresh()
    let now = new Date()
    // 存下来源数据
    data.updateTime = now.getTime()
    data.updateTimeFormat = utils.formatDate(now, "MM-dd hh:mm")
    wx.setStorage({
      key: 'cityDatas',
      data,
    })
    this.setData({
      cityDatas: data,
    })
  },
  fail(res) {
    wx.stopPullDownRefresh()
    let errMsg = res.errMsg || ''
    // 拒绝授权地理位置权限
    if (errMsg.indexOf('deny') !== -1 || errMsg.indexOf('denied') !== -1) {
      wx.showToast({
        title: '需要开启地理位置权限',
        icon: 'none',
        duration: 2500,
        success: (res) => {
          if (this.canUseOpenSettingApi()) {
            let timer = setTimeout(() => {
              clearTimeout(timer)
              wx.openSetting({})
            }, 2500)
          } else {
            this.setData({
              openSettingButtonShow: true,
            })
          }
        },
      })
    } else {
      wx.showToast({
        title: '网络不给力，请稍后再试',
        icon: 'none',
      })
    }
  },
  commitSearch (res) {
    let val = ((res.detail || {}).value || '').replace(/\s+/g, '')
    this.search(val)
  },
  dance() {
    this.setData({
      enableSearch: false,
    })
    let heartbeat = this.selectComponent('#heartbeat')
    heartbeat.dance(() => {
      this.setData({
        showHeartbeat: false,
        enableSearch: true,
      })
      this.setData({
        showHeartbeat: true,
      })
    })
  },
  clearInput () {
    this.setData({
      searchText: '',
    })
  },
  search (val, callback) {
    if (val === '520' || val === '521') {
      this.clearInput()
      this.dance()
      return
    }
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
    })
    if (val) {
      console.log(val)
      this.getlnglat(val)
      this.setData({
        district: val,
      })
    }
    callback && callback()
  },
  getlnglat: function (val) {
    // console.log(111)
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: "ZykiihvG8X2QWg4ZmbIc7r1UG2tR5nnr",
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      // console.log(data)
      // const wxMarkerData = data.wxMarkerData;
      // console.log(wxMarkerData)
      that.getWeather(`${data.wxMarkerData[0].longitude},${data.wxMarkerData[0].latitude}`)
      that.getThreeWeather(`${data.wxMarkerData[0].longitude},${data.wxMarkerData[0].latitude}`)
      that.getHourlyData(`${data.wxMarkerData[0].longitude},${data.wxMarkerData[0].latitude}`)
    }
    // 发起geocoding检索请求 
    BMap.geocoding({
      address: val,
      fail: fail,
      success: success,
      iconPath: '../../img/marker_red.png',
      iconTapPath: '../../img/marker_red.png'
    });
  }, 
  // wx.openSetting 要废弃，button open-type openSetting 2.0.7 后支持
  // 使用 wx.canIUse('openSetting') 都会返回 true，这里判断版本号区分
  canUseOpenSettingApi () {
    let systeminfo = getApp().globalData.systeminfo
    let SDKVersion = systeminfo.SDKVersion
    let version = utils.cmpVersion(SDKVersion, '2.0.7')
    if (version < 0) {
      return true
    } else {
      return false
    }
  },
  init(params, callback) {
    this.setData({
      located: true,
    })
    wx.getLocation({
      success: (res) => {
        // console.log(JSON.stringify(res))
        const latitude = res.latitude;
        const longitude = res.longitude;
        // console.log("lat:" + latitude + "lon:" + longitude);
        this.getCity(latitude, longitude);
        this.getWeather(`${res.longitude},${res.latitude}`)
        this.getThreeWeather(`${res.longitude},${res.latitude}`)
        // this.getHourly(`${res.longitude},${res.latitude}`)
        this.getHourlyData(`${res.longitude},${res.latitude}`)
        callback && callback()
      },
      fail: (res) => {
        this.fail(res)
      }
    })
  },
  //获取城市
  getCity: function (latitude, longitude) {
    var that = this;
    var url = "https://api.map.baidu.com/geocoder/v2/";
    var params = {
      ak: "ZykiihvG8X2QWg4ZmbIc7r1UG2tR5nnr",
      output: "json",
      location: latitude + "," + longitude,
    };
    wx.request({
      url: url,
      data: params,
      success: function (res) {
        // console.log(JSON.stringify(res))
        var city = res.data.result.addressComponent.city;
        var district = res.data.result.addressComponent.district;
        var street = res.data.result.addressComponent.street;
        that.setData({
          city: city,
          district: district,
          street: street
        })
        //获取城市名
        var descCity = city.substring(0, city.length - 1);
        // console.log(descCity)
        // 获取经纬度
        var cityLng = res.data.result.location.lng;
        var cityLat = res.data.result.location.lat;
        // that.getWeather(cityLng, cityLat);
        // that.getThreeWeather(cityLng, cityLat)
      },
      fail: function (res) {

      },
      complete: function (res) { },
    })
  },
  // 当天天气
  getWeather (location) {
    wx.request({
      url: `${globalData.requestUrl.weather}`,
      data: {
        location,
        key,
      },
      success: (res) => {
        //  console.log(JSON.stringify(res))
        if (res.data.code == 200) {
          // console.log(11)
          let data = res.data.now
            this.clearInput()
            this.success(data, location)
        }
      },
      fail: () => {
        wx.showToast({
          title: '查询失败',
          icon: 'none',
        })
      },
    })
  },
  // 获取 3天 天气预报
  getThreeWeather: function (location) {
    var that = this;
    var url = "https://devapi.heweather.net/v7/weather/3d";
    var params = {
      location: location,
      key: "8abcf2dadd514778b3abcccfaacb18f1"
    }
    wx.request({
      url: url,
      data: params,
      success: function (res) {
        // console.log(JSON.stringify(res))
        that.setData({
          cityThreeDatas: res.data,
        })
      },
      fail: function (res) {

      },
      complete: function (res) { },
    })
  },
  // 生活指数
  getHourlyData: function (location) {
    var that = this;
    var url = "https://devapi.heweather.net/v7/indices/1d";
    var params = {
      location: location,
      key: "8abcf2dadd514778b3abcccfaacb18f1",
      type: 0
    }
    wx.request({
      url: url,
      data: params,
      success: function (res) {
        // console.log(JSON.stringify(res))
        that.setData({
          hourlyDatas: res.data.daily,
        })
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
  onPullDownRefresh (res) {
    this.reloadPage()
  },
  getCityDatas() {
    let cityDatas = wx.getStorage({
      key: 'cityDatas',
      success: (res) => {
        this.setData({
          cityDatas: res.data,
        })
      },
    })
  },
  setBcgImg (index) {
    if (index !== undefined) {
      this.setData({
        bcgImgIndex: index,
        bcgImg: this.data.bcgImgList[index].src,
        bcgColor: this.data.bcgImgList[index].topColor,
      })
      this.setNavigationBarColor()
      return
    }
    wx.getStorage({
      key: 'bcgImgIndex',
      success: (res) => {
        let bcgImgIndex = res.data || 0
        this.setData({
          bcgImgIndex,
          bcgImg: this.data.bcgImgList[bcgImgIndex].src,
          bcgColor: this.data.bcgImgList[bcgImgIndex].topColor,
        })
        this.setNavigationBarColor()
      },
      fail: () => {
        this.setData({
          bcgImgIndex: 0,
          bcgImg: this.data.bcgImgList[0].src,
          bcgColor: this.data.bcgImgList[0].topColor,
        })
        this.setNavigationBarColor()
      },
    })
  },
  setNavigationBarColor (color) {
    let bcgColor = color || this.data.bcgColor
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: this.data.bcgColor,
    })
  },
  getBroadcast (callback) {
    // wx.cloud.callFunction({
    //   name: 'getBroadcast',
    //   data: {
    //     hour: new Date().getHours(),
    //   },
    // })
    // .then(res => {
    //   let data = res.result.data
    //   if (data) {
    //     callback && callback(data[0].message)
    //   }
    // })
  },
  reloadGetBroadcast () {
    var that = this;
    var url = "https://api.iiter.cn/soup";
    wx.request({
      url: url,
      success: function (res) {
        console.log(JSON.stringify(res.data))
        that.setData({
          message: res.data.data.title,
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '查询失败',
          icon: 'none',
        })
      },
      complete: function (res) { },
    })
    // https://api.iiter.cn/soup
    // this.getBroadcast((message) => {
    //   this.setData({
    //     message,
    //   })
    // })
  },
  reloadWeather () {
    if (this.data.located) {
      this.init({})
    } else {
      this.search(this.data.searchCity)
      this.setData({
        searchCity: '',
      })
    }
  },
  onShow() {
    // onShareAppMessage 要求同步返回
    if (!utils.isEmptyObject(this.data.shareInfo)) {
      return
    }
    // wx.cloud.callFunction({
    //   name: 'getShareInfo',
    // })
    // .then(res => {
    //   let shareInfo = res.result
    //   if (shareInfo) {
    //     if (!utils.isEmptyObject(shareInfo)) {
    //       this.setData({
    //         shareInfo,
    //       })
    //     }
    //   }
    // })
  },
  onLoad () {
    this.reloadPage()
  },
  reloadPage () {
    this.setBcgImg()
    this.getCityDatas()
    this.reloadInitSetting()
    this.reloadWeather()
    this.reloadGetBroadcast()
  },
  checkUpdate (setting) {
    // 兼容低版本
    if (!setting.forceUpdate || !wx.getUpdateManager) {
      return
    }
    let updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      console.error(res)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已下载完成，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
  },
  showBcgImgArea () {
    this.setData({
      bcgImgAreaShow: true,
    })
  },
  hideBcgImgArea () {
    this.setData({
      bcgImgAreaShow: false,
    })
  },
  chooseBcg (e) {
    let dataset = e.currentTarget.dataset
    let src = dataset.src
    let index = dataset.index
    this.setBcgImg(index)
    wx.setStorage({
      key: 'bcgImgIndex',
      data: index,
    })
  },
  toCitychoose () {
    wx.navigateTo({
      url: '/pages/citychoose/citychoose',
    })
  },
  initSetting (successFunc) {
    wx.getStorage({
      key: 'setting',
      success: (res) => {
        let setting = res.data || {}
        this.setData({
          setting,
        })
        successFunc && successFunc(setting)
      },
      fail: () => {
        this.setData({
          setting: {},
        })
      },
    })
  },
  reloadInitSetting () {
    this.initSetting((setting) => {
      this.checkUpdate(setting)
    })
  },
  onShareAppMessage (res) {
    let shareInfo = this.data.shareInfo
    return {
      title: shareInfo.title || 'Quiet Weather',
      path: shareInfo.path || '/pages/index/index',
      imageUrl: shareInfo.imageUrl,
    }
  },
  menuHide () {
    if (this.data.hasPopped) {
      this.takeback()
      this.setData({
        hasPopped: false,
      })
    }
  },
  menuMain () {
    if (!this.data.hasPopped) {
      this.popp()
      this.setData({
        hasPopped: true,
      })
    } else {
      this.takeback()
      this.setData({
        hasPopped: false,
      })
    }
  },
  menuToCitychoose () {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/citychoose/citychoose',
    })
  },
  menuToSetting () {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/setting/setting',
    })
  },
  menuToAbout () {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },
  popp() {
    let animationMain = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationOne = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationTwo = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationThree = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationFour = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    animationMain.rotateZ(180).step()
    animationOne.translate(0, -60).rotateZ(360).opacity(1).step()
    animationTwo.translate(-Math.sqrt(3600 - 400), -30).rotateZ(360).opacity(1).step()
    animationThree.translate(-Math.sqrt(3600 - 400), 30).rotateZ(360).opacity(1).step()
    animationFour.translate(0, 60).rotateZ(360).opacity(1).step()
    this.setData({
      animationMain: animationMain.export(),
      animationOne: animationOne.export(),
      animationTwo: animationTwo.export(),
      animationThree: animationThree.export(),
      animationFour: animationFour.export(),
    })
  },
  takeback() {
    let animationMain = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationOne = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationTwo = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationThree = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationFour = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    animationMain.rotateZ(0).step();
    animationOne.translate(0, 0).rotateZ(0).opacity(0).step()
    animationTwo.translate(0, 0).rotateZ(0).opacity(0).step()
    animationThree.translate(0, 0).rotateZ(0).opacity(0).step()
    animationFour.translate(0, 0).rotateZ(0).opacity(0).step()
    this.setData({
      animationMain: animationMain.export(),
      animationOne: animationOne.export(),
      animationTwo: animationTwo.export(),
      animationThree: animationThree.export(),
      animationFour: animationFour.export(),
    })
  },
})