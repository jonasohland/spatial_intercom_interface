<template>
        <div id="add_user_dialog">
        <v-dialog v-model="value.show" max-width="700">
            <v-card>
                <v-card-title> Add Input </v-card-title>
                <v-divider />
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    filled
                                    label="Input Name"
                                    v-model="name"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    filled
                                    :items="value.formats"
                                    label="Format"
                                    v-model="format"
                                />
                            </v-col>
                            <v-col>
                                <v-select
                                    filled
                                    :items="nodenames"
                                    label="Node"
                                    v-model="node"
                                    @change="refreshInputChannels()"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    filled
                                    label="Channels"
                                    v-model="name"
                                    :items="available_channels"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions
                    ><v-spacer />
                    <v-btn text @click="value.show = false">CLOSE</v-btn>
                    <v-btn text @click="addInput()">ADD</v-btn>
                </v-card-actions>
                <v-divider />
            </v-card>
        </v-dialog>
    </div>
</template>


<script>
export default {
    props: ['value', 'nodes'],
    data() {
        return {
            name: "",
            format: "",
            node: "",
            channels: "",
            available_channels: []
        }
    },
    methods: {
        addInput() {

        },
        refreshInputChannels(){

            this.available_channels.length = 0;

            console.log(this.nodes);
            
            let node = this.nodes.find(n => n.name == this.node)

            console.log(node);

            if(node) 
                this.available_channels = node.channels.inputs;
        }
    },
    computed: {
        nodenames: function() {
            return this.nodes.map(n => n.name);
        }
    }   
}
</script>