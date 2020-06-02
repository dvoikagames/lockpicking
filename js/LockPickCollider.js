class LockPickCollider extends PIXI.Container {
  constructor (...args) {
    super()
    this.draw(...args)
    if (this._hover) {
      this._hover.visible = false
    }

    this._collided = false
  }

  draw () {

  }

  isCollideBoxBox (box1, box2) {
    return Intersects.boxBox(
      box1.x,
      box1.y,
      box1._rw,
      box1._rh,
      box2.x,
      box2.y,
      box2._rw,
      box2._rh
    )
  }

  isCollideBoxCircle (box, circle) {
    return Intersects.boxCircle(
      box.x,
      box.y,
      box._rw,
      box._rh,
      circle.x + circle.radius,
      circle.y + circle.radius,
      circle.radius
    )
  }

  isCollideCircleCircle (circle1, circle2) {
    return Intersects.circleCircle(
      circle1.x + circle1.radius,
      circle1.y + circle1.radius,
      circle1.radius,
      circle2.x + circle2.radius,
      circle2.y + circle2.radius,
      circle2.radius
    )
  }

  isCollidedWith (collider) {
    if (collider === this) {
      return
    }

    if (this.radius && collider.radius) {
      return this.isCollideCircleCircle(this, collider)
    }

    if (this.radius) {
      return this.isCollideBoxCircle(collider, this)
    }

    if (collider.radius) {
      return this.isCollideBoxCircle(this, collider)
    }

    return this.isCollideBoxBox(this, collider)
  }

  setCollided (value) {
    if (this._hover) {
      this._hover.visible = value
    }

    if (this._bg) {
      this._bg.visible = !value
    }

    this._collided = value
  }

  isCollided () {
    return this._collided
  }
}
