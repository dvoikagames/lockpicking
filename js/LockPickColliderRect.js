class LockPickColliderRect extends LockPickCollider {
  constructor (...args) {
    super(...args)
    this._ry = 0
  }

  draw (w, h, gridSize, shrink) {
    this._rw = w - shrink * 2
    this._rh = h - shrink * 2

    const texture = loader.resources.atlas.textures['box.png']

    const WH = 5

    this._slice = new PIXI.mesh.NineSlicePlane(texture, WH, WH, WH, WH)
    this._slice.width = w
    this._slice.height = h
    this._slice.position.set(-shrink, -shrink)

    this.addChild(this._slice)
  }
}
