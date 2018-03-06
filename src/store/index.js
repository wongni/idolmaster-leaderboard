import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    loadedGames: [],
    user: null,
    loading: false,
    error: null,
    sortingOrder: 'by_total_votes',
    shufflingHandler: null,
    twipOverlayUrl: null,
    gameAddMinimumAmount: 0
  },
  mutations: {
    setLoadedGames (state, payload) {
      state.loadedGames = payload
    },
    updateGame (state, payload) {
      const game = state.loadedGames.find(game => game.id === payload.id)
      if (payload.name) {
        game.name = payload.name
      }
      if (payload.japaneseName) {
        game.japaneseName = payload.japaneseName
      }
      if (payload.description) {
        game.description = payload.description
      }
      if (payload.birthDate) {
        game.birthDate = payload.birthDate
      }
      if (payload.imageUrl) {
        game.imageUrl = payload.imageUrl
      }
      if (payload.numVotes) {
        game.numVotes = payload.numVotes
      }
    },
    startShufflingGames (state) {
      state.shufflingHandler = setInterval(() => {
        state.sortingOrder = 'by_total_votes'
        state.sortingOrder = 'random'
      }, 50)
    },
    stopShufflingGames (state) {
      clearInterval(state.shufflingHandler)
      state.shufflingHandler = null
    },
    sortGamesByTotalVotes (state) {
      state.sortingOrder = 'by_total_votes'
    },
    sortGamesByTodayVotes (state) {
      state.sortingOrder = 'by_today_votes'
    },
    setUser (state, payload) {
      state.user = payload
    },
    setLoading (state, payload) {
      state.loading = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    clearError (state) {
      state.error = null
    },
    storeTwipOverlayUrl (state, payload) {
      state.twipOverlayUrl = payload.url
      state.gameAddMinimumAmount = payload.gameAddMinimumAmount
    }
  },
  actions: {
    loadGames ({ commit }) {
      commit('setLoading', true)
      firebase.database().ref('games').on('value', data => {
        const games = []
        const obj = data.val()
        for (let key in obj) {
          games.push({
            id: key,
            name: obj[key].name,
            imageUrl: obj[key].imageUrl,
            voiceUrl: obj[key].voiceUrl,
            japaneseName: obj[key].japaneseName,
            voiceActor: obj[key].voiceActor,
            age: obj[key].age,
            birthDate: obj[key].birthDate,
            description: obj[key].description,
            numVotes: obj[key].numVotes,
            numTodayVotes: obj[key].numTodayVotes,
            creatorId: obj[key].creatorId,
            nicknames: obj[key].nicknames
          })
        }
        commit('setLoadedGames', games)
        commit('setLoading', false)
      })
    },
    createGame ({ commit, getters }, payload) {
      commit('setLoading', true)
      const game = {
        name: payload.name,
        imageUrl: payload.imageUrl,
        numVotes: payload.numVotes || 0,
        creatorId: getters.user.id
      }
      let imageUrl
      let key
      firebase.database().ref('games').push(game)
        .then(data => {
          key = data.key
          return key
        })
        .then(key => {
          if (payload.image) {
            const ext = 'image'
            return firebase.storage().ref(`games/${key}.${ext}`).put(payload.image)
          }
        })
        .then(fileData => {
          if (fileData) {
            imageUrl = fileData.metadata.downloadURLs[0]
            return firebase.database().ref('games').child(key).update({ imageUrl })
          }
        })
        .then(() => {
          commit('setLoading', false)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    updateGameData ({ commit }, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.name) {
        updateObj.name = payload.name
      }
      if (payload.description) {
        updateObj.description = payload.description
      }
      if (payload.numVotes !== undefined) {
        updateObj.numVotes = payload.numVotes
      }
      if (payload.numTodayVotes !== undefined) {
        updateObj.numTodayVotes = payload.numTodayVotes
      }
      if (payload.birthDate) {
        updateObj.birthDate = payload.birthDate
      }
      if (payload.nicknames) {
        updateObj.nicknames = payload.nicknames
      }
      if (payload.image) {
        firebase.storage().ref(`games/${payload.id}.image`).put(payload.image)
          .then(fileData => {
            const imageUrl = fileData.metadata.downloadURLs[0]
            updateObj.imageUrl = imageUrl
            firebase.database().ref('games').child(payload.id).update(updateObj)
              .then(() => {
                commit('setLoading', false)
                payload.imageUrl = imageUrl
                commit('updateGame', payload)
              })
              .catch(error => {
                console.log(error)
                commit('setLoading', false)
              })
          })
      }
      if (payload.voice) {
        firebase.storage().ref(`games/${payload.id}.voice`).put(payload.voice)
          .then(fileData => {
            const voiceUrl = fileData.metadata.downloadURLs[0]
            updateObj.voiceUrl = voiceUrl
            firebase.database().ref('games').child(payload.id).update(updateObj)
              .then(() => {
                commit('setLoading', false)
                payload.voiceUrl = voiceUrl
                commit('updateGame', payload)
              })
              .catch(error => {
                console.log(error)
                commit('setLoading', false)
              })
          })
      }
      if (!payload.image && !payload.voice) {
        firebase.database().ref('games').child(payload.id).update(updateObj)
          .then(() => {
            commit('setLoading', false)
            commit('updateGame', payload)
          })
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
          })
      }
    },
    deleteGame ({ commit }, payload) {
      commit('setLoading', true)
      firebase.database().ref('games').child(payload.id).remove()
        .then(() => {
          commit('setLoading', false)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    startShufflingGames ({ commit }) {
      commit('startShufflingGames')
    },
    stopShufflingGames ({ commit }) {
      commit('stopShufflingGames')
    },
    sortGamesByTotalVotes ({ commit }) {
      commit('sortGamesByTotalVotes')
    },
    sortGamesByTodayVotes ({ commit }) {
      commit('sortGamesByTodayVotes')
    },
    signUserUp ({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(user => {
          commit('setLoading', false)
          const newUser = {
            id: user.uid,
            registeredGames: []
          }
          commit('setUser', newUser)
        })
        .catch(error => {
          commit('setLoading', false)
          commit('setError', error)
        })
    },
    signUserIn ({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(user => {
          const newUser = {
            id: user.uid,
            registeredGames: []
          }
          commit('setLoading', false)
          commit('setUser', newUser)
        })
        .catch(error => {
          commit('setLoading', false)
          commit('setError', error)
        })
    },
    autoSignIn ({ commit }, payload) {
      commit('setUser', { id: payload.uid, registeredGames: [] })
    },
    logout ({ commit }) {
      firebase.auth().signOut()
      commit('setUser', null)
    },
    clearError ({ commit }) {
      commit('clearError')
    },
    storeTwipOverlayUrl ({ commit }, payload) {
      commit('storeTwipOverlayUrl', payload)
    }
  },
  getters: {
    loadedGames (state) {
      if (state.sortingOrder === 'by_total_votes') {
        return state.loadedGames.sort((gameA, gameB) => gameB.numVotes - gameA.numVotes)
      } else if (state.sortingOrder === 'by_today_votes') {
        return state.loadedGames.sort((gameA, gameB) => gameB.numTodayVotes - gameA.numTodayVotes)
      } else if (state.sortingOrder === 'random') {
        for (let i = state.loadedGames.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1))
          const temp = state.loadedGames[i]
          state.loadedGames[i] = state.loadedGames[j]
          state.loadedGames[j] = temp
        }
        return state.loadedGames
      }
    },
    featuredGames (state, getters) {
      return getters.loadedGames.slice(0, 5)
    },
    loadedGame (state) {
      return (gameId) => {
        return state.loadedGames.find(game => game.id === gameId)
      }
    },
    isShufflingGames (state) {
      return state.shufflingHandler !== null
    },
    user (state) {
      return state.user
    },
    loading (state) {
      return state.loading
    },
    error (state) {
      return state.error
    },
    twipOverlayUrl (state) {
      return state.twipOverlayUrl
    },
    gameAddMinimumAmount (state) {
      return state.gameAddMinimumAmount
    }
  }
})
