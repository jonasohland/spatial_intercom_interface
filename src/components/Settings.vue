<template>
    <div id="settings" style="display: inline">
        <div id="__terminal__" style="display: block"></div>
    </div>
</template>

<script>

import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'


export default {
    data() {
        return {
            terminal: {}
        }
    },
    mounted() {

        this.terminal = new Terminal({ rendererType: 'dom' });

        this.terminal.open(this.$el, true);
        this.terminal.resize(50, 10)
        
        let self = this;

        setInterval(() => {
            self.terminal.writeln("Hello!")
        }, 1000);
    }
}
</script>