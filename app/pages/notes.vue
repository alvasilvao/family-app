<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <PageHeader title="Notes">
      <template #right>
        <button
          style="
            background: #fff;
            border: none;
            border-radius: 10px;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #2d6a4f;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            box-shadow: 0 1px 4px rgba(0,0,0,.08);
          "
          @click="startNew"
        >
          + New Note
        </button>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <div v-else class="page-content-wide" style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Editor -->
      <div v-if="editing" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 10px">
        <div class="input-wrap">
          <input
            v-model="editTitle"
            type="text"
            placeholder="Title (optional)"
            class="form-input"
            style="padding: 10px 14px; padding-right: 32px; font-size: 16px; border-radius: 10px; font-family: 'Fraunces', serif; font-weight: 600"
          />
          <button v-if="editTitle" type="button" class="input-clear-btn" aria-label="Clear title" @click="editTitle = ''">&times;</button>
        </div>
        <div class="input-wrap input-wrap--textarea">
          <textarea
            ref="bodyInput"
            v-model="editBody"
            placeholder="Write your note..."
            class="form-input"
            style="padding: 10px 14px; padding-right: 32px; font-size: 16px; border-radius: 10px; min-height: 200px; resize: vertical; line-height: 1.6"
          />
          <button v-if="editBody" type="button" class="input-clear-btn" aria-label="Clear body" @click="editBody = ''">&times;</button>
        </div>
        <div style="display: flex; gap: 10px">
          <button
            style="
              flex: 1;
              background: #f5f0eb;
              border: none;
              border-radius: 10px;
              padding: 10px;
              font-size: 14px;
              font-weight: 600;
              color: #9b9590;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
            "
            @click="cancelEdit"
          >
            Cancel
          </button>
          <button
            :disabled="!editBody.trim()"
            :style="{
              flex: 1,
              background: editBody.trim() ? '#2d6a4f' : '#d4ccc4',
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              cursor: editBody.trim() ? 'pointer' : 'default',
              fontFamily: '\'DM Sans\', sans-serif',
            }"
            @click="handleSave"
          >
            Save
          </button>
        </div>
      </div>

      <!-- Show archived toggle -->
      <div v-if="!editing && archivedNotes.length > 0" style="padding: 12px 20px 0">
        <button
          style="background: none; border: none; font-size: 12px; color: #9b9590; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600"
          @click="showArchived = !showArchived"
        >
          {{ showArchived ? 'Hide archived' : `Show archived (${archivedNotes.length})` }}
        </button>
      </div>

      <!-- Empty state -->
      <EmptyState
        v-if="!editing && activeNotes.length === 0 && !showArchived"
        emoji="&#x1F4DD;"
        title="No notes yet"
        message="Create a note to share with everyone."
      />

      <!-- Notes list -->
      <div v-if="!editing" class="notes-grid" style="padding: 12px 20px; display: grid; grid-template-columns: 1fr; gap: 10px">
        <div
          v-for="note in displayedNotes"
          :key="note.id"
          :style="{
            background: note.archived_at ? '#f5f0eb' : '#fff',
            borderRadius: '13px',
            padding: '16px 18px',
            boxShadow: note.archived_at ? 'none' : '0 2px 10px rgba(0,0,0,.06)',
            opacity: note.archived_at ? 0.7 : 1,
            cursor: 'pointer',
          }"
          @click="openDetail(note)"
        >
          <div style="display: flex; align-items: flex-start; gap: 10px">
            <div style="flex: 1; min-width: 0">
              <p
                v-if="note.title"
                style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3; margin-bottom: 4px"
              >
                {{ note.title }}
              </p>
              <p
                style="font-size: 13px; color: #6b6560; line-height: 1.5; white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden"
              >{{ note.body }}</p>
            </div>
            <div style="display: flex; gap: 4px; flex-shrink: 0">
              <button
                style="background: none; border: none; font-size: 14px; cursor: pointer; padding: 4px; color: #b0a89e"
                :title="note.archived_at ? 'Unarchive' : 'Archive'"
                :aria-label="note.archived_at ? 'Unarchive note' : 'Archive note'"
                @click.stop="handleArchiveToggle(note)"
              >
                {{ note.archived_at ? '&#x21A9;' : '&#x1F4E6;' }}
              </button>
            </div>
          </div>
          <p style="font-size: 11px; color: #b0a89e; margin-top: 8px">
            {{ formatDate(note.updated_at) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Note detail modal -->
    <BaseModal v-if="viewingNote" style="display: flex; flex-direction: column" @close="viewingNote = null">
      <div style="flex: 1; overflow-y: auto; padding: 20px 24px 24px">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
          <h2
            v-if="viewingNote.title"
            style="font-family: 'Fraunces', serif; font-size: 19px; font-weight: 700; line-height: 1.3; flex: 1"
          >
            {{ viewingNote.title }}
          </h2>
          <div v-else style="flex: 1" />
          <div style="display: flex; gap: 6px; margin-left: 12px; flex-shrink: 0">
            <button
              v-if="!viewingNote.archived_at"
              aria-label="Edit note"
              style="
                background: #f5f0eb;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                font-size: 15px;
                color: #6b6560;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              @click="startEditFromModal"
            >
              &#x270E;
            </button>
            <button class="modal-close-btn" aria-label="Close" @click="viewingNote = null">
              &times;
            </button>
          </div>
        </div>
        <p style="font-size: 14px; color: #4a4540; line-height: 1.65; white-space: pre-wrap">{{ viewingNote.body }}</p>
        <p style="font-size: 11px; color: #b0a89e; margin-top: 16px">
          {{ formatDate(viewingNote.updated_at) }}
        </p>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/composables/useNotes'

const { notes, loading, fetchNotes, createNote, updateNote, archiveNote, unarchiveNote } = useNotes()

const editing = ref(false)
const editId = ref<string | null>(null)
const editTitle = ref('')
const editBody = ref('')
const bodyInput = ref<HTMLTextAreaElement | null>(null)
const showArchived = ref(false)
const viewingNote = ref<Note | null>(null)

const activeNotes = computed(() => notes.value.filter((n) => !n.archived_at))
const archivedNotes = computed(() => notes.value.filter((n) => n.archived_at))
const displayedNotes = computed(() => {
  if (showArchived.value) return notes.value
  return activeNotes.value
})

function openDetail(note: Note) {
  viewingNote.value = note
}

function startEditFromModal() {
  if (!viewingNote.value) return
  startEdit(viewingNote.value)
  viewingNote.value = null
}

function startNew() {
  editId.value = null
  editTitle.value = ''
  editBody.value = ''
  editing.value = true
  nextTick(() => bodyInput.value?.focus())
}

function startEdit(note: Note) {
  editId.value = note.id
  editTitle.value = note.title
  editBody.value = note.body
  editing.value = true
  nextTick(() => bodyInput.value?.focus())
}

function cancelEdit() {
  editing.value = false
  editId.value = null
}

async function handleSave() {
  const body = editBody.value.trim()
  if (!body) return

  if (editId.value) {
    await updateNote(editId.value, editTitle.value.trim(), body)
  } else {
    await createNote(editTitle.value.trim(), body)
  }
  editing.value = false
  editId.value = null
}

async function handleArchiveToggle(note: Note) {
  if (note.archived_at) {
    await unarchiveNote(note.id)
  } else {
    await archiveNote(note.id)
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

onMounted(() => {
  fetchNotes()
})
</script>
