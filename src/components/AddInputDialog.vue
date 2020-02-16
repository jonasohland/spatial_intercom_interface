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
                                    @change="refreshInputChannels()"
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
                                    v-model="channels"
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
const chcount = Object.freeze({
    mono: 1,
    stereo: 2,
    '5.1': 6,
});

export default {
    props: ['value', 'nodes'],
    data() {
        return {
            name: '',
            format: '',
            node: '',
            channels: '',
            available_channels: [],
        };
    },
    methods: {
        addInput() {
            
            let chRangeStart = this.available_channels.indexOf(this.channels);
            
            if(chRangeStart == -1)
                return;
        
            let ccount = chcount[this.format];
            
            let nodeid = this.nodes.find(n => n.name == this.node).id;

            this._io.emit('inputs.add', {
                name: this.name,
                format: this.format,
                nodeid: nodeid,
                ch_start: chRangeStart,
                ch_count: ccount,
            });

            this.value.show = false;
        },
        refreshInputChannels() {

            this.available_channels.length = 0;
            let node = this.nodes.find(n => n.name == this.node);

            if (node) this.available_channels = node.channels.inputs;
            else return (this.available_channels = []);

            let chans = chcount[this.format];
            let nchans = [];

            for (let i = 0; (i + chans) < this.available_channels.length; ++i)
                nchans.push(
                    `${this.available_channels[i].name} - ${
                        this.available_channels[i + chans - 1].name
                    }`
                );

            this.available_channels = nchans;
        },
    },
    computed: {
        nodenames: function() {
            return this.nodes.map(n => n.name);
        },
    },
};
</script>
