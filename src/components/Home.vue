<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center text-sm-center">
        <h2 class="primary--text">Top Five</h2>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate color="primary" :width="7" :size="70" v-if="loading"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="mt-2" v-if="!loading">
      <v-flex xs12 style="height: 100vh;">
        <v-carousel light style="cursor: pointer; height: 80%;">
          <v-carousel-item v-for="(idol, index) in idols" :key="idol.id" @click="onLoadIdol(idol.id)" src="">
            <img :src="idol.imageUrl">
            <div class="name">
              {{ `${index + 1}위-${idol.name}` }}-{{ idol.numVotes | currency }}표 (오늘 {{ idol.numTodayVotes | currency }}표)
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
    idols () {
      return this.$store.getters.featuredIdols
    },
    loading () {
      return this.$store.getters.loading
    }
  },
  methods: {
    onLoadIdol (id) {
      this.$router.push(`/idols/${id}`)
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