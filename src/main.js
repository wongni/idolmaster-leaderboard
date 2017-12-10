import Vue from 'vue'
import Vuetify from 'vuetify'
import * as firebase from 'firebase'
import VueCurrencyFilter from 'vue-currency-filter'
import App from './App'
import router from './router'
import { store } from './store'
import DateFilter from './filters/date'
import AlertCmp from './components/Shared/Alert.vue'
import EditIdolDetailsDialogCmp from './components/Idol/Edit/EditIdolDetailsDialog.vue'
import DeleteIdolConfirmDialogCmp from './components/Idol/Edit/DeleteIdolConfirmDialog.vue'

Vue.use(Vuetify)
Vue.use(VueCurrencyFilter, { thousandsSeparator: ',' })
Vue.config.productionTip = false

Vue.filter('date', DateFilter)
Vue.component('app-alert', AlertCmp)
Vue.component('app-edit-idol-details-dialog', EditIdolDetailsDialogCmp)
Vue.component('app-delete-idol-confirm-dialog', DeleteIdolConfirmDialogCmp)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  created () {
    firebase.initializeApp({
      apiKey: 'AIzaSyCSLe8M4E-nMSdlHTaNbRZG7rmjEmiss8A',
      authDomain: 'idolmaster-leaderboard.firebaseapp.com',
      databaseURL: 'https://idolmaster-leaderboard.firebaseio.com',
      projectId: 'idolmaster-leaderboard',
      storageBucket: 'gs://idolmaster-leaderboard.appspot.com'
    })
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.$store.dispatch('autoSignIn', user)
      } else {
        this.$store.dispatch('logout')
      }
    })
    this.$store.dispatch('loadIdols')
  }
})
