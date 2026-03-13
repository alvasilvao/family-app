<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Detail modal -->
    <MediaDetailModal
      v-if="detailItem"
      :item="detailItem"
      @close="detailId = null"
      @update="handleUpdate"
      @delete="handleDelete"
    />

    <!-- Header -->
    <PageHeader title="Watchlist">
      <template #right>
        <button
          style="
            background: rgba(255,255,255,.15);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          "
          aria-label="Search TMDB"
          @click="showSearch = true"
        >
          +
        </button>
      </template>
    </PageHeader>

    <!-- Search overlay -->
    <div v-if="showSearch" style="position: fixed; inset: 0; z-index: 100; background: #f7f3ee; display: flex; flex-direction: column">
      <div style="background: #2d6a4f; padding: calc(14px + env(safe-area-inset-top, 0px)) 20px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0">
        <button
          style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; display: flex; align-items: center"
          @click="closeSearch"
        >
          &larr;
        </button>
        <h1 style="font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: #fff; flex: 1; text-align: center">
          Search
        </h1>
        <div style="width: 20px" />
      </div>

      <div style="padding: 16px 20px 0">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search movies & TV shows..."
          class="form-input"
          style="width: 100%; padding: 12px 14px; font-size: 15px; border-radius: 10px"
          @input="debouncedSearch"
        />
      </div>

      <div style="flex: 1; overflow: auto; padding: 12px 20px">
        <div v-if="searching" style="text-align: center; padding: 40px 0">
          <LoadingDots />
        </div>
        <div v-else-if="searchResults.length === 0 && searchQuery.trim()" style="text-align: center; padding: 40px 0">
          <p style="font-size: 13px; color: #9b9590">No results found</p>
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 10px">
          <div
            v-for="result in searchResults"
            :key="`${result.mediaType}-${result.tmdbId}`"
            style="
              background: #fff;
              border-radius: 12px;
              padding: 12px;
              box-shadow: 0 1px 6px rgba(0,0,0,.06);
              display: flex;
              gap: 12px;
              cursor: pointer;
            "
            @click="selectResult(result)"
          >
            <img
              v-if="result.posterPath"
              :src="`https://image.tmdb.org/t/p/w92${result.posterPath}`"
              :alt="result.title"
              style="width: 52px; height: 78px; border-radius: 6px; object-fit: cover; flex-shrink: 0"
            />
            <div v-else style="width: 52px; height: 78px; border-radius: 6px; background: #f0ebe4; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 22px">
              {{ result.mediaType === 'movie' ? '&#127916;' : '&#128250;' }}
            </div>
            <div style="flex: 1; min-width: 0">
              <p style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                {{ result.title }}
              </p>
              <p style="font-size: 11px; color: #9b9590; margin-top: 2px">
                {{ result.mediaType === 'movie' ? 'Movie' : 'TV Show' }}
                <span v-if="result.releaseDate"> &middot; {{ result.releaseDate.slice(0, 4) }}</span>
              </p>
              <p style="font-size: 12px; color: #6b6560; margin-top: 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">
                {{ result.overview }}
              </p>
              <!-- Already added indicator -->
              <p v-if="isAlreadyAdded(result)" style="font-size: 11px; color: #2d6a4f; margin-top: 4px; font-weight: 600">
                Already in watchlist
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add modal -->
    <div v-if="selectedResult" style="position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; justify-content: center" @click.self="selectedResult = null">
      <div style="background: #fff; border-radius: 20px 20px 0 0; padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0px)); width: 100%; max-width: 500px">
        <div style="display: flex; gap: 14px; margin-bottom: 20px">
          <img
            v-if="selectedResult.posterPath"
            :src="`https://image.tmdb.org/t/p/w154${selectedResult.posterPath}`"
            :alt="selectedResult.title"
            style="width: 80px; height: 120px; border-radius: 8px; object-fit: cover; flex-shrink: 0"
          />
          <div>
            <p style="font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; line-height: 1.3">
              {{ selectedResult.title }}
            </p>
            <p style="font-size: 12px; color: #9b9590; margin-top: 2px">
              {{ selectedResult.mediaType === 'movie' ? 'Movie' : 'TV Show' }}
              <span v-if="selectedResult.releaseDate"> &middot; {{ selectedResult.releaseDate.slice(0, 4) }}</span>
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 10px">
          <button
            style="
              flex: 1;
              padding: 14px;
              border-radius: 12px;
              border: 1.5px solid #2d6a4f;
              background: #fff;
              color: #2d6a4f;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
            "
            @click="addToWatchlist('want_to_watch')"
          >
            Want to Watch
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
            @click="addToWatchlist('watched')"
          >
            Watched
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="mediaLoading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <!-- Content -->
    <div v-else style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Filter pills -->
      <div class="page-content-wide" style="padding: 16px 20px 0">
        <div style="display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            :style="{
              padding: '5px 12px',
              borderRadius: '999px',
              border: filterMode === opt.value ? '1.5px solid #2d6a4f' : '1.5px solid #e8e2db',
              background: filterMode === opt.value ? '#e8f5ee' : '#fff',
              color: filterMode === opt.value ? '#2d6a4f' : '#6b6560',
              fontSize: '12px',
              fontWeight: filterMode === opt.value ? 600 : 400,
              cursor: 'pointer',
              fontFamily: '\'DM Sans\', sans-serif',
              transition: 'all .2s',
            }"
            @click="filterMode = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <EmptyState
        v-if="filteredMedia.length === 0"
        emoji="&#127916;"
        title="No titles yet"
        message="Tap + to search and add movies or TV shows"
      />

      <!-- Media list -->
      <div v-else class="page-content-wide" style="padding: 0 20px 22px">
        <div style="display: flex; flex-direction: column; gap: 10px">
          <div
            v-for="item in filteredMedia"
            :key="item.id"
            style="
              background: #fff;
              border-radius: 14px;
              padding: 14px;
              box-shadow: 0 2px 10px rgba(0,0,0,.06);
              display: flex;
              gap: 14px;
              cursor: pointer;
            "
            @click="detailId = item.id"
          >
            <img
              v-if="item.posterPath"
              :src="`https://image.tmdb.org/t/p/w92${item.posterPath}`"
              :alt="item.title"
              style="width: 56px; height: 84px; border-radius: 8px; object-fit: cover; flex-shrink: 0"
            />
            <div v-else style="width: 56px; height: 84px; border-radius: 8px; background: #f0ebe4; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px">
              {{ item.mediaType === 'movie' ? '&#127916;' : '&#128250;' }}
            </div>
            <div style="flex: 1; min-width: 0">
              <p style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                {{ item.title }}
              </p>
              <p style="font-size: 11px; color: #9b9590; margin-top: 2px">
                {{ item.mediaType === 'movie' ? 'Movie' : 'TV Show' }}
                <span v-if="item.releaseDate"> &middot; {{ item.releaseDate.slice(0, 4) }}</span>
              </p>
              <!-- Stars -->
              <div v-if="item.rating" style="margin-top: 4px; display: flex; gap: 2px">
                <span v-for="s in 5" :key="s" style="font-size: 13px">{{ s <= item.rating ? '&#9733;' : '&#9734;' }}</span>
              </div>
              <!-- Status badge -->
              <span
                :style="{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: item.status === 'watched' ? '#e8f5ee' : '#fef3c7',
                  color: item.status === 'watched' ? '#2d6a4f' : '#92400e',
                }"
              >
                {{ item.status === 'watched' ? 'Watched' : 'Want to watch' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TmdbSearchResult, MediaItem } from '~/composables/useMedia'



const { mediaList, loading: mediaLoading, fetchMedia, searchTmdb, addMedia, updateMedia, deleteMedia } = useMedia()
const toast = useToast()

// Filter
type FilterMode = 'all' | 'watched' | 'want_to_watch'
const filterMode = ref<FilterMode>('all')

const filterOptions: Array<{ label: string; value: FilterMode }> = [
  { label: 'All', value: 'all' },
  { label: 'Watched', value: 'watched' },
  { label: 'Want to watch', value: 'want_to_watch' },
]

const filteredMedia = computed(() => {
  if (filterMode.value === 'all') return mediaList.value
  return mediaList.value.filter((m) => m.status === filterMode.value)
})

// Detail
const detailId = ref<string | null>(null)
const detailItem = computed(() =>
  detailId.value ? mediaList.value.find((m) => m.id === detailId.value) ?? null : null,
)

async function handleUpdate(updates: { id: string; status?: string; rating?: number | null; notes?: string }) {
  try {
    const { id, ...fields } = updates
    await updateMedia(id, fields)
  } catch (err: unknown) {
    console.error('Failed to update media:', err)
    toast.error('Failed to update')
  }
}

async function handleDelete(id: string) {
  try {
    await deleteMedia(id)
    detailId.value = null
    toast.success('Removed from watchlist')
  } catch (err: unknown) {
    console.error('Failed to delete media:', err)
    toast.error('Failed to remove')
  }
}

// Search
const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref<TmdbSearchResult[]>([])
const searching = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const selectedResult = ref<TmdbSearchResult | null>(null)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    const q = searchQuery.value.trim()
    if (!q) {
      searchResults.value = []
      return
    }
    searching.value = true
    try {
      searchResults.value = await searchTmdb(q)
    } catch (err: unknown) {
      console.error('Search failed:', err)
      toast.error('Search failed')
    } finally {
      searching.value = false
    }
  }, 400)
}

function closeSearch() {
  showSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
}

function isAlreadyAdded(result: TmdbSearchResult) {
  return mediaList.value.some((m) => m.tmdbId === result.tmdbId && m.mediaType === result.mediaType)
}

function selectResult(result: TmdbSearchResult) {
  if (isAlreadyAdded(result)) {
    toast.error('Already in your watchlist')
    return
  }
  selectedResult.value = result
}

async function addToWatchlist(status: 'watched' | 'want_to_watch') {
  if (!selectedResult.value) return
  try {
    await addMedia(selectedResult.value, status)
    toast.success(`Added "${selectedResult.value.title}"`)
    selectedResult.value = null
  } catch (err: unknown) {
    console.error('Failed to add media:', err)
    toast.error('Failed to add to watchlist')
  }
}

watch(showSearch, (val) => {
  if (val) {
    nextTick(() => searchInputRef.value?.focus())
  }
})

onMounted(() => {
  fetchMedia()
})

onBeforeUnmount(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>
