<template>
    <div id="users_page">
        <v-row align="stretch" justify="space-around">
            <v-col class="flex-grow-1" cols="20">
                <UserSettings
                    v-model="nodes[nselected_node].users[selected_user]"
                    :aux="aux"
                />
            </v-col>
            <v-col class="flex-shrink-1" cols="3">
                <v-card>
                    <v-toolbar color="indigo" dark>
                        Users <v-spacer />
                        <v-btn icon @click="showAddUserDialog()">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                        <AddUserDialog v-model="add_user_dialog" :nodes="aux.nodes"/>
                    </v-toolbar>
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
                                <template
                                    v-for="(user, user_idx) in node.users"
                                >
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
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import UserSettings from './UserSettings';
import AddUserDialog from './AddUserDialog';
import { mdiCpu64Bit } from '@mdi/js';

export default {
    data() {
        return {
            add_user_dialog: {
                show: false,
                available_channels : [
                    {
                        i: 0,
                        name: "Input 1",
                    },
                    {
                        i: 1,
                        name: "Input 2",
                    }
                    ,{
                        i: 2,
                        name: "Input 3",
                    }
                    ,{
                        i: 3,
                        name: "Input 4",
                    }
                ]
            },
            aux: {
                htrks: [3, 5, 9],
                nodes: [
                    {
                        nodename: 'jonasohland-mbp-2',
                        id: 'bla',
                        inputs: [
                            {
                                id: 0,
                                name: "Program",
                                format: "5.1"
                            },
                            {
                                id: 1,
                                name: "Program",
                                format: "stereo"
                            },
                            {
                                id: 2,
                                name: "Regie",
                                format: "mono"
                            }
                        ]
                    },
                    {
                        nodename: 'jonasohland-mbp-3',
                        id: 'blub',
                        inputs: [
                            {
                                id: 0,
                                name: "Program 2",
                                format: "5.1"
                            },
                            {
                                id: 1,
                                name: "Program 2",
                                format: "5.1"
                            }
                        ]
                    }
                ]
            },
            nodeIcon: mdiCpu64Bit,
            selected_node: 0,
            selected_user: undefined,
            nselected_node: 0,
            nodes: [
                {
                    nodename: 'Test Node',
                    id: "bla",
                    active: false,
                    users: [
                        {
                            id: 0,
                            name: 'Horst',
                            nodename: 'jonasohland-mbp-2',
                            nid: 'bla',
                            advanced: true,
                            selected_inputs: [],
                            inputs: [
                                {
                                    id: 1,
                                    name: "Test",
                                    azm: 0,
                                    elv: 0,
                                    mute: true
                                }
                            ],
                        },
                        {
                            id: 1,
                            nid: 'bla',
                            name: 'Udo',
                            nodename: 'jonasohland-mbp-2',
                            advanced: false,
                            selected_inputs: [],
                            inputs: [],
                        },
                    ],
                },
                {
                    nodename: 'Test Node 2',
                    id: 'blub',
                    active: false,
                    users: [
                        {
                            id: 0,
                            nid: 'bla',
                            name: 'Günther',
                            nodename: 'jonasohland-mbp-2',
                            advanced: true,
                            inputs: [],
                            selected_inputs: [],
                        },
                    ],
                },
            ],
        };
    },
    methods: {
        deselectUser() {
            this.selected_user = undefined;
        },
        selectUser(node) {
            this.nselected_node = node;
        },
        showAddUserDialog(){
            this.add_user_dialog.show = true;
        }
    },
    components: { UserSettings, AddUserDialog },
};
</script>
