<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <a href="https://github.com/alxiw/punkapi" target="_blank" rel="noreferrer">PunkAPI</a>
    <p>Web interface for exploring the digital beer archive</p>
    <a href="https://github.com/alxiw" target="_blank" rel="noreferrer">alxiw © {{ currentYear }}</a>
  </footer>
</template>

<style scoped>
.site-footer {
  min-height: 150px;
  /* page horizontal padding: footer sits outside <main> and does not inherit its padding */
  padding: 0 clamp(24px, 5vw, 76px);
  margin-top: 110px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  border-top: 1px solid var(--border);
  color: var(--muted-foreground);
  font: 400 10px/1.4 'DM Mono', monospace;
  text-transform: uppercase;
}

.site-footer a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: color 180ms ease, border-color 180ms ease;
}

.site-footer a:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.site-footer a:hover {
  color: var(--foreground);
  border-color: currentColor;
}

@media (max-width: 600px) {
  .site-footer {
    padding: 40px clamp(24px, 5vw, 76px);
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
