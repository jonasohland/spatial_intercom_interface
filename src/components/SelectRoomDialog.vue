<template>
    <div id="add_user_dialog">
        <v-dialog v-model="value.show" max-width="300">
            <v-card>
                <v-card-title> Select Room </v-card-title>
                <v-divider />
                <v-card-text>
                    <v-container>
                        <v-list>
                            <v-list-item v-for="(room, room_idx) in rooms" :key="room_idx"  class="align-center justify-center">
                                <v-btn style="width: 100%" dark :color="roomColor(room)" @click="doSelect(room)">
                                    {{ room }}
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn style="width: 100%" dark @click="doSelectNone()">
                                    NO ROOM
                                </v-btn>
                            </v-list-item>
                        </v-list>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { roomcolors } from './roomcolors';

export default {
    props: ['value'],
    methods: {
        doSelect(room) {
            this.value.room = room.slice(5, 6);
            this.value.show = false;
            this.$emit('input', this.value);
        },
        doSelectNone() {
            this.value.room = null;
            this.value.show = false;
            this.$emit('input', this.value);
        },
        roomColor(room) {
            return roomcolors[room.slice(5, 6)];
        }
    },
    computed: {
        rooms() {
            return ["ROOM A", "ROOM B", "ROOM C", "ROOM D", "ROOM E"];
        }
    }
}
</script>