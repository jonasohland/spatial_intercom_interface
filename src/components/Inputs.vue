<template>
    <div id="InputsPage">
        <AddInputDialog v-model="add_input_dialog" :nodes="nodes"/>
        <div style="margin-right: 256px">
        <InputEditor :value="selectedInput"/>
        </div>
        <v-navigation-drawer v-model="drawer" absolute right stateless>
            <v-list dense nav>
                <v-list-item>
                    Inputs
                    <v-spacer/>
                    <v-btn icon @click.stop="add_input_dialog.show = true">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-list-item>
                <v-divider/>
                <v-list nav>
                        <v-list-group
                            v-for="(node, node_idx) in nodes"
                            :key="node.id"
                            @change="deselectInput(node_idx)"
                        >
                            <template v-slot:activator>
                                <v-list-item-content>
                                    <v-list-item-title
                                        v-text="nodes.find(n => n.id == node.id).name"
                                    ></v-list-item-title>
                                </v-list-item-content>
                            </template>

                            <v-list-item-group
                                v-model="selected_input_index"
                                active-class="pink--text"
                                @change="selectInput(node_idx)"
                            >
                                <template
                                    v-for="(input, input_idx) in node.inputs"
                                >
                                    <v-list-item :key="input_idx">
                                        <template
                                            v-slot:default="{}"
                                        >
                                            <v-list-item-content>
                                                <v-list-item-title
                                                    v-text="input.name"
                                                ></v-list-item-title>
                                                <v-list-item-subtitle>
                                                    {{ inputTypeName(input.type) }}
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
import AddInputDialog from './AddInputDialog';
import InputEditor from './InputEditor';
import * as SI from 'spatial_intercom_server'

export default {
    data() {
        return {
            drawer: true,

            selected_input_index: 0,
            selected_node_index: null,

            nodes: [],

            add_input_dialog: {
                node: '',
                formats: ['mono', 'stereo', '5.1'],
                show: false
            },
        };
    },

    methods : {
        deselectInput(node) {
            this.selected_node_index = node;
        },
        selectInput(node) {
            this.selected_node_index = node;
        },
        inputTypeName(type) {
            return type;
        },
        inputTypeChannelCount(type) {
            return SI.PortTypeChannelCount[SI.PortTypes[type]];
        }
    },
    computed: {
        selectedInput() {
            if(this.selected_node_index != undefined) {
                return  {
                    node: this.nodes[this.selected_node_index],
                    input: this.nodes[this.selected_node_index].inputs[this.selected_input_index]
                }
            }
            return null;
        }
    },
    mounted() {
        let self = this;
        this._join_server_room('server', 'nodes');
        this._emit_to_server('nodes');

        this._io.on('server.nodes', nodes => {

            this.nodes = nodes.map(node => {
                node.inputs = [];
                return node;
            });

            nodes.forEach(node => {
                self._emit_to_node(node.id, 'inputs', 'update');
            });
        });

        this._io.on('inputs.update', (nodeid, inputs) => {
            let n = this.nodes.find(node => node.id == nodeid);
            n.inputs = inputs;
        });
    },
    beforeDestroy() {
        this._leave_server_room('server', 'nodes');
        this._io.removeAllListeners('server.nodes');
        this._io.removeAllListeners('inputs.update');
    },
    components: {
        AddInputDialog,
        InputEditor
    },
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
