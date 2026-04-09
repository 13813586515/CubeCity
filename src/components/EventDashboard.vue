<script setup>
import { EVENT_CATEGORIES, EVENT_DATA } from '@/constants/events.js'
import { useGameState } from '@/stores/useGameState.js'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const _props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['close'])

const gameState = useGameState()
const { language, activeEvents, eventHistory } = storeToRefs(gameState)

const activeTab = ref('active')

const allEvents = computed(() => {
  return Object.values(EVENT_DATA)
})

const activeEventsWithDetails = computed(() => {
  return activeEvents.value.map((activeEvent) => {
    const eventData = EVENT_DATA[activeEvent.eventId]
    return {
      ...activeEvent,
      ...eventData,
    }
  })
})

function categoryLabel(category) {
  if (language.value === 'zh') {
    switch (category) {
      case EVENT_CATEGORIES.POSITIVE: return '正面'
      case EVENT_CATEGORIES.NEGATIVE: return '负面'
      case EVENT_CATEGORIES.NEUTRAL: return '中性'
      default: return category
    }
  }
  else {
    switch (category) {
      case EVENT_CATEGORIES.POSITIVE: return 'Positive'
      case EVENT_CATEGORIES.NEGATIVE: return 'Negative'
      case EVENT_CATEGORIES.NEUTRAL: return 'Neutral'
      default: return category
    }
  }
}

function categoryColor(category) {
  switch (category) {
    case EVENT_CATEGORIES.POSITIVE: return '#22c55e'
    case EVENT_CATEGORIES.NEGATIVE: return '#ef4444'
    case EVENT_CATEGORIES.NEUTRAL: return '#6366f1'
    default: return '#6b7280'
  }
}

function categoryBg(category) {
  switch (category) {
    case EVENT_CATEGORIES.POSITIVE: return 'bg-green-500/10 border-green-500/30'
    case EVENT_CATEGORIES.NEGATIVE: return 'bg-red-500/10 border-red-500/30'
    case EVENT_CATEGORIES.NEUTRAL: return 'bg-indigo-500/10 border-indigo-500/30'
    default: return 'bg-gray-500/10 border-gray-500/30'
  }
}

function onClose() {
  emits('close')
}
</script>

<template>
  <transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" @click.self="onClose">
      <div class="relative bg-[#181c24] shadow-lg px-6 py-4 min-w-[320px] max-w-[90vw] w-[700px] max-h-[85vh] border-2 border-gray-600 rounded-lg overflow-hidden flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-150 focus:outline-none z-10"
          @click="onClose"
        >
          ✕
        </button>

        <!-- 标题 -->
        <h2 class="text-center text-[1.5rem] font-bold tracking-widest uppercase mb-4 select-none text-industrial-accent" :style="{ textShadow: '0 0 8px #ff4402, 0 0 24px #ff4402' }">
          {{ language === 'zh' ? '事件看板' : 'Event Dashboard' }}
        </h2>

        <!-- 标签页 -->
        <div class="flex justify-center gap-2 mb-4">
          <button
            class="px-4 py-2 rounded text-sm font-bold transition uppercase tracking-wider"
            :class="activeTab === 'active' ? 'bg-industrial-accent text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            @click="activeTab = 'active'"
          >
            {{ language === 'zh' ? '当前事件' : 'Active Events' }}
            <span v-if="activeEventsWithDetails.length > 0" class="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
              {{ activeEventsWithDetails.length }}
            </span>
          </button>
          <button
            class="px-4 py-2 rounded text-sm font-bold transition uppercase tracking-wider"
            :class="activeTab === 'all' ? 'bg-industrial-accent text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            @click="activeTab = 'all'"
          >
            {{ language === 'zh' ? '所有事件' : 'All Events' }}
          </button>
          <button
            class="px-4 py-2 rounded text-sm font-bold transition uppercase tracking-wider"
            :class="activeTab === 'history' ? 'bg-industrial-accent text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            @click="activeTab = 'history'"
          >
            {{ language === 'zh' ? '历史记录' : 'History' }}
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto pr-2 pb-8">
          <!-- 当前事件 -->
          <div v-if="activeTab === 'active'">
            <div v-if="activeEventsWithDetails.length === 0" class="text-center py-12">
              <span class="text-5xl mb-4 block">🌤️</span>
              <p class="text-gray-400 text-lg">
                {{ language === 'zh' ? '当前没有活跃事件' : 'No active events' }}
              </p>
              <p class="text-gray-500 text-sm mt-2">
                {{ language === 'zh' ? '继续发展你的城市，事件可能会随时发生' : 'Continue developing your city, events may occur at any time' }}
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="event in activeEventsWithDetails"
                :key="event.id"
                class="p-4 rounded-lg border"
                :class="categoryBg(event.category)"
              >
                <div class="flex items-start gap-4">
                  <div class="text-4xl flex-shrink-0" :style="{ filter: `drop-shadow(0 0 8px ${categoryColor(event.category)})` }">
                    {{ event.icon }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-lg font-bold" :style="{ color: categoryColor(event.category) }">
                        {{ language === 'zh' ? event.name.zh : event.name.en }}
                      </h3>
                      <span
                        class="px-2 py-0.5 rounded text-xs font-bold"
                        :style="{ backgroundColor: `${categoryColor(event.category)}20`, color: categoryColor(event.category) }"
                      >
                        {{ categoryLabel(event.category) }}
                      </span>
                    </div>
                    <p class="text-gray-300 text-sm mb-2">
                      {{ language === 'zh' ? event.description.zh : event.description.en }}
                    </p>
                    <div class="flex flex-wrap gap-4 text-sm">
                      <div class="flex items-center gap-1">
                        <span class="text-gray-400">{{ language === 'zh' ? '剩余天数:' : 'Remaining:' }}</span>
                        <span class="font-bold text-white">{{ event.remainingDays }} {{ language === 'zh' ? '天' : 'days' }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="text-gray-400">{{ language === 'zh' ? '效果:' : 'Effect:' }}</span>
                        <span class="font-medium" :style="{ color: categoryColor(event.category) }">
                          {{ language === 'zh' ? event.effect.zh : event.effect.en }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 所有事件 -->
          <div v-if="activeTab === 'all'" class="space-y-3">
            <div
              v-for="event in allEvents"
              :key="event.id"
              class="p-4 rounded-lg border bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition"
            >
              <div class="flex items-start gap-4">
                <div class="text-3xl flex-shrink-0" :style="{ filter: `drop-shadow(0 0 6px ${categoryColor(event.category)})` }">
                  {{ event.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-base font-bold" :style="{ color: categoryColor(event.category) }">
                      {{ language === 'zh' ? event.name.zh : event.name.en }}
                    </h3>
                    <span
                      class="px-2 py-0.5 rounded text-xs font-bold"
                      :style="{ backgroundColor: `${categoryColor(event.category)}20`, color: categoryColor(event.category) }"
                    >
                      {{ categoryLabel(event.category) }}
                    </span>
                  </div>
                  <p class="text-gray-400 text-sm mb-2">
                    {{ language === 'zh' ? event.description.zh : event.description.en }}
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div class="flex items-start gap-1">
                      <span class="text-gray-500 flex-shrink-0">{{ language === 'zh' ? '触发条件:' : 'Trigger:' }}</span>
                      <span class="text-gray-300">{{ language === 'zh' ? event.triggerCondition.zh : event.triggerCondition.en }}</span>
                    </div>
                    <div class="flex items-start gap-1">
                      <span class="text-gray-500 flex-shrink-0">{{ language === 'zh' ? '效果:' : 'Effect:' }}</span>
                      <span class="text-gray-300">{{ language === 'zh' ? event.effect.zh : event.effect.en }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-gray-500">{{ language === 'zh' ? '持续时间:' : 'Duration:' }}</span>
                      <span class="text-gray-300">{{ event.duration }} {{ language === 'zh' ? '天' : 'days' }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-gray-500">{{ language === 'zh' ? '触发概率:' : 'Probability:' }}</span>
                      <span class="text-gray-300">{{ Math.round(event.probability * 100) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 历史记录 -->
          <div v-if="activeTab === 'history'">
            <div v-if="eventHistory.length === 0" class="text-center py-12">
              <span class="text-5xl mb-4 block">📜</span>
              <p class="text-gray-400 text-lg">
                {{ language === 'zh' ? '暂无历史记录' : 'No history yet' }}
              </p>
              <p class="text-gray-500 text-sm mt-2">
                {{ language === 'zh' ? '事件发生后会记录在这里' : 'Events will be recorded here after they occur' }}
              </p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="event in eventHistory"
                :key="event.id"
                class="p-3 rounded-lg border bg-gray-800/30 border-gray-700"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ EVENT_DATA[event.eventId]?.icon || '❓' }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-sm" :style="{ color: categoryColor(event.category) }">
                        {{ language === 'zh' ? (EVENT_DATA[event.eventId]?.name.zh || event.eventId) : (EVENT_DATA[event.eventId]?.name.en || event.eventId) }}
                      </span>
                      <span
                        v-if="event.isExpired"
                        class="px-2 py-0.5 rounded text-xs bg-gray-600 text-gray-300"
                      >
                        {{ language === 'zh' ? '已结束' : 'Ended' }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ language === 'zh' ? `第 ${event.startDay} 天发生` : `Occurred on day ${event.startDay}` }}
                      <span v-if="event.endDay">
                        {{ language === 'zh' ? `，持续至第 ${event.endDay} 天` : `, ended on day ${event.endDay}` }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
