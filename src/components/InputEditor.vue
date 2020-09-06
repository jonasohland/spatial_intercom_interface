<template>
    <v-list v-if="this.value != null" style="padding: 30px">
        <v-row align="center">
            <span
                class="headline primary--text"
                style="padding-left: 14px; padding-bottom: 30px"
            >
                {{ this.value.input.name }}
            </span>
            <v-spacer />
            <span style="padding-bottom: 30px" class="primary--text">
                Type: {{ this.value.input.type }}
            </span>
            <span
                style="padding-bottom: 30px; padding-left: 20px"
                class="primary--text"
            >
                Node: {{ this.value.node.name }}
            </span>
        </v-row>
        <v-divider />
        <v-row>
            <v-col sm="6" class="d-flex align-center justify-center">
                <v-text-field
                    filled
                    label="Name"
                    v-model="value.input.name"
                    @change="changed()"
                    hide-details
                >
                </v-text-field>
            </v-col>
            <v-col sm="3" class="d-flex align-center justify-center">
                <v-select
                    filled
                    :items="types"
                    label="Format"
                    v-model="value.input.type"
                    @change="changed()"
                    hide-details
                />
            </v-col>
            <v-col class="d-flex align-center">
                <v-select
                    label="Default Encoding Order"
                    :items="encodingOrders"
                    v-model="value.input.default_encodingorder"
                    @change="changed()"
                    hide-details
                    filled
                />
            </v-col>
        </v-row>        
        <v-row>     
            <v-col>
                <v-text-field v-model="multich_count" @change="setChcount" label="Channelcount"/>
            </v-col>
            <v-col>
                <AudioChannelsSelector :value="selector" @input="acsInput" />
            </v-col>
        </v-row>
        <v-row>
            <v-col sm="6" cols="1" class="d-flex flex-column">
                <span class="caption">Default Gain</span>
                <v-slider
                    :value="defaultGainVal"
                    max="12."
                    min="-24."
                    step="0.5"
                    @change="defaultGainChanged"
                    hide-details
                    thumb-label
                />
            </v-col>
            <v-col class="d-flex align-center">
                <v-switch
                    label="RoomEncode by default"
                    hide-details
                    v-model="value.input.default_roomencode"
                    @change="changed()"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn color="red" @click="deleteMe()" dark>
                    DELETE
                </v-btn>
            </v-col>
        </v-row>
    </v-list>
</template>

<script>
import AudioChannelsSelector from './AudioChannelsSelector';
import { PortTypes, SourceUtils } from 'spatial_intercom_server';

function atodb(amplitude) {
    return 20 * Math.log10(amplitude);
}

function dbtoa(dbs) {
    return Math.pow(10, dbs / 20);
}

export default {
    props: ['value'],
    data() {
        return {
            range: [],
            multich_count: 1
        };
    },
    methods: {
        acsInput(value) {
            if (value.channelindex != this.value.channel) {
                this.value.input.channel = value.channelindex;
                this.changed();
            }
        },
        deleteMe() {
            this._emit_to_node(
                this.value.node.id,
                'inputs',
                'remove',
                this.value.input.id
            );
            this.value = null;
        },
        changed() {
            this._emit_to_node(
                this.value.node.id,
                'inputs',
                'modify',
                this.value.input
            );
        },
        defaultGainChanged(val) {
            this.value.input.default_gain = dbtoa(val);
            this.changed();
        },
        setChcount() {
            this.multich_count = Number.parseInt(this.multich_count)
            if (isNaN(this.multich_count))
                return;

            this.value.input.multich_count = this.multich_count;
            this.changed();
        }
    },
    watch: {
        value() {
            this.multich_count = this.value.input.multich_count;
        }
    },
    computed: {
        selector() {
            let obj = {
                node: this.value.node,
                channelcount:
                    SourceUtils[PortTypes[this.value.input.type]].channels *
                    this.value.input.multich_count,
                channelindex: this.value.input.channel,
            };
            return obj;
        },
        types: function() {
            let out = [];
            for (let _key of Object.keys(PortTypes)) {
                if (isNaN(_key)) out.push(_key);
            }
            out.shift();
            return out;
        },
        defaultGainVal() {
            return atodb(this.value.input.default_gain);
        },
        encodingOrders() {
            return [0, 1, 2, 3, 4, 5, 6, 7];
        },
    },
    components: {
        AudioChannelsSelector,
    },
};
</script>
