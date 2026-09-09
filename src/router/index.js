import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('@/features/dashboard/Dashboard.vue') },
    { path: '/survey/inquiry', name: 'inquiry', component: () => import('@/features/survey/Inquiry.vue') },
    { path: '/survey/form', name: 'form', component: () => import('@/features/survey/SurveyForm.vue') }
  ]
})

export default router