<template>
    <v-container id="user-pan" v-resize="onResize" style="width: 100%; height: 100%">
        <canvas id="pan-canvas" style="width: 100%; height: 100%"/>
    </v-container>    
</template>

<script>

import PanCanvas from './PanCanvas'

export default {
    data() {
        return {
            panner: new PanCanvas()
        }
    },
    mounted() {
        this.panner.attach("pan-canvas", "user-pan");
    },
    methods: {
        onResize() {
            if(this.panner.ready)
                this.panner.resize();
        }
    }
}
</script>