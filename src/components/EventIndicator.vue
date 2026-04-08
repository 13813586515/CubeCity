<script setup>
import { EVENT_CATEGORIES, EVENT_DATA } from '@/constants/events.js'
import { useGameState } from '@/stores/useGameState.js'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const emits = defineEmits(['openDashboard'])

const gameState = useGameState()
const { language, activeEvents } = storeToRefs(gameState)

const showTooltip = ref(false)

const activeEventsWithDetails = computed(() => {
  return activeEvents.value.map((activeEvent) => {
    const eventData = EVENT_DATA[activeEvent.eventId]
    return {
      ...activeEvent,
      ...eventData,
    }
  })
})

const hasActiveEvents = computed(() => activeEventsWithDetails.value.length > 0)

function categoryColor(category) {
  switch (category) {
    case EVENT_CATEGORIES.POSITIVE: return '#22c55e'
    case EVENT_CATEGORIES.NEGATIVE: return '#ef4444'
    case EVENT_CATEGORIES.NEUTRAL: return '#6366f1'
    default: return '#6b7280'
  }
}

function openDashboard() {
  emits('openDashboard')
}
</script>

<template>
  <div class="relative">
    <!-- 事件按钮 -->
    <button
      class="relative px-3 py-2 rounded bg-gray-700 text-white text-sm font-bold shadow hover:bg-gray-600 transition flex items-center gap-2"
      :class="{ 'ring-2 ring-industrial-accent': hasActiveEvents }"
      @click="openDashboard"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <span class="text-lg">📋</span>
      <span class="hidden sm:inline">
        {{ language === 'zh' ? '事件' : 'Events' }}
      </span>
      <!-- 活跃事件数量徽章 -->
      <span
        v-if="hasActiveEvents"
        class="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
        :style="{ backgroundColor: activeEventsWithDetails.some(e => e.category === EVENT_CATEGORIES.NEGATIVE) ? '#ef4444' : '#22c55e' }"
      >
        {{ activeEventsWithDetails.length }}
      </span>
    </button>

    <!-- 工具提示 -->
    <transition name="fade">
      <div
        v-if="showTooltip && hasActiveEvents"
        class="absolute bottom-full right-0 mb-2 w-64 bg-[#181c24] border border-gray-600 rounded-lg shadow-lg p-3 z-50"
      >
        <h4 class="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
          {{ language === 'zh' ? '当前活跃事件' : 'Active Events' }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="event in activeEventsWithDetails"
            :key="event.id"
            class="flex items-center gap-2 text-sm"
          >
            <span class="text-lg">{{ event.icon }}</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate" :style="{ color: categoryColor(event.category) }">
                {{ language === 'zh' ? event.name.zh : event.name.en }}
              </div>
              <div class="text-xs text-gray-500">
                {{ language === 'zh' ? `剩余 ${event.remainingDays} 天` : `${event.remainingDays} days left` }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500 text-center">
          {{ language === 'zh' ? '点击查看详情' : 'Click for details' }}
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
