<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center text-sm-center">
        <h2 class="primary--text">나이스게임티비 사내매치업</h2>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate color="primary" :width="7" :size="70" v-if="loading"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="mt-2" v-if="!loading">
      <v-flex xs12 style="height: 100vh;">
        <v-carousel light style="cursor: pointer; height: 80%;" interval="5000">
          <v-carousel-item v-for="(game, index) in games" :key="game.id" @click="onLoadGame(game.id)" src="">
            <img :src="game.imageUrl" width="100%">
            <div class="name">
              {{ `${index + 1}위-${game.name}` }}-{{ game.numVotes | currency }}표 (오늘 {{ game.numTodayVotes | currency }}표)
            </div>
          </v-carousel-item>
        </v-carousel>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  computed: {
    games () {
      return this.$store.getters.loadedGames
    },
    loading () {
      return this.$store.getters.loading
    }
  },
  methods: {
    onLoadGame (id) {
      this.$router.push(`/games/${id}`)
    }
  }
}
</script>

<style scoped>
.name {
  position: absolute;
  bottom: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 2em;
  padding: 10px;
}
</style>