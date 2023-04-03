window.requestAnimFrame = function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

/** DAT GUI **/
var guiControls = new function () {

    this.maxDrops = 800;

    this.speed = 40;

    this.wind = 3;

    this.mouseBlock = 70;

}
var datGUI = new dat.GUI();
// add variables to the UI
datGUI.add(guiControls, 'maxDrops', 100, 2000);
datGUI.add(guiControls, 'speed', 10, 100);
datGUI.add(guiControls, 'wind', -4, 4);
datGUI.add(guiControls, 'mouseBlock', 0, 100);

var meter = new FPSMeter();

/** global vars **/
var oSize = {
    h: document.body.clientHeight,
    w: document.body.clientWidth
};
var oMouse = {
    x: -500,
    y: -500
};
var oCanvas = document.getElementById('rainfall');
var oCanvasCtx = oCanvas.getContext('2d');

oCanvas.height = oSize.h;
oCanvas.width = oSize.w;

update_mouse = function (_e) {

    oMouse.y = _e.pageY;
    oMouse.x = _e.pageX;

}
onresize = function () {
    oSize.w = oCanvas.width = window.innerWidth;
    oSize.h = oCanvas.height = window.innerHeight;
}
document.addEventListener('onresize', onresize, false);
document.addEventListener('mousemove', update_mouse, false);
window.onresize();

function drops() {
    this.aDrops = [];
    this.aImpacts = [];

    if (typeof drops.initialized == "undefined") {

        drops.prototype.rand = function (min, max) {
            return Math.random() * (max - min) + min;
        }

        drops.prototype.check_drop_collision = function (drop) {

            var radius = guiControls.mouseBlock;

            var dx = oMouse.x - drop.x;
            var dy = oMouse.y - drop.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            // detection collison circle
            if (distance < radius)
                return true;
            else
                return false;

        }

        drops.prototype.check_impact = function (drop) {
            if (drop.y > oSize.h) {
                return true;
            } else {
                return false;
            }
        }

        drops.prototype.add_impact = function (drop) {

            var nb = this.rand(2, 4);

            for (var i = 0; i < nb; i++) {
                this.aImpacts.push(this.build_impact(drop));
            };
        }

        drops.prototype.build_impact = function (drop) {
            var y = (drop.y > oSize.h) ? oSize.h - 1 : drop.y;

            oImpact = {
                x: drop.x,
                speedx: this.rand(-2, 2),
                y: y,
                speedy: this.rand(1, 3),
                r: this.rand(5, 10) / 10,
                a: drop.a,
                speeda: this.rand(3, 8),
                intens: -5,
                ampl: this.rand(3, 10),
                freq: this.rand(3, 10)
            }

            return oImpact;
        }

        drops.prototype.addDrop = function () {

            this.aDrops.push(this.build_drop());

        };

        drops.prototype.build_drop = function () {
            oDrop = {
                x: this.rand(-100, oSize.w + 100),
                y: -this.rand(50, 200),
                h: this.rand(3, 15),
                a: this.rand(1, 8),
                speedy: this.rand(guiControls.speed / 2.5, guiControls.speed),
                speedx: guiControls.wind
            }

            return oDrop;
        };

        drops.prototype.update_rain = function () {
            var resetDrop = this.build_drop.bind(this);
            var check_imp = this.check_impact.bind(this);
            var do_imp = this.add_impact.bind(this);
            var check_mouse = this.check_drop_collision.bind(this);
            var length = this.aDrops.length;

            for (var i = this.aDrops.length - 1; i >= 0; i--) {

                this.aDrops[i]

                this.aDrops[i].x = this.aDrops[i].x + this.aDrops[i].speedx;

                this.aDrops[i].y = this.aDrops[i].y + this.aDrops[i].speedy;

                if (check_imp(this.aDrops[i]))
                    do_imp(this.aDrops[i]);

                if (check_mouse(this.aDrops[i])) {

                    do_imp(this.aDrops[i]);
                    //drop = resetDrop();
                    if (this.aDrops[i].x < oMouse.x) {
                        this.aDrops[i].x = oMouse.x - guiControls.mouseBlock;
                        this.aDrops[i].y--;
                    }
                    else {
                        this.aDrops[i].x = oMouse.x + guiControls.mouseBlock;
                        this.aDrops[i].y++;
                    }
                }

                if (check_imp(this.aDrops[i]) && length < guiControls.maxDrops)
                    this.aDrops[i] = resetDrop();

                if (this.aDrops[i].y > oSize.h && length >= guiControls.maxDrops)
                    this.aDrops.splice(i, 1);

            };
        }

        drops.prototype.update_imp = function () {

            for (var i = this.aImpacts.length - 1; i >= 0; i--) {

                this.aImpacts[i].x = this.aImpacts[i].x + this.aImpacts[i].speedx;

                this.aImpacts[i].y = this.aImpacts[i].ampl * Math.sin(this.aImpacts[i].intens / this.aImpacts[i].freq) + this.aImpacts[i].y;

                this.aImpacts[i].intens++;

                this.aImpacts[i].a = this.aImpacts[i].a - (this.aImpacts[i].speeda / 10);


                if (this.aImpacts[i].a <= 0)
                    this.aImpacts.splice(i, 1);
            };

        }

        drops.prototype.draw = function (ctx) {

            for (var i = this.aDrops.length - 1; i >= 0; i--) {


                ctx.beginPath();
                ctx.moveTo(this.aDrops[i].x, this.aDrops[i].y);
                ctx.lineTo(this.aDrops[i].x + guiControls.wind, this.aDrops[i].y + this.aDrops[i].h);
                ctx.strokeStyle = 'rgba(200,230,255,' + (this.aDrops[i].a / 10) + ')';
                ctx.stroke();

            };

            for (var i = this.aImpacts.length - 1; i >= 0; i--) {


                ctx.beginPath();
                ctx.arc(this.aImpacts[i].x, this.aImpacts[i].y, this.aImpacts[i].r, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(200,230,255,' + (this.aImpacts[i].a / 10) + ')';
                ctx.fill();

            };

        }

        drops.initialized = true;
    }
}

var oRain = new drops();

/** ANIMATION */
function render() {

    oCanvasCtx.clearRect(0, 0, oSize.w, oSize.h);

    if (oRain.aDrops.length < guiControls.maxDrops)
        oRain.addDrop();

    oRain.update_rain();

    oRain.update_imp();

    oRain.draw(oCanvasCtx);

    requestAnimationFrame(render);

    meter.tick();
}
render();