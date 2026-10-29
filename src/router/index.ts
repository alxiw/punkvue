import { defineComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

/**
 * Stub for route-state records.
 *
 * `/` and `/:id` don't swap the screen: `App.vue` renders both the catalog and
 * the recipe sheet, while the route only describes what's open. The component exists
 * purely because vue-router requires a `component` on every record.
 */
const RouteStateView = defineComponent({
  name: 'RouteStateView',
  render: () => null,
})

/**
 * App routes.
 *
 * Screens don't replace each other: `App.vue` always renders the catalog, and
 * `/:id` merely opens the recipe sheet on top of it. That way filters, loaded
 * pages and scroll position survive opening and closing the recipe view.
 *
 * The id range (1–415) isn't baked in here: `App.vue` validates it against
 * `TOTAL_BEERS`, so API data isn't duplicated in the route regex.
 */
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: RouteStateView },
    /** Beer recipe: `/366` */
    { path: '/:id(\\d+)', name: 'beer', component: RouteStateView },
    /** Everything else: `/abc`, `/366/extra` */
    { path: '/:pathMatch(.*)*', name: 'not-found', component: RouteStateView },
  ],
})
