<template>
    <div class="user_settings" style="padding-left: 20px">
        <div
            id="user_settings_container"
            v-if="value != undefined"
            style="padding: 20px"
        >
            <v-container fluid>
                <v-row class="d-flex">
                    <v-col class="headline">
                        {{ value.name }}
                    </v-col>
                    <v-spacer />
                    <v-col class="flex-grow-1"
                        ><span style="color: grey">Node: </span
                        >{{ value.nodename }}
                    </v-col>
                    <v-col class="flex-shrink-1" cols="1"
                        ><span style="color: grey">ID:</span> {{ value.id }}
                    </v-col>
                </v-row>
                <v-divider />
                <v-row>
                    <v-col class="title">
                        Settings
                    </v-col>
                </v-row>
                <v-row justify="start">
                    <v-col>
                        <v-switch
                            label="Advanced Spatialization"
                            v-model="value.advanced"
                            @change="switchMode()"                            
                        >
                        </v-switch>
                    </v-col>
                    <v-col cols="2">
                        <v-select
                            label="Headtracker (ID)"
                            :items="aux.htrks"
                            v-model="value.htrk"
                        >
                        </v-select>
                    </v-col>
                    <v-col cols="2">
                        <v-btn @click="assignHeadtracker()">ASSIGN</v-btn>
                    </v-col>
                </v-row>
                <v-divider v-if="value.advanced" />
                <v-row v-if="value.advanced">
                    <v-col class="title">
                        Advanced Spatialization
                    </v-col>
                </v-row>
                <v-row v-if="value.advanced">
                    <v-col>
                        <v-slider min="0" max="1000" label="Room Size" v-model="value.roomsize" @input="setRoomSize()"/>
                    </v-col>
                    <v-col>
                        <v-slider min="0" max="1000" label="Reflections" v-model="value.reflections" @input="setReflections()"/>
                    </v-col>
                    <v-col>
                        <v-slider min="0" max="1000" label="Room Character" v-model="value.room_character" @input="setRoomCharacter()"/>
                    </v-col>
                </v-row>
                <v-divider />
                <v-row>
                    <v-col>
                        <v-row>
                            <v-col class="title">
                                Inputs:
                            </v-col>
                        </v-row>
                        <v-card outlined>
                            <v-list
                                v-for="(input, i) in value.inputs"
                                :key="input.name"
                            >
                                <v-list-item>
                                    <v-list-item-content>
                                        <v-row justify="center" class="d-flex">
                                            <v-col cols="2">
                                                {{ input.name }}
                                            </v-col>
                                            <v-col
                                                class="justify-center"
                                                cols="1"
                                            >
                                                <SpatializedChannelDetails v-model="value.inputs[i]"/>
                                                <v-btn
                                                    :color="
                                                        input.mute
                                                            ? 'red'
                                                            : null
                                                    "
                                                    @click="mute(i)"
                                                    @change="update()"
                                                >
                                                    MUTE
                                                </v-btn>
                                            </v-col>
                                            <v-col>
                                                <v-slider
                                                    v-model="input.azm"
                                                    hide-details
                                                    min="-180"
                                                    max="180"
                                                    @input="
                                                        update();
                                                        azm(i);
                                                    "
                                                />
                                            </v-col>
                                            <v-col cols="1">
                                                <v-text-field
                                                    v-model="input.azm"
                                                    label="AZM"
                                                    @change="
                                                        update();
                                                        azm(i);
                                                    "
                                                >
                                                </v-text-field>
                                            </v-col>
                                            <v-col>
                                                <v-slider
                                                    v-model="input.elv"
                                                    hide-details
                                                    min="-90"
                                                    max="90"
                                                    @input="
                                                        update();
                                                        elv(i);
                                                    "
                                                />
                                            </v-col>
                                            <v-col cols="1">
                                                <v-text-field
                                                    v-model="input.elv"
                                                    label="ELV"
                                                    @change="
                                                        update();
                                                        elv(i);
                                                    "
                                                >
                                                </v-text-field>
                                            </v-col>
                                            <v-col
                                                v-if="input.format == 'stereo'"
                                            >
                                                <v-slider
                                                    v-model="input.stwidth"
                                                    hide-details
                                                    min="0"
                                                    max="360"
                                                    @input="
                                                        update();
                                                        stwidth(i);
                                                    "
                                                />
                                            </v-col>
                                            <v-col
                                                cols="1"
                                                v-if="input.format == 'stereo'"
                                            >
                                                <v-text-field
                                                    v-model="input.stwidth"
                                                    label="WIDTH"
                                                    @change="
                                                        update();
                                                        stwidth(i);
                                                    "
                                                >
                                                </v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-list-item-content>
                                </v-list-item>
                                <v-divider
                                    v-if="i != value.inputs.length - 1"
                                />
                            </v-list>
                            <UsersAddInputDialog
                                :aux="aux"
                                v-model="value"
                                @click="fillAvailableInputs()"
                            />
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <div v-else>
            <v-row justify="center">
                <span class="title justify-center" style="padding: 70px">
                    Please select a user from the list on the right
                </span>
            </v-row>
        </div>
    </div>
</template>

<script>
import UsersAddInputDialog from './UsersAddInputDialog';
import SpatializedChannelDetails from './SpatializedChannelDetails';

export default {
    props: ['value', 'aux'],
    data() {
        return {
            dialog: false,
            available_inputs: [],
        };
    },
    methods: {
        notifyHostAboutInputChange(event, idx, value) {
            this._io.emit(
                event,
                /* userid */ this.value.id,
                /* node id */ this.value.nid,
                /* input id */ this.value.inputs[idx].id,
                value
            );
        },
        update() {
            this.$emit('input', this.value);
        },
        switchMode(){
            this._io.emit('user.switch.mode', this.value.id, this.value.nid);
        },
        mute(idx) {
            this.value.inputs[idx].mute = !this.value.inputs[idx].mute;
            this.notifyHostAboutInputChange(
                'users.input.mute',
                idx,
                this.value.inputs[idx].mute
            );
        },
        azm(idx) {
            this.notifyHostAboutInputChange(
                'users.input.azm',
                idx,
                this.value.inputs[idx].azm
            );
        },
        elv(idx) {
            this.notifyHostAboutInputChange(
                'users.input.elv',
                idx,
                this.value.inputs[idx].elv
            );
        },
        stwidth(idx) {
            this.notifyHostAboutInputChange(
                'users.input.stwidth',
                idx,
                this.value.inputs[idx].stwidth
            );
        },
        assignHeadtracker() {
            this._io.emit(
                'users.htrk.assign',
                this.value.id,
                this.value.nid,
                this.value.htrk
            );
        },
        fillAvailableInputs() {},
        setReflections(){
            this._io.emit(
                'users.reflections',
                this.value.id,
                this.value.nid,
                this.value.reflections / 1000
            );
        },
        setRoomSize(){
            /*this._io.emit(
                'users.reflections',
                this.value.id,
                this.value.nid,
                this.value.roomsize
            );*/
        },
        setRoomCharacter(){
            this._io.emit(
                'users.room_character',
                this.value.id,
                this.value.nid,
                this.value.room_character / 1000
            );
        }
    },
    components: {
        UsersAddInputDialog,
        SpatializedChannelDetails
    },
};
</script>
