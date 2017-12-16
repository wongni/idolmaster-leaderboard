<template>
  <v-container>
    <v-layout row wrap v-if="loading">
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate color="primary" :width="7" :size="70"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <v-flex xs12 md8 offset-md2>
        <v-card>
          <v-card-title>
            <h4 class="primary--text">
              {{ idol.name }}
            </h4>
            <template v-if="userIsCreator">
              <v-spacer></v-spacer>
              <app-edit-idol-details-dialog :idol="idol"></app-edit-idol-details-dialog>
              <app-delete-idol-confirm-dialog :idol="idol"></app-delete-idol-confirm-dialog>
            </template>
          </v-card-title>
          <v-card-actions v-if="userIsCreator">
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs4 offset-xs2>
                  <v-text-field label="투표수" v-model="votes" :rules="voteRules" required></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <v-spacer></v-spacer>
                  <v-btn class="primary" :disabled="!votesAreValid" @click="onVote">투표하기</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-actions>
          <v-card-media>
            <img :src="idol.imageUrl">
          </v-card-media>
          <v-card-text>
            <div class="primary--text mb-2">득표수: {{ idol.numVotes | currency }} 표</div>
            <div class="info--text mb-2">성우: {{ idol.voiceActor }}</div>
            <div class="mb-2">나이: {{ idol.age }}</div>
            <div class="mb-2">생일: {{ idol.birthDate | date }}</div>
            <div class="mb-2">각오: {{ idol.description }}</div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      valid: false,
      votes: '',
      voteRules: [
        (v) => !!v || '투표수를 입력하세요',
        (v) => /\d+/.test(v) || '0 이상의 숫자를 입력하세요'
      ]
    }
  },
  props: ['id'],
  computed: {
    idol () {
      return this.$store.getters.loadedIdol(this.id)
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },
    userIsCreator () {
      if (!this.userIsAuthenticated) {
        return false
      }
      return this.$store.getters.user.id === this.idol.creatorId
    },
    loading () {
      return this.$store.getters.loading
    },
    votesAreValid () {
      return !isNaN(parseInt(this.votes))
    }
  },
  methods: {
    onVote () {
      const newVotes = parseInt(this.votes)
      if (isNaN(newVotes)) {
        return
      }
      this.$store.dispatch('updateIdolData', {
        id: this.idol.id,
        numVotes: this.idol.numVotes + newVotes
      })
      this.$router.push('/idols')
    }
  }
}
</script>