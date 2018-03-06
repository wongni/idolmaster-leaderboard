import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Games from '@/components/Game/Games'
import CreateGame from '@/components/Game/CreateGame'
import Game from '@/components/Game/Game'
import Profile from '@/components/User/Profile'
import Signup from '@/components/User/Signup'
import Signin from '@/components/User/Signin'
import AuthGuard from './auth-guard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/games',
      name: 'Games',
      component: Games
    },
    {
      path: '/new-game',
      name: 'CreateGame',
      component: CreateGame,
      beforeEnter: AuthGuard
    },
    {
      path: '/games/:id',
      name: 'Game',
      props: true,
      component: Game
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      beforeEnter: AuthGuard
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin
    }
  ],
  mode: 'history'
})
