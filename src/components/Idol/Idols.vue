<template>
  <v-container>
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
                  <v-card-media contain :height="cardHeight(index)" :src="idol.imageUrl">
                  </v-card-media>
                </v-card>
              </v-flex>
              <v-flex xs6>
                <v-card-title primary-title class="pt-0 pb-0" @click="onClick(idol)" style="cursor: pointer;">
                  <div>
                    <h5 class="white--text mb-2">{{ (index + 1) + '. ' + idol.name }}</h5>
                    <h6 class="primary--text mb-1">득표수: {{ idol.numVotes | currency }} 표</h6>
                  </div>
                </v-card-title>
              </v-flex>
              <v-flex xs4 class="white" v-if="userIsAuthenticated">
                <v-card-actions class="pa-0">
                  <v-text-field label="투표수" v-model="votes[index]" class="pb-0" hide-details></v-text-field>
                  <v-btn class="primary" :disabled="!votesAreValid(index)" @click="onVote(index)">투표하기</v-btn>
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
      votes: []
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
    }
  },
  methods: {
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
      const newVotes = parseInt(this.votes[index])
      if (isNaN(newVotes)) {
        return
      }
      this.$store.dispatch('updateIdolData', {
        id: this.idols[index].id,
        numVotes: this.idols[index].numVotes + newVotes
      })
      this.votes[index] = ''
    }
  }
}
</script>
