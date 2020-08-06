<template>
    <div id="settings" style="display: inline">
        <v-list>
            <v-list-group
                v-for="item in items"
                :key="item.id"
                v-model="item.active"
                multiple="true"
                no-action
            >
                <template v-slot:activator>
                    <v-list-item-icon>
                        <v-icon>memory</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title v-text="item.nodename" />
                        <v-list-item-subtitle v-text="item.id" />
                    </v-list-item-content>
                </template>

                <v-list-item-content>
                    <v-container fluid style="padding: 30px">
                        <v-row align="center">
                            <span
                                class="headline"
                                style="padding-left: 14px; padding-bottom: 30px"
                            >
                                Audio Settings
                            </span>
                            <v-spacer />
                            <span style="padding-bottom: 30px">
                                DSP usage: {{ (item.dspuse * 100).toFixed(0) }}%
                            </span>
                            <span
                                style="padding-bottom: 30px; padding-left: 20px"
                            >
                                IO Latency: {{ getIoLatency(item.buffersize, item.samplerate).toFixed(2) }} ms
                            </span>
                        </v-row>
                        <v-row align="center">
                            <v-col class="d-flex" cols="20" sm="6">
                                <v-select
                                    :items="item.options.audioIns"
                                    label="Audio Input Device"
                                    v-model="item.audioInputDevice"
                                    @change="setInputDevice(item.id, item.audioInputDevice)"
                                    filled
                                    hide-details
                                ></v-select>
                            </v-col>
                            <v-col class="d-flex" cols="20" sm="6">
                                <v-select
                                    :items="item.options.audioOuts"
                                    label="Audio Output Device"
                                    v-model="item.audioOutputDevice"
                                    @change="setOutputDevice(item.id, item.audioOutputDevice)"
                                    filled
                                    hide-details
                                ></v-select>
                            </v-col>
                            <v-col class="d-flex" cols="20" sm="3">
                                <v-select
                                    :items="item.options.buffersizes"
                                    label="Buffersize"
                                    v-model="item.buffersize"
                                    @change="setBuffersize(item.id, item.buffersize)"
                                    filled
                                    hide-details
                                ></v-select>
                            </v-col>
                            <v-col class="d-flex" cols="20" sm="3">
                                <v-select
                                    :items="item.options.samplerates"
                                    label="Samplerate"
                                    v-model="item.samplerate"
                                    @change="setSamplerate(item.id, item.samplerate)"
                                    filled
                                    hide-details
                                ></v-select>
                            </v-col>
                            <v-col class="d-flex" cols="20" sm="6">
                                <v-switch
                                    label="Open Device"
                                    v-model="item.device_open"
                                    @change="setDeviceOpen(item.id, item.device_open)"
                                ></v-switch>
                                <v-switch
                                    style="padding-left: 10px"
                                    label="Enable Audio Processing"
                                    v-model="item.dsp_on"
                                    @change="setDSPEnabled(item.id, item.dsp_on)"
                                ></v-switch>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-list-item-content>
            </v-list-group>
        </v-list>
        <v-overlay :absolute="true" :opacity="0.5" :value="block">
            <v-progress-circular
                indeterminate
                color="white"
                size="100"
            ></v-progress-circular>
        </v-overlay>
    </div>
</template>

<script>

export default {
    data() {
        return {
            updateDspUseInterval: null,
            dataReady: false,
            block: true,
            items: [],
            dspuse: [],
            nodes: [],
            node_listeners: {}
        };
    },
    mounted() {
        this._join_server_room('server', 'nodes');
        let self = this;
        this.resetAllListeners();
        this._io.on('server.nodes', (nodes) => {
            nodes.forEach(node => {
                console.log(node);
                node.dspuse = 0.3;
                this.node_listeners[node.id] = {
                    dspuse_listener: (dspuse) => {
                        self.setDSPUseVal(node.id, dspuse)
                    }
                }
                this._join_node_room(node.id, 'node-audio-devices', 'dspuse');
                this._io.on(`${node.id}-dspuse`, this.node_listeners[node.id].dspuse_listener);
                this._emit_to_node(node.id, 'audiosettings', 'update');
            });
        });

        this._io.on('audiosettings.update.done', (data) => {
            console.log(data);
            this.block = false;

            let idx = this.items.findIndex(it => it.id == data.id);
            if(idx != -1) {
                Object.assign(this.items[idx], data);
            } else {
                data.dspuse = 0;
                this.items.push(data);
            }
        });

        this._io.on('audiosettings.done', () => {
            this.block = false;
        });
    },
    beforeDestroy() {
        this._leave_server_room('server', 'nodes');
        this._io.removeAllListeners('audiosettings.update.done');
        this._io.removeAllListeners('audiosettings.done');
        this._io.removeAllListeners('server.nodes');
        this.resetAllListeners();
    },
    methods: {
        resetAllListeners() {
            this.items.forEach(node => {
                if(this.node_listeners[node.id]) {
                    this._leave_node_room(node.id, 'node-audio-devices', 'dspuse');
                    this._io.off(`${node.id}-dspuse`, this.node_listeners[node.id].dspuse_listener);
                }
            })
        },
        setDSPUseVal(nodeid, val) {
            let n = this.items.find(node => node.id == nodeid);
            if(n) {
                console.log(val);
                n.dspuse = val;
                this.$forceUpdate();
            }
        },
        setInputDevice(id) {
            this._emit_to_node(
                id,
                'audiosettings',
                'inputdevice',
                this.items.find(inode => inode.id == id)
                    .audioInputDevice
            );
            this.block = true;
        },
        setOutputDevice(id) {
            this._emit_to_node(
                id,
                'audiosettings',
                'outputdevice',
                this.items.find(inode => inode.id == id)
                    .audioOutputDevice
            );
            this.block = true;
        },
        setBuffersize(id) {
            this._emit_to_node(
                id,
                'audiosettings',
                'buffersize',
                this.items.find(inode => inode.id == id)
                    .buffersize
            );
            this.block = true;
        },
        setSamplerate(id) {
            this._emit_to_node(
                id,
                'audiosettings',
                'samplerate',
                this.items.find(inode => inode.id == id)
                    .samplerate
            );
            this.block = true;
        },
        setDSPEnabled(id) {
            this._emit_to_node(
                id,
                'audiosettings',
                'dspenabled',
                this.items.find(inode => inode.id == id)
                    .dsp_on
            );
            this.block = true;
        },
        setDeviceOpen(id) {
            this._emit_to_node(
                id,
                'audiosettings',
                'open',
                this.items.find(inode => inode.id == id)
                    .device_open
            );
            this.block = true;
        },
        getIoLatency(buf, sr) {
            return buf / sr * 1000;
        }
    },
};
</script>
