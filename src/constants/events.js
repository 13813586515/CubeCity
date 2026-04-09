export const EVENT_TYPES = {
  ECONOMIC_CRISIS: 'economic_crisis',
  ECONOMIC_BOOM: 'economic_boom',
  TECH_BREAKTHROUGH: 'tech_breakthrough',
  NATURAL_DISASTER: 'natural_disaster',
  EPIDEMIC: 'epidemic',
  FESTIVAL: 'festival',
  INVESTMENT: 'investment',
  POWER_OUTAGE: 'power_outage',
  ENVIRONMENTAL_AWARD: 'environmental_award',
  POPULATION_MIGRATION: 'population_migration',
}

export const EVENT_CATEGORIES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
}

export const EVENT_DATA = {
  [EVENT_TYPES.ECONOMIC_CRISIS]: {
    id: EVENT_TYPES.ECONOMIC_CRISIS,
    category: EVENT_CATEGORIES.NEGATIVE,
    icon: '📉',
    name: {
      zh: '经济危机',
      en: 'Economic Crisis',
    },
    description: {
      zh: '经济衰退导致收入下降',
      en: 'Economic recession leads to reduced income',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 2 且 建筑数 ≥ 5',
      en: 'City Level ≥ 2 and Buildings ≥ 5',
    },
    effect: {
      zh: '每日收入减少 30%，持续 3 天',
      en: 'Daily income reduced by 30% for 3 days',
    },
    probability: 0.08,
    duration: 3,
    minCityLevel: 2,
    minBuildings: 5,
    color: '#ef4444',
  },
  [EVENT_TYPES.ECONOMIC_BOOM]: {
    id: EVENT_TYPES.ECONOMIC_BOOM,
    category: EVENT_CATEGORIES.POSITIVE,
    icon: '📈',
    name: {
      zh: '经济繁荣',
      en: 'Economic Boom',
    },
    description: {
      zh: '经济增长带来额外收入',
      en: 'Economic growth brings extra income',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 1 且 稳定度 ≥ 70',
      en: 'City Level ≥ 1 and Stability ≥ 70',
    },
    effect: {
      zh: '每日收入增加 50%，持续 3 天',
      en: 'Daily income increased by 50% for 3 days',
    },
    probability: 0.1,
    duration: 3,
    minCityLevel: 1,
    minStability: 70,
    color: '#22c55e',
  },
  [EVENT_TYPES.TECH_BREAKTHROUGH]: {
    id: EVENT_TYPES.TECH_BREAKTHROUGH,
    category: EVENT_CATEGORIES.POSITIVE,
    icon: '🔬',
    name: {
      zh: '科技突破',
      en: 'Tech Breakthrough',
    },
    description: {
      zh: '新技术提升发电效率',
      en: 'New technology improves power generation efficiency',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 2 且 有工业建筑',
      en: 'City Level ≥ 2 and has industrial buildings',
    },
    effect: {
      zh: '发电量增加 30%，持续 5 天',
      en: 'Power generation increased by 30% for 5 days',
    },
    probability: 0.06,
    duration: 5,
    minCityLevel: 2,
    requiresIndustrial: true,
    color: '#3b82f6',
  },
  [EVENT_TYPES.NATURAL_DISASTER]: {
    id: EVENT_TYPES.NATURAL_DISASTER,
    category: EVENT_CATEGORIES.NEGATIVE,
    icon: '🌪️',
    name: {
      zh: '自然灾害',
      en: 'Natural Disaster',
    },
    description: {
      zh: '自然灾害破坏城市设施',
      en: 'Natural disaster damages city facilities',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 3 且 建筑数 ≥ 10',
      en: 'City Level ≥ 3 and Buildings ≥ 10',
    },
    effect: {
      zh: '损失当前金币的 15%，稳定度下降 20',
      en: 'Lose 15% of current credits, stability decreases by 20',
    },
    probability: 0.04,
    duration: 1,
    minCityLevel: 3,
    minBuildings: 10,
    color: '#f97316',
  },
  [EVENT_TYPES.EPIDEMIC]: {
    id: EVENT_TYPES.EPIDEMIC,
    category: EVENT_CATEGORIES.NEGATIVE,
    icon: '🦠',
    name: {
      zh: '疫情爆发',
      en: 'Epidemic Outbreak',
    },
    description: {
      zh: '疫情导致人口减少',
      en: 'Epidemic causes population decline',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 2 且 人口 ≥ 100 且 无医院',
      en: 'City Level ≥ 2, Population ≥ 100, and no hospitals',
    },
    effect: {
      zh: '人口容量减少 20%，持续 4 天',
      en: 'Population capacity reduced by 20% for 4 days',
    },
    probability: 0.05,
    duration: 4,
    minCityLevel: 2,
    minPopulation: 100,
    requiresNoHospital: true,
    color: '#a855f7',
  },
  [EVENT_TYPES.FESTIVAL]: {
    id: EVENT_TYPES.FESTIVAL,
    category: EVENT_CATEGORIES.POSITIVE,
    icon: '🎉',
    name: {
      zh: '城市庆典',
      en: 'City Festival',
    },
    description: {
      zh: '庆典活动提升市民满意度',
      en: 'Festival activities boost citizen satisfaction',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 1 且 稳定度 ≥ 50',
      en: 'City Level ≥ 1 and Stability ≥ 50',
    },
    effect: {
      zh: '稳定度增加 15，获得额外金币奖励',
      en: 'Stability increases by 15, receive extra coin bonus',
    },
    probability: 0.12,
    duration: 1,
    minCityLevel: 1,
    minStability: 50,
    color: '#ec4899',
  },
  [EVENT_TYPES.INVESTMENT]: {
    id: EVENT_TYPES.INVESTMENT,
    category: EVENT_CATEGORIES.POSITIVE,
    icon: '💰',
    name: {
      zh: '外来投资',
      en: 'Foreign Investment',
    },
    description: {
      zh: '投资者看好城市发展',
      en: 'Investors are optimistic about city development',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 2 且 稳定度 ≥ 60',
      en: 'City Level ≥ 2 and Stability ≥ 60',
    },
    effect: {
      zh: '获得 500-2000 金币的投资',
      en: 'Receive 500-2000 credits investment',
    },
    probability: 0.07,
    duration: 1,
    minCityLevel: 2,
    minStability: 60,
    color: '#eab308',
  },
  [EVENT_TYPES.POWER_OUTAGE]: {
    id: EVENT_TYPES.POWER_OUTAGE,
    category: EVENT_CATEGORIES.NEGATIVE,
    icon: '⚡',
    name: {
      zh: '电力故障',
      en: 'Power Outage',
    },
    description: {
      zh: '电网故障导致电力供应中断',
      en: 'Grid failure causes power supply interruption',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 2 且 电力不足',
      en: 'City Level ≥ 2 and power shortage',
    },
    effect: {
      zh: '发电量减少 40%，持续 2 天',
      en: 'Power generation reduced by 40% for 2 days',
    },
    probability: 0.06,
    duration: 2,
    minCityLevel: 2,
    requiresPowerShortage: true,
    color: '#84cc16',
  },
  [EVENT_TYPES.ENVIRONMENTAL_AWARD]: {
    id: EVENT_TYPES.ENVIRONMENTAL_AWARD,
    category: EVENT_CATEGORIES.POSITIVE,
    icon: '🏆',
    name: {
      zh: '环保奖项',
      en: 'Environmental Award',
    },
    description: {
      zh: '城市因环保努力获得表彰',
      en: 'City recognized for environmental efforts',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 2 且 污染 ≤ 30',
      en: 'City Level ≥ 2 and Pollution ≤ 30',
    },
    effect: {
      zh: '稳定度增加 20，获得 1000 金币奖励',
      en: 'Stability increases by 20, receive 1000 credits bonus',
    },
    probability: 0.05,
    duration: 1,
    minCityLevel: 2,
    maxPollution: 30,
    color: '#14b8a6',
  },
  [EVENT_TYPES.POPULATION_MIGRATION]: {
    id: EVENT_TYPES.POPULATION_MIGRATION,
    category: EVENT_CATEGORIES.NEUTRAL,
    icon: '🚶',
    name: {
      zh: '人口迁移',
      en: 'Population Migration',
    },
    description: {
      zh: '人口流动带来变化',
      en: 'Population flow brings changes',
    },
    triggerCondition: {
      zh: '城市等级 ≥ 1',
      en: 'City Level ≥ 1',
    },
    effect: {
      zh: '随机：人口增加 10% 或减少 5%',
      en: 'Random: Population increases by 10% or decreases by 5%',
    },
    probability: 0.08,
    duration: 1,
    minCityLevel: 1,
    color: '#6366f1',
  },
}

export const EVENT_CONFIG = {
  CHECK_INTERVAL_DAYS: 10,
  BASE_PROBABILITY_MULTIPLIER: 0.3,
  MAX_ACTIVE_EVENTS: 1,
  GLOBAL_TRIGGER_CHANCE: 0.25,
}
