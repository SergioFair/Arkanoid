
var nivelActual = 0;

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
        cc.audioEngine.playMusic(res.sonidobucle_wav, true);
        var size = cc.winSize;

        // cachear
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionpanda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animaciontigre_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionmono_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionkoala_plist);

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

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this)

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
        this.spritePelota.x = this.spritePelota.x + this.velocidadX*(1+nivelActual/10);
        this.spritePelota.y = this.spritePelota.y + this.velocidadY*(1+nivelActual/10);

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
                cc.audioEngine.playEffect(res.grunt_wav);
                if (this.arrayBloques.length > 0
                    && this.arrayBloques[i].getSpriteFrame()._texture.url.includes("mono")
                    && !this.spriteBarra.getSpriteFrame()._texture.url.includes("1")) {
                    this.reduceBar();
                } else if (this.arrayBloques.length > 0
                    && this.arrayBloques[i].getSpriteFrame()._texture.url.includes("koala")
                    && !this.spriteBarra.getSpriteFrame()._texture.url.includes("3")) {
                    this.enlargeBar();
                } /*else if (this.arrayBloques.length > 0
                    && this.arrayBloques[i].getSpriteFrame()._texture.url.includes("koala")) {
                    this.destruirBloquesColindantes(i, desaparecer);
                }
                else {
                    this.arrayBloques.splice(i, 1);
                }*/
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
            cc.audioEngine.stopMusic();
            nivelActual = 0;
            this.addChild(new GameOverLayer());
        }
        if (this.spritePelota.y > cc.winSize.height - mitadAlto) {
            this.spritePelota.y = cc.winSize.height - mitadAlto;
            this.velocidadY = this.velocidadY * -1;
        }

        if (this.arrayBloques.length == 0) {
            cc.director.pause();
            nivelActual++;
            this.addChild(new GameWinLayer());
        }

    },
    reduceBar: function () {
        let position = this.spriteBarra.getPosition();
        this.removeChild(this.spriteBarra);
        this.spriteBarra = new cc.Sprite.create(res.barra_1_png);
        this.spriteBarra.setPosition(cc.p(position.x, position.y));
        this.addChild(this.spriteBarra);
    },
    enlargeBar: function () {
        let position = this.spriteBarra.getPosition();
        this.removeChild(this.spriteBarra);
        this.spriteBarra = new cc.Sprite.create(res.barra_3_png);
        this.spriteBarra.setPosition(cc.p(position.x, position.y));
        this.addChild(this.spriteBarra);
    },
    inicializarBloques: function () {
        var insertados = 0;
        var fila = 0;
        var columna = 0;

        var framesBloqueCocodrilo = [], framesBloquePanda = []
            , framesBloqueTigre = [], framesBloqueMono = []
            , framesBloqueKoala = [], str, frame;
        for (let i = 1; i <= 8; i++) {

            // Cocodrilo
            str = "cocodrilo" + i + ".png";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesBloqueCocodrilo.push(frame);

            // Panda
            str = "panda" + i + ".png";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesBloquePanda.push(frame);

            // Tigre
            str = "tigre" + i + ".png";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesBloqueTigre.push(frame);

            // Mono
            str = "mono" + i + ".png";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesBloqueMono.push(frame);

            // Koala
            str = "koala" + i + ".png";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesBloqueKoala.push(frame);
        }

        var aleatorio, animacionBloque
            , accionAnimacionBloque, spriteBloqueActual;
        while (insertados < 50) {
            aleatorio = Math.floor(Math.random() * 5);
            animacionBloque;
            if (aleatorio == 0) {
                animacionBloque = new cc.Animation(framesBloqueCocodrilo, 0.1);
                spriteBloqueActual = new cc.Sprite("#cocodrilo1.png");
            }
            else if (aleatorio == 1) {
                animacionBloque = new cc.Animation(framesBloquePanda, 0.1);
                spriteBloqueActual = new cc.Sprite("#panda1.png");
            }
            else if (aleatorio == 2) {
                animacionBloque = new cc.Animation(framesBloqueTigre, 0.1);
                spriteBloqueActual = new cc.Sprite("#tigre1.png");
            }
            else if (aleatorio == 3) {
                animacionBloque = new cc.Animation(framesBloqueMono, 0.1);
                spriteBloqueActual = new cc.Sprite("#mono1.png");
            }
            else if (aleatorio == 4) {
                animacionBloque = new cc.Animation(framesBloqueKoala, 0.1);
                spriteBloqueActual = new cc.Sprite("#koala1.png");
            }
            accionAnimacionBloque = new cc.RepeatForever(new cc.Animate(animacionBloque));

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
    },
    destruirBloquesColindantes: function (index, accion) {
        let bloquesFila = Math.floor(cc.winSize.width / this.arrayBloques[0].width);
        let posicionFila = Math.floor(bloquesFila * index / this.arrayBloques.length);
        posicionFila--;
        let fila = index % bloquesFila;

        //indexes after
        if (index + bloquesFila - 1 < this.arrayBloques.length && index + bloquesFila - 1 >= 0
            && this.arrayBloques[index + bloquesFila - 1] !== undefined) {
            this.arrayBloques[index + bloquesFila - 1].runAction(accion);
            this.arrayBloques.splice(index + bloquesFila - 1, 1);
        }
        if (index + 1 < this.arrayBloques.length && index + 1 >= 0
            && this.arrayBloques[index + 1] !== undefined) {
            this.arrayBloques[index + 1].runAction(accion);
            this.arrayBloques.splice(index + 1, 1);
        }

        //current index
        this.arrayBloques[index].runAction(accion);
        this.arrayBloques.splice(index, 1);

        //indexes before
        if (index - 1 < this.arrayBloques.length && index - 1 >= 0
            && this.arrayBloques[index - 1] !== undefined) {
            this.arrayBloques[index - 1].runAction(accion);
            this.arrayBloques.splice(index - 1, 1);
        }
        if (index - bloquesFila < this.arrayBloques.length && index - bloquesFila >= 0
            && this.arrayBloques[index - bloquesFila] !== undefined) {
            this.arrayBloques[index - bloquesFila].runAction(accion);
            this.arrayBloques.splice(index - bloquesFila, 1);
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