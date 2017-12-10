import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Idols from '@/components/Idol/Idols'
import CreateIdol from '@/components/Idol/CreateIdol'
import Idol from '@/components/Idol/Idol'
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
      path: '/idols',
      name: 'Idols',
      component: Idols
    },
    {
      path: '/new-idol',
      name: 'CreateIdol',
      component: CreateIdol,
      beforeEnter: AuthGuard
    },
    {
      path: '/idols/:id',
      name: 'Idol',
      props: true,
      component: Idol
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
