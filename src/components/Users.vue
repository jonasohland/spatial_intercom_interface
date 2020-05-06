<template>
    <div id="users_page">
        <UserSettings
            v-model="selUser"
            :aux="aux"
        />
        <v-btn
            color="red"
            fab
            dark
            top
            right
            class="v-btn--open-inputs"
            @click="drawer = true"
        >
            <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-navigation-drawer v-model="drawer" absolute right clipped temporary>
            <v-list dense nav>
                <v-list-item>
                    <v-btn icon @click.stop="drawer = !drawer">
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                    Inputs
                    <v-spacer />
                    <AddUserDialog
                        v-model="add_user_dialog"
                        :nodes="aux.nodes"
                    />
                    <v-btn icon @click.stop="add_user_dialog.show = true">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-list-item>

                <v-divider></v-divider>
                <v-list nav>
                    <v-list-group
                        v-for="(node, node_idx) in nodes"
                        :key="node.id"
                        @change="deselectUser()"
                    >
                        <template v-slot:activator>
                            <v-list-item-content>
                                <v-list-item-title
                                    v-text="node.nodename"
                                ></v-list-item-title>
                            </v-list-item-content>
                        </template>

                        <v-list-item-group
                            v-model="selected_user"
                            active-class="pink--text"
                            @change="selectUser(node_idx)"
                        >
                            <template v-for="(user, user_idx) in node.users">
                                <v-list-item :key="user_idx">
                                    <template
                                        v-slot:default="{ active, toggle }"
                                    >
                                        <v-list-item-content>
                                            <v-list-item-title
                                                v-text="user.name"
                                            ></v-list-item-title>
                                        </v-list-item-content>
                                    </template>
                                </v-list-item>
                            </template>
                        </v-list-item-group>
                    </v-list-group>
                </v-list>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>
import UserSettings from './UserSettings';
import AddUserDialog from './AddUserDialog';

export default {
    data() {
        return {
            drawer: false,
            selUser: null,
            add_user_dialog: {
                show: false,
                available_channels: [
                ],
            },
            aux: {
                htrks: [],
                nodes: []
            },
            selected_node: 0,
            selected_user: undefined,
            nselected_node: 0,
            nodes: [],
        };
    },
    methods: {
        deselectUser() {
            this.selected_user = undefined;
        },
        selectUser(node) {
            this.selUser = this.nodes[node].users[this.selected_user];
        },
        showAddUserDialog() {
            this.add_user_dialog.show = true;
        },
    },
    mounted() {

        let self = this;

        this._io.on('users.update', data => {
            self.nodes = data.nodes;
            self.aux.nodes = data.inputs;
            self.add_user_dialog.channels = data.channels;
            console.log(data);
        });

        this._io.on('users.headtrackers.update', data => {
            self.aux.htrks = data;
        });

        this._io.emit('users.update');
    },
    components: { UserSettings, AddUserDialog },
};
</script>

<style lang="css" scoped>
.v-btn--open-inputs {
    top: 10;
    right: 20;
    position: absolute;
    margin: 0 0 16px 16px;
}
</style>
