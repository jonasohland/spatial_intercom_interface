/* eslint-disable no-unused-vars,no-undef */

import paper from 'paper';

const p = paper;

export default class PanCanvas {

    constructor() {}

    attach(id, container_id) {

        this.scope = new p.PaperScope();

        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById(container_id);

        this.scope.install(this.canvas);
        this.scope.setup(this.canvas);


        this.test = new p.Path.Rectangle(new p.Rectangle(0,0,100,100), 0);
        this.test.fillColor = 'AAAAAA'

        this.resize();

        // this.resize();


        this.ready = true;
    }

    positionSelf() {
        // ...then set the internal size to match
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        this.h = this.canvas.height;
        this.w = this.canvas.width;
    }

    resize() {

        this.positionSelf();

        this.test.position = new p.Point(this.w / 2, this.h / 2);
        this.test.fitBounds(new p.Rectangle(this.w / 4, this.h / 4, this.w / 2, this.h / 2));
        this.test.fillColor = '#aaaaaa'

        console.log("Resized!" + this.h);
        this.scope.view.requestUpdate();
    }

}
