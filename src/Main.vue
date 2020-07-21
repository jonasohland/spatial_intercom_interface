<template>
    <v-app id="main">
            <v-main class="text-center">
                <v-content>
                <v-row class="d-flex justify-center">
                <v-card
                    class="px-12 ma-12"
                >
                    <v-div class="pa-3">
                        <v-card-title>
                            <span class="title font-weight-light text--center"
                                >SPATIAL INTERCOM MANAGER</span
                            >
                        </v-card-title>
                        <v-list>
                            <v-list-item-group>
                                <v-list-item>
                                    <v-list-item-icon>
                                        <v-icon> settings </v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content
                                        @click="nav('/admin/settings')"
                                        >ADMIN</v-list-item-content
                                    >
                                </v-list-item>
                                <v-list-item>
                                    <v-list-item-icon>
                                        <v-icon>
                                            person
                                        </v-icon> </v-list-item-icon
                                    ><v-list-item-content
                                        >USER</v-list-item-content
                                    ></v-list-item
                                >
                            </v-list-item-group>
                        </v-list>
                    </v-div>
                </v-card>
                </v-row>
                </v-content>
            </v-main>
        </v-app>
</template>

<script>
export default {
    methods: {
        nav(target) {
            this.$router.push(target);
        }
    },
    created() {
        this.$vuetify.theme.dark = false;
    },
    mounted() {
        this.$cookies.config('30d');
        let theme_is_dark = this.$cookies.get('si-manager-theme-dark');

        if(typeof theme_is_dark == 'string') {
            switch(theme_is_dark) {
                case 'true':
                    theme_is_dark = true;
                    break;
                default:
                    theme_is_dark = false;
                    
            }
        }

        if(theme_is_dark != null) 
            this.is_dark = theme_is_dark;
        else
            theme_is_dark = false;

        this.is_dark = theme_is_dark;
        
        this.$vuetify.theme.dark = this.is_dark;
        this.$cookies.set('si-manager-theme-dark', this.is_dark);
    }
};
</script>
