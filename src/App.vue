<template>
  <v-app style="max-width: 1024px;">
    <v-navigation-drawer temporary v-model="sideNav">
      <v-list>
        <v-list-tile v-for="item in menuItem" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>{{ item.title }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="userIsAuthenticated" @click="onLogout">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Logout</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar dark class="green">
      <span class="hidden-sm-and-up">
        <v-toolbar-side-icon @click.stop="sideNav = !sideNav"></v-toolbar-side-icon>
      </span>
      <v-toolbar-title>
        <router-link to="/" tag="span" style="cursor: pointer">매치업 게임 선정</router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="item in menuItem" :key="item.title" :to="item.link">
          <v-icon left>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
        <v-btn flat v-if="userIsAuthenticated" @click="onLogout">
          <v-icon left>exit_to_app</v-icon>
          로그아웃
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <main>
      <router-view></router-view>
    </main>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      sideNav: false
    }
  },
  computed: {
    menuItem () {
      let menuItems = [
        // { icon: 'face', title: '가입', link: '/signup' },
        { icon: 'group', title: '게임 목록', link: '/games' },
        { icon: 'lock_open', title: '로그인', link: '/signin' }
      ]
      if (this.userIsAuthenticated) {
        menuItems = [
          { icon: 'videogame_asset', title: '게임 목록', link: '/games' },
          { icon: 'add_to_queue', title: '게임 추가', link: '/new-game' }
          // { icon: 'face', title: '프로필', link: '/profile' }
        ]
      }
      return menuItems
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    }
  },
  methods: {
    onLogout () {
      this.$store.dispatch('logout')
    }
  }
}
</script>

<style lang="stylus">
  @import './stylus/main'
</style>
