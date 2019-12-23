<template>
  <div id="headtracking">
    <div id="options">
      <v-card class="mx-auto" outlined>
        <v-list-item three-line>
          <v-list-item-content>
            <div class="overline mb-4">OPTIONS</div>
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </div>
    <div id="dev_list">
      <v-card class="mx-auto" outlined>
        <v-list-item three-line>
          <v-list-item-content>
            <div class="overline mb-4">DEVICE LIST</div>
            <div style="width: 400px; flex-wrap: wrap">
              <div id="tracker_list" v-for="tracker in trackers" v-bind:key="tracker.data.id">
                <Headtracker :tracker_data="tracker.data" style="float: left" />
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </div>
  </div>
</template>

<script>
import Headtracker from "./Headtracker";

export default {
  data: () => {
    return {
      trackers: []
    };
  },
  mounted() {
    let self = this;

    this._io.on("htrk.update", (tracker_data) => {
      console.log(tracker_data);
      self.trackers = tracker_data;
    });

    this._io.emit("htrk.update.req");
    
  },
  components: {
    Headtracker
  }
};
</script>

<style lang="scss">
@font-face {
  font-family: dotrice;
  src: url("../assets/Dotrice-Regular.otf") format('truetype');
}

#headtracking {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

#options {
  float: left;

  margin-top: 30px;
  margin-bottom: 10px;
  margin-left: 30px;
  margin-right: 30px;

  flex-basis: 100%;
}

#dev_list {
  float: bottom;

  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 30px;
  margin-right: 30px;

  flex-basis: 100%;
}

#__test {
  display: inline-block;
  flex:none;
  font-family: dotrice;
  font-size: 16pt;
  border: 3px solid;
  background:rgb(0, 0, 51);
  color: aqua;
  padding: 5px;
  width: 6ch
}
</style>