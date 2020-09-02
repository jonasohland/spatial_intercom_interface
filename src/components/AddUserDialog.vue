<template>
    <div id="add_user_dialog">
        <v-dialog v-model="value.show" max-width="700" persistent>
            <v-card>
                <v-card-title> Add User </v-card-title>
                <v-divider />
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-select
                                    hide-details
                                    filled
                                    :items="nodenames"
                                    label="Node"
                                    v-model="node"
                                    @change="refreshInputChannels()"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    hide-details
                                    filled
                                    label="User Name"
                                    v-model="name"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <AudioChannelsSelector
                                    v-model="channelselect"
                                    @input="is_ch_selected = true"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-checkbox
                                    hide-details
                                    label="Managed Panel"
                                    v-model="managed"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col sm="2">
                                <v-autocomplete
                                    label="Node"
                                    hide-details
                                    @change="setNode(artist_node)"
                                    v-model="artist_node"
                                    :items="availableNodes"
                                    :disabled="!managed"
                                />
                            </v-col>
                            <v-col>
                                <v-autocomplete
                                    label="Port"
                                    hide-details
                                    v-model="artist_port"
                                    :disabled="!managed"
                                    :items="ports"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-divider />
                <v-card-actions
                    ><v-spacer />
                    <v-btn text @click="value.show = false">CLOSE</v-btn>
                    <v-btn text @click="addUser()" :disabled="canAdd"
                        >ADD</v-btn
                    >
                </v-card-actions>
                <v-divider />
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import AudioChannelsSelector from './AudioChannelsSelector';
import * as SI from 'spatial_intercom_server';
import roomcolors from './roomcolors';

export default {
    props: ['value', 'nodes', 'artist_nodes'],
    data() {
        return {
            managed: false,
            ports: [],
            artist_node: -1,
            artist_port: -1,
            name: '',
            node: '',
            channelselect: { channelcount: 5, node: {}, output: true },
            is_ch_selected: false,
        };
    },
    methods: {
        addUser() {
            let port;

            if (this.managed) {
                port = {
                    Node: this.artist_node,
                    Port: this.artist_port,
                    IsInput: true
                }
            } else {
                port = {
                    Node: 0,
                    Port: 0,
                    IsInput: false
                }
            }

            console.log(SI.basicUserData(this.name, this.channelselect.channelindex, port));

            this._emit_to_node(
                this.selectedNode.id,
                'users',
                'add.user',
                SI.basicUserData(this.name, this.channelselect.channelindex, port)
            );
        },
        refreshInputChannels() {
            if (this.selectedNode) {
                this.channelselect.node = this.selectedNode;
            }
        },
        setNode(node) {
            this.ports = this.availablePorts(node, true);
        },
        availablePorts(nodeid, is_src) {
            if (nodeid == -1) return [];
            else {
                let node = this.artist_nodes.find(n => n.id == nodeid);
                let out = [];
                for (let port of node.ports) {
                    if ((is_src && port.Input) || (!is_src && port.Output)) {
                        out.push({
                            text: `${port.Name} - ${port.PortType}`,
                            value: port.Port,
                        });
                        if (port.HasSecondChannel) {
                            out.push({
                                text: `${port.Name} - ${port.PortType} - 2nd Channel`,
                                value: port.Port + 1,
                            });
                        }
                    }
                }
                return out;
            }
        },
    },
    computed: {
        selectedNode: function() {
            return this.nodes.find(node => node.name == this.node);
        },
        nodenames: function() {
            return this.nodes.map(n => n.name);
        },
        canAdd() {
            return !(
                this.name != null &&
                this.name.length > 0 &&
                this.node.length > 0 &&
                this.is_ch_selected
            );
        },
        availableNodes() {
            return this.artist_nodes.map(node => node.id);
        },
    },
    components: {
        AudioChannelsSelector,
    }
};
</script>
