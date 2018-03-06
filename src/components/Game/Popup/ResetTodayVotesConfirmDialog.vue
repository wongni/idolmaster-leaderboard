<template>
  <v-dialog width="450px" persistent v-model="resetTodayVotesConfirmDialog">
    <v-btn small round class="black yellow--text" slot="activator">오늘 득표 초기화</v-btn>
    <v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-title>오늘의 득표수를 초기화 하시겠습니까?</v-card-title>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-actions>
              <v-btn flat class="blue--text darken-1" @click="resetTodayVotesConfirmDialog = false">아니</v-btn>
              <v-btn flat class="red--text darken-1" @click="onResetConfirmed">예</v-btn>
            </v-card-actions>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data () {
    return {
      resetTodayVotesConfirmDialog: false
    }
  },
  props: ['games'],
  methods: {
    onResetConfirmed () {
      this.games.forEach(game => {
        this.$store.dispatch('updateGameData', {
          id: game.id,
          numTodayVotes: 0
        })
      })
      this.$store.dispatch('sortGamesByTotalVotes')
      this.resetTodayVotesConfirmDialog = false
    }
  }
}
</script>

