<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <PageHeader title="Inspiration" backTo="/recipes" />

    <!-- Loading -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <div v-else class="page-content" style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Add form -->
      <form style="padding: 16px 20px; display: flex; flex-direction: column; gap: 10px" @submit.prevent="handleAdd">
        <div class="input-wrap">
          <input
            v-model="newTitle"
            type="text"
            placeholder="Site name (e.g. Minimalist Baker)"
            class="form-input"
            style="padding: 10px 14px; padding-right: 32px; font-size: 16px; border-radius: 10px"
          />
          <button v-if="newTitle" type="button" class="input-clear-btn" aria-label="Clear" @click="newTitle = ''">&times;</button>
        </div>
        <div style="display: flex; gap: 10px">
          <div class="input-wrap" style="flex: 1">
            <input
              v-model="newUrl"
              type="url"
              placeholder="Website URL"
              class="form-input"
              style="padding: 10px 14px; padding-right: 32px; font-size: 14px; border-radius: 10px"
            />
            <button v-if="newUrl" type="button" class="input-clear-btn" aria-label="Clear" @click="newUrl = ''">&times;</button>
          </div>
          <button
            type="submit"
            :disabled="!newUrl.trim()"
            :style="{
              background: newUrl.trim() ? '#2d6a4f' : '#d4ccc4',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: newUrl.trim() ? 'pointer' : 'default',
              fontFamily: '\'DM Sans\', sans-serif',
              transition: 'background .2s',
            }"
          >
            Add
          </button>
        </div>
      </form>

      <!-- Empty state -->
      <EmptyState
        v-if="links.length === 0"
        emoji="&#x1F4D6;"
        title="No sites yet"
        message="Add your favourite recipe websites for inspiration."
      />

      <!-- Site list -->
      <div v-else style="padding: 0 20px; display: flex; flex-direction: column; gap: 10px">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display: flex;
            align-items: center;
            gap: 14px;
            background: #fff;
            border-radius: 14px;
            padding: 16px 16px;
            text-decoration: none;
            color: inherit;
            box-shadow: 0 1px 3px rgba(0,0,0,.06);
          "
        >
          <img
            :src="`https://www.google.com/s2/favicons?sz=32&domain=${getHostname(link.url)}`"
            width="32"
            height="32"
            style="border-radius: 8px; flex-shrink: 0"
            alt=""
          />
          <div style="flex: 1; min-width: 0">
            <div style="font-family: 'Fraunces', serif; font-weight: 600; font-size: 16px; color: #3d3530; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
              {{ link.title || getHostname(link.url) }}
            </div>
            <div style="font-size: 12px; color: #9b9590; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 3px">
              {{ getHostname(link.url) }}
            </div>
          </div>
          <button
            v-if="link.created_by === user?.id"
            style="
              background: none;
              border: none;
              color: #c4b8b0;
              font-size: 18px;
              cursor: pointer;
              padding: 4px 6px;
              flex-shrink: 0;
            "
            aria-label="Delete site"
            @click.prevent="handleDelete(link.id)"
          >
            &times;
          </button>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { links, loading, fetchLinks, addLink, deleteLink } = useRecipeLinks()

const newUrl = ref('')
const newTitle = ref('')

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

async function handleAdd() {
  let url = newUrl.value.trim()
  if (!url) return
  if (!/^https?:\/\//.test(url)) {
    url = `https://${url}`
  }
  newUrl.value = ''
  const title = newTitle.value.trim()
  newTitle.value = ''
  await addLink(url, title || undefined)
}

async function handleDelete(id: string) {
  await deleteLink(id)
}

onMounted(() => {
  fetchLinks()
})
</script>
