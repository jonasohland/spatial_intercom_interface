<template>
    <v-dialog v-model="value.show" max-width="800" persistent>
        <v-card>
            <v-card-title> Add XPSync </v-card-title>
            <v-divider />
            <v-card-text>
                <v-row>
                    <v-col>
                        Volume Source
                    </v-col>
                </v-row>
                <v-row>
                    <v-col sm="1" align-self="center" class="mt-4">
                        FROM
                    </v-col>
                    <v-col sm="2">
                        <v-autocomplete
                            label="Node"
                            :disabled="src_wildcard"
                            hide-details
                            :items="availableNodes"
                            v-model="master.xp.Source.Node"
                            @change="setSrcNode(master.xp.Source.Node)"
                        >
                        </v-autocomplete>
                    </v-col>
                    <v-col>
                        <v-autocomplete
                            label="Port"
                            :disabled="src_wildcard"
                            hide-details
                            :items="src_avail_ports"
                            v-model="master.xp.Source.Port"
                        >
                        </v-autocomplete>
                    </v-col>
                    <v-col sm=1>
                        <v-checkbox label="Any" :disabled="dest_wildcard" v-model="src_wildcard"/>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col sm="1" align-self="center" class="mt-4">
                        TO
                    </v-col>
                    <v-col sm="2">
                        <v-autocomplete
                            label="Node"
                            hide-details
                            :disabled="dest_wildcard"
                            :items="availableNodes"
                            v-model="master.xp.Destination.Node"
                            @change="setDestNode(master.xp.Destination.Node)"
                        >
                        </v-autocomplete>
                    </v-col>
                    <v-col>
                        <v-autocomplete
                            label="Port"
                            hide-details
                            :disabled="dest_wildcard"
                            :items="dest_avail_ports"
                            v-model="master.xp.Destination.Port"
                        >
                        </v-autocomplete>
                    </v-col>
                    <v-col sm=1>
                        <v-checkbox label="Any" :disabled="src_wildcard" v-model="dest_wildcard"/>
                    </v-col>
                </v-row>
                <v-col>
                    <v-checkbox
                        label="Use Conference Volume"
                        v-model="master.conf"
                        hide-details
                    ></v-checkbox>
                </v-col>
            </v-card-text>
            <v-divider />
            <v-card-text>
                <v-row>
                    <v-col>
                        Volume Destinations
                    </v-col>
                </v-row>
                <v-list style="max-height: 400; overflow-y: auto">
                    <div
                        v-for="(item, i) in destinations"
                        :key="i"
                        class="my-4"
                    >
                        <v-divider v-if="i > 0" />
                        <v-row>
                            <v-col sm="1" align-self="center">
                                FROM
                            </v-col>
                            <v-col sm="2">
                                <v-autocomplete
                                    label="Node"
                                    hide-details
                                    :items="availableNodes"
                                    v-model="item.xpvt.xp.Source.Node"
                                    @change="destSetSrcNode(i)"
                                >
                                </v-autocomplete>
                            </v-col>
                            <v-col>
                                <v-autocomplete
                                    label="Port"
                                    hide-details
                                    :items="item.src_ports"
                                    v-model="item.xpvt.xp.Source.Port"
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
                                    v-model="item.xpvt.xp.Destination.Node"
                                    @change="destSetDestNode(i)"
                                >
                                </v-autocomplete>
                            </v-col>
                            <v-col>
                                <v-autocomplete
                                    label="Port"
                                    hide-details
                                    :items="item.dest_ports"
                                    v-model="item.xpvt.xp.Destination.Port"
                                >
                                </v-autocomplete>
                            </v-col>
                        </v-row>
                        <v-row class="ml-1 d-flex flex-row">
                            <v-col>
                                <v-checkbox
                                    label="Single"
                                    v-model="item.xpvt.single"
                                />
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    label="Conf"
                                    v-model="item.xpvt.conf"
                                />
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    label="XP"
                                    v-model="item.xpvt.set"
                                />
                            </v-col>
                        </v-row>
                    </div>
                    <v-btn fab color="red" dark @click="addDestination()"
                        ><v-icon>mdi-plus</v-icon></v-btn
                    >
                </v-list>
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-checkbox
                    hide-details
                    label="Add Single/Conference Mirror"
                    class="mx-4 my-1"
                    v-model="add_mirror"
                ></v-checkbox>
                <v-spacer />
                <v-btn text @click="value.show = false">CLOSE</v-btn>
                <v-btn text @click="addSync()" :disabled="!canAdd">ADD</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ['value', 'artist_nodes', 'node'],
    data() {
        return {
            master: {
                conf: false,
                xp: {
                    Source: {
                        Node: undefined,
                        Port: undefined,
                        IsInput: true,
                    },
                    Destination: {
                        Node: undefined,
                        Port: undefined,
                        IsInput: false,
                    },
                },
            },
            src_avail_ports: [],
            dest_avail_ports: [],
            use_conf_volume: false,
            src_node: -1,
            src_port: -1,
            dest_node: -1,
            dest_port: -1,
            src_wildcard: false,
            dest_wildcard: false,
            destinations: [],
            add_mirror: false,
        };
    },
    methods: {
        addSync() {
            if (this.src_wildcard) {
                this.master.xp.Source.Node = -1;
                this.master.xp.Source.Port = -1;
            }

            if (this.dest_wildcard) {
                this.master.xp.Destination.Node = -1;
                this.master.xp.Destination.Port = -1;
            }

            this._emit_to_node(this.node.id, 'rrcs', 'add-xp-sync', {
                vol: 0,
                state: false,
                master: this.master,
                slaves: this.destinations.map(dest => dest.xpvt),
            });

            if (this.add_mirror) {
                this.master.conf = !this.master.conf;
                this.destinations.forEach(dest => {
                    dest.xpvt.conf = !dest.xpvt.conf;
                    dest.xpvt.single = !dest.xpvt.single;
                });
                this._emit_to_node(this.node.id, 'rrcs', 'add-xp-sync', {
                    vol: 0,
                    state: false,
                    master: this.master,
                    slaves: this.destinations.map(dest => dest.xpvt),
                });
            }

            this.destinations = [];
            this.add_mirror = false;
            this.master = {
                conf: false,
                xp: {
                    Source: {
                        Node: undefined,
                        Port: undefined,
                        IsInput: true,
                    },
                    Destination: {
                        Node: undefined,
                        Port: undefined,
                        IsInput: false,
                    },
                },
            };
            this.value.show = false;
        },
        setSrcNode(node) {
            this.src_avail_ports = this.availablePorts(node, true);
        },
        setDestNode(node) {
            this.dest_avail_ports = this.availablePorts(node, false);
        },
        destSetSrcNode(index) {
            this.destinations[index].src_ports = this.availablePorts(
                this.destinations[index].xpvt.xp.Source.Node,
                true
            );
        },
        destSetDestNode(index) {
            this.destinations[index].dest_ports = this.availablePorts(
                this.destinations[index].xpvt.xp.Destination.Node,
                false
            );
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
        addDestination() {
            this.destinations.push({
                xpvt: {
                    conf: this.master.conf,
                    single: !this.master.conf,
                    set: false,
                    xp: {
                        Source: {
                            Node: undefined,
                            Port: undefined,
                            IsInput: true,
                        },
                        Destination: {
                            Node: undefined,
                            Port: undefined,
                            IsInput: false,
                        },
                    },
                },
                dest_ports: [],
                src_ports: [],
            });
        },
    },
    computed: {
        canAdd() {
            return true;
        },
        availableNodes() {
            return this.artist_nodes.map(node => node.id);
        },
    },
};
</script>
