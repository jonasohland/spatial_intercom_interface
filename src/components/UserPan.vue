<template>
    <v-content
        id="pan-canvas-container"
        v-resize="onResize"
        style="width: 100%; height: 100%"
    >
        <v-row
            justify="center"
            align="center"
            style="position: absolute; top: 0px; width: 100%; margin: 20px"
        >
            <v-col cols="12">
                <span style="color: grey"> Selected: </span>
                {{ selection.name }}
                <v-spacer />
                <span style="color: grey"> Short: </span> {{ selection.short }}
            </v-col>
        </v-row>
        <v-container style="padding: 0px; max-width: none">
            <canvas id="pan-canvas" style="height: 80%; width: 100%" />
        </v-container>
        <v-row
            justify="center"
            align="center"
            style="position: absolute; bottom: 0px; width: 100%; margin: 5px"
        >
            <v-col cols="6">
                <v-slider
                    label="AZM"
                    min="-180"
                    max="180"
                    @input="updateAzm()"
                    v-model="selection.a_deg"
                />
            </v-col>
            <v-col cols="6">
                <v-slider
                    label="ELV"
                    min="-90"
                    max="90"
                    @input="updateElv()"
                    v-model="selection.e_deg"
                />
            </v-col>
        </v-row>
        <v-tooltip
            bottom
            :value="tooltip.show"
            :position-x="tooltip.x"
            :position-y="tooltip.y"
        >
            <span>{{ tooltip.txt }}</span>
        </v-tooltip>
    </v-content>
</template>

<script>
import PanCanvas from './PanCanvas';

export default {
    data() {
        return {
            panner: new PanCanvas(),
            sources: [
                {
                    id: 0,
                    name: 'Kamera 1',
                    short: 'K1',
                    a: Math.PI / 4,
                    e: Math.PI / 5,
                },
                {
                    id: 1,
                    name: 'Kamera 2',
                    short: 'K1',
                    a: Math.PI / 7,
                    e: Math.PI / 5,
                },
                {
                    id: 2,
                    name: 'Kamera 3',
                    short: 'K1',
                    a: Math.PI / 10,
                    e: Math.PI / 5,
                },
            ],
            tooltip: {
                show: false,
                txt: 'Error!',
                x: 100,
                y: 100,
            },
            selection: {
                name: '(None)',
                short: '/',
                a_deg: 0,
                e_deg: 0
            },
        };
    },
    mounted() {
        let self = this;

        // this until the whole site has been rendered, so we can get the correct canvas size
        setTimeout(() => {
            this.panner.attach('pan-canvas', 'user-pan');

            this.panner.displayTooltip = function(text, x, y) {
                self.tooltip.txt = text;
                self.tooltip.x = x;
                self.tooltip.y = y;
                self.tooltip.show = true;
            };

            this.panner.destroyTooltip = function() {
                self.tooltip.show = false;
            };

            this.panner.setData(this.sources);

            this.panner.onSelect = function() {

                let s = self.panner.getSelected()

                self.selection.a_deg = s.a_deg;
                self.selection.e_deg = s.e_deg;
                self.selection.name = s.name;
                self.selection.short = s.short;
            };

            this.panner.onDeselect = function() {
                self.selection = {
                    name: '(none)',
                    short: '/',
                };
            };
        }, 20);
    },
    methods: {
        onResize() {
            if (this.panner.ready) this.panner.resize();
        },
        updateElv() {
            let s = this.panner.getSelected();
            if(s)
                s.setElvDeg(this.selection.e_deg);
        },
        updateAzm() {
            let s = this.panner.getSelected();
            if(s)
                s.setAzmDeg(this.selection.a_deg);
        },
    },
};
</script>

<style>
::-webkit-scrollbar {
    background: #2e2e2e;
    display: none !important;
}

canvas[resize] {
    width: 100%;
    height: 100%;
}
</style>
