let utils = require('../../utils/utils')
Page({
  data: {
    // projectAddress: 'https://github.com/myvin/quietweather',
    csdn: 'https://blog.csdn.net/qq_42540989',
    email: 'blj473669799@163.com',
    qq: '473669799',
    swiperHeight: 'auto',
    bannerImgList: [
      {
        src: '/img/heliushulinfengjing_7283795.jpg',
        title: '谁人定我去或留 ',
      },
      {
        src: '/img/17cd567662bafc8d63d73d41444585d2.jpg',
        title: '定我心中的宇宙',
      },
      {
        src: '/img/heliushulinfengjing_7283795.jpg',
        title: '只想靠两手向理想挥手',
      },
    ],
  },
  onLoad () {
    this.initSwiper()
  },
  previewImages (e) {
    let index = e.currentTarget.dataset.index || 0
    let urls = this.data.bannerImgList
    let arr = []
    let imgs = urls.forEach(item => {
      arr.push(item.src)
    })
    wx.previewImage({
      current: arr[index],
      urls: arr,
      success: function (res) { },
      fail: function (res) {
        console.error('previewImage fail: ', res)
      }
    })
  },
  initSwiper () {
    let systeminfo = getApp().globalData.systeminfo
    if (utils.isEmptyObject(systeminfo)) {
      wx.getSystemInfo({
        success: (res) => {
          this.setSwiperHeight(res)
        },
      })
    } else {
      this.setSwiperHeight(systeminfo)
    }
  },
  setSwiperHeight (res) {
    this.setData({
      swiperHeight: `${(res.windowWidth || res.screenWidth) / 375 * 200}px`
    })
  },
  copy(e) {
    let dataset = (e.currentTarget || {}).dataset || {}
    let title = dataset.title || ''
    let content = dataset.content || ''
    wx.setClipboardData({
      data: content,
      success () {
        wx.showToast({
          title: `已复制${title}`,
          duration: 2000,
        })
      },
    })
  },
})