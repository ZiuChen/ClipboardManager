<template>
  <div class="main">
    <div class="clip-restore" @click="restoreDataBase">🧺</div>
    <transition name="fade">
      <div class="clip-full" v-show="fullDataShow">
        <div v-if="fullData.type === 'text'">
          <div v-text="fullData.data"></div>
        </div>
        <div v-else>
          <file-list :data="fullData.data"></file-list>
        </div>
      </div>
    </transition>
    <div class="clip-overlay" v-show="fullDataShow" @click="toggleFullData('')"></div>
    <div class="clip-switch">
      <div class="clip-switch-items">
        <template v-for="tab of tabs">
          <div
            :class="{ 'clip-switch-item': true, active: activeTab === tab.type }"
            @click="toggleNav(tab.type)"
          >
            {{ tab.name }}
          </div>
        </template>
      </div>

      <div class="clip-search">
        <input v-model="filterText" autofocus type="text" placeholder="输入关键词检索" />
      </div>
    </div>
    <div class="clip-break"></div>
    <div class="clip-empty-status" v-if="showList.length === 0">📪 无记录</div>
    <div
      class="clip-item"
      v-for="(item, index) in showList"
      :key="item.createTime"
      @click="executeCopy(item)"
    >
      <div class="clip-info">
        <div class="clip-time">
          <span>{{ dateFormat(item.updateTime) }}</span>
        </div>
        <div class="clip-data">
          <template v-if="item.type === 'text'">
            {{ item.data.slice(0, 500).trim() }}
          </template>
          <template v-if="item.type === 'image'">
            <img :src="item.data" alt="Image" />
            <div class="clip-image-size">{{ item.size }}</div>
          </template>
          <template v-if="item.type === 'file'">
            <file-list :data="JSON.parse(item.data)" />
          </template>
        </div>
      </div>
      <div class="clip-count">{{ index + 1 }}</div>
      <div
        class="clip-more"
        v-if="
          (item.type === 'text' && item.data.length >= 500) ||
          (item.type === 'file' && JSON.parse(item.data).length >= 8)
        "
        @click.stop="toggleFullData(item)"
      >
        📃
      </div>
    </div>
  </div>
</template>

<script>
import FileList from '../cpns/FileList.vue'

export default {
  name: 'Main',
  components: {
    FileList
  },

  data() {
    return {
      GAP: 10,
      offset: 0,
      showList: [],
      list: [],
      fullData: { type: 'text', data: '' },
      fullDataShow: false,
      filterText: '',
      tabs: [
        {
          name: '📚 全部',
          type: 'all'
        },
        {
          name: '📋 文字',
          type: 'text'
        },
        {
          name: '⛺ 图片',
          type: 'image'
        },
        {
          name: '📂 文件',
          type: 'file'
        }
      ],
      activeTab: 'all'
    }
  },
  watch: {
    filterText: function (val) {
      this.updateShowList()
    }
  },
  mounted: function () {
    this.list = window.db.dataBase.data
    this.showList = this.list.slice(0, this.GAP) // 最初展示 10条

    // 初始化导航
    this.toggleNav(this.activeTab)

    // 定期检查更新
    let prev = {}
    setInterval(() => {
      const now = window.db.dataBase.data[0]
      if (prev?.id === now?.id) {
      } else {
        // 有更新
        this.list = window.db.dataBase.data
        this.toggleNav(this.activeTab)
        prev = now
      }
    }, 500)

    // 懒加载
    const callBack = (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.target.scrollingElement
      if (scrollTop + clientHeight + 20 >= scrollHeight) {
        this.offset += this.GAP + 1
        let addition = []
        if (this.activeTab !== 'all') {
          addition = this.list.filter((item) => item.type === this.activeTab)
        } else {
          addition = this.list
        }
        addition = addition.slice(this.offset, this.offset + this.GAP)
        if (addition.length) {
          this.showList.push(...addition)
        }
      }
    }
    document.addEventListener('scroll', callBack)
    document.addEventListener('keydown', (e) => {
      const { key, ctrlKey } = e
      const isTab = key === 'Tab'
      const isSearch =
        key === '/' ||
        (ctrlKey && (key === 'F' || key === 'f')) ||
        (ctrlKey && (key === 'L' || key === 'l'))
      const isExit = key === 'Escape'
      if (isTab) {
        const l = ['all', 'text', 'image', 'file']
        const i = l.indexOf(this.activeTab)
        const t = i === l.length - 1 ? l[0] : l[i + 1]
        this.toggleNav(t)
      } else if (isSearch) {
        document.querySelector('input').focus()
      } else if (isExit) {
        this.filterText = ''
      }
    })
  },
  methods: {
    toggleNav(type) {
      // 切换导航 同时更新展示的数据
      this.activeTab = type
      this.updateShowList()
    },
    updateShowList(type = this.activeTab) {
      if (type === 'all') {
        if (this.filterText) {
          // 有过滤词 则过滤掉图片
          this.showList = this.list
            .filter((item) => item.type !== 'image')
            .filter((item) => item.data.indexOf(this.filterText) !== -1)
            .slice(0, this.GAP)
        } else {
          // 无过滤词 直接更新
          this.showList = this.list
            .filter((item) => item.data.indexOf(this.filterText) !== -1)
            .slice(0, this.GAP)
        }
      } else if (type === 'image') {
        // 排除掉对图片 DataURL的筛选
        this.showList = this.list.filter((item) => item.type === type).slice(0, this.GAP)
      } else {
        // `file`类型 在stringify的data里搜
        // `text`类型 在data里搜
        this.showList = this.list
          .filter((item) => item.type === type)
          .filter((item) => item.data.indexOf(this.filterText) !== -1)
          .slice(0, this.GAP)
      }
      document.scrollingElement.scrollTop = 0
    },
    dateFormat(timeStamp) {
      const startTime = new Date(timeStamp) // 开始时间
      const endTime = new Date() // 结束时间
      const gaps = [
        Math.floor((endTime - startTime) / 1000 / 60), // 分钟
        Math.floor((endTime - startTime) / 1000 / 60 / 60), // 小时
        Math.floor((endTime - startTime) / 1000 / 60 / 60 / 24) // 天
      ]
      let info = ''
      if (gaps[2] > 0) {
        info = `${gaps[2]}天前`
      } else if (gaps[1] > 0) {
        info = `${gaps[1]}小时前`
      } else if (gaps[0] > 0) {
        info = `${gaps[0]}分钟前`
      } else {
        info = '刚刚'
      }
      return info
    },
    toggleFullData(item) {
      // only text || file
      const { type, data } = item
      if (type === 'text') {
        this.fullData.type = 'text'
        this.fullData.data = data
      } else if (type === 'file') {
        this.fullData.type = 'file'
        this.fullData.data = JSON.parse(data)
      }

      this.fullDataShow = !this.fullDataShow
    },
    executeCopy(item) {
      window.copy(item)
    },
    restoreDataBase() {
      const flag = window.confirm('确定要清空剪贴板记录吗?')
      if (flag) {
        window.db.emptyDataBase()
        this.updateShowList()
      }
    }
  }
}
</script>

<style>
:root {
  --primary--color: #8a2be2;
  --primary--color-lighter: #d3b8ec;
  --text-color: #333;
  --text-color-lighter: rgb(138, 138, 138);
  --text-bg-color: #e3d9ec;
  --text-bg-color-lighter: #eeeaf3;
}
.clip-restore {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 10px;
  right: 10px;
  height: 50px;
  width: 50px;
  cursor: pointer;
  border-radius: 50%;
  font-size: 20px;
  background-color: rgb(232, 232, 232);
  user-select: none;
}
.clip-restore:hover {
  background-color: var(--primary--color);
  transition: all 0.15s;
}
.clip-switch {
  z-index: 999;
  position: fixed;
  top: 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  background-color: #eeeeee;
}
.clip-switch-items {
  display: flex;
  justify-content: left;
  align-items: center;
  flex-direction: row;
}
.clip-switch .clip-switch-item {
  padding: 10px 15px 10px 15px;
  margin: 10px 5px 10px 10px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
}
.clip-switch .clip-switch-item:hover {
  background-color: rgb(222, 222, 222);
  transition: all 0.15s ease-in-out;
}
.clip-switch .active {
  color: var(--primary--color);
  background-color: white;
  transition: all 0.15s ease-in-out;
}
.clip-search {
  width: 40%;
  margin-right: 30px;
}
.clip-search input {
  width: 100%;
  /* normalize */
  background: none;
  outline: none;
  border: none;
  /* custom */
  color: var(--text-color);
  background-color: white;
  height: fit-content;
  font-size: 15px;
  padding: 10px;
  border-radius: 5px;
}
.clip-search input::placeholder {
  color: var(--text-color-lighter);
}
.clip-break {
  height: 55px;
}
.clip-empty-status {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
}
.clip-item {
  display: flex;
  justify-content: space-between;
  border: 0px solid #eee;
  border-width: 0px 0px 1px 0px;
  cursor: pointer;
}
.clip-item:hover {
  background-color: var(--text-bg-color-lighter);
  transition: all 0.15s;
}
.clip-info {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  padding: 10px;
}
.clip-time {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100px;
}
.clip-time span {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: var(--text-color-lighter);
  background-color: var(--text-bg-color);
  border-radius: 5px;
  min-width: 50px;
  padding: 5px 10px 5px 10px;
}
.clip-data {
  display: flex;
  overflow: hidden;
  word-break: break-all;
  max-height: 150px;
  padding: 5px;
  white-space: pre-wrap;
  flex-direction: column;
  background-color: white;
}
.clip-data img {
  max-height: 150px;
}
.clip-data .clip-image-size {
  position: absolute;
  background-color: white;
}
.clip-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  padding: 10px;
  font-size: 13px;
  color: var(--text-color-lighter);
  padding: 10px;
}
.clip-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 0px 5px 5px 0px;
}
.clip-more:hover {
  background-color: var(--text-bg-color);
  transition: all 0.15s;
}
.clip-full {
  z-index: 9999999999;
  position: fixed;
  top: 0;
  height: 100%;
  width: 60%;
  background: white;
  padding: 0px 20px 0px 20px;
  overflow-y: scroll;
  word-break: break-all;
  white-space: pre-wrap;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.clip-overlay {
  z-index: 999999999;
  position: fixed;
  top: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
}
</style>
