<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm8 offset-sm3>
        <h4>새로운 아이돌 영입하기</h4>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs12>
        <form @submit.prevent="onCreateIdol">
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field name="name" label="이름" id="name" v-model="name" hide-details required></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field name="numVotes" label="득표수" id="numVotes" v-model="numVotes" :rules="voteRules" required></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-btn raised class="primary" @click="onPickFile">사진 올리기*</v-btn>
              <input type="file" style="display: none" ref="fileInput" accept="image/*" @change="onFilePicked">
            </v-flex>
          </v-layout>
          <v-layout row class="mt-2">
            <v-flex xs12 sm6 offset-sm3 v-if="imageUrl">
              <img :src="imageUrl" height="300">
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field name="japaneseName" label="일본 이름" id="japaneseName" v-model="japaneseName" hide-details></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field name="voiceActor" label="성우" id="voiceActor" v-model="voiceActor" hide-details></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field name="age" label="나이" id="age" v-model="age" hide-details></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <h6>생일을 선택하세요</h6>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-date-picker v-model="date"></v-date-picker>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field name="description" label="각오" id="description" v-model="description" multi-line hide-details></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-btn class="primary" :disabled="!formIsValid" type="submit">아이돌 영입하기</v-btn>
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
      japaneseName: '',
      voiceActor: '',
      age: '',
      date: '',
      birthDate: new Date(),
      numVotes: '',
      imageUrl: '',
      description: '',
      image: null,
      voteRules: [
        (v) => !!v || '투표수를 입력하세요',
        (v) => /\d+/.test(v) || '0 이상의 숫자를 입력하세요'
      ]
    }
  },
  computed: {
    formIsValid () {
      return this.name !== '' && this.imageUrl !== '' && this.numVotes >= 0
    },
    submittableDate () {
      return new Date(this.date) || new Date()
    }
  },
  methods: {
    onCreateIdol () {
      if (!this.formIsValid) {
        return
      }
      if (!this.imageUrl && !this.image) {
        return
      }
      const idolData = {
        name: this.name,
        imageUrl: this.imageUrl,
        image: this.image,
        japaneseName: this.japaneseName,
        voiceActor: this.voiceActor,
        age: this.age,
        birthDate: this.submittableDate,
        description: this.description,
        numVotes: parseInt(this.numVotes)
      }
      this.$store.dispatch('createIdol', idolData)
      this.$router.push('/idols')
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
