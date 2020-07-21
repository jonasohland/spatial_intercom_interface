<template>
    <div id="InputsPage">
        <AddUserDialog v-model="add_user_dialog" :nodes="nodes"/>
        <div style="margin-right: 256px">
            <UserEditor :value="selectedUser"/>
        </div>
        <v-navigation-drawer v-model="drawer" absolute right stateless>
            <v-list dense nav>
                <v-list-item>
                    Users
                    <v-spacer />
                    <v-btn icon @click="add_user_dialog.show=true">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-list-item>
                <v-divider />
                <v-list nav>
                    <v-list-group
                        v-for="(node, node_idx) in nodes"
                        :key="node.id"
                        @change="deselectUser(node_idx)"
                    >
                        <template v-slot:activator>
                            <v-list-item-content>
                                <v-list-item-title
                                    v-text="
                                        nodes.find(n => n.id == node.id).name
                                    "
                                ></v-list-item-title>
                            </v-list-item-content>
                        </template>

                        <v-list-item-group
                            v-model="selected_user_index"
                            active-class="pink--text"
                            @change="selectUser(node_idx)"
                        >
                            <template v-for="(user, user_idx) in node.users">
                                <v-list-item :key="user_idx">
                                    <template v-slot:default="{}">
                                        <v-list-item-content>
                                            <v-list-item-title
                                                v-text="user.name"
                                            ></v-list-item-title>
                                            <v-list-item-subtitle>
                                                Inputs: {{ user.inputs.length }}
                                            </v-list-item-subtitle>
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
import AddUserDialog from './AddUserDialog';
import UserEditor from './UserEditor';

export default {
    data() {
        return {
            drawer: true,
            users: [],
            nodes: [],
            selected_user_index: null,
            add_user_dialog: {
                show: false,
                node: ''
            }
        };
    },
    mounted() {
        this._join_server_room('server', 'nodes');
        this._emit_to_server('nodes');

        this._io.on('server.nodes', new_nodes => {
            console.log(new_nodes);
            this.nodes.forEach(node => {
                if(new_nodes.findIndex(nn => nn.id === node.id) == -1) {
                    console.log("Remove node: " + node.id);
                    this.nodes.splice(this.nodes.indexOf(node), 1);
                    this._leave_node_room(node.id, 'users', 'users');
                } 
            });
            
            new_nodes.forEach(new_node => {
                if(this.nodes.findIndex(n => n.id === new_node.id) == -1) {
                    console.log("Add node: " + new_node.id);
                    new_node.users = [];
                    this.nodes.push(new_node);
                    this._join_node_room(new_node.id, 'users', 'users');
                }
            })
        });

        this._io.on('node.users.update', (nodeid, users) => {
            let n = this.nodes.find(node => node.id == nodeid);
            if(n)
                n.users = users;
        });
    },
    beforeDestroy() {
        this._leave_server_room('server', 'nodes');
        this.nodes.forEach(node => {
            this._leave_node_room(node.id, 'users', 'users');
        })
    },
    computed: {
        selectedUser() {
            if(this.selected_user_index != undefined) {
                return {
                    node: this.nodes[this.selected_node_index],
                    user: this.nodes[this.selected_node_index].users[this.selected_user_index]
                }
            }
            return null;
        }
    },
    methods: {
        selectUser(nodeidx) {
            this.selected_node_index = nodeidx;
        },
        deselectUser() {
            this.selected_node_index = null;
            this.selected_user_index = null;
        }
    },
    components: {
        AddUserDialog, UserEditor
    }
};
</script>
