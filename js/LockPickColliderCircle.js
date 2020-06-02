class LockPickColliderCircle extends LockPickCollider {
  constructor (r) {
    super(r)
    // this.circular = true;
    // Undocumented?
    // this.diameter = r * 2;
    this.radius = r
  }

  setCollided (value) {
    super.setCollided(value)
    this._sprite.tint = value ? 0xFF0000 : 0xFFFFFF
  }

  draw (r) {
    this._rw = r * 2
    this._rh = r * 2

    const texture = loader.resources.atlas.textures['point.png']

    this._sprite = new PIXI.Sprite(texture)
    this._sprite.x = Math.floor(this._rw / 2 - this._sprite.width / 2)
    this._sprite.y = Math.floor(this._rh / 2 - this._sprite.height / 2)
    this.addChild(this._sprite)
  }
}
