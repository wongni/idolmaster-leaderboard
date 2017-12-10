<template>
  <v-container>
    <v-layout row wrap v-if="loading">
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate color="primary" :width="7" :size="70"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-for="(idol, index) in idols" :key="idol.id" class="mb-2" v-else>
      <v-flex xs12 sm10 offset-sm1 md8 offset-md2>
        <v-card class="info" @click="onClick(idol)" style="cursor: pointer;">
          <v-container fluid class="pa-1">
            <v-layout row>
              <v-flex xs3 sm3 md2>
                <v-card>
                  <v-card-media contain :height="cardHeight(index)" :src="idol.imageUrl">
                  </v-card-media>
                </v-card>
              </v-flex>
              <v-flex xs7 sm8 md9>
                <v-card-title primary-title class="pt-0 pb-0">
                  <div>
                    <h5 class="white--text mb-2">{{ (index + 1) + '. ' + idol.name }}</h5>
                    <h6 class="primary--text mb-1">득표수: {{ idol.numVotes | currency }} 표</h6>
                  </div>
                </v-card-title>
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
  computed: {
    idols () {
      return this.$store.getters.loadedIdols
    },
    loading () {
      return this.$store.getters.loading
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
    }
  }
}
</script>
