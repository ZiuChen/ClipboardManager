<template>
  <div class="main">
    <div class="clip-restore" @click="restoreDataBase">🧺</div>
    <ClipFullData
      :isShow="fullDataShow"
      :fullData="fullData"
      @onOverlayClick="toggleFullData('')"
    ></ClipFullData>
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
    <ClipItemList :showList="showList" @onDataChange="toggleFullData"></ClipItemList>
  </div>
</template>

<script>
import FileList from '../cpns/FileList.vue'
import ClipItemList from '../cpns/ClipItemList.vue'
import ClipFullData from '../cpns/ClipFullData.vue'

export default {
  name: 'Main',
  components: {
    FileList,
    ClipItemList,
    ClipFullData
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

<style lang="less">
@import '../style/variable.less';
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
  &:hover {
    background-color: @primary-color;
    transition: all 0.15s;
  }
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
  .active {
    color: @primary-color;
    background-color: white;
    transition: all 0.15s ease-in-out;
  }
  .clip-switch-items {
    display: flex;
    justify-content: left;
    align-items: center;
    flex-direction: row;
    .clip-switch-item {
      padding: 10px 15px 10px 15px;
      margin: 10px 5px 10px 10px;
      cursor: pointer;
      border-radius: 5px;
      font-size: 14px;
      &:hover {
        background-color: rgb(222, 222, 222);
        transition: all 0.15s ease-in-out;
      }
    }
  }
}
.clip-search {
  width: 40%;
  margin-right: 30px;
  input {
    width: 100%;
    /* normalize */
    background: none;
    outline: none;
    border: none;
    /* custom */
    color: @text-color;
    background-color: white;
    height: fit-content;
    font-size: 15px;
    padding: 10px;
    border-radius: 5px;
    &::placeholder {
      color: @text-color-lighter;
    }
  }
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

// .fade-enter-active,
// .fade-leave-active {
//   transition: all 0.15s;
// }
// .fade-enter,
// .fade-leave-to {
//   opacity: 0;
// }
</style>
