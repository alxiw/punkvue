<template>
  <div class="hero-layout hero-layout--skeleton" aria-hidden="true">
    <!-- Matches content grid and padding, but non-interactive, completely hidden from screen readers -->
    <div class="hero-copy">
      <p class="eyebrow">
        <span class="sk sk--dot" />
        <span class="sk sk--eyebrow" />
      </p>

      <div class="hero-inner">
        <span class="sk sk--tagline" />
        <span class="sk sk--title" />
      </div>

      <div class="hero-bottom">
        <div class="hero-metrics">
          <div v-for="n in 3" :key="n" class="metric">
            <span class="sk sk--metric-label" />
            <span class="sk sk--metric-value" />
          </div>
        </div>

        <!-- Button placeholder: loading bar of the same box, no real control -->
        <span class="sk sk--button" />
      </div>
    </div>

    <div class="hero-image hero-image--skeleton">
      <span class="sk sk--bottle" />
    </div>
  </div>
</template>

<style scoped src="./hero-shell.css"></style>

<style scoped>
.sk--dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
}

.sk--eyebrow {
  width: 170px;
  height: 11px;
}

.sk--tagline {
  width: min(340px, 55%);
  height: 18px;
  margin-bottom: 16px;
}

.sk--title {
  width: min(520px, 88%);
  height: clamp(78px, 9vw, 116px);
}

.sk--metric-label {
  width: 40px;
  height: 9px;
}

.sk--metric-value {
  width: 40px;
  height: 30px;
}

/*
 * Button placeholder: matches the metric group height (9px label + 6px gap +
 * 30px value) so the bar does not stick out above the row. The real button is
 * 50px tall and bottom-anchored, so on content load the row grows upwards
 * without moving the metrics.
 */
.sk--button {
  width: 138px;
  height: 45px;
  flex: 0 0 auto;
}

@media (max-width: 600px) {
  .sk--eyebrow {
    width: 140px;
  }

  .sk--title {
    width: 82%;
    height: 64px;
  }
}
</style>
