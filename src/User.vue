<template>
    <v-app id="user-container">
        <v-content>
            <router-view name="user" />
        </v-content>
        <v-bottom-navigation :value="active_tab" app grow>
            <v-btn value="panning" @click="nav(`panning`)">
                <span>Panning</span>
                <v-icon>looks</v-icon>
            </v-btn>
            <v-btn value="settings" @click="nav(`settings`)">
                <span>Settings</span>
                <v-icon>settings</v-icon>
            </v-btn>
        </v-bottom-navigation>
    </v-app>
</template>

<script>
export default {
    data() {
        return {
            active_tab: null,
        };
    },
    beforeCreate() {
        this.$vuetify.theme.dark = true;
    },
    methods: {
        nav(dest) {
            console.log(dest);
            this.$router.push(dest);
        },
    },
};
</script>
