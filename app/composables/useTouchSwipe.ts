export function useTouchSwipe() {
  const vTouchSwipe = {
    mounted(el: HTMLElement, binding: { value: (dir: 'left' | 'right') => void }) {
      let startX = 0
      let startY = 0
      el.addEventListener('touchstart', (e: TouchEvent) => {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }, { passive: true })
      el.addEventListener('touchend', (e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - startX
        const dy = e.changedTouches[0].clientY - startY
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          binding.value(dx < 0 ? 'left' : 'right')
        }
      }, { passive: true })
    },
  }

  return { vTouchSwipe }
}
