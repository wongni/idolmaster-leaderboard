<template>
  <v-container>
    <v-layout row mb-3>
      <v-flex xs12 class="text-xs-center">
        <h3 class="yellow black--text">총 {{ totalVotes }}만표 (오늘 {{ totalTodayVotes }}만표)={{ holsCups }}홀스컵={{ migals }}미갈</h3>
      </v-flex>
    </v-layout>
    <v-layout row mb-3>
      <v-flex xs5 offset-xs1>
        <v-card>
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
            </v-container>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs2>
        <v-btn small round class="primary" @click="onStartShuffling" v-if="!isShuffling">돌려 돌려 아이돌</v-btn>
        <v-btn small round class="yellow lighten-3" @click="onStopShuffling" v-else>선택 2017</v-btn>
      </v-flex>
      <v-flex xs4>
        <v-btn small round class="blue" @click="onSortByTotal">총 득표수 정렬</v-btn>
        <v-btn small round class="green" @click="onSortByToday">오늘 득표수 정렬</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row mb-3>
      <v-flex xs6 offset-xs4>
        <v-btn large round class="black yellow--text" @click="onResetTodayVotes()">오늘 득표 초기화</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="loading">
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate color="primary" :width="7" :size="70"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-for="(idol, index) in idols" :key="idol.id" class="mb-2" v-else>
      <v-flex xs12 sm10 offset-sm1>
        <v-card class="info">
          <v-container fluid class="pa-1">
            <v-layout row>
              <v-flex xs2>
                <v-card>
                  <v-card-media contain :height="cardHeight(index)" :src="idol.imageUrl" @click="onClick(idol)" style="cursor: pointer;">
                  </v-card-media>
                </v-card>
              </v-flex>
              <v-flex xs6>
                <v-card-title primary-title class="pt-0 pb-0" @click="onClick(idol)" style="cursor: pointer;">
                  <div>
                    <h5 class="white--text mb-2">{{ (index + 1) + '. ' + idol.name }}</h5>
                    <h6 class="primary--text mb-1">총 득표수: {{ idol.numVotes | currency }} 표</h6>
                    <div class="black--text mb-1">오늘 득표수: {{ idol.numTodayVotes | currency }} 표</div>
                  </div>
                </v-card-title>
              </v-flex>
              <v-flex xs4 class="white" v-if="userIsAuthenticated">
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
export default {
  data () {
    return {
      votes: [],
      timer: 10,
      minutes: 0,
      seconds: 0,
      timerHandler: null,
      isMonitoringTwip: false
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
      return Math.floor(this.idols.reduce((sum, idolB) => sum + idolB.numVotes, 0) / 10000)
    },
    migals () {
      return (this.totalVotes / 77).toFixed(1)
    },
    holsCups () {
      return Math.round(this.totalVotes / 30)
    },
    totalTodayVotes () {
      return Math.round(this.idols.reduce((sum, idolB) => sum + (isNaN(idolB.numTodayVotes) ? 0 : idolB.numTodayVotes), 0) / 10000)
    }
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
      let height = 60
      if (index < 3) {
        height += (5 - index) * 10
      }
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
    onSortByTotal () {
      this.$store.dispatch('sortIdolsByTotalVotes')
    },
    onSortByToday () {
      this.$store.dispatch('sortIdolsByTodayVotes')
    },
    onResetTodayVotes () {
      this.idols.forEach(idol => {
        this.$store.dispatch('updateIdolData', {
          id: idol.id,
          numTodayVotes: 0
        })
      })
      this.$store.dispatch('sortIdolsByTotalVotes')
    }
  }
}
</script>
