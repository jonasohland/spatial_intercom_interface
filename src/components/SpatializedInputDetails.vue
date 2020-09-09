<template>
    <v-dialog v-model="value.show" max-width="600px">
        <v-card>
            <v-card-title>
                Details
            </v-card-title>
            <v-card-subtitle>
                {{
                    value.availableInputs != null
                        ? value.availableInputs.find(
                              inp => inp.id == value.input.inputid
                          ).name
                        : '[unknown]'
                }}
            </v-card-subtitle>
            <v-divider />
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-slider
                            v-model="value.input.gain"
                            min="-24"
                            max="12"
                            step="0.2"
                            thumb-label
                            label="GAIN"
                            hide-details
                            @input="setgain(value.input.id, value.input.gain)"
                            @change="inputModified()"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-slider
                            v-model="value.input.azm"
                            min="-180"
                            max="180"
                            thumb-label
                            label="AZM"
                            hide-details
                            @input="setAzm()"
                            @change="inputModified()"
                        />
                    </v-col>
                    <v-col>
                        <v-slider
                            v-model="value.input.elv"
                            min="-90"
                            max="90"
                            thumb-label
                            label="ELV"
                            hide-details
                            @input="setElv()"
                            @change="inputModified()"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-slider
                            v-model="value.input.width"
                            min="0"
                            max="180"
                            thumb-label
                            label="WDH"
                            hide-details
                            @change="inputModified()"
                            @input="setWidth()"
                        />
                    </v-col>
                    <v-col>
                        <v-slider
                            v-model="value.input.heigth"
                            min="0"
                            max="90"
                            thumb-label
                            label="HGT"
                            hide-details
                            @change="inputModified()"
                            @input="setHeight()"
                        />
                    </v-col>
                </v-row>
                <v-row v-for="(ch, i) in channels" :key="i">
                    <v-col align-self="center">
                       Channel {{ ch }}
                    </v-col>
                    <v-col align-self="center">
                        <v-btn @click="changePlayState(i)" :disabled="playing && !playstates[i].state" :color="playstates[i].state?'red':'' " :dark="playstates[i].state"> {{ playstates[i].txt }} TEST SOUND </v-btn>
                    </v-col>
                    <v-col>
                        <v-checkbox label="NOISE" hide-details class="mt-1" v-model="playstates[i].noise"/>
                    </v-col>
                    <v-col>
                        <v-checkbox label="SINE" hide-details class="mt-1" v-model="playstates[i].noise"/>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-btn text @click="resetPlayStates(); $emit('previous')">
                    <v-icon>
                        skip_previous
                    </v-icon>
                </v-btn>
                <v-btn text @click="resetPlayStates(); $emit('next')">
                    <v-icon>
                        skip_next
                    </v-icon>
                </v-btn>
                <v-spacer />
                <v-btn text @click="value.show = false">
                    SAVE
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { SourceUtils, ensurePortTypeEnum } from 'spatial_intercom_server';

export default {
    props: ['value'],
    data() {
        let playstates = Array(64).fill(1).map(nothing => { console.log("HI"); return { state: false, noise: false, tone: false, txt: "PLAY", playid: "" } });

        return {
            playstates,
            playing: false
        };
    },
    methods: {
        setgain(id, gain) {
            this._emit_to_server_module('users', 'setgain', {
                user: this.value.input.userid,
                id,
                gain,
            });
        },
        setAzm() {
            this._emit_to_node(this.value.node.id, 'users', 'user.input.azm', {
                userid: this.value.input.userid,
                spid: this.value.input.id,
                value: this.value.input.azm,
            });
        },
        setElv() {
            this._emit_to_node(this.value.node.id, 'users', 'user.input.elv', {
                userid: this.value.input.userid,
                spid: this.value.input.id,
                value: this.value.input.elv,
            });
        },
        setHeight() {
            this._emit_to_node(
                this.value.node.id,
                'users',
                'user.input.height',
                {
                    userid: this.value.input.userid,
                    spid: this.value.input.id,
                    value: this.value.input.heigth,
                }
            );
        },
        setWidth() {
            this._emit_to_node(
                this.value.node.id,
                'users',
                'user.input.width',
                {
                    userid: this.value.input.userid,
                    spid: this.value.input.id,
                    value: this.value.input.width,
                }
            );
        },
        inputModified() {
            this._emit_to_node(
                this.value.node.id,
                'users',
                'user.modify.input',
                {
                    userid: this.value.input.userid,
                    input: this.value.input,
                    recompile: true,
                }
            );
        },
        setPlayStates() {
            this._emit_to_node(
                this.value.node.id,
                'users',
                'user.input.playstates',
                { 
                    inputid: this.value.input.id,
                    userid: this.value.input.userid,
                    states: this.playstates
                }
            )
        },
        changePlayState(index) {

            if (this.playstates[index].state) {
                this.playstates[index].txt = "PLAY";
                this.playstates[index].state = false;
                this.playing = false;
            } else {
                this.playstates[index].txt = "STOP";
                this.playstates[index].state = true;
                this.playing = true;
            }

            this.setPlayStates();
        },
        resetPlayStates() {
            this._emit_to_node(
                this.value.node.id,
                'users',
                'user.input.reset-playstates'
            )
            this.playing = false;
            this.playstates = (new Array(64)).fill(1).map(nothing => { console.log("HI"); return { state: false, noise: true, tone: false, txt: "PLAY", playid: "" } });
        }
    },
    computed: {
        channels() {
            let chs = [...(new Array(SourceUtils[
                ensurePortTypeEnum(
                    this.value.availableInputs.find(
                        inp => inp.id === this.value.input.inputid
                    ).type
                )
            ].channels)).keys()].map(ch => ch + 1);
            return chs;
        },
    },
};
</script>
