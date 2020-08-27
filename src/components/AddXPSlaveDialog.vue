<template>
    <v-dialog v-model="show" max-width="800" persistent>
        <v-card>
            <v-card-title>
                Add Slave XP
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col sm="1" align-self="center">
                        FROM
                    </v-col>
                    <v-col sm="2">
                        <v-autocomplete
                            label="Node"
                            hide-details
                            :items="availableNodes"
                            v-model="xp.Source.Node"
                            @change="setSrcNode(xp.Source.Node)"
                        >
                        </v-autocomplete>
                    </v-col>
                    <v-col>
                        <v-autocomplete
                            label="Port"
                            hide-details
                            :items="src_ports"
                            v-model="xp.Source.Port"
                        >
                        </v-autocomplete>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col sm="1" align-self="center">
                        TO
                    </v-col>
                    <v-col sm="2">
                        <v-autocomplete
                            label="Node"
                            hide-details
                            :items="availableNodes"
                            v-model="xp.Destination.Node"
                            @change="setDestNode(xp.Destination.Node)"
                        >
                        </v-autocomplete>
                    </v-col>
                    <v-col>
                        <v-autocomplete
                            label="Port"
                            hide-details
                            :items="dest_ports"
                            v-model="xp.Destination.Port"
                        >
                        </v-autocomplete>
                    </v-col>
                </v-row>
                <v-row class="ml-1 d-flex flex-row">
                    <v-col>
                        <v-checkbox label="Single" v-model="single" />
                    </v-col>
                    <v-col>
                        <v-checkbox label="Conf" v-model="conf" />
                    </v-col>
                    <v-col>
                        <v-checkbox label="XP" v-model="set" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn text @click="$emit('close')">CLOSE</v-btn>
                <v-btn text @click="doAdd()">ADD</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: [ 'show', 'masterid', 'artist_nodes', 'node' ],
    data() {
        return {
            dest_ports: [],
            src_ports: [],
            conf: false,
            single: true,
            set: false,
            xp: {
                Source: {
                    Node: null,
                    Port: null,
                    IsInput: true
                },
                Destination: {
                    Node: null,
                    Port: null,
                    IsInput: false
                }
            }
        };
    },
    methods: {
        doAdd(){
            this._emit_to_node(this.node.id, 'rrcs', 'xp-add-slave', {
                masterid: this.masterid,
                slave: {
                    conf: this.conf,
                    single: this.single,
                    set: this.set,
                    xp: this.xp
                }
            });
            this.xp = {
                Source: {
                    Node: null,
                    Port: null,
                    IsInput: true
                },
                Destination: {
                    Node: null,
                    Port: null,
                    IsInput: false
                }
            }
            this.single = true;
            this.conf = false;
            this.set = false;
            this.$emit("close");
        },
        setSrcNode(node) {
            this.src_ports = this.availablePorts(node, true);
        },
        setDestNode(node) {
            this.dest_ports = this.availablePorts(node, false);
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
        availableNodes() {
            return this.artist_nodes.map(node => node.id);
        },
    }
};
</script>
