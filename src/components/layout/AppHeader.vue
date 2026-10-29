<script setup lang="ts">
import PunkIcon from "@/components/layout/PunkIcon.vue"
</script>

<template>
  <header class="site-header">
    <a href="https://punkapi.dev/" class="brand" aria-label="PunkAPI — to main page">
      <PunkIcon class="brand__icon" aria-hidden="true" />
      <span>PUNKAPI</span>
    </a>

    <nav aria-label="Main navigation">
      <a href="https://punkapi.dev/docs" target="_blank" rel="noreferrer noopener">API DOCS</a>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  height: 76px;
  padding: 0 clamp(24px, 5vw, 76px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* gap between logo and nav: prevents them from colliding on narrow screens */
  gap: 24px;
  border-bottom: 1px solid var(--border);
}

.brand {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 10px;
  color: inherit;
  text-decoration: none;
  font: 600 25px/1 'DM Sans', sans-serif;
  letter-spacing: -0.03em;
  /* right padding: prevents the focus outline (outline-offset: 4px) from sticking to text */
  padding-right: 8px;
}

.brand:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 4px;
}

.brand__icon {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.brand :deep(svg) {
  color: var(--foreground);
}

/* prevent name wrapping: entire header scales down on small screens */
.brand span {
  white-space: nowrap;
}

.site-header nav {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 34px;
}

.site-header nav a {
  position: relative;
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
  font: 500 18px/1 'DM Mono', monospace;
  letter-spacing: 0.08em;
}

.site-header nav a::after {
  position: absolute;
  right: 0;
  bottom: -7px;
  left: 0;
  height: 1px;
  background: var(--foreground);
  content: '';
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 180ms ease;
}

.site-header nav a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

@media (max-width: 600px) {
  .site-header {
    height: 64px;
  }

  .site-header nav {
    gap: 18px;
    /* padding right prevents the nav from touching viewport boundary */
    padding-right: 4px;
  }
}

/* narrow screens (320–420px): header scales down so the logo doesn't overlap the nav */
@media (max-width: 420px) {
  .site-header {
    gap: 12px;
  }

  .brand {
    gap: 8px;
    font-size: 20px;
  }

  .brand__icon {
    width: 52px;
    height: 52px;
  }

  .site-header nav a {
    font-size: 15px;
    letter-spacing: 0.06em;
  }
}
</style>
