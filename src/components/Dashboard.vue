<template>
    <div class="ma-5 px-5">
        <v-card class="width: 100% pa-5 my-4" outlined>
        <div class="overline mb-4">DEVICE LIST</div>
        <v-container class="d-flex flex-wrap ma-3">
        <v-card v-for="node in nodes" :key="node.id" class="ma-4"> 
            <v-card-title> {{  node.name }} </v-card-title> 
            <v-card-subtitle>TC: 00:00:00:00 | DSP: {{ (node.dspuse * 100.).toFixed(0) }}%</v-card-subtitle>
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
        this._join_server_room('server', 'nodes');
        let self = this;
        this._io.on('server.nodes', nodes => {
            this.nodes = nodes;
            this.resetAllListeners();
            this.nodes.forEach(node => {
                node.dspuse = 0.3;
                this.node_listeners[node.id] = {
                    dspuse_listener: (dspuse) => {
                        self.setDSPUseVal(node.id, dspuse)
                    }
                }
                this._join_node_room(node.id, 'node-audio-devices', 'dspuse');
                this._io.on(`${node.id}-dspuse`, this.node_listeners[node.id].dspuse_listener);
            });
        });
    },
    beforeDestroy() {
        this._io.removeAllListeners('server.nodes');
        this._leave_server_room('server', 'nodes');
        this.resetAllListeners();
    },
    data() {
        return {
            nodes: [],
            node_listeners: {},
        }
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
                if(this.node_listeners[node.id]) {
                    this._leave_node_room(node.id, 'node-audio-devices', 'dspuse');
                    this._io.off(`${node.id}-dspuse`, this.node_listeners[node.id].dspuse_listener);
                }
            })
        },
        setDSPUseVal(nodeid, val) {
            let n = this.nodes.find(node => node.id == nodeid);
            if(n) {
                console.log(val);
                n.dspuse = val;
                this.$forceUpdate();
            }
        }
    }
}
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