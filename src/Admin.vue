/* eslint-disable no-console */

<template>
    <v-app id="admin-container">
        <v-navigation-drawer v-model="drawer" app expand-on-hover>
            <v-list dense nav>
                <v-list-item link v-on:click="nav('/admin/dashboard')">
                    <v-list-item-action>
                        <v-icon>dashboard</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Dashboard</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link v-on:click="nav('/admin/users')">
                    <v-list-item-action>
                        <v-icon>perm_identity</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Users</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link v-on:click="nav('/admin/rooms')">
                    <v-list-item-action>
                        <v-icon>settings_overscan</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Rooms</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link v-on:click="nav('/admin/inputs')">
                    <v-list-item-action>
                        <v-icon>input</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Inputs</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link v-on:click="nav('/admin/headtracking')">
                    <v-list-item-action>
                        <v-icon>3d_rotation</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Headtracking</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link v-on:click="nav('/admin/xpsync')">
                    <v-list-item-action>
                        <v-icon>sync</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>XP Sync</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link v-on:click="nav('/admin/settings')">
                    <v-list-item-action>
                        <v-icon>settings</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Audio Settings</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app id="mainnav">
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <v-toolbar-title>Spatial Intercom Manager</v-toolbar-title>
            <v-spacer/>
            <span class="mr-3">
                COMMIT DSP GRAPH: 
            </span>
                <v-overflow-btn
                    class="mt-5 mr-6"
                    label="COMMIT TO DSP"
                    style="max-width: 300px"
                    target="#mainnav"
                    segmented
                    :items="nodes"
                    :disabled="!online"
                >
                    COMMIT TO DSP
                </v-overflow-btn>
            <span>Server:</span>
            <span v-if="online">
                <v-chip class="ma-2" color="green" text-color="white"
                    >ONLINE</v-chip
                >
            </span>
            <span v-if="!online">
                <v-chip class="ma-2" color="red" text-color="white"
                    >OFFLINE</v-chip
                >
            </span>
        </v-app-bar>

        <v-main>
            <router-view class="view" name="admin"></router-view>
            <notifications group="all" position="bottom left" />
        </v-main>

        <v-footer app>
            <span>&copy; 2020 Jonas Ohland</span>
            <v-spacer></v-spacer>
            <span>
                <v-switch
                    v-model="is_dark"
                    primary
                    label="Dark"
                    style="padding: 0px; margin: 0px"
                    hide-details
                    @change="changeTheme()"
                />
            </span>
        </v-footer>
    </v-app>
</template>

<script>
const MSGTypes = Object.freeze({ INFO: 1, WARN: 2, ERROR: 3 });
import truncate from 'truncate';

function msgTypeString(ty) {
    switch (ty) {
        case MSGTypes.INFO:
            return 'success';
        case MSGTypes.WARN:
            return 'warning';
        case MSGTypes.ERROR:
            return 'error';
    }
}

export default {
    props: {
        source: String,
    },
    created() {
        this.$vuetify.theme.dark = false;
    },
    mounted() {
        let self = this;

        this.online = this._io.connected;

        this._join_server_room('server', 'DSP_NODE');
        this.dspnodes_listener = new_nodes => {
            this.nodes = new_nodes.map(node => {
                return {
                    text: truncate(node.name, 24),
                    callback: () => {
                        console.log("Rebuild node " + node.id);
                        this._emit_to_node(node.id, 'graph-controller', 'committnodeodsp');
                    },
                };
            });
        }

        this._io.on('server.nodes.DSP_NODE', this.dspnodes_listener);

        this._io.on('connect', () => {
            self.conMsg('Connected to server', MSGTypes.INFO);
            self.online = true;
        });

        this._io.on('disconnect', () => {
            self.conMsg('Lost connection to server', MSGTypes.ERROR);
            self.online = false;
        });

        this._io.on('htrk.connected', (id, addr) => {
            self.htrkMsg(
                `Found a new Headtracker:<br> id: ${id}, address: ${addr}`,
                MSGTypes.INFO
            );
        });

        this._io.on('htrk.disconnected', id => {
            self.htrkMsg(
                `Lost connection to Headtracker #${id}`,
                MSGTypes.WARN
            );
        });

        this._io.on('htrk.reconnected', id => {
            self.htrkMsg(`Headtracker #${id} reconnected`, MSGTypes.INFO);
        });

        this._io.on('htrk.saved', id => {
            self.htrkMsg(
                `Configuration on Headtracker #${id} saved successfully`,
                MSGTypes.INFO
            );
        });

        this._io.on('htrk.gyro.changed', gystate => {
            if (gystate.prs) {
                if (gystate.rdy)
                    self.htrkMsg(
                        `Gyroscope on headtracker #${gystate.id} is ready`,
                        MSGTypes.INFO
                    );
                else
                    self.htrkMsg(
                        `Gyroscope on headtracker #${gystate.id} connected`
                    );
            } else {
                self.htrkMsg(
                    `Gyroscope on headtracker #${gystate.id} disconnected`,
                    MSGTypes.WARN
                );
            }
        });

        this._io.on('showerror', (title, err_string) => {
            self.errorMsg(title, err_string);
        });

        this._io.on('notification', (title, err_string) => {
            self.notificationMsg(title, err_string);
        });

        this._io.on('warning', (title, err_string) => {
            self.warnMsg(title, err_string);
        });

        this.$cookies.config('30d');
        let theme_is_dark = this.$cookies.get('si-manager-theme-dark');

        if (typeof theme_is_dark == 'string') {
            switch (theme_is_dark) {
                case 'true':
                    theme_is_dark = true;
                    break;
                default:
                    theme_is_dark = false;
            }
        }

        if (theme_is_dark != null) this.is_dark = theme_is_dark;
        else theme_is_dark = false;

        this.is_dark = theme_is_dark;

        this.$vuetify.theme.dark = this.is_dark;
        this.$cookies.set('si-manager-theme-dark', this.is_dark);
    },
    data: () => ({
        drawer: null,
        dsp: false,
        is_dark: false,
        online: false,
        nodes: [],
    }),
    computed: {
    },
    methods: {
        commit() {
            this._io.emit('-graph-controller.committodsp');
        },
        nav(target) {
            if (this.$route.path != target) {
                this._io.emit('nav', target);
                this.$router.push(target);
            }
        },
        changeTheme() {
            this.$vuetify.theme.dark = this.is_dark;
            this.$cookies.remove('si-manager-theme-dark');
            this.$cookies.set('si-manager-theme-dark', this.is_dark);
        },
        htrkMsg(msg, ty) {
            this.$notify({
                group: 'all',
                title: 'Headtracking',
                type: msgTypeString(ty),
                text: msg,
            });
        },
        conMsg(msg, ty) {
            this.$notify({
                group: 'all',
                title: 'Connection',
                type: msgTypeString(ty),
                text: msg,
            });
        },
        errorMsg(title, msg) {
            this.$notify({
                group: 'all',
                title,
                type: msgTypeString(MSGTypes.ERROR),
                text: msg,
            });
        },
        warnMsg(title, msg) {
            this.$notify({
                group: 'all',
                title,
                type: msgTypeString(MSGTypes.WARN),
                text: msg,
            });
        },
        notificationMsg(title, msg) {
            this.$notify({
                group: 'all',
                title,
                type: msgTypeString(MSGTypes.INFO),
                text: msg,
            });
        },
    },
};
</script>
