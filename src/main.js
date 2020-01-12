import Vue from 'vue';
import App from './App.vue';

import io from 'socket.io-client';

import Notifications from 'vue-notification';

import VueRouter from 'vue-router';
import vuetify from './plugins/vuetify';

import Headtracking from './components/Headtracking';
import Settings from './components/Settings';
import Users from './components/Users';
import Inputs from './components/Inputs';

Vue.config.productionTip = false;

location.host.split(':')[0];

Vue.prototype._io = io(`ws://${location.host.split(':')[0]}:45040`, {
    maxReconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 1000,
});

Vue.use(VueRouter);
Vue.use(vuetify);
Vue.use(Notifications);

const router = new VueRouter({
    mode: 'history',
    base: __dirname,
    routes: [
        { path: '/headtracking', component: Headtracking },
        { path: '/settings', component: Settings },
        { path: '/users', component: Users },
        { path: '/inputs', component: Inputs }
    ],
});

App.$_router = router;

new Vue({
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app');
