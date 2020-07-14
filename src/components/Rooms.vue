<template>
    <div id="RoomPage" style="margin-right: 256px">
        <v-navigation-drawer value="true" absolute right stateless>
            <v-list dense nav>
                <v-list-item>
                    Nodes
                    <v-spacer />
                </v-list-item>
                <v-divider />
                <v-list nav>
                    <v-list-item-group
                        v-model="selected_node"
                        color="primary"
                        @change="nodeSelectionChanged"
                    >
                        <v-list-item v-for="node in nodes" :key="node.id">
                            <v-list-item-icon>
                                <v-icon>memory</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title
                                    v-text="
                                        nodes.find(n => n.id == node.id).name
                                    "
                                ></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-list>
        </v-navigation-drawer>
        <v-tabs
            v-if="rooms.length != 0"
            v-model="selected_room"
            :background-color="tabbarcolor"
            color="white"
            @change="roomChanged()"
        >
            <v-tab v-for="room in rooms" :key="room.letter">
                ROOM {{ room.letter }}
            </v-tab>
        </v-tabs>
        <v-container v-if="room != null && rooms.length != 0">
            <v-row>
                <v-col class="pt-6 text-h5">
                    Main
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex align-center">
                    <v-switch
                        label="Enable Room Simulation"
                        v-model="room.enabled"
                        @change="updateRoom()"
                    />
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider
                        label="Reflections"
                        hide-details
                        v-model="room.reflections"
                        @input="serverSetValue(room.reflections, 'main', 'reflections')"
                        @change="updateRoom()"
                        thumb-label
                    />
                </v-col>
            </v-row>
            <v-divider />
            <v-row>
                <v-col class="pt-6 text-h5">
                    Room
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex align-center">
                    <v-slider label="Room Size" thumb-label min="5" max="20" step="0.1" v-model="room.room.size" @input="serverSetValue(room.room.size, 'room', 'size')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="Room Depth" thumb-label min="0" max="1" step="0.01" v-model="room.room.depth" @input="serverSetValue(room.room.depth, 'room', 'depth')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="Room Height" thumb-label min="0" max="1" step="0.01" v-model="room.room.height" @input="serverSetValue(room.room.height, 'room', 'height')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="Room Width" thumb-label min="0" max="1" step="0.01" v-model="room.room.width" @input="serverSetValue(room.room.width, 'room', 'width')" @change="updateRoom()"/>
                </v-col>
            </v-row>
            <v-divider />
            <v-row>
                <v-col class="pt-6 text-h5">
                    Attenuation
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex align-center">
                    <v-slider label="Front" thumb-label min="0" max="1" step="0.01" v-model="room.attn.front" @input="serverSetValue(room.attn.front, 'attn', 'front')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="Left" thumb-label min="0" max="1" step="0.01" v-model="room.attn.left" @input="serverSetValue(room.attn.left, 'attn', 'left')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="Right" thumb-label min="0" max="1" step="0.01" v-model="room.attn.right" @input="serverSetValue(room.attn.right, 'attn', 'right')" @change="updateRoom()"/>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex align-center">
                    <v-slider label="Back" thumb-label min="0" max="1" step="0.01" v-model="room.attn.back" @input="serverSetValue(room.attn.back, 'attn', 'back')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="Ceiling" thumb-label min="0" max="1" step="0.01" v-model="room.attn.ceiling" @input="serverSetValue(room.attn.ceiling, 'attn', 'ceiling')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="Floor" thumb-label min="0" max="1" step="0.01" v-model="room.attn.floor" @input="serverSetValue(room.attn.floor, 'attn', 'floor')" @change="updateRoom()"/>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex align-center">
                    <v-slider label="High Band Gain" thumb-label min="-80" max="0" step="1" v-model="room.eq.high.gain" @input="serverSetValue(room.eq.high.gain, 'eq', 'hight.gain')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="High Band Frequency" thumb-label min="1000" max="10000" step="1" v-model="room.eq.high.freq" @input="serverSetValue(room.eq.high.freq, 'eq', 'high.freq')" @change="updateRoom()"/>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex align-center">
                    <v-slider label="Low Band Gain" thumb-label min="-80" max="0" step="1" v-model="room.eq.low.gain" @input="serverSetValue(room.eq.low.freq, 'eq', 'low.gain')" @change="updateRoom()"/>
                </v-col>
                <v-col class="d-flex align-center">
                    <v-slider label="Low Band Frequency" thumb-label min="20" max="600" step="1" v-model="room.eq.low.freq" @input="serverSetValue(room.eq.low.freq, 'eq', 'low.freq')" @change="updateRoom()"/>
                </v-col>
            </v-row>
        </v-container>
        <v-row justify="center">
            <span
                class="title justify-center"
                style="padding: 70px"
                v-if="room == null"
            >
                Please select a node from the list on the right
            </span></v-row
        >
    </div>
</template>

<script>
import { roomcolors } from './roomcolors';

export default {
    mounted() {
        this._join_server_room('server', 'nodes');
        this._io.on('server.nodes', nodes => {
            this.nodes = nodes;
        });
        this._io.on('node.rooms', rooms => {
            for(let room of rooms) {
                let idx = this.rooms.findIndex(rm => rm.letter === room.letter);
                if(idx != -1)
                    this.rooms[idx] = room;
                else
                    this.rooms.push(room);
            }
            this.selected_room = this.selected_room || 0;
            this.roomChanged();
        });
    },
    methods: {
        nodeSelectionChanged() {
            let selected = this.nodes[this.selected_node];
            this.rooms = [];

            if (this.last_node)
                this._leave_node_room(this.last_node.id, 'rooms', 'rooms');

            if (selected) {
                this._join_node_room(selected.id, 'rooms', 'rooms');
                this.last_node = selected;
            } else {
                this.last_node = null;
                this.rooms = [];
            }
        },
        roomChanged() {
            this.room = this.rooms[this.selected_room];
            this.tabbarcolor = roomcolors[this.room.letter];
        },
        serverSetValue(value, name, name2) {
            if (this.selected_node == undefined) return;

            console.log(`Emit to ${this.nodes[this.selected_node].id} [set-${name}] ${value}`);
            this._emit_to_node(
                this.nodes[this.selected_node].id,
                'rooms',
                `set-${name}`,
                value
            );
        },
        updateRoom() {
            this._emit_to_node(this.nodes[this.selected_node].id, 'rooms', 'modify', this.room);
        }
    },
    data() {
        return {
            tabbarcolor: roomcolors['A'],
            nodes: [],
            rooms: [],
            last_node: null,
            selected_room: null,
            selected_node: null,
            room: null,
        };
    },
    beforeDestroy() {
        this._io.removeAllListeners('server.nodes');
        this._io.removeAllListeners('node.rooms');
        this._leave_server_room('server', 'nodes');
        if (this.last_node)
            this._leave_node_room(this.last_node.id, 'rooms', 'rooms');
    },
};
</script>
