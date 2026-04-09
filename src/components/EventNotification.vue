<script setup>
import { EVENT_CATEGORIES } from '@/constants/events.js'
import { useGameState } from '@/stores/useGameState.js'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  eventData: {
    type: Object,
    required: true,
  },
  effects: {
    type: Object,
    default: () => ({}),
  },
})

const emits = defineEmits(['close'])

const gameState = useGameState()
const { language } = storeToRefs(gameState)

const isVisible = ref(true)
const autoCloseTimer = ref(null)
const countdown = ref(5)

const categoryClass = computed(() => {
  switch (props.eventData.category) {
    case EVENT_CATEGORIES.POSITIVE:
      return {
        color: '#22c55e',
        tw: 'from-green-400 to-green-600',
        border: 'border-green-400',
        shadow: 'shadow-green-400',
      }
    case EVENT_CATEGORIES.NEGATIVE:
      return {
        color: '#ef4444',
        tw: 'from-red-400 to-red-600',
        border: 'border-red-400',
        shadow: 'shadow-red-400',
      }
    default:
      return {
        color: '#6366f1',
        tw: 'from-indigo-400 to-indigo-600',
        border: 'border-indigo-400',
        shadow: 'shadow-indigo-400',
      }
  }
})

const effectDescription = computed(() => {
  const effects = props.effects
  const lang = language.value

  const descriptions = []

  if (effects.incomeMultiplier !== undefined) {
    const percent = Math.round((effects.incomeMultiplier - 1) * 100)
    if (lang === 'zh') {
      descriptions.push(percent > 0 ? `收入 +${percent}%` : `收入 ${percent}%`)
    }
    else {
      descriptions.push(percent > 0 ? `Income +${percent}%` : `Income ${percent}%`)
    }
  }

  if (effects.powerMultiplier !== undefined) {
    const percent = Math.round((effects.powerMultiplier - 1) * 100)
    if (lang === 'zh') {
      descriptions.push(percent > 0 ? `发电量 +${percent}%` : `发电量 ${percent}%`)
    }
    else {
      descriptions.push(percent > 0 ? `Power +${percent}%` : `Power ${percent}%`)
    }
  }

  if (effects.populationMultiplier !== undefined) {
    const percent = Math.round((effects.populationMultiplier - 1) * 100)
    if (lang === 'zh') {
      descriptions.push(percent > 0 ? `人口 +${percent}%` : `人口 ${percent}%`)
    }
    else {
      descriptions.push(percent > 0 ? `Population +${percent}%` : `Population ${percent}%`)
    }
  }

  if (effects.creditLoss !== undefined) {
    if (lang === 'zh') {
      descriptions.push(`损失 ${effects.creditLoss} 金币`)
    }
    else {
      descriptions.push(`Lost ${effects.creditLoss} credits`)
    }
  }

  if (effects.stabilityLoss !== undefined) {
    if (lang === 'zh') {
      descriptions.push(`稳定度 -${effects.stabilityLoss}`)
    }
    else {
      descriptions.push(`Stability -${effects.stabilityLoss}`)
    }
  }

  if (effects.stabilityGain !== undefined) {
    if (lang === 'zh') {
      descriptions.push(`稳定度 +${effects.stabilityGain}`)
    }
    else {
      descriptions.push(`Stability +${effects.stabilityGain}`)
    }
  }

  if (effects.coinBonus !== undefined) {
    if (lang === 'zh') {
      descriptions.push(`获得 ${effects.coinBonus} 金币`)
    }
    else {
      descriptions.push(`Received ${effects.coinBonus} credits`)
    }
  }

  if (effects.investment !== undefined) {
    if (lang === 'zh') {
      descriptions.push(`获得 ${effects.investment} 金币投资`)
    }
    else {
      descriptions.push(`Received ${effects.investment} credits investment`)
    }
  }

  return descriptions
})

function startAutoClose() {
  if (autoCloseTimer.value) {
    clearInterval(autoCloseTimer.value)
  }

  countdown.value = 5

  autoCloseTimer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      onClose()
    }
  }, 1000)
}

function stopAutoClose() {
  if (autoCloseTimer.value) {
    clearInterval(autoCloseTimer.value)
    autoCloseTimer.value = null
  }
}

function onClose() {
  stopAutoClose()
  isVisible.value = false
  setTimeout(() => {
    emits('close')
  }, 300)
}

watch(isVisible, (newVal) => {
  if (newVal) {
    startAutoClose()
  }
  else {
    stopAutoClose()
  }
}, { immediate: true })

onUnmounted(() => {
  stopAutoClose()
})
</script>

<template>
  <transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" @click.self="onClose">
      <div
        class="relative bg-[#181c24] shadow-lg px-6 py-8 min-w-[320px] max-w-[90vw] w-[500px] border rounded-lg"
        :class="categoryClass.border"
        @mouseenter="stopAutoClose"
        @mouseleave="startAutoClose"
      >
        <!-- 自动关闭倒计时 -->
        <div class="absolute top-2 left-4 flex items-center gap-2 text-xs text-gray-400">
          <span>{{ language === 'zh' ? '自动关闭' : 'Auto close' }}</span>
          <span
            class="font-bold px-2 py-0.5 rounded"
            :style="{ backgroundColor: `${categoryClass.color}20`, color: categoryClass.color }"
          >
            {{ countdown }}s
          </span>
        </div>

        <!-- 关闭按钮 -->
        <button
          class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-150 focus:outline-none z-10"
          @click="onClose"
        >
          ✕
        </button>

        <!-- 事件类型标签 -->
        <div class="text-center mb-2 mt-4">
          <span
            class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            :style="{
              backgroundColor: `${categoryClass.color}20`,
              color: categoryClass.color,
              border: `1px solid ${categoryClass.color}`,
            }"
          >
            {{ language === 'zh' ? (eventData.category === 'positive' ? '正面事件' : eventData.category === 'negative' ? '负面事件' : '中性事件') : (eventData.category === 'positive' ? 'Positive' : eventData.category === 'negative' ? 'Negative' : 'Neutral') }}
          </span>
        </div>

        <!-- 标题 -->
        <h2 class="text-center text-[2rem] font-bold tracking-widest uppercase mb-1 select-none" :style="{ color: categoryClass.color, textShadow: `0 0 8px ${categoryClass.color}, 0 0 24px ${categoryClass.color}, 0 0 40px ${categoryClass.color}` }">
          {{ language === 'zh' ? eventData.name.zh : eventData.name.en }}
        </h2>

        <!-- 分割线 -->
        <div class="h-[2px] w-full mb-4" :style="{ background: categoryClass.color }" />

        <!-- 动态图标 -->
        <div class="flex justify-center mb-4">
          <span class="text-[4rem] select-none icon-animate" :style="{ filter: `drop-shadow(0 0 12px ${categoryClass.color})` }">{{ eventData.icon }}</span>
        </div>

        <!-- 描述 -->
        <p class="text-center text-gray-300 text-lg mb-4">
          {{ language === 'zh' ? eventData.description.zh : eventData.description.en }}
        </p>

        <!-- 效果详情 -->
        <div v-if="effectDescription.length > 0" class="mb-4">
          <h3 class="text-sm text-gray-400 uppercase tracking-wider mb-2 text-center">
            {{ language === 'zh' ? '效果详情' : 'Effect Details' }}
          </h3>
          <div class="flex flex-wrap justify-center gap-2">
            <span
              v-for="(effect, index) in effectDescription"
              :key="index"
              class="px-3 py-1 rounded text-sm font-medium"
              :style="{
                backgroundColor: `${categoryClass.color}15`,
                color: categoryClass.color,
                border: `1px solid ${categoryClass.color}40`,
              }"
            >
              {{ effect }}
            </span>
          </div>
        </div>

        <!-- 持续时间 -->
        <div v-if="eventData.duration > 1" class="text-center text-gray-400 text-sm mb-4">
          {{ language === 'zh' ? `持续 ${eventData.duration} 天` : `Duration: ${eventData.duration} days` }}
        </div>

        <!-- 确认按钮 -->
        <div class="flex justify-center">
          <button
            class="px-8 py-2 text-lg font-bold rounded border-2 hover:text-white transition uppercase tracking-wider shadow-md"
            :style="{ background: categoryClass.color, color: '#fff', borderColor: categoryClass.color }"
            @click="onClose"
          >
            {{ language === 'zh' ? '知道了' : 'Got it' }}
          </button>
        </div>

        <!-- 提示文字 -->
        <p class="text-center text-gray-500 text-xs mt-3">
          {{ language === 'zh' ? '鼠标悬停暂停倒计时，点击任意位置或按钮关闭' : 'Hover to pause, click anywhere or button to close' }}
        </p>

        <!-- 发光边框 -->
        <div
          class="pointer-events-none absolute inset-0 rounded-lg border-2 animate-glow"
          :style="{ 'borderColor': categoryClass.color, '--theme-color': categoryClass.color }"
        />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.icon-animate {
  animation: icon-bounce 1.2s infinite alternate cubic-bezier(0.4,0,0.2,1);
  display: inline-block;
}
@keyframes icon-bounce {
  from { transform: scale(1) rotate(-5deg); }
  50%  { transform: scale(1.1) rotate(5deg); }
  to   { transform: scale(1) rotate(-5deg); }
}
.animate-glow {
  animation: glow 1.5s infinite alternate;
  box-shadow: 0 0 12px var(--theme-color), 0 0 32px var(--theme-color);
}
@keyframes glow {
  from { box-shadow: 0 0 8px var(--theme-color), 0 0 16px var(--theme-color); }
  to   { box-shadow: 0 0 24px var(--theme-color), 0 0 48px var(--theme-color); }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
