<template>
    <div class="ma-5 px-5">
        <v-card class="width: 100% pa-5 my-4" outlined>
            <div class="overline mb-4">DSP Nodes</div>
            <v-container class="d-flex flex-wrap ma-3">
                <v-card v-for="node in nodes" :key="node.id" class="ma-4">
                    <v-card-title> {{ node.name }} </v-card-title>
                    <v-card-subtitle
                        >TC: 00:00:00:00 | DSP:
                        {{ (node.dspuse * 100).toFixed(0) }}%</v-card-subtitle
                    >
                    <v-divider />
                    <v-card-text class="mt-3">
                        <p>
                            Graph Nodes: {{ node.dspstats.num_dspobjects
                            }}<br />
                            Render Operations: {{ node.dspstats.num_renderops
                            }}<br />
                            Processing Channels:
                            {{ node.dspstats.num_connections }}<br />
                            Processing Buses: {{ node.dspstats.num_ports
                            }}<br />
                        </p>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions>
                        <v-btn text @click="reloadNode(node.id)">
                            RELOAD
                        </v-btn>
                        <v-btn text color="red">
                            RESET
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-container>
        </v-card>
        <v-card class="width: 100% pa-5" outlined>
            <div class="overline mb-4">RRCS</div>
            <v-btn @click="reconnectRRCS()">RECONNECT</v-btn>
        </v-card>
    </div>
</template>

<script>
export default {
    mounted() {
        this._join_server_room('server', 'DSP_NODE');
        let self = this;
        this.dspnodes_listener = nodes => {
            this.nodes = nodes;
            this.resetAllListeners();
            this.nodes.forEach(node => {
                node.dspuse = 0.3;
                node.dspstats = this.defaultDSPStats();
                this.node_listeners[node.id] = {
                    dspuse_listener: dspuse => {
                        self.setDSPUseVal(node.id, dspuse);
                    },
                    dspstats_listener: dspstats => {
                        self.setDSPStats(node.id, dspstats);
                    },
                };
                this._join_node_room(node.id, 'node-audio-devices', 'dspuse');
                this._join_node_room(node.id, 'dsp-process', 'dspstats');
                this._io.on(
                    `${node.id}-dspuse`,
                    this.node_listeners[node.id].dspuse_listener
                );
                this._io.on(
                    `${node.id}.dspstats`,
                    this.node_listeners[node.id].dspstats_listener
                );
            });
        };

        this._io.on('server.nodes.DSP_NODE', this.dspnodes_listener);
    },
    beforeDestroy() {
        this._io.off('server.nodes.DSP_NODE', this.dspnodes_listener);
        this._leave_server_room('server', 'DSP_NODE');
        this.resetAllListeners();
    },
    data() {
        return {
            nodes: [],
            node_listeners: {},
        };
    },
    methods: {
        reconnectRRCS() {
            this._emit_to_server_module('rrcs', 'reconnect-rrcs');
        },
        reloadNode(nodeid) {
            this._emit_to_node(nodeid, 'graph-controller', 'rebuildgraph');
        },
        resetAllListeners() {
            this.nodes.forEach(node => {
                if (this.node_listeners[node.id]) {
                    this._leave_node_room(
                        node.id,
                        'node-audio-devices',
                        'dspuse'
                    );
                    this._leave_node_room(node.id, 'dsp-process', 'dspstats');
                    this._io.off(
                        `${node.id}-dspuse`,
                        this.node_listeners[node.id].dspuse_listener
                    );
                    this._io.off(
                        `${node.id}.dspstats`,
                        this.node_listeners[node.id].dspstats_listener
                    );
                }
            });
        },
        setDSPUseVal(nodeid, val) {
            let n = this.nodes.find(node => node.id == nodeid);
            if (n) {
                n.dspuse = val;
                this.$forceUpdate();
            }
        },
        defaultDSPStats() {
            return {
                num_dspobjects: 0,
                num_connections: 0,
                num_ports: 0,
                num_renderops: 0,
            };
        },
        setDSPStats(nodeid, val) {
            let n = this.nodes.find(node => node.id == nodeid);
            if (n) {
                if (val) n.dspstats = val;
                else n.dspstats = this.defaultDSPStats();

                this.$forceUpdate();
            }
        },
    },
};
</script>

<style>
#node_list {
    float: bottom;

    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 30px;
    margin-right: 30px;

    flex-basis: 100%;
}
</style>
