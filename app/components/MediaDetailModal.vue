<template>
  <div style="position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; justify-content: center" @click.self="$emit('close')">
    <div style="background: #fff; border-radius: 20px 20px 0 0; padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0px)); width: 100%; max-width: 500px; max-height: 85dvh; overflow: auto">
      <!-- Poster + title -->
      <div style="display: flex; gap: 16px; margin-bottom: 20px">
        <img
          v-if="item.posterPath"
          :src="`https://image.tmdb.org/t/p/w154${item.posterPath}`"
          :alt="item.title"
          style="width: 100px; height: 150px; border-radius: 10px; object-fit: cover; flex-shrink: 0"
        />
        <div style="flex: 1">
          <p style="font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; line-height: 1.3">
            {{ item.title }}
          </p>
          <p style="font-size: 12px; color: #9b9590; margin-top: 4px">
            {{ item.mediaType === 'movie' ? 'Movie' : 'TV Show' }}
            <span v-if="item.releaseDate"> &middot; {{ item.releaseDate.slice(0, 4) }}</span>
          </p>
          <p v-if="item.overview" style="font-size: 13px; color: #6b6560; margin-top: 8px; line-height: 1.5">
            {{ item.overview }}
          </p>
        </div>
      </div>

      <!-- Status toggle -->
      <div style="margin-bottom: 16px">
        <p style="font-size: 11px; font-weight: 600; color: #9b9590; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px">
          Status
        </p>
        <div style="display: flex; gap: 8px">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            :style="{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: localStatus === opt.value ? '1.5px solid #2d6a4f' : '1.5px solid #e8e2db',
              background: localStatus === opt.value ? '#e8f5ee' : '#fff',
              color: localStatus === opt.value ? '#2d6a4f' : '#6b6560',
              fontSize: '13px',
              fontWeight: localStatus === opt.value ? 600 : 400,
              cursor: 'pointer',
              fontFamily: '\'DM Sans\', sans-serif',
            }"
            @click="setStatus(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Rating -->
      <div style="margin-bottom: 16px">
        <p style="font-size: 11px; font-weight: 600; color: #9b9590; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px">
          Your Rating
        </p>
        <div style="display: flex; gap: 6px">
          <button
            v-for="s in 5"
            :key="s"
            style="background: none; border: none; cursor: pointer; font-size: 28px; padding: 2px; line-height: 1"
            @click="setRating(s)"
          >
            {{ s <= (localRating || 0) ? '&#9733;' : '&#9734;' }}
          </button>
          <button
            v-if="localRating"
            style="background: none; border: none; cursor: pointer; font-size: 12px; color: #9b9590; margin-left: 8px"
            @click="setRating(null)"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Notes -->
      <div style="margin-bottom: 20px">
        <p style="font-size: 11px; font-weight: 600; color: #9b9590; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px">
          Notes
        </p>
        <textarea
          v-model="localNotes"
          placeholder="Add your thoughts..."
          class="form-input"
          style="width: 100%; min-height: 80px; padding: 10px 12px; font-size: 14px; border-radius: 10px; resize: vertical"
          @blur="saveNotes"
        />
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 10px">
        <button
          style="
            flex: 1;
            padding: 14px;
            border-radius: 12px;
            border: 1.5px solid #dc2626;
            background: #fff;
            color: #dc2626;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
          "
          @click="confirmDelete"
        >
          {{ deleteConfirming ? 'Tap again to confirm' : 'Remove' }}
        </button>
        <button
          style="
            flex: 1;
            padding: 14px;
            border-radius: 12px;
            border: none;
            background: #2d6a4f;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
          "
          @click="$emit('close')"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from '~/composables/useMedia'

const props = defineProps<{
  item: MediaItem
}>()

const emit = defineEmits<{
  close: []
  update: [updates: { id: string; status?: string; rating?: number | null; notes?: string }]
  delete: [id: string]
}>()

const localStatus = ref(props.item.status)
const localRating = ref(props.item.rating)
const localNotes = ref(props.item.notes)

const statusOptions = [
  { label: 'Want to Watch', value: 'want_to_watch' as const },
  { label: 'Watched', value: 'watched' as const },
]

function setStatus(status: 'watched' | 'want_to_watch') {
  localStatus.value = status
  emit('update', { id: props.item.id, status })
}

function setRating(rating: number | null) {
  localRating.value = rating
  emit('update', { id: props.item.id, rating })
}

const deleteConfirming = ref(false)
let deleteTimer: ReturnType<typeof setTimeout> | null = null

function confirmDelete() {
  if (deleteConfirming.value) {
    emit('delete', props.item.id)
    return
  }
  deleteConfirming.value = true
  deleteTimer = setTimeout(() => { deleteConfirming.value = false }, 3000)
}

onUnmounted(() => {
  if (deleteTimer) clearTimeout(deleteTimer)
})

function saveNotes() {
  if (localNotes.value !== props.item.notes) {
    emit('update', { id: props.item.id, notes: localNotes.value })
  }
}
</script>
