<template>
    <div class="user_settings" style="padding-left: 20px">
        <v-card>
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
                            >
                            </v-switch>
                        </v-col>
                        <v-col cols="2">
                            <v-select
                                label="Headtracker (ID)"
                                :items="aux.htrks"
                            >
                            </v-select>
                        </v-col>
                        <v-col cols="2">
                            <v-btn>RESET</v-btn>
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
                            <v-slider label="Room Size" />
                        </v-col>
                        <v-col>
                            <v-slider label="Reflections" />
                        </v-col>
                        <v-col>
                            <v-slider label="Room Character" />
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
                                            <v-row
                                                justify="center"
                                                class="d-flex"
                                            >
                                                <v-col cols="2">
                                                    {{ input.name }}
                                                </v-col>
                                                <v-col
                                                    class="justify-center"
                                                    cols="1"
                                                >
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
                                                        thumb-label
                                                        min="-180"
                                                        max="180"
                                                        @change="update()"
                                                    />
                                                </v-col>
                                                <v-col cols="1">
                                                    <v-text-field v-model="input.azm" label="AZM">
                                                    </v-text-field>
                                                </v-col>
                                                <v-col>
                                                    <v-slider
                                                        v-model="input.elv"
                                                        hide-details
                                                        thumb-label
                                                        min="-90"
                                                        max="90"
                                                        @change="update()"
                                                    />
                                                </v-col>
                                                <v-col cols="1">
                                                    <v-text-field v-model="input.elv" label="ELV">
                                                    </v-text-field>
                                                </v-col>
                                            </v-row>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                                <UsersAddInputDialog :aux="aux" v-model="value" @click="fillAvailableInputs()"/>
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
        </v-card>
    </div>
</template>

<script>

import UsersAddInputDialog from './UsersAddInputDialog';

export default {
    props: ['value', 'aux'],
    data() {
        return {
            dialog: false,
            available_inputs: [],
        }
    },
    methods: {
        update() {
            this.$emit('input', this.value);
        },
        mute(idx) {
            this.value.inputs[idx].mute = !this.value.inputs[idx].mute;
        },
        resetPan(idx) {
            this.value.inputs[idx].azm = 0;
            this.value.inputs[idx].elv = 0;
        },
        fillAvailableInputs() {
        }
    },
    components: {
        UsersAddInputDialog
    },
};
</script>
