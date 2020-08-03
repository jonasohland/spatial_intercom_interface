<template>
    <div id="user-self-settings">
        <v-list>
            <v-list-item>
                <span class="my-3">
                    <h3>Input Gains</h3>
                </span>
            </v-list-item>
            <v-divider class="mb-3" />
            <v-list-item v-for="userinput in userinputs" :key="userinput.id">
                <v-row>
                    <v-col cols="3">
                        {{ userinputname(userinput.inputid) }}
                    </v-col>
                    <v-col>
                        <v-slider
                            v-model="userinput.gain"
                            hide-details
                            @input="setgain(userinput.id, userinput.gain)"
                            @change="gainchanged(userinput.id, userinput.gain)"
                            max="12"
                            min="-24"
                            step="0.2"
                        />
                    </v-col>
                    <v-col cols="1">
                        {{ (userinput.gain || 0).toFixed(0) }}
                    </v-col>
                </v-row>
            </v-list-item>
        </v-list>
    </div>
</template>

<script>
import truncate from 'truncate';

export default {
    data() {
        return {
            inputslistener: null,
            inputs: [],
            userinputs: [],
        };
    },
    mounted() {
        this._join_server_room('users', `${this.$route.params.id}.userinputs`);

        this.inputslistener = (inputs, userinputs) => {
            this.inputs = inputs;
            this.userinputs = userinputs;
        };

        this._io.on(`${this.$route.params.id}.userinputs`, this.inputslistener);
    },
    methods: {
        resetAllListeners() {
            this._leave_server_room(
                'users',
                `${this.$route.params.id}.userinputs`
            );
            if (this.inputslistener) {
                this._io.off(
                    `${this.$route.params.id}.userinputs`,
                    this.inputslistener
                );
            }
        },
        userinputname(id) {
            let input = this.inputs.find(inp => inp.id === id);
            if (input) return truncate(input.name);
            else return '<unknown>';
        },
        setgain(id, gain) {
            this._emit_to_server_module('users', 'setgain', {
                user: this.$route.params.id,
                id,
                gain,
            });
        },
        gainchanged(id, gain) {
            this._emit_to_server_module('users', 'changegain', {
                user: this.$route.params.id,
                id,
                gain,
            });
        },
    },
};
</script>
