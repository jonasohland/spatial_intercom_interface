<template>
    <div id="headtracker_settings">
        <v-dialog v-model="value" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Headtracker Settings</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-switch v-model="settings.dhcp" label="DHCP enabled"></v-switch>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    label="IP Address"
                                    v-model="settings.addr"
                                    :disabled="settings.dhcp"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    label="Subnet Mask"
                                    v-model="settings.subnet"
                                    :disabled="settings.dhcp"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close()"
                        >Close</v-btn
                    >
                    <v-btn color="blue darken-1" text @click="saveSettings()"
                        >Save</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    props: [ 'settings', 'value' ],
    data() {
        return {
            show: this.value
        }
    },
    methods: {
        saveSettings(){
            this.$emit('input', this.show);
            this._io.emit('htrk.save.settings', this.settings);
        },
        close(){
            this.$emit('input', this.show);
        }
    }
};
</script>
