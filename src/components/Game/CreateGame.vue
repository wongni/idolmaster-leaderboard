<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm8 offset-sm3>
        <h4>새로운 게임 추가하기</h4>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs12>
        <form @submit.prevent="onCreateGame">
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field name="name" label="이름" id="name" v-model="name" hide-details required></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-btn class="primary" :disabled="!formIsValid" type="submit">게임 추가</v-btn>
            </v-flex>
          </v-layout>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      name: '',
      image: '',
      imageUrl: ''
    }
  },
  computed: {
    formIsValid () {
      return this.name !== ''
    }
  },
  methods: {
    onCreateGame () {
      if (!this.formIsValid) {
        return
      }
      const gameData = {
        name: this.name,
        image: this.image,
        imageUrl: this.imageUrl,
        numVotes: 0
      }
      this.$store.dispatch('createGame', gameData)
      this.$router.push('/games')
    },
    onPickFile () {
      this.$refs.fileInput.click()
    },
    onFilePicked (event) {
      const files = event.target.files
      let filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        return alert('Please add a valid file!')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.imageUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.image = files[0]
    }
  }
}
</script>
