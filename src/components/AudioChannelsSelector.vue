<template>
    <v-select
        v-model="selected"
        :items="options"
        filled
        :background-color="bgcol"
        :label="label"
        :loading="loading"
        :disabled="disabled"
        @change="input()"
        hide-details
    >
    </v-select>
</template>

<script>
import pevent from 'p-event';

function webifResponseEvent(nodeid, modulename, event) {
    return `${nodeid}.${modulename}.${event}`;
}

function defaultList(is_output) {
    let out = [];

    for (let i = 1; i < 129; ++i)
        out.push(`Virtual ${is_output ? 'Output' : 'Input'} ${i}`);

    return out;
}

export default {
    props: ['value'],
    data() {
        return {
            loading: false,
            selected: null,
            virtualSelected: false,
            selectedNotAvailable: false,
            cache: {
                channels: [],
                nodeid: '',
            },
        };
    },
    computed: {
        label() {
            return `Channel${
                this.value.channelcount != null && this.value.channelcount == 1
                    ? ''
                    : 's'
            } ${this.disabled ? '(select node and format first)' : ''}`;
        },
        invalidSelected() {
            return this.options != null && this.selectedNotAvailable;
        },
        bgcol() {
            if (this.invalidSelected) return 'red lighten-3';
            if (this.virtualSelected) return 'blue lighten-3';

            return '';
        },
        disabled() {
            return !(
                this.value.node &&
                this.value.node.id &&
                this.value.node.id.length &&
                this.value.channelcount != undefined
            );
        },
    },
    methods: {
        input() {
            if (
                this.selectedNotAvailable &&
                this.options.findIndex(val => val == this.selected) ==
                    this.options.length - 1
            )
                this.value.channelindex = this.initial_index;
            else {
                this.selectedNotAvailable = false;
                this.value.channelindex = this.options.findIndex(
                    val => val == this.selected
                );
            }

            this.$emit('input', this.value);
        },
        buildChannelList(available_list) {
            let list_out = [];
            let chcount = Number.parseInt(this.value.channelcount);

            for (let i = 0; i < available_list.length; ++i) {
                if (i + chcount - 1 < available_list.length) {
                    list_out.push(
                        `${available_list[i]}${
                            chcount > 1
                                ? ` - ${available_list[i + chcount - 1]}`
                                : ''
                        }`
                    );
                }
            }

            if (this.value.channelindex != undefined) {
                let currentindex = Number.parseInt(this.value.channelindex);

                if (available_list.length < currentindex + chcount - 1) {
                    this.initial_index = currentindex;
                    let dummy_ch_name = `Unavailable: ${currentindex + 1}${
                        chcount > 1
                            ? ` - Unavailable ${currentindex + chcount}`
                            : ''
                    }`;

                    list_out.push(dummy_ch_name);
                    this.selected = dummy_ch_name;
                    this.selectedNotAvailable = true;
                } else {
                    this.selectedNotAvailable = false;
                    this.selected = list_out[currentindex];
                }
            }
            return list_out;
        },
    },
    asyncComputed: {
        async options() {
            if (this.value.currentindex) {
                this.value.currentindex = Number.parseInt(
                    this.value.currentindex
                );
            }
            if (
                this.value.node &&
                this.value.node.id &&
                this.value.node.id.length &&
                this.value.channelcount != undefined
            ) {
                if (this.cache.nodeid === this.value.node.id)
                    return this.buildChannelList(this.cache.channels);

                this.loading = true;
                this._emit_to_node(
                    this.value.node.id,
                    'audiosettings',
                    'channellist'
                );
                try {
                    let list = await pevent(
                        this._io,
                        webifResponseEvent(
                            this.value.node.id,
                            'audiosettings',
                            'channellist'
                        ),
                        { timeout: 5000 }
                    );
                    this.loading = false;
                    this.cache.nodeid = this.value.node.id;
                    if (list) {
                        if (this.value.output)
                            this.cache.channels = list.outputs.map(
                                out => out.name
                            );
                        else
                            this.cache.channels = list.inputs.map(
                                inp => inp.name
                            );

                        this.virtualSelected = false;
                        return this.buildChannelList(this.cache.channels);
                    } else {
                        this.cache.channels = defaultList();
                        this.virtualSelected = true;
                        return this.buildChannelList(this.cache.channels);
                    }
                } catch (err) {
                    return this.buildChannelList(defaultList());
                }
            } else {
                return [1, 2, 3];
            }
        },
    },
};
</script>
