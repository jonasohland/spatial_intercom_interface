import Vue from 'vue';
import App from './App.vue';

import io from 'socket.io-client';

import Notifications from 'vue-notification';

import VueRouter from 'vue-router';
import VueCookies from 'vue-cookies';
import vuetify from './plugins/vuetify';

import Main from './Main.vue';

import Admin from './Admin.vue';
import User from './User.vue';

import Dashboard from './components/Dashboard';
import Headtracking from './components/Headtracking';
import Settings from './components/Settings';
import Users from './components/Users';
import Rooms from './components/Rooms';
import Inputs from './components/Inputs';

import UserPan from './components/UserPan';
import UserSelfSettings from './components/UserSelfSettings';

import AsyncComputed from 'vue-async-computed';

import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@mdi/font/css/materialdesignicons.css';
import 'typeface-roboto/index.css'

Vue.config.productionTip = false;
Vue.config.strict = false;

/*Vue.prototype._io = io(`ws://${location.host.split(':')[0]}:45040`, {
    maxReconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
}); */

Vue.prototype._io = io(`ws://127.0.0.1:45040`, {
    maxReconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
});

Vue.prototype.noderooms = [];
Vue.prototype.serverrooms = [];

Vue.prototype._emit_to_node = (nodeid, module, event, data) => {
    Vue.prototype._io.emit(`-${module}.${event}`, nodeid, data);
};

Vue.prototype._emit_to_server = (event, data) => {
    Vue.prototype._io.emit(`-server.${event}`, data);
};

Vue.prototype._emit_to_server_module = (module, event, data) => {
    console.log(`-${module}.${event}`);
    Vue.prototype._io.emit(`-${module}.${event}`, data);
}

Vue.prototype._join_node_room = (nodeid, module, topic) => {
    Vue.prototype._io.emit('join-node', nodeid, module, topic);

    if (
        Vue.prototype.noderooms.findIndex(
            room =>
                room.nodeid == nodeid &&
                room.module == module &&
                room.topic == topic
        ) == -1
    ) {
        Vue.prototype.noderooms.push({
            nodeid,
            module,
            topic,
        });
    }
};

Vue.prototype._leave_node_room = (nodeid, module, topic) => {
    Vue.prototype._io.emit('leave-node', nodeid, module, topic);

    let roomidx = Vue.prototype.noderooms.findIndex(
        room =>
            room.nodeid == nodeid &&
            room.module == module &&
            room.topic == topic
    );

    if (roomidx != -1) {
        Vue.prototype.noderooms.splice(roomidx, 1);
    }
};

Vue.prototype._join_server_room = (module, topic) => {
    Vue.prototype._io.emit('join-server', module, topic);

    if (
        Vue.prototype.serverrooms.findIndex(
            room => room.module == module && room.topic == topic
        ) == -1
    ) {
        Vue.prototype.serverrooms.push({
            module,
            topic,
        });
    }
};

Vue.prototype._leave_server_room = (module, topic) => {
    Vue.prototype._io.emit('leave-server', module, topic);

    let roomidx = Vue.prototype.serverrooms.findIndex(
        room => room.module == module && room.topic == topic
    );

    if (roomidx != -1) {
        Vue.prototype.serverrooms.splice(roomidx, 1);
    }
};

Vue.prototype._io.on('reconnect', () => {
    Vue.prototype.noderooms.forEach(room => {
        Vue.prototype._io.emit('join-node', room.nodeid, room.module, room.topic);
    });
    Vue.prototype.serverrooms.forEach(room => {
        Vue.prototype._io.emit('join-server', room.module, room.topic);
    });
});

Vue.use(VueRouter);
Vue.use(VueCookies);
Vue.use(vuetify);
Vue.use(Notifications);
Vue.use(AsyncComputed);

const router = new VueRouter({
    mode: 'history',
    base: __dirname,
    routes: [
        {
            path: '/',
            components: {
                default: Main
            }
        },
        {
            path: '/admin',
            components: {
                default: Admin,
            },
            children: [
                { path: 'dashboard', components: { admin: Dashboard } },
                { path: 'headtracking', components: { admin: Headtracking } },
                { path: 'settings', components: { admin: Settings } },
                { path: 'users', components: { admin: Users } },
                { path: 'inputs', components: { admin: Inputs } },
                { path: 'rooms', components: { admin: Rooms } }
            ],
        },
        {
            path: '/user/:id',
            components: {
                default: User,
            },
            children: [
                { path: 'panning', components: { user: UserPan } },
                { path: 'settings', components: { user: UserSelfSettings } },
            ],
        },
    ],
});

App.$_router = router;

new Vue({
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app');
