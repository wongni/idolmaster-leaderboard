<template>
  <v-dialog width="650px" persistent v-model="editDialog">
    <v-btn fab accent slot="activator">
      <v-icon>edit</v-icon>
    </v-btn>
    <v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-title>게임 수정하기</v-card-title>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs5>
          </v-flex>
          <v-flex xs12>
            <v-card-text>
              <v-text-field name="name" label="이름" id="name" v-model="editedName" hide-details required></v-text-field>
            </v-card-text>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-actions>
              <v-btn flat class="blue--text darken-1" @click="editDialog = false">닫기</v-btn>
              <v-btn flat class="blue--text darken-1" @click="onSaveChanges">저장</v-btn>
            </v-card-actions>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['game'],
  data () {
    let nicknamesString = this.game.nicknames ? this.game.nicknames.reduce((acc, nick) => {
      if (typeof nick === 'string') {
        acc += nick.trim() + ', '
      }
      console.log(acc)
      return acc
    }, '') : ''
    return {
      editDialog: false,
      editedName: this.game.name,
      editedDescription: this.game.description,
      editedImageUrl: this.game.imageUrl,
      editedImage: null,
      editedVoiceUrl: this.game.voiceUrl,
      editedVoice: null,
      editedNumVotes: this.game.numVotes,
      editedBirthDate: new Date(this.game.birthDate),
      editedNicks: nicknamesString.slice(0, nicknamesString.length - 2)
    }
  },
  methods: {
    onSaveChanges () {
      if (this.editedName.trim() === '') {
        return
      }
      this.editDialog = false
      const nicks = this.editedNicks.split(',')
      const nicknames = nicks.map(nick => nick.trim())
      this.$store.dispatch('updateGameData', {
        id: this.game.id,
        name: this.editedName,
        image: this.editedImage,
        nicknames
      })
    },
    onPickImage () {
      this.$refs.fileInputForImage.click()
    },
    onImagePicked (event) {
      const files = event.target.files
      let filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        return alert('Please add a valid file!')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.editedImageUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.editedImage = files[0]
    },
    onPickVoice () {
      this.$refs.fileInputForVoice.click()
    },
    onVoicePicked (event) {
      const files = event.target.files
      let filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        return alert('Please add a valid file!')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.editedVoiceUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.editedVoice = files[0]
    }
  }
}
</script>

