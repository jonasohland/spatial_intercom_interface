<template>
    <div id="add_user_dialog">
        <v-dialog v-model="value.show" max-width="700">
            <v-card>
                <v-card-title> Add User </v-card-title>
                <v-divider />
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-select
                                    filled
                                    :items="nodenames"
                                    label="Node"
                                    v-model="node"
                                    @change="setAvailableChannels()"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    filled
                                    label="User Name"
                                    v-model="username"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    filled
                                    :items="channelnames"
                                    label="Output Channels"
                                    v-model="channels"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions
                    ><v-spacer />
                    <v-btn text @click="value.show = false">CLOSE</v-btn>
                    <v-btn text @click="addUser()">ADD</v-btn>
                </v-card-actions>
                <v-divider />
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    props: ['value', 'nodes'],
    computed: {
        nodenames: function() {
            console.log(this.nodes);
            return this.nodes.map(node => node.nodename);
        },
    },
    methods: {
        setAvailableChannels() {
            let self = this;

            let available_channels = this.value.channels.find(
                n => n.name == self.node
            ).channels.outputs;

            let pairs = [];

            for (let i = 0; i < available_channels.length - 1; ++i)
                pairs.push([available_channels[i], available_channels[i + 1]]);

            this.available_channels = available_channels;
            this.channelnames = pairs.map(p => `${p[0].name} - ${p[1].name}`);
        },
        addUser() {
            let out = {
                username: this.username,
                nodeid: this.nodes.find(n => n.nodename == this.node).id,
                channels: [
                    this.available_channels[
                        this.channelnames.indexOf(this.channels)
                    ],
                    this.available_channels[
                        this.channelnames.indexOf(this.channels) + 1
                    ],
                ],
            };

            this._io.emit('user.add', out);
            this.value.show = false;
        },
    },
    data() {
        return {
            username: '',
            channels: -1,
            channelnames: [],
            node: '',
        };
    },
};
</script>
