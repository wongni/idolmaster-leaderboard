<template>
  <v-container>
    <v-layout row mb-3>
      <v-flex xs12 class="text-xs-center">
        <h4 class="purple white--text">총 {{ Math.round(totalVotes / 10000) }}만표</h4>
      </v-flex>
    </v-layout>
    <v-layout row mb-3>
      <v-flex xs10 offset-xs1>
        <v-card v-if="userIsAuthenticated">
          <v-card-actions class="pa-2">
            <v-container fluid class="pa-1">
              <v-layout row>
                <v-flex xs8>
                  <v-text-field label="트윕 오버레이 주소" v-model="twipOverlayUrl" class="pb-1" type="password" required hide-details></v-text-field>
                  <v-text-field label="게임 추가 최소 금액" v-model="gameAddMinimumAmount" class="pb-1" type="text" required hide-details></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <v-btn class="pink white--text" @click="onStartMonitoringTwip" v-if="cardClass === 'warning'"><strong>자동 집계 시작</strong></v-btn>
                  <v-btn class="yellow" @click="onStopMonitoringTwip(true)" v-else><strong>자동 집계 중지</strong></v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="loading">
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate color="primary" :width="7" :size="70"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-for="(game, index) in games" :key="game.id" class="mb-2" v-else>
      <v-flex xs12 sm10 offset-sm1>
        <v-card :class="cardClass">
          <v-container fluid class="pa-1">
            <v-layout row>
              <v-flex xs7 @click="onClick(game)" style="cursor: pointer;">
                <v-card-title primary-title class="pt-0 pb-0">
                  <div>
                    <h5 class="white--text mb-2">{{ (index + 1) + '. ' + getLastName(game) }}</h5>
                    <h6 class="primary--text mb-2">총 {{ game.numVotes | currency }}표 (점유율 {{ (game.numVotes / (totalVotes) * 100).toFixed(1) }}%)</h6>
                  </div>
                </v-card-title>
              </v-flex>
              <v-flex xs5 class="white" v-if="userIsAuthenticated">
                <v-card-actions class="pa-0">
                  <v-text-field label="투표수" v-model="votes[index]" class="pb-0" hide-details></v-text-field>
                  <v-btn class="primary" :disabled="!votesAreValid(index)" @click="onVote(index)">투표하기</v-btn>
                  <audio :id="`${game.id}.voice`" :src="game.voiceUrl"></audio>
                </v-card-actions>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
const W3CWebSocket = require('websocket').w3cwebsocket

export default {
  data () {
    return {
      votes: [],
      timer: 10,
      minutes: 0,
      seconds: 0,
      timerHandler: null,
      twipWebSocket: null,
      cardClass: 'warning',
      twipOverlayUrl: null,
      twipConnectionChecker: null,
      gameAddMinimumAmount: 0
    }
  },
  computed: {
    games () {
      return this.$store.getters.loadedGames
    },
    loading () {
      return this.$store.getters.loading
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },
    isShuffling () {
      return this.$store.getters.isShufflingGames
    },
    totalVotes () {
      return this.games.reduce((sum, gameB) => sum + gameB.numVotes, 0)
    },
    migals () {
      return (this.totalVotes / 770000).toFixed(1)
    },
    holsCups () {
      return Math.round(this.totalVotes / 300000)
    },
    totalTodayVotes () {
      return this.games.reduce((sum, gameB) => sum + (isNaN(gameB.numTodayVotes) ? 0 : gameB.numTodayVotes), 0)
    },
    holsStopSmoking () {
      return (this.totalVotes / 30000 / 24).toFixed(1)
    }
  },
  mounted () {
    this.twipOverlayUrl = this.$store.getters.twipOverlayUrl
    this.gameAddMinimumAmount = this.$store.getters.gameAddMinimumAmount
    this.onStartMonitoringTwip()
  },
  destroyed () {
    this.onStopMonitoringTwip()
  },
  methods: {
    onStartTimer () {
      this.minutes = this.timer
      this.seconds = 0
      this.timerHandler = setInterval(() => {
        if (this.seconds === 0) {
          this.minutes--
          this.seconds = 59
        } else {
          this.seconds--
        }
        if (!this.minutes && !this.seconds) {
          clearInterval(this.timerHandler)
          this.timerHandler = null
        }
      }, 1000)
    },
    onStopTimer () {
      clearInterval(this.timerHandler)
      this.timerHandler = null
    },
    onClick (game) {
      this.$router.push(`/games/${game.id}`)
    },
    cardHeight (index) {
      let height = 160
      // if (index < 3) {
      //   height += (5 - index) * 10
      // }
      return height + 'px'
    },
    votesAreValid (index) {
      return !isNaN(parseInt(this.votes[index]))
    },
    onVote (index) {
      let voice = document.getElementById(`${this.games[index].id}.voice`)
      voice.play()

      const newVotes = parseInt(this.votes[index])
      if (isNaN(newVotes)) {
        return
      }
      this.$store.dispatch('updateGameData', {
        id: this.games[index].id,
        numVotes: this.games[index].numVotes + newVotes,
        numTodayVotes: (this.games[index].numTodayVotes || 0) + newVotes
      })
      this.votes[index] = ''
    },
    onStartShuffling () {
      this.$store.dispatch('startShufflingGames')
    },
    onStopShuffling () {
      this.$store.dispatch('stopShufflingGames')
    },
    onStartMonitoringTwip () {
      if (!this.twipOverlayUrl) return

      // 2초 안에 웹 소켓 연결을 성공하지 못하면 연결을 닫고 에러 메시지를 띄운다.
      this.twipConnectionChecker = setTimeout(() => {
        if (this.cardClass !== 'success') {
          this.twipConnectionChecker = null
          this.twipWebSocket.close()
          this.$toasted.error('트윕 연동 실패: 트윕 오버레이 주소를 확인해 주세요', {
            theme: 'primary',
            position: 'top-left',
            duration: null,
            action: {
              text: '확인',
              onClick: (e, toastObject) => {
                toastObject.goAway(0)
              }
            }
          })
        }
      }, 2000)

      const twipEventKey = this.twipOverlayUrl.slice(this.twipOverlayUrl.lastIndexOf('/') + 1)
      const twipWebSocketUrl = `wss://io.mytwip.net/socket.io/?eventlist_key=${twipEventKey}&EIO=3&transport=websocket`
      this.twipWebSocket = new W3CWebSocket(twipWebSocketUrl, 'echo-protocol')
      this.twipWebSocket.onerror = () => {
        this.$toasted.error('트윕 연동 에러: 다시 연결해 주세요', {
          theme: 'primary',
          position: 'top-left',
          duration: null,
          action: {
            text: '확인',
            onClick: (e, toastObject) => {
              toastObject.goAway(0)
            }
          }
        })
      }
      this.twipWebSocket.onclose = () => {
        this.onStopMonitoringTwip()
      }
      this.twipWebSocket.onopen = () => {
      }
      this.twipWebSocket.onmessage = message => {
        if (message.data.indexOf('reload') >= 0) {
          clearTimeout(this.twipConnectionChecker)
          this.twipConnectionChecker = null
          this.cardClass = 'success'
          this.$store.dispatch('storeTwipOverlayUrl', { url: this.twipOverlayUrl, gameAddMinimumAmount: this.gameAddMinimumAmount })
          this.$toasted.success('트윕 연동 성공: 자동 집계를 시작합니다.', {
            theme: 'primary',
            position: 'top-left',
            duration: 5000,
            action: {
              text: '확인',
              onClick: (e, toastObject) => {
                toastObject.goAway(0)
              }
            }
          })
        }
        const startIndex = message.data.indexOf('{')
        const endIndex = message.data.lastIndexOf('}')
        if (startIndex >= 0 && endIndex >= 0) {
          const msg = JSON.parse(message.data.substring(startIndex, endIndex + 1))
          if (msg.pingInterval) {
            this.twipPingTask = setInterval(() => {
              this.twipWebSocket.send('2')
            }, msg.pingInterval)
          } else if (msg.amount) {
            // wkkim: test
            msg.comment = '라 라 라 @철권3 우오오오와'
            const targetGame = this.games.find(game => {
              const name = ('@' + game.name.slice(game.name.indexOf(' ') + 1)).trim()
              const nameFound = msg.nickname.indexOf(name) >= 0 || msg.comment.indexOf(name) >= 0
              const nickFound = game.nicknames ? game.nicknames.find(nick => {
                if (!nick.trim()) {
                  return false
                }
                return msg.nickname.indexOf(`@${nick.trim()}`) >= 0 || msg.comment.indexOf(`@${nick.trim()}`) >= 0
              }) : false
              return nameFound || nickFound
            })
            if (targetGame) {
              const index = this.games.findIndex(game => game.id === targetGame.id)
              this.votes[index] = msg.amount
              this.onVote(index)
              this.$toasted.show('성공: ' + msg.nickname + '님이 ' + targetGame.name + '에게 ' + msg.amount + '표 추가', {
                theme: 'outline',
                position: 'top-right',
                duration: 5000,
                action: {
                  text: '확인',
                  onClick: (e, toastObject) => {
                    toastObject.goAway(0)
                  }
                }
              })
            } else {
              if (msg.amount >= Number(this.gameAddMinimumAmount)) {
                const startPosition = msg.comment.indexOf('@') + 1
                const newGameName = msg.comment.substring(startPosition, msg.comment.indexOf(' ', startPosition))
                const gameData = {
                  name: newGameName,
                  imageUrl: '',
                  numVotes: msg.amount
                }
                this.$store.dispatch('createGame', gameData)
              } else {
                this.$toasted.show(`실패: ${msg.nickname}님의 ${msg.amount}표 (${msg.comment})`, {
                  theme: 'primary',
                  position: 'top-right',
                  duration: null,
                  action: {
                    text: '확인',
                    onClick: (e, toastObject) => {
                      toastObject.goAway(0)
                    }
                  }
                })
              }
            }
          }
        }
      }
    },
    onStopMonitoringTwip (clearUrl) {
      clearTimeout(this.twipConnectionChecker)
      this.twipConnectionChecker = null

      if (this.twipWebSocket) {
        this.twipWebSocket.close()
        this.twipWebSocket = null
        this.$toasted.info('트윕 연동 해제: 자동 집계를 중지합니다.', {
          theme: 'primary',
          position: 'top-left',
          duration: 5000,
          action: {
            text: '확인',
            onClick: (e, toastObject) => {
              toastObject.goAway(0)
            }
          }
        })
      }
      if (this.twipPingTask) {
        clearInterval(this.twipPingTask)
        this.twipPingTask = null
      }
      this.cardClass = 'warning'
      this.twipOverlayUrl = null

      if (clearUrl) {
        this.$store.dispatch('storeTwipOverlayUrl', { url: this.twipOverlayUrl })
      }
    },
    onSortByTotal () {
      this.$store.dispatch('sortGamesByTotalVotes')
    },
    onSortByToday () {
      this.$store.dispatch('sortGamesByTodayVotes')
    },
    getNicknamesString (game) {
      const nicknameString = game.nicknames ? game.nicknames.reduce((acc, nick) => {
        if (typeof nick === 'string') {
          acc += nick.trim() + ', '
        }
        console.log(acc)
        return acc
      }, '') : ''
      return nicknameString.slice(0, nicknameString.length - 2)
    },
    getLastName (game) {
      return game.name.slice(game.name.indexOf(' ') === -1 ? 0 : game.name.indexOf(' '))
    }
  }
}
</script>
