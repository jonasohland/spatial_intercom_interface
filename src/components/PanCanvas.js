/* eslint-disable no-unused-vars,no-undef */

import paper from 'paper';

const p = paper;

function setupCanvas(canvas) {
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    var rect = canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var ctx = canvas.getContext('2d');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
    return canvas;
}

export default class PanCanvas {
    constructor() {}

    attach(id) {

        this.scope = new p.PaperScope();

        this.canvas = setupCanvas(document.getElementById(id));
        this.ctx = this.canvas.getContext('2d');

        this.scope.install(this.canvas);
        this.scope.setup(this.canvas);

        this.resize();
        this.resize();

        this.ready = true;
    }

    updateSelf() {

        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        this.h = this.canvas.height;
        this.w = this.canvas.width;

    }

    resize() {

        this.updateSelf();

        if (this.test) this.test.remove();

        if (this.circ) this.circ.remove();

        this.test = new p.Path.Rectangle(
            new p.Rectangle(this.w / 4, this.h / 4, this.w / 2, this.h / 2)
        );

        this.circ = new p.Path.Circle(new p.Point(this.w / 2, this.h / 2), Math.min(this.h, this.w) / 4 - 10);

        this.circ.strokeColor = '#cccccc'
        this.test.strokeColor = '#ffffff'

        console.log('Resized!' + this.h);

        // this.scope.view.draw();
        // this.scope.view.requestUpdate();
    }
}
