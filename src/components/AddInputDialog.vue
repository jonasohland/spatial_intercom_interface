<template>
    <div id="add_user_dialog">
        <v-dialog v-model="value.show" max-width="700">
            <v-card>
                <v-card-title> Add Input </v-card-title>
                <v-divider />
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-select
                                    filled
                                    :items="types"
                                    label="Format"
                                    v-model="type"
                                    @change="refreshInputChannels()"
                                />
                            </v-col>
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
                                    label="Input Name"
                                    v-model="name"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <AudioChannelsSelector
                                    v-model="channelselect"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions
                    ><v-spacer />
                    <v-btn text @click="value.show = false">CLOSE</v-btn>
                    <v-btn text @click="addInput()" :disabled="!canAdd">ADD</v-btn>
                </v-card-actions>
                <v-divider />
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import AudioChannelsSelector from './AudioChannelsSelector';
import * as SI from 'spatial_intercom_server';

export default {
    props: ['value', 'nodes'],
    data() {
        return {
            name: '',
            type: null,
            node: '',
            channelselect: { channelcount: undefined, channelindex: -1, node: {} },
        };
    },
    methods: {
        addInput() {
            if (
                this.name &&
                this.channelselect.channelcount != null &&
                this.channelselect.channelindex != null &&
                this.type != null
            ) {
                this._emit_to_node(
                    this.selectedNode.id,
                    'inputs',
                    'add',
                    SI.basicNodeAudioInputDescription(
                        this.name,
                        this.channelselect.channelindex,
                        this.type
                    )
                );
            }
        },
        refreshInputChannels() {
            if (this.selectedNode) {
                this.channelselect.node = this.selectedNode;
            }

            if (this.type != undefined) {
                this.channelselect.channelcount =
                    SI.SourceUtils[SI.PortTypes[this.type]].channels;
            }

            console.log(this.channelselect);
        },
    },
    computed: {
        nodenames: function() {
            return this.nodes.map(n => n.name);
        },
        types: function() {
            let out = [];
            for (let _key of Object.keys(SI.PortTypes)) {
                if (isNaN(_key)) out.push(_key);
            }
            out.shift();
            return out;
        },
        selectedNode: function() {
            return this.nodes.find(node => node.name == this.node);
        },
        canAdd() {
            // looks stupid, but we have to access all the props for vue to register them as dependencies
            let ok = true;
            if(this.name) {
                if(this.name.length < 1)
                    ok = false;
            } else
                ok = false;

            if(this.type != null) {
                if(this.type.length < 1)
                    ok = false;
            } else
                ok = false;

            if(this.channelselect) {
                if(this.channelselect.channelindex != null) {
                    if(isNaN(this.channelselect.channelindex) || this.channelselect.channelindex < 0)
                        ok = false;
                }
                    else ok = false;
            } else ok = false;

            return ok;
        }
    },
    components: {
        AudioChannelsSelector,
    },
};
</script>
