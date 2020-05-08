/* eslint-disable no-unused-vars,no-undef */

import paper from 'paper';
import { Path, Point, Color, PointText } from 'paper';
import 'typeface-nanum-gothic-coding';

const p = paper;

function wrap(x, min, max) {
    let range_size = max - min + 1;
    if (x < min) x += range_size * ((min - x) / range_size + 1);
    return min + ((x - min) % range_size);
}

class PannedSource {
    /**
     *
     * @param {number} a
     * @param {number} e
     * @param {number} id
     * @param {string} name
     * @param {string} short_name
     */
    constructor(a, e, id, name, short_name) {
        this.need_update = false;
        this.parent = null;

        this.setAzm(a, true);
        this.setElv(e, true);

        this.id = id;
        this.name = name;
        this.short = short_name;

        this.selected = false;

        this.displayTooltip = (text, x, y) => {};
        this.destroyTooltip = () => {};
    }

    setAzm(a, nodraw) {
        this.a = wrap(a, 0, 4 * Math.PI);
        this.a_deg = wrap((a * 180) / Math.PI, -180, 180);

        if (!nodraw) this.redraw();
    }

    setElv(e, nodraw) {
        this.e = wrap(e, -Math.PI, Math.PI);
        this.e_deg = wrap((e * 180) / Math.PI, -90, 90);

        if (!nodraw) this.redraw();
    }

    setAzmDeg(a, nodraw) {
        this.a_deg = wrap(a, -180, 180);
        this.a = wrap(a * Math.PI / 180, -(Math.PI * 2), Math.PI * 2);

        if(!nodraw) this.redraw();
    }

    setElvDeg(e, nodraw) {
        this.e_deg = wrap(e, -90, 90);
        this.e = wrap(e * Math.PI / 180, -Math.PI, Math.PI);

        if(!nodraw) this.redraw();
    }

    redraw() {
        this.parent.scope.activate();

        this.remove();

        let obj_radius = 20 + (this.e * 2 / Math.PI) * 10;

        let r =
            this.parent.radius -
            (Math.abs(this.e * 2) / Math.PI) * this.parent.radius;

        let x = r * Math.cos(this.a - Math.PI / 2) + this.parent.center.x;
        let y = r * Math.sin(this.a - Math.PI / 2) + this.parent.center.y;

        this.obj = new Path.Circle(new Point(x, y), obj_radius);
        this.obj.fillColor = '#fcba03';
        this.obj.strokeColor = this.selected ? 'red' : '#eeeeee';
        this.obj.strokeWidth = '2';

        this.obj.shadowColor = '#000000';

        let offs = (this.e + Math.PI / 2) * 4;

        this.obj.shadowOffset = new Point(offs, offs);
        this.obj.shadowBlur = 4 + (this.e + Math.PI / 2) * 7;

        this.txt = new PointText(new Point(x, y));
        this.txt.style.fontFamily = 'Nanum Gothic Coding';

        this.txt.justification = 'center';
        this.txt.content = this.short;

        this.txt.fitBounds(this.obj.internalBounds);
        this.txt.scale(0.9, new Point(x, y));

        this.hitbox = new Path.Circle(new Point(x, y), obj_radius);
        this.hitbox.fillColor = new Color(0, 0, 0, 0.01);

        let self = this;

        this.hitbox.onMouseEnter = () => {
            self.obj.strokeWidth = 4;
            self.parent.scope.view.requestUpdate();
            self.parent.displayTooltip(this.name, x, y + obj_radius);
        };

        this.hitbox.onMouseLeave = () => {
            self.obj.strokeWidth = 2;
            self.parent.scope.view.requestUpdate();
            self.parent.destroyTooltip();
        };
    }

    remove() {
        this.parent.scope.activate();

        if (this.hitbox) this.hitbox.remove();

        if (this.obj) this.obj.remove();

        if (this.txt) this.txt.remove();
    }

    /**
     * @param {Point} p
     */
    checkIntersect(p) {
        if (this.hitbox) return this.hitbox.hitTest(p);
        else return false;
    }

    select() {
        this.selected = true;
        this.redraw();
    }

    deselect() {
        this.selected = false;
        this.redraw();
    }

    attach(parent) {
        this.parent = parent;
    }
}

export default class PanCanvas {
    constructor() {
        this.coord_segs = [];
        this.coord_lines = [];
        this.sources = [];

        this.onSelect = () => {};
        this.onDeselect = () => {};

        this.selectedSourceChanged = () => {};

        this.onReady = () => {};
    }

    attach(id) {
        document.fonts.load('10pt "Nanum Gothic Coding"').then(() => {
            this.scope = new p.PaperScope();

            this.canvas = document.getElementById(id);
            this.ctx = this.canvas.getContext('2d');

            this.scope.install(this.canvas);
            this.scope.setup(this.canvas);

            this.canvas.style.height = '100%';
            this.canvas.style.width = '100%';

            this.scope.view.onMouseDown = event => {
                let s = this.getSourceAt(event.point);
                if (s) {
                    if (s.selected) {
                        s.deselect();
                        this.onDeselect();
                    } else {
                        s.select();
                        this.onSelect();
                    }
                }
            };

            this.scope.view.onMouseDrag = event => {
                console.log(event);
            };

            this.resize();
            this.ready = true;

            if (this.dirty) this.redrawAllSources();

            this.redrawAllSources();
        });
    }

    updateSelf() {
        var dpr = window.devicePixelRatio || 1;

        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;

        this.ctx.scale(dpr, dpr);

        this.h = this.canvas.height / dpr;
        this.w = this.canvas.width / dpr;
    }

    redrawCoordSystem() {
        this.scope.activate();

        let dia = Math.min(this.w, this.h);

        if (this.coordOutline) this.coordOutline.remove();

        this.coord_segs.forEach(seg => seg.remove());
        this.coord_lines.forEach(seg => seg.remove());

        this.center = new p.Point(this.w / 2, this.h / 2);
        this.radius = dia / 2 - dia / 10;

        let segments = Math.floor(this.radius / (30 + this.radius / 100));
        let segment_size = this.radius / segments;
        let color_steps = Math.floor(70 / segments);

        for (let i = 0; i < segments; ++i) {
            let cstep = color_steps * i;

            let segment = new p.Path.Circle(
                this.center,
                (segments - i) * segment_size
            );

            segment.fillColor = new p.Color(
                (70 + cstep) / 255,
                (70 + cstep) / 255,
                (120 + cstep) / 255
            );

            segment.strokeColor = '#aaaaaa';

            this.coord_segs.push(segment);
        }

        let csegs = 8;

        for (let i = 0; i < csegs; ++i) {
            let angle = ((2 * Math.PI) / csegs) * i;
            let x = this.radius * Math.cos(angle);
            let y = this.radius * Math.sin(angle);

            let line = new p.Path.Line(
                this.center,
                new p.Point(this.center.x + x, this.center.y + y)
            );

            line.strokeColor = '#414141';

            this.coord_lines.push(line);
        }

        this.coordOutline = new p.Path.Circle(this.center, this.radius);

        this.coordOutline.strokeColor = '#ffffff';
        this.coordOutline.strokeWidth = 2;
    }

    getSourceAt(p) {
        let i = this.sources.findIndex(s => s.checkIntersect(p));
        return this.sources[i];
    }

    setData(panner_data) {
        let self = this;
        this.basedata = panner_data;

        this.basedata.forEach(d => {
            let s = new PannedSource(d.a, d.e, d.id, d.name, d.short);
            s.attach(self);
            self.sources.push(s);
        });
    }

    redrawAllSources() {
        if (this.ready) this.sources.forEach(s => s.redraw());
        else this.dirty = true;
    }

    updateSource(source_id) {}

    getSelected() {
        return this.sources.find(s => s.selected);
    }

    resize() {
        this.updateSelf();
        this.redrawCoordSystem();
        this.redrawAllSources();
    }
}
