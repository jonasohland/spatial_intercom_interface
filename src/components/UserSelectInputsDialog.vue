<template>
    <v-dialog v-model="value.show" max-width="500">
        <v-card>
            <v-card-title> Add Inputs </v-card-title>
            <v-list>
                <v-list-item-group v-model="selectedInputs" multiple>
                    <v-list-item v-for="(input, i) in shownAvailableInputs" :key="i">
                            <template v-slot:default="{ active, toggle }">
                                <v-list-item-action>
                                    <v-checkbox
                                        v-model="active"
                                        color="primary"
                                        @click="toggle"
                                    ></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title>{{
                                        input.name
                                    }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                    {{ input.type }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-card-actions
                    ><v-spacer />
                    <v-btn text @click="value.show = false">CLOSE</v-btn>
                    <v-btn text @click="addInputs()">ADD</v-btn>
                </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ['value'],
    data() {
        return {
            selectedInputs: []
        }
    },
    methods: {
        addInputs() {
            let shown = this.shownAvailableInputs;
            let out = [];
            this.value.selectedInputs = [];

            for(let i = 0; i < this.selectedInputs.length; ++i)
                this.value.selectedInputs.push(shown[this.selectedInputs[i]]);

            this.selectedInputs = [];
            this.value.show = false;
            this.$emit('input', this.value);
        }
    },
    computed: {
        shownAvailableInputs() {
            return this.value.availableInputs.filter(inp => this.value.userInputs.findIndex(uinp => uinp.inputid === inp.id) === -1);
        }
    }
}
</script>