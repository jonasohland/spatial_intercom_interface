<template>
    <div id="settings" style="display: inline">
        <v-list v-if="dataReady">
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
                                DSP usage: {{ (item.dspUse * 100).toFixed(0) }}%
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
                                    @change="setInputDevice(item.nodename)"
                                    filled
                                ></v-select>
                            </v-col>
                            <v-col class="d-flex" cols="20" sm="6">
                                <v-select
                                    :items="item.options.audioOuts"
                                    label="Audio Output Device"
                                    v-model="item.audioOutputDevice"
                                    @change="setOutputDevice(item.nodename)"
                                    filled
                                ></v-select>
                            </v-col>
                            <v-col class="d-flex" cols="20" sm="3">
                                <v-select
                                    :items="item.options.buffersizes"
                                    label="Buffersize"
                                    v-model="item.buffersize"
                                    @change="setBuffersize(item.nodename)"
                                    filled
                                ></v-select>
                            </v-col>
                            <v-col class="d-flex" cols="20" sm="3">
                                <v-select
                                    :items="item.options.samplerates"
                                    label="Samplerate"
                                    v-model="item.samplerate"
                                    @change="setSamplerate(item.nodename)"
                                    filled
                                ></v-select>
                            </v-col>
                            <v-col class="d-flex" cols="20" sm="6">
                                <v-switch
                                    label="Open Device"
                                    v-model="item.device_open"
                                    @change="setDeviceOpen(item.nodename)"
                                ></v-switch>
                                <v-switch
                                    style="padding-left: 10px"
                                    label="Enable Audio Processing"
                                    v-model="item.dsp_on"
                                    @change="setDSPEnabled(item.nodename)"
                                ></v-switch>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-list-item-content>
            </v-list-group>
        </v-list>
        <v-overlay :absolute="true" :opacity="0.5" :value="operationOngoing">
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
            operationOngoing: true,
            items: [],
            dspuse: []
        };
    },
    mounted() {
        let self = this;

        this._io.emit('audiosettings.update');

        this._io.on('audiosettings.update.done', data => {
            this.items = data;

            self.dataReady = true;
            self.operationOngoing = false;
        });

        this._io.on('audiosettings.operation.done', () => {
            self.operationOngoing = false;
        });

        this._io.on('audiosettings.dspuse', node => {
            
            let it = this.items.find(item => item.id == node.id);

            if(it)
                it.dspUse = node.value;
        })

        this.updateDspUseInterval = setInterval(() => {
            self._io.emit('audiosettings.dspuse');
        }, 500);
    },
    beforeDestroy() {
        clearInterval(this.updateDspUseInterval);
    },
    methods: {
        setInputDevice(node) {
            this._io.emit(
                'audiosettings.inputdevice.set',
                node,
                this.items.find(inode => inode.nodename == node)
                    .audioInputDevice
            );
            this.operationOngoing = true;
        },
        setOutputDevice(node) {
            this._io.emit(
                'audiosettings.outputdevice.set',
                node,
                this.items.find(inode => inode.nodename == node)
                    .audioOutputDevice
            );
            this.operationOngoing = true;
        },
        setBuffersize(node) {
            this._io.emit(
                'audiosettings.buffersize.set',
                node,
                this.items.find(inode => inode.nodename == node).buffersize
            );
            this.operationOngoing = true;
        },
        setSamplerate(node) {
            this._io.emit(
                'audiosettings.samplerate.set',
                node,
                this.items.find(inode => inode.nodename == node).samplerate
            );
            this.operationOngoing = true;
        },
        setDSPEnabled(node) {
            this._io.emit(
                'audiosettings.dsp.enabled',
                node,
                this.items.find(inode => inode.nodename == node).dsp_on
            );
            this.operationOngoing = true;
        },
        setDeviceOpen(node) {
            this._io.emit(
                'audiosettings.device.open',
                node,
                this.items.find(inode => inode.nodename == node).device_open
            );
            this.operationOngoing = true;
        },
        getIoLatency(buf, sr) {
            return buf / sr * 1000;
        }
    },
};
</script>
