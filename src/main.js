import Vue from 'vue';
import App from './App.vue';

import io from 'socket.io-client';

import Notifications from 'vue-notification';

import VueRouter from 'vue-router';
import vuetify from './plugins/vuetify';

import Admin from './Admin.vue';
import User from './User.vue'

import Headtracking from './components/Headtracking';
import Settings from './components/Settings';
import Users from './components/Users';
import Inputs from './components/Inputs';

import UserPan from './components/UserPan';
import UserSelfSettings from './components/UserSelfSettings';

import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false;
Vue.config.strict = false;

Vue.prototype._io = io(`ws://${location.host.split(':')[0]}:45040`, {
    maxReconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
});

Vue.use(VueRouter);
Vue.use(vuetify);
Vue.use(Notifications);

const router = new VueRouter({
    mode: 'history',
    base: __dirname,
    routes: [
        {
            path: '/admin',
            components: {
                default: Admin
            },
            children: [
                { path: 'headtracking', components: { admin: Headtracking } },
                { path: 'settings', components: { admin: Settings } },
                { path: 'users', components: { admin: Users } },
                { path: 'inputs', components: { admin: Inputs } },
            ],
        },
        {
            path: '/user/:id',
            components: {
                default: User
            },
            children: [
                { path: 'panning', components: { user: UserPan } },
                { path: 'settings', components: { user: UserSelfSettings }}
            ],
        },
    ],
});

App.$_router = router;

new Vue({
    router,
    vuetify,
    render: h => h(App)
}).$mount('#app');
