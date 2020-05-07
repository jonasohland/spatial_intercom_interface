/* eslint-disable no-unused-vars,no-undef */

import paper from 'paper';

const p = paper;

export default class PanCanvas {
    constructor() {
        this.coord_segs = [];
        this.coord_lines = [];
    }

    attach(id) {

        this.scope = new p.PaperScope();

        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');

        this.scope.install(this.canvas);
        this.scope.setup(this.canvas);

        this.canvas.style.height = '100%';
        this.canvas.style.width = '100%';

        this.resize();

        this.ready = true;
    }

    updateSelf() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.h = this.canvas.height;
        this.w = this.canvas.width;
    }

    redrawCoordSystem() {

        let dia = Math.min(this.w, this.h);

        if (this.coordOutline) this.coordOutline.remove();

        this.coord_segs.forEach(seg => seg.remove());
        this.coord_lines.forEach(seg => seg.remove());

        let center = new p.Point(this.w / 2, this.h / 2);
        let coord_radius = dia / 2 - dia / 10;

        let segments = Math.floor(coord_radius / 40);
        let segment_size = coord_radius / segments;
        let color_steps = Math.floor(70 / segments);

        for (let i = 0; i < segments; ++i) {
            
            let cstep = color_steps * i;

            this.coord_segs.push(
                new p.Path.Circle(center, (segments - i) * segment_size)
            );

            this.coord_segs[this.coord_segs.length - 1].fillColor = new p.Color(
                (70 + cstep) / 255,
                (70 + cstep) / 255,
                (120 + cstep) / 255
            );

            this.coord_segs[this.coord_segs.length - 1].strokeColor = '#aaaaaa';
        }

        let csegs = 8;

        for (let i = 0; i < csegs; ++i) {

            let angle = ((2 * Math.PI) / csegs) * i;
            let x = coord_radius * Math.cos(angle);
            let y = coord_radius * Math.sin(angle);

            let line = new p.Path.Line(
                center,
                new p.Point(center.x + x, center.y + y)
            );

            line.strokeColor = '#414141';

            this.coord_lines.push(line);
        }

        this.coordOutline = new p.Path.Circle(center, coord_radius);

        this.coordOutline.strokeColor = '#ffffff';
        this.coordOutline.strokeWidth = 2;
    }

    resize() {

        this.updateSelf();
        this.redrawCoordSystem();

        console.log('Resized!' + this.h);
    }
}
