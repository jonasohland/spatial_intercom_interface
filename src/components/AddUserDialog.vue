<template>
    <div id="add_user_dialog">
        <v-dialog v-model="value.show" max-width="700">
            <v-card>
                <v-card-title> Add User </v-card-title>
                <v-divider />
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-select
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
                                    filled
                                    label="User Name"
                                    v-model="name"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <AudioChannelsSelector v-model="channelselect" @input="is_ch_selected=true"/>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions
                    ><v-spacer />
                    <v-btn text @click="value.show = false">CLOSE</v-btn>
                    <v-btn text @click="addUser()" :disabled="canAdd">ADD</v-btn>
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
    props: ['value', 'nodes'],
    data() {
        return {
            name: '',
            node: '',
            channelselect: { channelcount: 2, node: {}, output: true },
            is_ch_selected: false
        };
    },
    methods: {
        addUser() {
            this._emit_to_node(this.selectedNode.id, 'users', 'add.user', SI.basicUserData(this.name, this.channelselect.channelindex))
        },
        refreshInputChannels() {
            if (this.selectedNode) {
                this.channelselect.node = this.selectedNode;
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
            return !(this.name != null && this.name.length > 0 && this.node.length > 0 && this.is_ch_selected);
        }
    },
    components: {
        AudioChannelsSelector
    }
}
</script>