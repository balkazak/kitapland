import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SubscriptionView from '@/views/SubscriptionView.vue'
import MDataViewVue from '@/views/MDataView.vue'
import FundViewVue from '@/views/FundView.vue'
import SubmissionViewVue from '@/views/SubmissionView.vue'
import ContractorViewVue from '@/views/ContractorView.vue'
import AppliesViewVue from '@/views/AppliesView.vue'
import UsersView from '@/views/UsersView.vue'
import LoginView from '@/views/LoginView.vue'
import InventoryViewVue from '@/views/InventoryView.vue'
import PurchaseViewVue from '@/views/PurchaseView.vue'
import MDataAddViewVue from '@/views/MDataAddView.vue'
import UserPageVue from '@/views/UserPage.vue'
import ContractorAddView from '@/views/ContractorAddView.vue'
import InventoryWriteOffView from '@/views/InventoryWriteOffView.vue'
import ContestPage from '@/views/ContestPage.vue'
import EntityView from '@/views/EntityView.vue'
import OrganizationsListView from '@/views/OrganizationsListView.vue'
import OrganizationApplies from '@/views/OrganizationApplies.vue'
import OrganizationRequests from '@/views/OrganizationRequests.vue'
import OrganizationPage from '@/views/OrganizationPage.vue'
import MDataEditView from '@/views/MDataEditView.vue'
import InventoryDeclineView from '@/views/InventoryDeclineView.vue'
import ApplyView from '@/views/ApplyView.vue'
import RegionsView from '@/views/RegionsView.vue'
import BookPage from '@/views/BookPage.vue'
import BkView from '@/views/BkView.vue'
import UpdateView from '@/views/UpdateView.vue'
import QuotesView from '@/views/QuotesView.vue'
import OnlineLibrary from '@/views/OnlineLibrary.vue'
import ReportsView from '@/views/ReportsView.vue'
import FundAddViewVue from '@/views/FundAddView.vue'
import MDataAdminAddView from '@/views/MDataAdminAddView.vue'
import GuideCategoryView from '@/views/GuideCategoryView.vue'
import GuideEntryView from '@/views/GuideEntryView.vue'
import EBooksView from '@/views/EBooksView.vue'
import TemporaryView from '@/views/TemporaryView.vue'
import EventsView from '@/views/EventsView.vue'
import BookDetailView from '@/views/BookDetailView.vue'
import KitaplandHome from '@/views/KitaplandHome.vue'
import KitaplandNews from '@/views/KitaplandNews.vue'
import NewsDetailPage from '@/views/NewsDetailPage.vue'
import KitaplandRegister from '@/views/KitaplandRegister.vue'
import KitaplandBookDetailPage from '@/views/KitaplandBookDetailPage.vue'
import KitaplandResultPage from '@/views/KitaplandResultPage.vue'

const safeParseJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    console.error('Error parsing JSON:', e)
    return null
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'kitapland-home',
      component: KitaplandHome
    },
    {
      path: '/news',
      name: 'kitapland-news',
      component: KitaplandNews
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: NewsDetailPage
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: SubscriptionView
    },
    {
      path: '/m-data',
      name: 'm-data',
      component: MDataViewVue
    },
    {
      path: '/m-data/add',
      name: 'm-data-add',
      component: MDataAddViewVue
    },
    {
      path: '/m-data/edit/:id',
      name: 'm-data-edit',
      component: MDataEditView
    },
    {
      path: '/m-data/admin-add',
      name: 'm-data-admin-add',
      component: MDataAdminAddView
    },
    {
      path: '/fund',
      name: 'fund',
      component: FundViewVue
    },
    {
      path: '/submission',
      name: 'submission',
      component: SubmissionViewVue
    },
    {
      path: '/contractor',
      name: 'contractor',
      component: ContractorViewVue
    },
    {
      path: '/applies',
      name: 'applies',
      component: AppliesViewVue
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/apply',
      name: 'applyView',
      component: ApplyView
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: InventoryViewVue
    },
    {
      path: '/inventory/write-off',
      name: 'inventoryWriteOff',
      component: InventoryWriteOffView
    },
    {
      path: '/inventory/decline',
      name: 'inventoryDecline',
      component: InventoryDeclineView
    },
    {
      path: '/purchase',
      name: 'purchase',
      component: PurchaseViewVue
    },
    {
      path: '/users/:id',
      name: 'userPage',
      component: UserPageVue
    },
    {
      path: '/contractor/add',
      name: 'contractorAddPage',
      component: ContractorAddView
    },
    {
      path: '/contest',
      name: 'contest',
      component: ContestPage
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView
    },
    {
      path: '/publisher',
      name: 'publisher',
      component: EntityView
    },
    {
      path: '/language',
      name: 'language',
      component: EntityView
    },
    {
      path: '/bookState',
      name: 'bookState',
      component: EntityView
    },
    {
      path: '/bbk',
      name: 'bbk',
      component: BkView
    },
    {
      path: '/udk',
      name: 'udk',
      component: BkView
    },
    {
      path: '/author',
      name: 'author',
      component: EntityView
    },
    {
      path: '/categories',
      name: 'categories',
      component: EntityView
    },
    {
      path: '/bookAdmission',
      name: 'bookAdmission',
      component: EntityView
    },
    {
      path: '/genre',
      name: 'genre',
      component: EntityView
    },
    {
      path: '/ageCharacteristic',
      name: 'ageCharacteristic',
      component: EntityView
    },
    {
      path: '/binding',
      name: 'binding',
      component: EntityView
    },
    {
      path: '/contentType',
      name: 'contentType',
      component: EntityView
    },
    {
      path: '/copyrightSign',
      name: 'copyrightSign',
      component: EntityView
    },
    {
      path: '/organizations',
      name: 'organizationList',
      component: OrganizationsListView
    },
    {
      path: '/organizations/:id',
      name: 'organizationPage',
      component: OrganizationPage
    },
    {
      path: '/organizationTypes',
      name: 'organizationTypes',
      component: EntityView
    },
    {
      path: '/organizationApplies',
      name: 'organizationApplies',
      component: OrganizationApplies
    },
    {
      path: '/organizationRequests',
      name: 'organizationRequests',
      component: OrganizationRequests
    },
    {
      path: '/userRoles',
      name: 'userRoles',
      component: EntityView
    },
    {
      path: '/country',
      name: 'country',
      component: EntityView
    },
    {
      path: '/educationLevel',
      name: 'educationLevel',
      component: EntityView
    },
    {
      path: '/bookType',
      name: 'bookType',
      component: EntityView
    },
    {
      path: '/tag',
      name: 'tag',
      component: EntityView
    },
    {
      path: '/material',
      name: 'material',
      component: EntityView
    },
    {
      path: '/discipline',
      name: 'discipline',
      component: EntityView
    },
    {
      path: '/qualification',
      name: 'qualification',
      component: EntityView
    },
    {
      path: '/regions',
      name: 'regions',
      component: RegionsView
    },
    {
      path: '/book/:id',
      name: 'book',
      component: BookPage
    },
    {
      path: '/book-detail/:id',
      name: 'book-detail',
      component: BookDetailView
    },
    {
      path: '/update',
      name: 'update',
      component: UpdateView
    },
    {
      path: '/quotes',
      name: 'quotes',
      component: QuotesView
    },
    {
      path: '/online-library',
      name: 'online-library',
      component: OnlineLibrary
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView
    },
    {
      path: '/fund/add',
      name: 'fundAdd',
      component: FundAddViewVue
    },
    {
      path: '/guide',
      name: 'guide',
      component: () => import('@/views/GuideView.vue')
    },
    {
      path: '/guide/:id',
      name: 'guide-item',
      component: () => import('@/views/GuideItemView.vue')
    },
    {
      path: '/guide/categories',
      name: 'guide-categories',
      component: GuideCategoryView
    },
    {
      path: '/guide/entries',
      name: 'guide-entries',
      component: GuideEntryView
    },
    {
      path: '/guide/:id/edit',
      name: 'guide-entry-edit',
      component: () => import('@/views/GuideEntryEditView.vue')
    },
    {
      path: '/e-books',
      name: 'e-books',
      component: EBooksView
    },
    {
      path: '/e-books-main',
      name: 'e-books-main',
      component: () => import('@/views/EbooksMainView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: KitaplandRegister
    },
    {
      path: '/temporary',
      name: 'temporary',
      component: TemporaryView
    },
    {
      path: '/apply',
      name: 'apply',
      component: () => import('@/views/ApplyView.vue')
    },
    {
      path: '/readers-panel',
      name: 'readers-panel',
      component: () => import('../views/ReadersPanelView.vue')
    },
    {
      path: '/books/:id',
      name: 'book-detail',
      component: KitaplandBookDetailPage
    },
    {
      path: '/search',
      name: 'search-results',
      component: KitaplandResultPage
    }
  ]
})

export default router
