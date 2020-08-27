<template>
    <div id="XPSyncPage" style="padding-right: 256px">
        <div>
            <AddXPSyncDialog
                v-model="add_xp_dialog"
                :artist_nodes="artist_nodes"
                :node="node"
            />
            <AddXPSlaveDialog
                :show="add_slave_dialog.show"
                :masterid="add_slave_dialog.masterid"
                :artist_nodes="artist_nodes"
                :node="node"
                @close="add_slave_dialog.show = false"
            />
            <v-navigation-drawer
                value="true"
                absolute
                right
                stateless
                style="position: fixed; margin-top: 64px; z-index:3;"
            >
                <v-list dense nav>
                    <v-list-item>
                        Nodes
                        <v-spacer />
                    </v-list-item>
                    <v-divider />
                    <v-list nav>
                        <v-list-item-group
                            v-model="selected_node"
                            color="primary"
                            @change="nodeSelectionChanged"
                        >
                            <v-list-item v-for="node in nodes" :key="node.id">
                                <v-list-item-icon>
                                    <v-icon>memory</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title
                                        v-text="
                                            nodes.find(n => n.id == node.id)
                                                .name
                                        "
                                    ></v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-list>
            </v-navigation-drawer>
        </div>
        <v-list v-if="node != null" style="padding-top:0px">
            <div
                style="position: fixed; width: 100%; padding-right: 312px; z-index:2; background:inherit;"
                class="py-5"
            >
                <v-row align="center" class="mx-4">
                    <span
                        class="headline primary--text"
                        style="padding-left: 14px; padding-bottom: 30px"
                    >
                        {{ this.node.name }}
                    </span>
                    <v-spacer />
                    <v-chip
                        class="mx-1"
                        :color="gateway_online ? 'green' : 'red'"
                        dark
                        >Gateway</v-chip
                    >
                    <v-chip
                        class="mx-1"
                        :color="artist_online ? 'green' : 'red'"
                        dark
                        >Artist</v-chip
                    >
                </v-row>
                <v-row @dragenter.prevent @dragover.prevent @drop="onDrop">
                    <v-col>
                        <v-text-field
                            label="Filter"
                            hide-details
                            clearable
                            class="mx-4"
                            v-model="filterexpression"
                            @input="evalFilter()"
                            :error="filter_has_err"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="mx-4">
                        <v-alert v-if="this.filter_error" type="error">
                            {{ this.filter_error }}
                        </v-alert>
                    </v-col>
                </v-row>
                <v-divider />
            </div>
            <div
                style="position:relative; overflow: hidden; padding-top: 200px; z-index:1;"
            >
                <v-list-item v-for="(sync, i) in syncs" :key="i">
                    <XPSync
                        v-model="syncs[i]"
                        :artist_nodes="artist_nodes"
                        :node="node"
                        @addslave="addSlave(sync)"
                        @deleteme="deleteSync(sync)"
                    />
                </v-list-item>
                <v-btn fab dark color="red" class="mx-6 my-6" @click="addNew()">
                    <v-icon>
                        mdi-plus
                    </v-icon>
                </v-btn>
            </div>
        </v-list>
    </div>
</template>

<script>
import AddXPSyncDialog from './AddXPSyncDialog';
import AddXPSlaveDialog from './AddXPSlaveDialog';
import XPSync from './XPSync';
import { xpvtid } from 'spatial_intercom_server';
import jexl from 'jexl';
import { isWildcardPort } from 'spatial_intercom_server';

jexl.addBinaryOp('has', 5, (lhs, rhs) => {
    return (
        lhs.filter(el => {
            if (typeof el == 'object') {
                if (el.hasOwnProperty(rhs)) {
                    if (typeof el[rhs] == 'boolean') return el[rhs];
                    return true;
                }
            }
        }).length > 0
    );
});

jexl.addBinaryOp('where', 3, (lhs, rhs) => {
    return (
        lhs.filter(el => {
            return jexl.evalSync(rhs, el);
        }).length > 0
    );
});

export default {
    data() {
        return {
            add_xp_dialog: {
                show: false,
            },
            add_slave_dialog: {
                show: false,
                masterid: null,
            },
            xpstates: {},
            nodes: [],
            selected_node: null,
            artist_nodes: [],
            rrcsnodes_listener: null,
            syncs_listener: null,
            node: null,
            all_syncs: [],
            syncs: [],
            artist_online: false,
            gateway_online: false,
            filterexpression: '',
            filter_error: '',
            filter_has_err: false,
        };
    },
    mounted() {
        this._join_server_room('server', 'RRCS_NODE');

        this.rrcsnodes_listener = new_nodes => {
            this.nodes.forEach(node => {
                if (new_nodes.findIndex(nn => nn.id === node.id) == -1) {
                    this.nodes.splice(this.nodes.indexOf(node), 1);
                }
            });

            new_nodes.forEach(new_node => {
                if (this.nodes.findIndex(n => n.id === new_node.id) == -1) {
                    new_node.artists = [];
                    this.nodes.push(new_node);
                }
            });
        };
        this._io.on('server.nodes.RRCS_NODE', this.rrcsnodes_listener);
    },
    beforeDestroy() {
        this._leave_server_room('server', 'RRCS_NODE');
        this._io.off('server.nodes.RRCS_NODE', this.rrcsnodes_listener);
        this.resetListeners();
    },
    methods: {
        nodeSelectionChanged(selected) {
            if (selected == undefined) this.node = null;
            else {
                this.resetListeners(this.nodes[selected]);

                this.syncs_listener = data => {
                    data = data.map(sync => {
                        sync.master.src = {
                            node: sync.master.xp.Source.Node,
                            port: sync.master.xp.Source.Port,
                        };

                        sync.master.dst = {
                            node: sync.master.xp.Destination.Node,
                            port: sync.master.xp.Destination.Port,
                        };

                        sync.slaves = sync.slaves.map(slave => {
                            (slave.src = {
                                node: slave.xp.Source.Node,
                                port: slave.xp.Source.Port,
                            }),
                                (slave.dst = {
                                    node: slave.xp.Destination.Node,
                                    port: slave.xp.Destination.Port,
                                });
                            return slave;
                        });
                        console.log(sync);
                        return sync;
                    });

                    data.sort((lhs, rhs) =>
                        lhs.master.conf === rhs.master.conf
                            ? 0
                            : lhs.master.conf
                            ? 1
                            : -1
                    );
                    data.sort(
                        (lhs, rhs) =>
                            lhs.master.xp.Source.Port -
                            rhs.master.xp.Source.Port
                    );
                    data.sort(
                        (lhs, rhs) =>
                            lhs.master.xp.Source.Node -
                            rhs.master.xp.Source.Node
                    );
                    this.all_syncs = data;
                    this.connectArtistMetadata();
                    this.evalFilter();
                };

                this.connection_listener = (gateway, artist) => {
                    console.log(gateway, artist);
                    this.gateway_online = gateway;
                    this.artist_online = artist;
                };

                this.artist_listener = data => {
                    this.gateway_online = data.gateway;
                    this.artist_online = data.artist;
                    this.artist_nodes = data.artist_nodes;
                    this.connectArtistMetadata();
                    this.evalFilter();
                };

                this.xpstates_listener = xps => {
                    xps.forEach(xp => {
                        let sync = this.all_syncs.find(
                            sync => xpvtid(sync.master) == xp.xpid
                        );
                        if (sync) sync.state = xp.state;
                    });
                    this.evalFilter();
                };

                this.node = this.nodes[selected];

                this._join_node_room(this.node.id, 'rrcs', 'all');
                this._io.on(`${this.node.id}.rrcs.syncs`, this.syncs_listener);
                this._io.on(
                    `${this.node.id}.rrcs.artists`,
                    this.artist_listener
                );
                this._io.on(
                    `${this.node.id}.rrcs.connection`,
                    this.connection_listener
                );
                this._io.on(`${this.node.id}.rrcs.xps`, this.xpstates_listener);
            }
        },
        connectArtistMetadata() {
            this.all_syncs = this.all_syncs.map(sync => {
                let ports = this.findPorts(sync.master.xp);
                if (ports[0]) {
                    sync.master.src.name = ports[0].Name;
                    sync.master.src.label = ports[0].Label;
                    sync.master.src.type = ports[0].PortType;
                }
                if (ports[1]) {
                    sync.master.dst.name = ports[1].Name;
                    sync.master.dst.label = ports[1].Label;
                    sync.master.dst.type = ports[1].PortType;
                }
                return sync;
            });
        },
        evalFilter() {
            if (this.filterexpression && this.filterexpression.length) {
                try {
                    this.syncs = jexl.evalSync(
                        `elements[${this.filterexpression}]`,
                        { elements: this.all_syncs }
                    );
                    this.filter_has_err = false;
                    this.filter_error = null;
                } catch (err) {
                    this.filter_has_err = true;
                    this.filter_error = err.message;
                }
            } else {
                this.syncs = this.all_syncs;
                (this.filter_error = null), (this.filter_has_err = false);
            }
        },
        onDrop(event) {
            let newxp = {
                xp: {
                    Source: {
                        Node: parseInt(
                            event.dataTransfer.getData('srcxp-node')
                        ),
                        Port: parseInt(
                            event.dataTransfer.getData('srcxp-port')
                        ),
                        IsInput: true,
                    },
                    Destination: {
                        Node: parseInt(
                            event.dataTransfer.getData('dstxp-node')
                        ),
                        Port: parseInt(
                            event.dataTransfer.getData('dstxp-port')
                        ),
                        IsInput: false,
                    },
                },
                single: event.dataTransfer.getData('single') == 'true',
                conf: event.dataTransfer.getData('conf') == 'true',
                set: event.dataTransfer.getData('set') == 'true',
            };

            this.filterexpression = `.slaves where '.src.node == ${event.dataTransfer.getData(
                'srcxp-node'
            )} && .src.port == ${event.dataTransfer.getData(
                'srcxp-port'
            )} && .dst.node == ${event.dataTransfer.getData(
                'dstxp-node'
            )} && .dst.port == ${event.dataTransfer.getData('dstxp-port')}'`;
            this.evalFilter();
            console.log(newxp);
        },
        resetListeners(selected) {
            if (selected) {
                this._leave_node_room(selected.id, 'rrcs', 'all');
                this._io.off(`${selected.id}.rrcs.syncs`, this.syncs_listener);
                this._io.off(
                    `${selected.id}.rrcs.connection`,
                    this.connection_listener
                );
                this._io.off(
                    `${selected.id}.rrcs.artists`,
                    this.artist_listener
                );
                this._io.off(`${selected.id}.rrcs.xps`, this.xpstates_listener);
            }
        },
        addNew() {
            this.add_xp_dialog.show = true;
        },
        addSlave(sync) {
            this.add_slave_dialog.masterid = xpvtid(sync.master);
            this.add_slave_dialog.show = true;
        },
        deleteSync(sync) {
            this._emit_to_node(
                this.node.id,
                'rrcs',
                'remove-xp-sync',
                xpvtid(sync.master)
            );
        },
        findPorts(xp) {
            let src_port, dest_port, src_node, dest_node;

            if (isWildcardPort(xp.Source)) {
                src_port = {
                    Name: '[[ ANY ]]',
                    Port: -1,
                    HasSecondChannel: false,
                };
            } else {
                src_node = this.artist_nodes.find(
                    node => node.id == xp.Source.Node
                );
            }

            if (isWildcardPort(xp.Destination)) {
                dest_port = {
                    Name: '[[ ANY ]]',
                    Port: -1,
                    HasSecondChannel: false,
                };
            } else {
                dest_node = this.artist_nodes.find(
                    node => node.id == xp.Destination.Node
                );
            }

            if (src_node)
                src_port = this.findPort(src_node, xp.Source.Port, true);

            if (dest_node)
                dest_port = this.findPort(
                    dest_node,
                    xp.Destination.Port,
                    false
                );

            return [src_port, dest_port];
        },
        findPort(node, xpport, input) {
            let out = {};
            for (let port of node.ports) {
                if (
                    port.Port === xpport &&
                    (port.Input === input || port.Output === !input)
                ) {
                    out = port;
                    break;
                }
                if (port.HasSecondChannel) {
                    if (
                        port.Port + 1 === xpport &&
                        (port.Input === input || port.Output === !input)
                    ) {
                        Object.assign(out, port);
                        out.Name += ' (2nd Ch)';
                        out.Port++;
                        break;
                    }
                }
            }
            return out;
        },
    },
    components: {
        AddXPSyncDialog,
        AddXPSlaveDialog,
        XPSync,
    },
};
</script>
