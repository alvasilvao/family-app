import type { RouterConfig } from '@nuxt/schema'
import { createWebHashHistory } from 'vue-router'

export default <RouterConfig>{
  history: (base) => createWebHashHistory(base),
}
