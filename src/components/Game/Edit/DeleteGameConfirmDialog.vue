<template>
  <v-dialog width="450px" persistent v-model="deleteConfirmDialog">
    <v-btn fab accent slot="activator">
      <v-icon>delete</v-icon>
    </v-btn>
    <v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-title>{{ game.name }}을(를) 집으로 돌려 보냅니까?</v-card-title>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-actions>
              <v-btn flat class="blue--text darken-1" @click="deleteConfirmDialog = false">아니</v-btn>
              <v-btn flat class="red--text darken-1" @click="onDeleteConfirmed">집으로</v-btn>
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
      deleteConfirmDialog: false
    }
  },
  props: ['game'],
  methods: {
    onDeleteConfirmed () {
      this.$store.dispatch('deleteGame', { id: this.game.id })
      this.$router.push('/games')
    }
  }
}
</script>

