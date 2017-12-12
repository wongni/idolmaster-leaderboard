import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    loadedIdols: [],
    user: null,
    loading: false,
    error: null,
    sortingOrder: 'by_vote',
    shufflingHandler: null
  },
  mutations: {
    setLoadedIdols (state, payload) {
      state.loadedIdols = payload
    },
    updateIdol (state, payload) {
      const idol = state.loadedIdols.find(idol => idol.id === payload.id)
      if (payload.name) {
        idol.name = payload.name
      }
      if (payload.japaneseName) {
        idol.japaneseName = payload.japaneseName
      }
      if (payload.description) {
        idol.description = payload.description
      }
      if (payload.birthDate) {
        idol.birthDate = payload.birthDate
      }
      if (payload.imageUrl) {
        idol.imageUrl = payload.imageUrl
      }
      if (payload.numVotes) {
        idol.numVotes = payload.numVotes
      }
    },
    startShufflingIdols (state) {
      state.shufflingHandler = setInterval(() => {
        state.sortingOrder = 'by_vote'
        state.sortingOrder = 'random'
      }, 50)
    },
    stopShufflingIdols (state) {
      clearInterval(state.shufflingHandler)
      state.shufflingHandler = null
    },
    sortIdols (state) {
      state.sortingOrder = 'by_vote'
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
    }
  },
  actions: {
    loadIdols ({ commit }) {
      commit('setLoading', true)
      firebase.database().ref('idols').on('value', data => {
        const idols = []
        const obj = data.val()
        for (let key in obj) {
          idols.push({
            id: key,
            name: obj[key].name,
            imageUrl: obj[key].imageUrl,
            japaneseName: obj[key].japaneseName,
            voiceActor: obj[key].voiceActor,
            age: obj[key].age,
            birthDate: obj[key].birthDate,
            description: obj[key].description,
            numVotes: obj[key].numVotes,
            creatorId: obj[key].creatorId
          })
        }
        commit('setLoadedIdols', idols)
        commit('setLoading', false)
      })
    },
    createIdol ({ commit, getters }, payload) {
      commit('setLoading', true)
      const idol = {
        name: payload.name,
        japaneseName: payload.japaneseName,
        voiceActor: payload.voiceActor,
        age: payload.age,
        birthDate: payload.birthDate.toISOString(),
        description: payload.description,
        numVotes: payload.numVotes === '' ? 0 : parseInt(payload.numVotes),
        creatorId: getters.user.id
      }
      let imageUrl
      let key
      firebase.database().ref('idols').push(idol)
        .then(data => {
          key = data.key
          return key
        })
        .then(key => {
          // const filename = payload.image.name
          // const ext = filename.slice(filename.lastIndexOf('.') + 1)
          const ext = 'image'
          return firebase.storage().ref(`idols/${key}.${ext}`).put(payload.image)
        })
        .then(fileData => {
          imageUrl = fileData.metadata.downloadURLs[0]
          return firebase.database().ref('idols').child(key).update({ imageUrl })
        })
        .then(() => {
          commit('setLoading', false)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    updateIdolData ({ commit }, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.name) {
        updateObj.name = payload.name
      }
      if (payload.description) {
        updateObj.description = payload.description
      }
      if (payload.numVotes) {
        updateObj.numVotes = payload.numVotes
      }
      if (payload.birthDate) {
        updateObj.birthDate = payload.birthDate
      }
      if (payload.image) {
        firebase.storage().ref(`idols/${payload.id}.image`).put(payload.image)
          .then(fileData => {
            const imageUrl = fileData.metadata.downloadURLs[0]
            updateObj.imageUrl = imageUrl
            firebase.database().ref('idols').child(payload.id).update(updateObj)
              .then(() => {
                commit('setLoading', false)
                payload.imageUrl = imageUrl
                commit('updateIdol', payload)
              })
              .catch(error => {
                console.log(error)
                commit('setLoading', false)
              })
          })
      } else {
        firebase.database().ref('idols').child(payload.id).update(updateObj)
          .then(() => {
            commit('setLoading', false)
            commit('updateIdol', payload)
          })
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
          })
      }
    },
    deleteIdol ({ commit }, payload) {
      commit('setLoading', true)
      firebase.database().ref('idols').child(payload.id).remove()
        .then(() => {
          commit('setLoading', false)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    startShufflingIdols ({ commit }) {
      commit('startShufflingIdols')
    },
    stopShufflingIdols ({ commit }) {
      commit('stopShufflingIdols')
    },
    sortIdols ({ commit }) {
      commit('sortIdols')
    },
    signUserUp ({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(user => {
          commit('setLoading', false)
          const newUser = {
            id: user.uid,
            registeredIdols: []
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
            registeredIdols: []
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
      commit('setUser', { id: payload.uid, registeredIdols: [] })
    },
    logout ({ commit }) {
      firebase.auth().signOut()
      commit('setUser', null)
    },
    clearError ({ commit }) {
      commit('clearError')
    }
  },
  getters: {
    loadedIdols (state) {
      if (state.sortingOrder === 'by_vote') {
        return state.loadedIdols.sort((idolA, idolB) => idolB.numVotes - idolA.numVotes)
      } else if (state.sortingOrder === 'random') {
        for (let i = state.loadedIdols.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1))
          const temp = state.loadedIdols[i]
          state.loadedIdols[i] = state.loadedIdols[j]
          state.loadedIdols[j] = temp
        }
        return state.loadedIdols
      }
    },
    featuredIdols (state, getters) {
      return getters.loadedIdols.slice(0, 5)
    },
    loadedIdol (state) {
      return (idolId) => {
        return state.loadedIdols.find(idol => idol.id === idolId)
      }
    },
    isShufflingIdols (state) {
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
    }
  }
})
