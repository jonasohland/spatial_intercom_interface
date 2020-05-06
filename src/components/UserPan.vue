<template>
    <div id="user-pan">
        <canvas id="pan-canvas">
        </canvas>
    </div>    
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
        this.panner.attach("pan-canvas");
    }
}
</script>