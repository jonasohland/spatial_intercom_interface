<template>
    <div>
        <SelectRoomDialog v-model="select_room_dialog" @input="roomSelected" />
        <UserSelectInputsDialog
            :value="select_inputs_dialog"
            @input="inputsSelected"
        />
        <v-list v-if="this.value != null" style="padding: 30px">
            <v-row align="center">
                <span
                    class="headline primary--text"
                    style="padding-left: 14px; padding-bottom: 30px"
                >
                    {{ this.value.user.name }}
                </span>
                <v-spacer />
                <span style="padding-bottom: 20px" class="primary--text">
                    Node: {{ this.value.node.name }}
                </span>
                <span
                    style="padding-bottom: 20px; padding-left: 20px"
                    class="primary--text"
                >
                    Headtracker:
                    {{
                        this.value.user.headtracker == -1
                            ? 'none'
                            : this.value.user.headtracker
                    }}
                </span>
            </v-row>
            <v-divider />
            <v-row>
                <v-col class="pt-6 text-h6">
                    Settings
                </v-col>
            </v-row>
            <v-row>
                <v-col sm="6" class="d-flex align-center justify-center">
                    <v-text-field
                        filled
                        label="Name"
                        v-model="value.user.name"
                        @change="changed()"
                        hide-details
                    >
                    </v-text-field>
                </v-col>
                <v-col sm="3" class="d-flex align-center justify-center">
                    <v-select
                        filled
                        :items="headtrackers"
                        label="Headtracker"
                        v-model="value.user.headtracker"
                        @change="assignHeadtracker()"
                        hide-details
                    />
                </v-col>
                <v-col sm="3" class="d-flex align-center justify-center">
                    <v-select
                        label="Default Room"
                        :value="room"
                        :items="rooms"
                        filled
                        hide-details
                        :color="defaultRoomColor"
                        @input="setDefaultRoom"
                    >
                    </v-select>
                </v-col>
                <v-col>
                    <AudioChannelsSelector
                        :value="selector"
                        @input="acsInput"
                    />
                </v-col>
            </v-row>
            <v-divider />
            <v-row>
                <v-col class="pt-6 text-h6">
                    Inputs
                </v-col>
            </v-row>
            <v-row v-if="loading_inputs">
                <v-col class="d-flex align-center justify-center">
                    <v-progress-circular
                        size="50"
                        indeterminate
                        color="primary"
                    ></v-progress-circular>
                </v-col>
            </v-row>
            <v-card
                v-for="(input, input_idx) in inputs"
                :key="input_idx"
                elevation="6"
            >
                <v-row class="flex mr-2 ml-3 mt-3">
                    <v-col sm="2">
                        {{
                            availableInputs.find(inp => inp.id == input.inputid)
                                ? availableInputs.find(
                                      inp => inp.id == input.inputid
                                  ).name
                                : '[unknown]'
                        }}
                    </v-col>
                    <v-col>
                        <v-slider
                            label="AZM"
                            hide-details
                            min="-180"
                            max="180"
                            v-model="input.azm"
                            thumb-label
                            @change="userInputModified(input_idx)"
                            @input="setAzm(input_idx, input.azm)"
                        >
                        </v-slider>
                    </v-col>
                    <v-col>
                        <v-slider
                            label="ELV"
                            hide-details
                            min="-90"
                            max="90"
                            v-model="input.elv"
                            thumb-label
                            @change="userInputModified(input_idx)"
                            @input="setElv(input_idx, input.elv)"
                        >
                        </v-slider>
                    </v-col>
                    <v-col
                        sm="1"
                        align-self="center"
                        class="d-flex justify-center"
                    >
                        <v-btn
                            small
                            dark
                            @click="
                                select_room_dialog.show = true;
                                input_to_edit = input_idx;
                            "
                            :color="roomColor(input.room)"
                        >
                            ROOM {{ input.room }}
                        </v-btn>
                    </v-col>
                    <v-col
                        sm="2"
                        align-self="center"
                        class="d-flex justify-center"
                    >
                        <v-btn
                            small
                            style="margin-right: 5px"
                            @click="editInput(input_idx)"
                        >
                            <v-icon>
                                edit
                            </v-icon>
                        </v-btn>
                        <v-btn
                            small
                            style="margin-right: 5px"
                            @click="deleteInput(input_idx)"
                        >
                            <v-icon>
                                delete
                            </v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>
            <v-btn
                class="mt-3"
                color="pink"
                dark
                small
                bottom
                left
                fab
                @click="showAddInputs()"
            >
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-list>
    </div>
</template>

<script>
import AudioChannelsSelector from './AudioChannelsSelector';
import SelectRoomDialog from './SelectRoomDialog';
import UserSelectInputsDialog from './UserSelectInputsDialog';
import { roomcolors } from './roomcolors';

export default {
    props: ['value'],
    data() {
        return {
            defaultRoomColor: '',
            availableInputs: [],
            userInputs: [],
            loading_inputs: true,
            input_to_edit: -1,
            inputs: [],
            select_room_dialog: {
                show: false,
            },
            select_inputs_dialog: {
                show: false,
                userInputs: [],
                availableInputs: [],
                selectedInputs: [],
            },
        };
    },
    mounted() {
        this._io.on('inputs.update', (nodeid, inputs) => {
            this.availableInputs = inputs;
        });

        this._io.on('user.inputs.update', (userid, inputs) => {
            this.loading_inputs = false;
            this.inputs = inputs;
        });
    },
    beforeDestroy() {
        this._io.removeAllListeners('inputs.update');
        this._io.removeAllListeners('user.inputs.update');
    },
    methods: {
        changed() {
            this._emit_to_node(
                this.value.node.id,
                'users',
                'user.modify',
                this.value.user
            );
        },
        acsInput(value) {
            this.value.user.channel = value.channelindex;
            this.changed();
        },
        setDefaultRoom(room) {
            this.value.user.room = room.slice(5, 6);
            this.defaultRoomColor = roomcolors[this.value.user.room];
            this.changed();
        },
        roomSelected(dialog) {
            this.inputs[this.input_to_edit].room = dialog.room;
            this.userInputModified(this.input_to_edit, true);
        },
        showAddInputs() {
            this.select_inputs_dialog.selectedInputs.length = 0;
            this.select_inputs_dialog.availableInputs = this.availableInputs;
            this.select_inputs_dialog.userInputs = this.inputs;
            this.select_inputs_dialog.show = true;
        },
        inputsSelected(value) {
            this._emit_to_node(this.value.node.id, 'users', 'user.add.inputs', {
                userid: this.value.user.id,
                inputs: value.selectedInputs,
            });
        },
        userInputModified(input_idx, recompile) {
            this._emit_to_node(
                this.value.node.id,
                'users',
                'user.modify.input',
                {
                    userid: this.value.user.id,
                    input: this.inputs[input_idx],
                    recompile,
                }
            );
        },
        assignHeadtracker() {
            this._emit_to_node(this.value.node.id, 'users', 'user.headtracker', {
                userid: this.value.user.id,
                headtrackerid: this.value.user.headtracker
            });
            this.changed();
        },
        setAzm(input_idx, azm) {
            this._emit_to_node(this.value.node.id, 'users', 'user.input.azm', {
                userid: this.value.user.id,
                spid: this.inputs[input_idx].id,
                value: azm
            });
        },
        setElv(input_idx, elv) {
            console.log(elv);
            this._emit_to_node(this.value.node.id, 'users', 'user.input.elv', {
                userid: this.value.user.id,
                spid: this.inputs[input_idx].id,
                value: elv
            });
        },
        editInput(input_idx) {},
        deleteInput(input_idx) {
            this._emit_to_node(
                this.value.node.id,
                'users',
                'user.delete.input',
                { userid: this.value.user.id, input: this.inputs[input_idx] }
            );
        },
        roomColor(roomletter) {
            return roomcolors[roomletter];
        },
    },
    watch: {
        value: function(newval, oldval) {
            if (newval != null) {
                this._emit_to_node(newval.node.id, 'inputs', 'update');
                if (oldval == null || newval.user.id != oldval.user.id) {
                    if (oldval != null) {
                        this._leave_node_room(
                            oldval.node.id,
                            'users',
                            `userinputs-${oldval.user.id}`
                        );
                    }
                    this.loading_inputs = true;
                    this._join_node_room(
                        newval.node.id,
                        'users',
                        `userinputs-${newval.user.id}`
                    );
                }
            }
        },
    },
    computed: {
        selector() {
            let obj = {
                node: this.value.node,
                channelcount: 2,
                channelindex: this.value.user.channel,
                output: true,
            };
            return obj;
        },
        headtracker() {
            return this.value.user.headtracker == -1
                ? null
                : this.value.user.headtracker;
        },
        headtrackers() {
            let trks = [];
            for (let i = 0; i < 64; ++i) {
                trks.push(i);
            }
            return trks;
        },
        room() {
            return this.value.user.room != null
                ? 'ROOM ' + this.value.user.room
                : null;
        },
        rooms() {
            return ['ROOM A', 'ROOM B', 'ROOM C', 'ROOM D', 'ROOM E'];
        },
    },
    components: {
        AudioChannelsSelector,
        SelectRoomDialog,
        UserSelectInputsDialog,
    },
};
</script>