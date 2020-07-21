<template>
<v-row>
    <v-container class="d-flex flex-wrap ma-3">
        <v-card v-for="node in nodes" :key="node.id" class=" ma-4"> 
            <v-card-title> {{  node.name }} </v-card-title> 
            <v-card-subtitle>TC: 00:00:00:00 | DSP: 89%</v-card-subtitle>
            <v-card-actions>
                <v-btn text>
                    RELOAD
                </v-btn>
                <v-btn text color="red">
                    RESET
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</v-row>
</template>

<script>
export default {
    mounted() {
        this._join_server_room('server', 'nodes');
        this._io.on('server.nodes', nodes => {
            this.nodes = nodes;
        });
    },
    beforeDestroy() {
        this._leave_server_room('server', 'nodes');
    },
    data() {
        return {
            nodes: []    
        }
    }
}
</script>