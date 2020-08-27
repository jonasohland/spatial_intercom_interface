<template>
    <v-card
        class="my-3"
        :elevation="dropindic ? 10 : 3"
        :color="this.value.state ? 'grey darken-2' : ''"
        :dark="this.value.state"
        @drop="onDrop"
        @dragover.prevent
        @dragenter="dragEnter($event)"
        @dragleave="dragLeave($event)"
        width="100%"
    >
        <v-card-text class="py-1">
            <v-row class="ma-2 text-subtitle-1"
                v-bind:class="{ 'text--primary': !value.state }"
                v-bind:style="{
                        color: value.state ? 'rgba(255, 255, 255, 1)' : '',
                    }"
            >
                <v-icon v-if="value.master.conf" class="mr-5">
                    group
                </v-icon>
                <v-icon v-if="!value.master.conf" class="mr-5">
                    person
                </v-icon>
                <span
                    class="px-2"
                    v-bind:class="{ 'text--disabled': !value.state }"
                    v-bind:style="{
                        color: value.state ? 'rgba(255, 255, 255, 0.5)' : '',
                    }"
                    >{{ this.value.master.src.type }}</span
                >
                {{ this.value.master.src.name }}
                <v-icon class="mx-2"> clear </v-icon>
                {{ this.value.master.dst.name }}
                <span
                    class="px-2"
                    v-bind:class="{ 'text--disabled': !value.state }"
                    v-bind:style="{
                        color: value.state ? 'rgba(255, 255, 255, 0.5)' : '',
                    }"
                    >{{ this.value.master.dst.type }}</span
                >
            </v-row>
            <v-row class="ma-2">
                <v-chip
                    draggable
                    v-for="(slave, i) in value.slaves"
                    :key="i"
                    :color="slave.set ? 'red' : 'blue'"
                    close
                    text-color="white"
                    @dragstart="slaveStartDrag($event, slave)"
                    @click:close="removeSlave(i)"
                    class="mx-2 my-1"
                >
                    {{ findPorts(slave.xp)[0].Name }}
                    <v-icon class="mx-4">clear</v-icon>
                    {{ findPorts(slave.xp)[1].Name }}
                    <v-icon v-if="slave.conf" class="ml-3">group</v-icon>
                    <v-icon v-if="slave.single" class="ml-3">person</v-icon>
                </v-chip>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn small text @click="$emit('addslave')">
                <v-icon>
                    add
                </v-icon>
            </v-btn>
            <v-btn small text @click="$emit('deleteme')">
                <v-icon>
                    delete
                </v-icon>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { xpvtid, isWildcardPort } from 'spatial_intercom_server';

export default {
    props: ['value', 'artist_nodes', 'node'],
    methods: {
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
        removeSlave(index) {
            console.log('Remove', index);
            let newslave = {};

            // todo: this is ugly
            Object.assign(newslave, this.value.slaves[index]);
            delete newslave.src;
            delete newslave.dst;

            this._emit_to_node(this.node.id, 'rrcs', 'xp-remove-slave', {
                masterid: xpvtid(this.value.master),
                slave: newslave,
            });
        },
        slaveStartDrag(event, item) {
            event.dataTransfer.dropEffect = 'move';
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('originVSID', xpvtid(this.value.master));
            event.dataTransfer.setData('srcxp-node', item.xp.Source.Node);
            event.dataTransfer.setData('srcxp-port', item.xp.Source.Port);
            event.dataTransfer.setData('dstxp-node', item.xp.Destination.Node);
            event.dataTransfer.setData('dstxp-port', item.xp.Destination.Port);
            event.dataTransfer.setData('set', item.set);
            event.dataTransfer.setData('conf', item.conf);
            event.dataTransfer.setData('single', item.single);
        },
        dragEnter(evt) {
            ++this.dragcnt;
            this.dropindic = true;
            this.$forceUpdate();
            evt.preventDefault();
        },
        dragLeave(evt) {
            this.dragcnt--;
            if (this.dragcnt === 0) {
                this.dropindic = false;
            }
            this.$forceUpdate();
            evt.preventDefault();
        },
        onDrop(event) {
            this.dragcnt = 0;
            this.dropindic = false;
            let myid = xpvtid(this.value.master);

            if (event.dataTransfer.getData('originVSID') === myid) {
                console.log('same');
                return;
            }

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

            this._emit_to_node(this.node.id, 'rrcs', 'xp-add-slave', {
                masterid: myid,
                slave: newxp,
            });
        },
    },
    data() {
        return {
            dropindic: false,
            dragcnt: 0,
        };
    },
    computed: {
        masterports() {
            let ports = this.findPorts(this.value.master.xp);
            return ports;
        },
    },
};
</script>
