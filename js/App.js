var app = new PIXI.Application({
  width: window.innerWidth > 1366 ? 1366 : window.innerWidth,
  height: 768,
})

var loader = new PIXI.loaders.Loader()

loader.add('atlas', 'img/lockpick.json')
loader.add('bg', 'img/background.png')
loader.add('click1', 'sound/click1.ogg')
loader.add('click2', 'sound/click2.ogg')
loader.add('click3', 'sound/click3.ogg')
loader.add('click4', 'sound/click4.ogg')
loader.add('click5', 'sound/click5.ogg')
loader.add('click6', 'sound/click6.ogg')
loader.add('click7', 'sound/click7.ogg')
loader.add('click8', 'sound/click8.ogg')
loader.add('click9', 'sound/click9.ogg')
loader.add('click10', 'sound/click10.ogg')
loader.add('click11', 'sound/click11.ogg')
loader.add('success', 'sound/success.ogg')
loader.add('bgs', 'sound/bgs.ogg')
loader.add('bgm', 'sound/bgm.ogg')
loader.add('fail', 'sound/fail.ogg')
new FontFace('GameFont', `url('fonts/game_font_en.ttf')`).load()

Input.initialize()
TouchInput.initialize()

loader.load((loader, res) => {
    const bg = new PIXI.Sprite(loader.resources.bg.texture)
    bg.x = Math.floor((app.screen.width / 2) - (bg.width / 2))
    app.stage.addChild(bg);

    const game = new SceneLockPick()
    game.x = Math.floor((app.screen.width / 2) - (game.width / 2))
    app.stage.addChild(game);

    app.ticker.maxFPS = 60
    app.ticker.add((delta) => {
      Input.update()
      TouchInput.update()
      game.update()
    });
})

app.view.style.position = 'absolute';
app.view.style.margin = 'auto';
app.view.style.top = '0px';
app.view.style.left = '0px';
app.view.style.right = '0px';
app.view.style.bottom = '0px';
app.view.addEventListener("contextmenu", ( e )=> { e.preventDefault(); return false; } );

document.body.appendChild(app.view);
