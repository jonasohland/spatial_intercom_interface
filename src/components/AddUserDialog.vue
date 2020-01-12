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
            return this.nodes.map(node => node.nodename);
        },
        channelnames: function() {
            let pairs = [];

            for (let i = 0; i < this.value.available_channels.length - 1; ++i)
                pairs.push([
                    this.value.available_channels[i],
                    this.value.available_channels[i + 1],
                ]);

            return pairs.map(p => `${p[0].name} - ${p[1].name}`);
        }
    },
    methods: {
        addUser() {

            let out = {
                username: this.username,
                node: this.nodes.find(n => n.nodename == this.node),
                channels: this.value.available_channels[this.channelnames.indexOf(this.channels)]
            }

            this._io.emit('user.add', out);
        }
    },
    data() {
        return {
            username: '',
            channels: -1,
            node: '',
        };
    },
};
</script>
