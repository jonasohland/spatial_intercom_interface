<template>
    <div id="InputsPage">
        <AddInputDialog v-model="add_input_dialog" :nodes="nodes"/>
        <v-btn
            color="red"
            fab
            dark
            top
            right
            class="v-btn--open-inputs"
            @click="drawer = true"
        >
            <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-navigation-drawer v-model="drawer" absolute right>
            <v-list dense nav>
                <v-list-item>
                    <v-btn icon @click.stop="drawer = !drawer">
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                    Inputs
                    <v-spacer />
                    <v-btn icon @click.stop="add_input_dialog.show = true">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-list-item>

                <v-divider></v-divider>

                <v-list nav>
                        <v-list-group
                            v-for="(node, node_idx) in node_inputs"
                            :key="node.id"
                            @change="deselectInput()"
                        >
                            <template v-slot:activator>
                                <v-list-item-content>
                                    <v-list-item-title
                                        v-text="nodes.find(n => n.id == node.id).name"
                                    ></v-list-item-title>
                                </v-list-item-content>
                            </template>

                            <v-list-item-group
                                v-model="selected_input"
                                active-class="pink--text"
                                @change="selectInput(node_idx)"
                            >
                                <template
                                    v-for="(input, input_idx) in node.inputs"
                                >
                                    <v-list-item :key="input_idx">
                                        <template
                                            v-slot:default="{ active, toggle }"
                                        >
                                            <v-list-item-content>
                                                <v-list-item-title
                                                    v-text="input.name"
                                                ></v-list-item-title>
                                                <v-list-item-subtitle>
                                                    {{ input.format }}
                                                </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-list-item-group>
                        </v-list-group>
                    </v-list>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>
import AddInputDialog from './AddInputDialog';

export default {
    data() {
        return {
            drawer: true,

            selected_input: 0,

            nodes: [],
            node_inputs: [],

            add_input_dialog: {
                formats: ['mono', 'stereo', '5.1'],
                show: false
            },
        };
    },

    methods : {
        deselectInput() {

        },
        selectInput() {

        }
    },
    
    mounted() {

        let self = this;

        this._io.on('inputs.update', data => {
            self.nodes = data.nodes;
            self.node_inputs = data.inputs;

            console.log(self.node_inputs);
            console.log(self.nodes);
        });

        this._io.emit('inputs.update');

    },

    components: {
        AddInputDialog,
    },
};
</script>

<style lang="css" scoped>
.v-btn--open-inputs {
    top: 10;
    right: 20;
    position: absolute;
    margin: 0 0 16px 16px;
}
</style>
