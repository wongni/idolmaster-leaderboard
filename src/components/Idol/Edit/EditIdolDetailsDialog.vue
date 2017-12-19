<template>
  <v-dialog width="650px" persistent v-model="editDialog">
    <v-btn fab accent slot="activator">
      <v-icon>edit</v-icon>
    </v-btn>
    <v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-title>아이돌 편집하기</v-card-title>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs5>
            <v-card-text>
              <v-layout row>
                <v-flex>
                  <img :src="editedImageUrl" width="100%">
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs6 offset-xs3>
                  <v-btn raised class="primary" @click="onPickImage">사진 바꾸기</v-btn>
                  <input type="file" style="display: none" ref="fileInputForImage" accept="image/*" @change="onImagePicked">
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs6 offset-xs3>
                  <v-btn raised class="green" @click="onPickVoice">감사 인사 바꾸기</v-btn>
                  <input type="file" style="display: none" ref="fileInputForVoice" accept="audio/*" @change="onVoicePicked">
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-flex>
          <v-flex xs7>
            <v-card-text>
              <v-text-field name="name" label="이름" id="name" v-model="editedName" hide-details required></v-text-field>
              <v-text-field name="description" label="각오" id="description" v-model="editedDescription" hide-details multi-line></v-text-field>
              <v-text-field name="numVotes" label="득표수" id="numVotes" v-model="editedNumVotes"></v-text-field>
              <h6>생일을 선택하세요</h6>
              <v-date-picker v-model="editedBirthDate"></v-date-picker>
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
  props: ['idol'],
  data () {
    return {
      editDialog: false,
      editedName: this.idol.name,
      editedDescription: this.idol.description,
      editedImageUrl: this.idol.imageUrl,
      editedImage: null,
      editedVoiceUrl: this.idol.voiceUrl,
      editedVoice: null,
      editedNumVotes: this.idol.numVotes,
      editedBirthDate: new Date(this.idol.birthDate)
    }
  },
  methods: {
    onSaveChanges () {
      if (this.editedName.trim() === '') {
        return
      }
      this.editDialog = false
      this.$store.dispatch('updateIdolData', {
        id: this.idol.id,
        name: this.editedName,
        description: this.editedDescription,
        image: this.editedImage,
        voice: this.editedVoice,
        numVotes: parseInt(this.editedNumVotes),
        birthDate: (new Date(this.editedBirthDate) || new Date()).toISOString()
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

