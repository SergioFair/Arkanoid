
var GameLayer = cc.Layer.extend({
    spritePelota: null,
    velocidadX: null,
    velocidadY: null,
    spriteBarra: null,
    keyPulsada: null,
    arrayBloques: [],
    ctor: function () {
        this._super();
        cc.director.resume();
        var size = cc.winSize;

        // cachear
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionpanda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animaciontigre_plist);

        this.velocidadX = 6;
        this.velocidadY = 3;

        this.spritePelota = cc.Sprite.create(res.bola_png);
        this.spritePelota.setPosition(cc.p(size.width / 2, size.height / 2));
        this.spriteBarra = cc.Sprite.create(res.barra_2_png);
        this.spriteBarra.setPosition(cc.p(size.width / 2, size.height * 0.1));
        this.inicializarBloques();
        var spriteFondo = cc.Sprite.create(res.fondo_png);
        spriteFondo.setPosition(cc.p(size.width / 2, size.height / 2));
        spriteFondo.setScale(size.width / spriteFondo.width);
        this.addChild(spriteFondo, -1);
        this.addChild(this.spriteBarra);
        this.addChild(this.spritePelota);

        var actionMoverPelota1 = cc.MoveBy.create(1, cc.p(100, 0));
        var actionMoverPelota2 = cc.MoveBy.create(1, cc.p(0, 100));
        var actionMoverPelota3 = cc.MoveBy.create(1, cc.p(-100, 0));
        var actionMoverPelota4 = cc.MoveBy.create(1, cc.p(0, -100));
        var secuencia = cc.Sequence.create(actionMoverPelota1, actionMoverPelota2, actionMoverPelota3, actionMoverPelota4);
        this.spritePelota.runAction(secuencia);


        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this)


        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                var actionMoverBarraX = null;
                var instancia = event.getCurrentTarget();

                if (instancia.keyPulsada == keyCode)
                    return;

                instancia.keyPulsada = keyCode;

                if (keyCode == 37) {
                    console.log("Ir izquierda ");
                    actionMoverBarraX =
                        cc.MoveTo.create(Math.abs(instancia.spriteBarra.x - 0) / 500,
                            cc.p(0, cc.winSize.height * 0.1));
                }

                if (keyCode == 39) {
                    console.log("Ir derecha ");
                    actionMoverBarraX =
                        cc.MoveTo.create(Math.abs(instancia.spriteBarra.x - cc.winSize.width) / 500,
                            cc.p(cc.winSize.width, cc.winSize.height * 0.1));
                }

                cc.director.getActionManager().
                    removeAllActionsFromTarget(instancia.spriteBarra, true);

                if (actionMoverBarraX != null)
                    instancia.spriteBarra.runAction(actionMoverBarraX);

            },

            onKeyReleased: function (keyCode, event) {
                if (keyCode == 37 || keyCode == 39) {
                    var instancia = event.getCurrentTarget();
                    instancia.keyPulsada = null;
                    cc.director.getActionManager().
                        removeAllActionsFromTarget(instancia.spriteBarra, true);
                }
            }


        }, this);

        this.scheduleUpdate();

        return true;
    },
    procesarMouseDown: function (event) {
        var instancia = event.getCurrentTarget();

        cc.director.getActionManager().removeAllActionsFromTarget(instancia.spriteBarra, true);

        var actionMoverBarraX =
            cc.MoveTo.create(Math.abs(instancia.spriteBarra.x - event.getLocationX()) / 500,
                cc.p(event.getLocationX(),
                    cc.winSize.height * 0.1));

        instancia.spriteBarra.runAction(actionMoverBarraX);

    },
    update: function (dt) {

        var mitadAncho = this.spritePelota.getContentSize().width / 2;
        var mitadAlto = this.spritePelota.getContentSize().height / 2;

        // Nuevas posiciones
        this.spritePelota.x = this.spritePelota.x + this.velocidadX;
        this.spritePelota.y = this.spritePelota.y + this.velocidadY;

        //Colisiones
        var areaPelota = this.spritePelota.getBoundingBox();
        var areaBarra = this.spriteBarra.getBoundingBox();

        if (cc.rectIntersectsRect(areaPelota, areaBarra)) {
            console.log("Colision");
            this.velocidadX = (this.spritePelota.x - this.spriteBarra.x) / 5;
            this.velocidadY = this.velocidadY * -1;
        }

        var destruido = false;
        for (var i = 0; i < this.arrayBloques.length; i++) {
            var areaBloque = this.arrayBloques[i].getBoundingBox();
            if (cc.rectIntersectsRect(areaPelota, areaBloque)) {
                var desaparecer = cc.fadeOut(0.5);
                this.arrayBloques[i].runAction(desaparecer);
                this.arrayBloques.splice(i, 1);
                console.log("Quedan : " + this.arrayBloques.length);
                destruido = true;
            }
        }
        if (destruido) {
            this.velocidadX = this.velocidadX * -1;
            this.velocidadY = this.velocidadY * -1;
        }

        // Rebote
        if (this.spritePelota.x < 0 + mitadAncho) {
            this.spritePelota.x = 0 + mitadAncho;
            this.velocidadX = this.velocidadX * -1;
        }
        if (this.spritePelota.x > cc.winSize.width - mitadAncho) {
            this.spritePelota.x = cc.winSize.width - mitadAncho;
            this.velocidadX = this.velocidadX * -1;
        }
        if (this.spritePelota.y < 0 + mitadAlto) {
            cc.director.pause();
            this.addChild(new GameOverLayer());
        }
        if (this.spritePelota.y > cc.winSize.height - mitadAlto) {
            this.spritePelota.y = cc.winSize.height - mitadAlto;
            this.velocidadY = this.velocidadY * -1;
        }

        if (this.arrayBloques.length == 0) {
            cc.director.pause();
            this.addChild(new GameWinLayer());
        }

    },
    inicializarBloques: function () {
        var insertados = 0;
        var fila = 0;
        var columna = 0;

        var framesBloqueCocodrilo = [], framesBloquePanda = [], framesBloqueTigre = [];
        for (var i = 1; i <= 8; i++) {
            var str = "cocodrilo" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesBloqueCocodrilo.push(frame);
        }
        for (var i = 1; i <= 8; i++) {
            var str = "panda" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesBloquePanda.push(frame);
        }
        for (var i = 1; i <= 8; i++) {
            var str = "tigre" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesBloqueTigre.push(frame);
        }

        while (insertados < 50) {
            var aleatorio = Math.floor(Math.random() * 3);
            var animacionBloque;
            if (aleatorio == 0)
                animacionBloque = new cc.Animation(framesBloqueCocodrilo, 0.1);
            else if (aleatorio == 1)
                animacionBloque = new cc.Animation(framesBloquePanda, 0.1);
            else if (aleatorio == 2)
                animacionBloque = new cc.Animation(framesBloqueTigre, 0.1);
            var accionAnimacionBloque = new cc.RepeatForever(new cc.Animate(animacionBloque));

            var spriteBloqueActual;
            if (aleatorio == 0)
                spriteBloqueActual = new cc.Sprite("#cocodrilo1.png");
            else if (aleatorio == 1)
                spriteBloqueActual = new cc.Sprite("#panda1.png");
            else if (aleatorio == 2)
                spriteBloqueActual = new cc.Sprite("#tigre1.png");
            spriteBloqueActual.runAction(accionAnimacionBloque);

            var x = (spriteBloqueActual.width / 2) +
                (spriteBloqueActual.width * columna);
            var y = (cc.winSize.height - spriteBloqueActual.height / 2) -
                (spriteBloqueActual.height * fila);
            console.log("Insertado en: " + x + " ," + y);

            spriteBloqueActual.setPosition(cc.p(x, y));

            this.arrayBloques.push(spriteBloqueActual);
            this.addChild(spriteBloqueActual);

            insertados++;
            columna++;

            if (x + spriteBloqueActual.width / 2 > cc.winSize.width) {
                columna = 0;
                fila++;
            }
        }
    }

});

var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});