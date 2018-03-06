import Vue from 'vue'
import Vuetify from 'vuetify'
import * as firebase from 'firebase'
import VueCurrencyFilter from 'vue-currency-filter'
import Toasted from 'vue-toasted'
import App from './App'
import router from './router'
import { store } from './store'
import DateFilter from './filters/date'
import AlertCmp from './components/Shared/Alert.vue'
import EditGameDetailsDialogCmp from './components/Game/Edit/EditGameDetailsDialog.vue'
import DeleteGameConfirmDialogCmp from './components/Game/Edit/DeleteGameConfirmDialog.vue'
import ResetTodayVotesConfirmDialogCmp from './components/Game/Popup/ResetTodayVotesConfirmDialog.vue'

Vue.use(Vuetify)
Vue.use(VueCurrencyFilter, { thousandsSeparator: ',' })
Vue.use(Toasted)
Vue.config.productionTip = false

Vue.filter('date', DateFilter)
Vue.component('app-alert', AlertCmp)
Vue.component('app-edit-game-details-dialog', EditGameDetailsDialogCmp)
Vue.component('app-delete-game-confirm-dialog', DeleteGameConfirmDialogCmp)
Vue.component('app-reset-today-votes-confirm-dialog', ResetTodayVotesConfirmDialogCmp)

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
    this.$store.dispatch('loadGames')
  }
})
