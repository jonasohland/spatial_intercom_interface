<template>
  <div id="headtracker">
    <v-card :loading="tracker_data.waiting">
      <v-card-title id="headtracker_title">
        ID: {{ tracker_data.id }}
        <v-spacer />
        <v-checkbox
          label="RX/TX"
          style="margin-right: 10px"
          :success="tracker_data.online"
          v-model="tracker_data.online"
          class="__status_box"
          readonly
        />
        <v-checkbox
          label="GYRO"
          :success="tracker_data.gyro_online"
          :indeterminate="tracker_data.gyro_online && !tracker_data.gyro_ready"
          :disabled="!tracker_data.online"
          v-model="tracker_data.gyro_online"
          class="__status_box"
          readonly
        />
      </v-card-title>
      <v-divider />
      <v-slider
        label="Samplerate"
        class="__input"
        min="5"
        max="75"
        v-model="tracker_data.samplerate"
        v-on:change="srChanged"
        thumb-label
      />
      <v-switch
        class="__input"
        v-model="tracker_data.stream_on"
        v-on:change="streamChanged"
        label="Data Streaming enabled"
      />
      <!--<v-text-field class="textin" label="IP Address"/>
      <v-text-field class="textin" label="Subnet Mask"/>-->
      <v-card-actions>
        <v-btn text v-on:click="save">SAVE</v-btn>
        <v-btn text v-on:click="reboot">REBOOT</v-btn>
        <v-spacer />
        <v-btn text>SETTINGS</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  props: ["tracker_data"],
  data: () => {
    return {
      test: ""
    };
  },
  methods: {
    streamChanged() {
      this._io.emit(
        "htrk.stream.changed",
        this.tracker_data.id,
        this.tracker_data.stream_on
      );
    },
    srChanged() {
      this._io.emit(
        "htrk.sr.changed",
        this.tracker_data.id,
        this.tracker_data.samplerate
      );
    },
    save() {
      this._io.emit("htrk.save", this.tracker_data.id);
    },
    reboot() {
      this._io.emit("htrk.reboot", this.tracker_data.id);
    }
  }
};
</script>

<style>
#headtracker_title {
  padding: 0px;
  margin-left: 15px;
  margin-right: 15px;
}
.__status_box {
  padding: 0px;
  padding-top: 25px;
  margin: 0px;
}

#headtracker {
  margin: 20px;
  width: 400px;
}
.__input {
  margin: 15px;
}
</style>