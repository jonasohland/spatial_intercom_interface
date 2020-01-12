<template>
    <div>
        <v-dialog v-model="dialog" max-width="700" @click:outside="rebuildInputs()">
            <template v-slot:activator="{ on }">
                <v-btn absolute dark fab bottom right color="pink" v-on="on" @click="dialogShow()">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-card-title class="headline">Select Inputs</v-card-title>
                <v-list>

                <v-divider/>
                    <v-list-item-group v-model="selected_inputs" multiple>
                        <v-list-item v-for="(input, i) in available_inputs" :key="i">
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
                                    {{ input.format }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                    </v-list-item-group>
                    <v-divider/>
                </v-list>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="green darken-1" text @click="dialog = false; rebuildInputs()"
                        >CLOSE
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    props: ['aux', 'value'],
    data() {
        return {
            dialog: false,
            available_inputs: [],
            selected_inputs: []
        };
    },
    methods: {
        dialogShow(){
            let self = this;

            this.available_inputs = this.aux.nodes.find(n => n.id == this.value.nid).inputs;
            self.selected_inputs.length = 0;

            this.value.inputs.forEach(ni => {

                let pi = self.available_inputs.find(inp => inp.id == ni.id);

                console.log(pi);

                if(pi) 
                    self.selected_inputs.push(self.available_inputs.indexOf(pi));
            });

        },
        rebuildInputs(){

            let self = this;

            this.available_inputs.forEach((ai, idx) => {
                
                if(self.selected_inputs.indexOf(idx) != -1){
                    if(self.value.inputs.find(inp => inp.id == ai.id))
                        return;
                    else {
                        self.value.inputs.push({
                            id: ai.id,
                            name: ai.name,
                            format: ai.format,
                            mute: false,
                            azm: 0,
                            elv: 0
                        });
                    }
                } else {
                    if(self.value.inputs.find(inp => inp.id == ai.id))
                        self.value.inputs.splice(self.value.inputs.findIndex(inp => inp.id == ai.id), 1);
                }

            });
        },
        update(){
            this.$emit('input', this.value);
        }
    }
};
</script>
