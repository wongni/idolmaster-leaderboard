<template>
  <v-container>
    <v-layout row mb-3>
      <v-flex xs12 class="text-xs-center">
        <h4 class="yellow black--text">총 {{ Math.round(totalVotes / 10000) }}만표 (오늘 {{ Math.round(totalTodayVotes / 10000) }}만표)={{ holsCups }}홀스컵={{ migals }}미갈=홀금연 {{ holsStopSmoking }}일</h4>
      </v-flex>
    </v-layout>
    <v-layout row mb-3>
      <v-flex xs5 offset-xs1>
        <v-card v-if="userIsAuthenticated">
          <v-card-actions class="pa-2">
            <v-container fluid class="pa-1">
              <v-layout row>
                <v-flex xs8>
                  <v-text-field label="타이머 (분)" v-model="timer" class="pb-1" hide-details v-if="!timerHandler"></v-text-field>
                  <h4 class="primary--text" v-else>{{ minutes }} 분 : {{ seconds }} 초</h4>
                </v-flex>
                <v-flex xs4>
                  <v-btn class="orange" @click="onStartTimer()" v-if="!timerHandler">타이머 시작</v-btn>
                  <v-btn class="green" @click="onStopTimer()" v-else>타이머 중지</v-btn>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs8>
                  <v-text-field label="트윕 오버레이 주소" v-model="twipOverlayUrl" class="pb-1" type="password" required hide-details></v-text-field>
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
      <v-flex xs2>
        <v-btn small round class="primary" @click="onStartShuffling" v-if="!isShuffling">돌려 돌려 아이돌</v-btn>
        <v-btn small round class="yellow lighten-3" @click="onStopShuffling" v-else>주사위 신의 선택!</v-btn>
        <app-reset-today-votes-confirm-dialog :idols="idols" v-if="userIsAuthenticated"></app-reset-today-votes-confirm-dialog>
      </v-flex>
      <v-flex xs2>
        <v-btn small round class="blue" @click="onSortByTotal">총 득표수 정렬</v-btn>
        <v-btn small round class="green" @click="onSortByToday">오늘 득표수 정렬</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="loading">
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate color="primary" :width="7" :size="70"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-for="(idol, index) in idols" :key="idol.id" class="mb-2" v-else>
      <v-flex xs12 sm10 offset-sm1>
        <v-card :class="cardClass">
          <v-container fluid class="pa-1">
            <v-layout row>
              <v-flex xs4 @click="onClick(idol)" style="cursor: pointer;">
                <v-card>
                  <v-card-media contain :height="cardHeight(index)" :src="idol.imageUrl">
                  </v-card-media>
                </v-card>
              </v-flex>
              <v-flex xs5 @click="onClick(idol)" style="cursor: pointer;">
                <v-card-title primary-title class="pt-0 pb-0">
                  <div>
                    <h5 class="white--text mb-2">{{ (index + 1) + '. ' + getLastName(idol) }} ({{ getNicknamesString(idol) }})</h5>
                    <h6 class="primary--text mb-2">총 {{ idol.numVotes | currency }}표 (점유율 {{ (idol.numVotes / (totalVotes) * 100).toFixed(1) }}%)</h6>
                    <div class="black--text mb-1">오늘 {{ idol.numTodayVotes | currency }}표 (점유율 {{ ((idol.numTodayVotes / (totalTodayVotes) * 100) || 0).toFixed(1) }}%)</div>
                  </div>
                </v-card-title>
              </v-flex>
              <v-flex xs3 class="white" v-if="userIsAuthenticated">
                <v-card-actions class="pa-0">
                  <v-text-field label="투표수" v-model="votes[index]" class="pb-0" hide-details></v-text-field>
                  <v-btn class="primary" :disabled="!votesAreValid(index)" @click="onVote(index)">투표하기</v-btn>
                  <audio :id="`${idol.id}.voice`" :src="idol.voiceUrl"></audio>
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
      twipConnectionChecker: null
    }
  },
  computed: {
    idols () {
      return this.$store.getters.loadedIdols
    },
    loading () {
      return this.$store.getters.loading
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },
    isShuffling () {
      return this.$store.getters.isShufflingIdols
    },
    totalVotes () {
      return this.idols.reduce((sum, idolB) => sum + idolB.numVotes, 0)
    },
    migals () {
      return (this.totalVotes / 770000).toFixed(1)
    },
    holsCups () {
      return Math.round(this.totalVotes / 300000)
    },
    totalTodayVotes () {
      return this.idols.reduce((sum, idolB) => sum + (isNaN(idolB.numTodayVotes) ? 0 : idolB.numTodayVotes), 0)
    },
    holsStopSmoking () {
      return (this.totalVotes / 30000 / 24).toFixed(1)
    }
  },
  mounted () {
    this.twipOverlayUrl = this.$store.getters.twipOverlayUrl
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
    onClick (idol) {
      this.$router.push(`/idols/${idol.id}`)
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
      let voice = document.getElementById(`${this.idols[index].id}.voice`)
      voice.play()

      const newVotes = parseInt(this.votes[index])
      if (isNaN(newVotes)) {
        return
      }
      this.$store.dispatch('updateIdolData', {
        id: this.idols[index].id,
        numVotes: this.idols[index].numVotes + newVotes,
        numTodayVotes: (this.idols[index].numTodayVotes || 0) + newVotes
      })
      this.votes[index] = ''
    },
    onStartShuffling () {
      this.$store.dispatch('startShufflingIdols')
    },
    onStopShuffling () {
      this.$store.dispatch('stopShufflingIdols')
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
        this.onStartMonitoringTwip()
      }
      this.twipWebSocket.onopen = () => {
      }
      this.twipWebSocket.onmessage = message => {
        if (message.data.indexOf('reload') >= 0) {
          clearTimeout(this.twipConnectionChecker)
          this.twipConnectionChecker = null
          this.cardClass = 'success'
          this.$store.dispatch('storeTwipOverlayUrl', { url: this.twipOverlayUrl })
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
            const targetIdol = this.idols.find(idol => {
              const name = ('@' + idol.name.slice(idol.name.indexOf(' ') + 1)).trim()
              const nameFound = msg.nickname.indexOf(name) >= 0 || msg.comment.indexOf(name) >= 0
              const nickFound = idol.nicknames ? idol.nicknames.find(nick => {
                if (!nick.trim()) {
                  return false
                }
                return msg.nickname.indexOf(`@${nick.trim()}`) >= 0 || msg.comment.indexOf(`@${nick.trim()}`) >= 0
              }) : false
              return nameFound || nickFound
            })
            if (targetIdol) {
              const index = this.idols.findIndex(idol => idol.id === targetIdol.id)
              this.votes[index] = msg.amount
              this.onVote(index)
              this.$toasted.show('성공: ' + msg.nickname + '님이 ' + targetIdol.name + '에게 ' + msg.amount + '표 추가', {
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
      this.$store.dispatch('sortIdolsByTotalVotes')
    },
    onSortByToday () {
      this.$store.dispatch('sortIdolsByTodayVotes')
    },
    getNicknamesString (idol) {
      const nicknameString = idol.nicknames ? idol.nicknames.reduce((acc, nick) => {
        if (typeof nick === 'string') {
          acc += nick.trim() + ', '
        }
        console.log(acc)
        return acc
      }, '') : ''
      return nicknameString.slice(0, nicknameString.length - 2)
    },
    getLastName (idol) {
      return idol.name.slice(idol.name.indexOf(' ') === -1 ? 0 : idol.name.indexOf(' '))
    }
  }
}
</script>
