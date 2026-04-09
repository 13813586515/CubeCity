import { getAdjustedStabilityRate, STABILITY_CONFIG } from '@/constants/constants.js'
import { EVENT_CONFIG, EVENT_DATA, EVENT_TYPES } from '@/constants/events.js'
import { getEffectiveBuildingValue } from '@/js/utils/building-interaction-utils.js'
import { defineStore } from 'pinia'

export const useGameState = defineStore('gameState', {
  state: () => ({
    // 核心游戏状态
    metadata: Array.from({ length: 17 }, _ =>
      Array.from({ length: 17 }, _ => ({
        type: 'grass',
        building: null,
        direction: 0,
      }))),
    currentMode: 'build',
    selectedBuilding: null,
    selectedPosition: null,
    toastQueue: [],

    // 游戏时间和经济
    gameDay: 1,
    credits: 3000,

    // 城市属性
    territory: 16,
    cityLevel: 1,
    cityName: 'HeXian City',
    citySize: 16,
    language: 'en',
    showMapOverview: false,

    // 音乐系统状态
    musicEnabled: false,
    musicVolume: 0.5,
    isPlayingMusic: false,

    // 稳定度系统（移除计时器相关状态）
    stability: 100,
    stabilityChangeRate: 0,
    // 移除：stabilityIntervalId: null,

    // 随机事件系统
    activeEvents: [],
    eventHistory: [],
    lastEventCheckDay: 0,
    eventModifiers: {
      incomeMultiplier: 1,
      powerMultiplier: 1,
      populationMultiplier: 1,
    },
  }),
  getters: {
    /**
     * 计算每日总收入（直接使用metadata中的detail，大幅提升性能）
     * @param {object} state - 游戏状态
     * @returns {number} 总收入
     */
    dailyIncome: (state) => {
      let totalIncome = 0

      state.metadata.forEach((row, x) => {
        row.forEach((tile, y) => {
          if (tile.building && tile.detail) {
            const income = getEffectiveBuildingValue(state, x, y, 'coinOutput')
            totalIncome += income
          }
        })
      })

      return Math.floor(totalIncome * state.eventModifiers.incomeMultiplier)
    },
    /**
     * 计算总人口容量（优化：直接使用detail，仅对有相互作用的建筑计算修正）
     * @param {object} state - 游戏状态
     * @returns {number} 总人口容量
     */
    maxPopulation: (state) => {
      let totalCapacity = 0

      state.metadata.forEach((row, x) => {
        row.forEach((tile, y) => {
          if (tile.building && tile.detail && tile.detail.category === 'residential') {
            const capacity = getEffectiveBuildingValue(state, x, y, 'maxPopulation')
            totalCapacity += capacity
          }
        })
      })

      return Math.floor(totalCapacity * state.eventModifiers.populationMultiplier)
    },
    /**
     * 计算总就业岗位
     * @param {object} state - a
     * @returns {number} - b
     */
    totalJobs: (state) => {
      let totalJobs = 0
      state.metadata.forEach((row) => {
        row.forEach((tile) => {
          if (tile.building && tile.detail) {
            totalJobs += tile.detail.population || 0
          }
        })
      })
      return totalJobs
    },
    population() {
      return Math.min(this.maxPopulation * 1.5, this.totalJobs)
    },
    /**
     * 计算最大发电量（优化：直接使用detail，仅对有相互作用的建筑计算修正）
     * @param {object} state - 游戏状态
     * @returns {number} 最大发电量
     */
    maxPower: (state) => {
      let totalPower = 0

      state.metadata.forEach((row, x) => {
        row.forEach((tile, y) => {
          if (tile.building && tile.detail) {
            const power = getEffectiveBuildingValue(state, x, y, 'powerOutput')
            totalPower += power
          }
        })
      })

      return Math.floor(totalPower * state.eventModifiers.powerMultiplier)
    },
    /**
     * 计算总耗电量
     * @param {object} state - a
     * @returns {number} - b
     */
    power: (state) => {
      let totalUsage = 0
      state.metadata.forEach((row) => {
        row.forEach((tile) => {
          if (tile.building && tile.detail) {
            totalUsage += tile.detail.powerUsage || 0
          }
        })
      })
      return totalUsage
    },

    buildingCount: (state) => {
      let count = 0
      state.metadata.forEach((row) => {
        row.forEach((tile) => {
          if (tile.building && tile.building !== 'road') {
            count++
          }
        })
      })
      return count
    },
    /**
     * 计算总污染值（优化：直接使用detail，仅对有相互作用的建筑计算修正）
     * @param {object} state - 游戏状态
     * @returns {number} 总污染值
     */
    pollution: (state) => {
      let totalPollution = 0

      state.metadata.forEach((row, x) => {
        row.forEach((tile, y) => {
          if (tile.building && tile.detail) {
            // 使用高效函数：自动判断是否需要相互作用计算
            const pollution = getEffectiveBuildingValue(state, x, y, 'pollution')
            totalPollution += pollution
          }
        })
      })

      return totalPollution
    },
    hospitalCount: state =>
      state.metadata.flat().filter(tile => tile.building === 'hospital').length,
    policeStationCount: state =>
      state.metadata.flat().filter(tile => tile.building === 'police').length,
    fireStationCount: state =>
      state.metadata.flat().filter(tile => tile.building === 'fire_station').length,
  },
  actions: {
    updateStability() {
      // 每5秒的变化率，使用配置常量计算
      let changeRate = STABILITY_CONFIG.DEFAULT_STABILITY_CHANGE_RATE

      // 1. 公共服务建筑带来的稳定度提升
      const servicesCount = this.hospitalCount + this.policeStationCount + this.fireStationCount
      changeRate += servicesCount * getAdjustedStabilityRate(STABILITY_CONFIG.SERVICE_STABILITY_PER_SECOND)

      // 2. 就业不足导致的稳定度下降
      const jobDeficit = this.totalJobs - this.maxPopulation
      if (jobDeficit > 0 && this.maxPopulation > 0) {
        const unemploymentRatio = Number((jobDeficit / this.maxPopulation).toFixed(2))
        changeRate -= unemploymentRatio * getAdjustedStabilityRate(STABILITY_CONFIG.UNEMPLOYMENT_STABILITY_PENALTY)
      }

      // 3. 污染导致的稳定度下降
      if (this.pollution > STABILITY_CONFIG.POLLUTION_THRESHOLD) {
        // 污染越高，下降越快，呈指数增长
        const pollutionFactor = (this.pollution / STABILITY_CONFIG.POLLUTION_THRESHOLD) ** 2
        changeRate -= Number((pollutionFactor * getAdjustedStabilityRate(STABILITY_CONFIG.POLLUTION_STABILITY_PENALTY)).toFixed(2))
      }

      // 4. 电力不足导致的稳定度下降
      const powerDeficit = this.power - this.maxPower
      if (powerDeficit > 0 && this.maxPower > 0) {
        const powerDeficitRatio = Number((powerDeficit / this.maxPower).toFixed(2))
        changeRate -= powerDeficitRatio * getAdjustedStabilityRate(STABILITY_CONFIG.POWER_DEFICIT_STABILITY_PENALTY)
      }

      // 确保变化率是有效数值，防止 Infinity 或 NaN
      if (!Number.isFinite(changeRate)) {
        changeRate = 0
      }

      this.stabilityChangeRate = changeRate
    },

    applyStabilityChange() {
      const newStability = this.stability + this.stabilityChangeRate
      this.stability = Math.max(0, Math.min(100, newStability))
    },

    // 移除稳定度定时器相关方法，现在使用统一的5秒计时器
    // startStabilityTimer() 和 stopStabilityTimer() 已移除

    setMode(mode) {
      this.currentMode = mode
    },
    setSelectedBuilding(payload) {
      this.selectedBuilding = payload
    },
    setSelectedPosition(position) {
      this.selectedPosition = position
    },
    // 金币
    setCredits(credits) {
      this.credits = credits
    },
    updateCredits(credits) {
      this.credits += credits
    },
    setTerritory(territory) {
      this.territory = territory
    },
    setCityLevel(cityLevel) {
      this.cityLevel = cityLevel
    },
    setCityName(cityName) {
      this.cityName = cityName
    },
    setCitySize(citySize) {
      this.citySize = citySize
    },
    addToast(message, type = 'info') {
      const id = Date.now() + Math.random()
      this.toastQueue.push({ message, type, id })
      // 最多只保留 3 条 toast
      if (this.toastQueue.length > 2) {
        this.toastQueue.shift()
      }
    },
    setLanguage(lang) {
      this.language = lang
    },
    removeToast(id) {
      this.toastQueue = this.toastQueue.filter(t => t.id !== id)
    },
    clearSelection() {
      this.selectedBuilding = null
      this.selectedPosition = null
    },
    setTile(x, y, patch) {
      // 合并 patch 到指定 tile
      Object.assign(this.metadata[x][y], patch)
    },
    updateTile(x, y, patch) {
      // 语义同 setTile，便于扩展
      Object.assign(this.metadata[x][y], patch)
    },
    getTile(x, y) {
      return this.metadata?.[x]?.[y] || null
    },
    setShowMapOverview(val) {
      this.showMapOverview = val
    },
    /**
     * 进入下一天，更新金币和稳定度
     */
    nextDay() {
      // 经济系统更新
      this.credits += this.dailyIncome
      this.gameDay++

      // 稳定度系统更新（每5秒执行一次）
      this.updateStability()
      this.applyStabilityChange()

      // 事件系统：更新持续事件并检查新事件
      this.updateActiveEvents()
      this.checkAndTriggerEvents()
    },
    resetAll() {
      this.metadata = Array.from({ length: 17 }, _ =>
        Array.from({ length: 17 }, _ => ({
          type: 'grass',
          building: null,
          direction: 0,
        })))
      this.currentMode = 'build'
      this.selectedBuilding = null
      this.selectedPosition = null
      this.toastQueue = []
      this.gameDay = 1
      this.credits = 3000
      this.territory = 16
      this.cityLevel = 1
      this.cityName = 'HeXian City'
      this.citySize = 16
      this.language = 'en'
      this.showMapOverview = false
      this.stability = 100
      this.stabilityChangeRate = 0
      this.musicEnabled = false
      this.musicVolume = 0.5
      this.isPlayingMusic = false

      // 重置事件系统
      this.activeEvents = []
      this.eventHistory = []
      this.lastEventCheckDay = 0
      this.eventModifiers = {
        incomeMultiplier: 1,
        powerMultiplier: 1,
        populationMultiplier: 1,
      }
    },

    // 音乐系统相关方法
    toggleMusic() {
      this.musicEnabled = !this.musicEnabled
    },
    enableMusic() {
      this.musicEnabled = true
    },
    disableMusic() {
      this.musicEnabled = false
    },
    setMusicVolume(volume) {
      this.musicVolume = Math.max(0, Math.min(1, volume))
    },
    setMusicPlaying(playing) {
      this.isPlayingMusic = playing
    },

    // ==================== 随机事件系统 ====================

    /**
     * 检查事件触发条件
     * @param {object} eventData - 事件数据
     * @returns {boolean} 是否满足触发条件
     */
    checkEventTriggerCondition(eventData) {
      // 检查城市等级
      if (eventData.minCityLevel && this.cityLevel < eventData.minCityLevel) {
        return false
      }

      // 检查建筑数量
      if (eventData.minBuildings && this.buildingCount < eventData.minBuildings) {
        return false
      }

      // 检查稳定度
      if (eventData.minStability && this.stability < eventData.minStability) {
        return false
      }

      // 检查人口
      if (eventData.minPopulation && this.maxPopulation < eventData.minPopulation) {
        return false
      }

      // 检查污染上限
      if (eventData.maxPollution !== undefined && this.pollution > eventData.maxPollution) {
        return false
      }

      // 检查是否需要工业建筑
      if (eventData.requiresIndustrial) {
        const hasIndustrial = this.metadata.flat().some(tile =>
          tile.building && ['factory', 'chemistry_factory', 'nuke_factory'].includes(tile.building),
        )
        if (!hasIndustrial)
          return false
      }

      // 检查是否没有医院
      if (eventData.requiresNoHospital && this.hospitalCount > 0) {
        return false
      }

      // 检查是否电力不足
      if (eventData.requiresPowerShortage && this.power <= this.maxPower) {
        return false
      }

      return true
    },

    /**
     * 应用事件效果
     * @param {object} eventData - 事件数据
     * @returns {object} 应用的效果详情
     */
    applyEventEffect(eventData) {
      const effects = {}

      switch (eventData.id) {
        case EVENT_TYPES.ECONOMIC_CRISIS:
          this.eventModifiers.incomeMultiplier = 0.7
          effects.incomeMultiplier = 0.7
          break

        case EVENT_TYPES.ECONOMIC_BOOM:
          this.eventModifiers.incomeMultiplier = 1.5
          effects.incomeMultiplier = 1.5
          break

        case EVENT_TYPES.TECH_BREAKTHROUGH:
          this.eventModifiers.powerMultiplier = 1.3
          effects.powerMultiplier = 1.3
          break

        case EVENT_TYPES.NATURAL_DISASTER: {
          const creditLoss = Math.floor(this.credits * 0.15)
          this.credits = Math.max(0, this.credits - creditLoss)
          this.stability = Math.max(0, this.stability - 20)
          effects.creditLoss = creditLoss
          effects.stabilityLoss = 20
          break
        }

        case EVENT_TYPES.EPIDEMIC:
          this.eventModifiers.populationMultiplier = 0.8
          effects.populationMultiplier = 0.8
          break

        case EVENT_TYPES.FESTIVAL: {
          this.stability = Math.min(100, this.stability + 15)
          const festivalBonus = Math.floor(this.dailyIncome * 0.5)
          this.credits += festivalBonus
          effects.stabilityGain = 15
          effects.coinBonus = festivalBonus
          break
        }

        case EVENT_TYPES.INVESTMENT: {
          const investment = Math.floor(Math.random() * 1500) + 500
          this.credits += investment
          effects.investment = investment
          break
        }

        case EVENT_TYPES.POWER_OUTAGE:
          this.eventModifiers.powerMultiplier = 0.6
          effects.powerMultiplier = 0.6
          break

        case EVENT_TYPES.ENVIRONMENTAL_AWARD:
          this.stability = Math.min(100, this.stability + 20)
          this.credits += 1000
          effects.stabilityGain = 20
          effects.coinBonus = 1000
          break

        case EVENT_TYPES.POPULATION_MIGRATION: {
          const isPositive = Math.random() > 0.4
          if (isPositive) {
            this.eventModifiers.populationMultiplier = 1.1
            effects.populationMultiplier = 1.1
            effects.isPositive = true
          }
          else {
            this.eventModifiers.populationMultiplier = 0.95
            effects.populationMultiplier = 0.95
            effects.isPositive = false
          }
          break
        }
      }

      return effects
    },

    /**
     * 移除事件效果
     * @param {object} activeEvent - 活跃事件
     */
    removeEventEffect(activeEvent) {
      const eventData = EVENT_DATA[activeEvent.eventId]
      if (!eventData)
        return

      switch (eventData.id) {
        case EVENT_TYPES.ECONOMIC_CRISIS:
        case EVENT_TYPES.ECONOMIC_BOOM:
          this.eventModifiers.incomeMultiplier = 1
          break

        case EVENT_TYPES.TECH_BREAKTHROUGH:
        case EVENT_TYPES.POWER_OUTAGE:
          this.eventModifiers.powerMultiplier = 1
          break

        case EVENT_TYPES.EPIDEMIC:
        case EVENT_TYPES.POPULATION_MIGRATION:
          this.eventModifiers.populationMultiplier = 1
          break
      }
    },

    /**
     * 更新活跃事件（减少持续天数）
     */
    updateActiveEvents() {
      const expiredEvents = []
      const remainingEvents = []

      this.activeEvents.forEach((activeEvent) => {
        activeEvent.remainingDays--
        if (activeEvent.remainingDays <= 0) {
          expiredEvents.push(activeEvent)
          this.removeEventEffect(activeEvent)
        }
        else {
          remainingEvents.push(activeEvent)
        }
      })

      this.activeEvents = remainingEvents

      // 将过期事件添加到历史记录
      expiredEvents.forEach((event) => {
        this.eventHistory.unshift({
          ...event,
          endDay: this.gameDay,
          isExpired: true,
        })
      })

      // 限制历史记录数量
      if (this.eventHistory.length > 20) {
        this.eventHistory = this.eventHistory.slice(0, 20)
      }
    },

    /**
     * 检查并触发随机事件
     */
    checkAndTriggerEvents() {
      // 每 EVENT_CONFIG.CHECK_INTERVAL_DAYS 天检查一次
      if (this.gameDay - this.lastEventCheckDay < EVENT_CONFIG.CHECK_INTERVAL_DAYS) {
        return
      }

      this.lastEventCheckDay = this.gameDay

      // 检查活跃事件数量限制
      if (this.activeEvents.length >= EVENT_CONFIG.MAX_ACTIVE_EVENTS) {
        return
      }

      // 全局触发概率检查
      if (EVENT_CONFIG.GLOBAL_TRIGGER_CHANCE !== undefined && Math.random() > EVENT_CONFIG.GLOBAL_TRIGGER_CHANCE) {
        return
      }

      // 获取所有满足条件的事件
      const eligibleEvents = Object.values(EVENT_DATA).filter((event) => {
        // 检查是否已经有同类型的活跃事件
        const hasActiveSameType = this.activeEvents.some(ae => ae.eventId === event.id)
        if (hasActiveSameType)
          return false

        // 检查触发条件
        return this.checkEventTriggerCondition(event)
      })

      if (eligibleEvents.length === 0)
        return

      // 随机选择一个事件
      // 根据概率权重选择，并应用概率乘数
      const totalWeight = eligibleEvents.reduce((sum, e) => sum + (e.probability * EVENT_CONFIG.BASE_PROBABILITY_MULTIPLIER), 0)
      let random = Math.random() * totalWeight

      let selectedEvent = null
      for (const event of eligibleEvents) {
        random -= event.probability * EVENT_CONFIG.BASE_PROBABILITY_MULTIPLIER
        if (random <= 0) {
          selectedEvent = event
          break
        }
      }

      if (!selectedEvent) {
        return
      }

      // 应用事件效果
      const effects = this.applyEventEffect(selectedEvent)

      // 创建活跃事件记录
      const activeEvent = {
        id: Date.now(),
        eventId: selectedEvent.id,
        startDay: this.gameDay,
        remainingDays: selectedEvent.duration,
        effects,
        category: selectedEvent.category,
      }

      this.activeEvents.push(activeEvent)

      // 触发事件通知
      this.emitEventNotification(selectedEvent, effects)
    },

    /**
     * 触发事件通知（通过 eventBus）
     * @param {object} _eventData - 事件数据
     * @param {object} _effects - 效果详情
     */
    emitEventNotification(_eventData, _effects) {
      // 这个方法会在组件中通过 eventBus 监听
      // 这里我们只需要记录，实际的 UI 通知由组件处理
    },

    /**
     * 获取所有事件数据（用于看板显示）
     * @returns {Array} 事件数据数组
     */
    getAllEvents() {
      return Object.values(EVENT_DATA)
    },

    /**
     * 获取当前活跃事件
     * @returns {Array} 活跃事件数组
     */
    getActiveEventsWithDetails() {
      return this.activeEvents.map((activeEvent) => {
        const eventData = EVENT_DATA[activeEvent.eventId]
        return {
          ...activeEvent,
          ...eventData,
        }
      })
    },
  },
  persist: true, // 启用持久化
})
