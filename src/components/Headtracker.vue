<template>
    <div id="headtracker">
        <v-card raised :disabled="_d.disabled" :loading="_d.waiting">
            <HeadtrackerSettings
                :settings="_d.settings"
                v-model="showSettings"
            />
            <v-card-title id="headtracker_title">
                ID: {{ _d.id }}
                <v-spacer />
                <v-checkbox
                    label="RX/TX"
                    style="margin-right: 10px"
                    :success="_d.online"
                    v-model="_d.online"
                    class="__status_box"
                    readonly
                />
                <v-checkbox
                    label="GYRO"
                    :success="_d.gyro_online"
                    :indeterminate="_d.gyro_online && !_d.gyro_ready"
                    :disabled="!_d.online"
                    v-model="_d.gyro_online"
                    class="__status_box"
                    readonly
                />
            </v-card-title>
            <v-divider />
            <v-slider
                label="Samplerate"
                class="__input"
                min="5"
                max="75"
                v-model="_d.samplerate"
                v-on:change="srChanged"
                thumb-label
                style="margin-bottom: 0px"
            />
            <v-row style="padding-left: 15px">

                <v-col class="d-inline-flex align-center"
                    ><v-label>Invert</v-label></v-col
                >
                <v-col><v-checkbox style="margin-top: 0px" label="X" hide-details @change="invertChanged()" v-model="_d.invert.x"/></v-col>
                <v-col><v-checkbox style="margin-top: 0px" label="Y" hide-details @change="invertChanged()" v-model="_d.invert.y"/> </v-col>
                <v-col> <v-checkbox style="margin-top: 0px" label="Z" hide-details @change="invertChanged()" v-model="_d.invert.z"/></v-col
            ></v-row>

            <v-switch
                class="__input"
                v-model="_d.stream_on"
                v-on:change="streamChanged"
                label="Data Streaming enabled"
                style="margin-bottom: 0px"
            />
            <!--<v-text-field class="textin" label="IP Address"/>
      <v-text-field class="textin" label="Subnet Mask"/>-->

            <v-btn small color="primary" style="margin: 15px" @click="resetOrientation()"> RESET ORIENTATION </v-btn>
            <v-divider/>
            <v-card-actions>
                <v-btn text v-on:click="save">SAVE</v-btn>
                <v-btn text v-on:click="reboot">REBOOT</v-btn>
                <v-spacer />
                <v-btn text @click="doShowSettings()">SETTINGS</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
import HeadtrackerSettings from './HeadtrackerSettings';

export default {
    props: ['_d'],
    data() {
        return {
            showSettings: false,
        };
    },
    methods: {
        streamChanged() {
            this._io.emit('htrk.stream.changed', this._d.id, this._d.stream_on);
        },
        srChanged() {
            this._io.emit('htrk.sr.changed', this._d.id, this._d.samplerate);
        },
        save() {
            this._io.emit('htrk.save', this._d.id);
        },
        reboot() {
            this._io.emit('htrk.reboot', this._d.id);
        },
        invertChanged() {
            this._io.emit('htrk.invert.changed', this._d.id, this._d.invert);
        },
        resetOrientation() {
            this._io.emit('htrk.reset.orientation', this._d.id);
        },
        doShowSettings() {
            this.showSettings = true;
        },
    },
    components: {
        HeadtrackerSettings,
    },
};
</script>

<style>
#headtracker_title {
    padding: 0px;
    margin-left: 20px;
    margin-right: 15px;
}
.__status_box {
    padding: 0px;
    padding-top: 25px;
    margin: 0px;
}

#headtracker {
    margin: 20px;
    width: 400px;
}
.__input {
    margin: 15px;
}
</style>
