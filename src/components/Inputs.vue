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

                <v-list-item link>
                    <v-list-item-content>
                        Program
                    </v-list-item-content>
                </v-list-item>

                <v-list-item link>
                    <v-list-item-content>
                        Regie Intercom
                    </v-list-item-content>
                </v-list-item>
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

            nodes: [],

            add_input_dialog: {
                formats: ['mono', 'stereo', '5.1'],
                show: false
            },
        };
    },

    
    mounted() {

        let self = this;

        this._io.on('inputs.update', data => {
            
            self.nodes = data.nodes;

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
