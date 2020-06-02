class SceneLockPick extends PIXI.Container {
  constructor() {
    super();
    this.initialize()
    this.create()
  }

  initialize () {

    // ***
    // Options
    // ***

    // Sample start speed 1.5px (90px/s)
    this._initialSpeed = 1.7
    // Sample speeed up 0.2. Every level up is +0.2. 1.7, 1.9, 2.1
    this._speedUp = 0.25
    // How many blocks will be created before speed up
    this._blocksToSpeedUp = 10
    // Width and height of grid square in pixels
    this._squareSize = 36
    // Width of grid in squares
    this._gridWidthInSquares = 8
    // Min and max size of blocks in squares
    // Range of blocks geometry will be auto-generated
    this._blockMinWidth = 1
    this._blockMaxWidth = 3
    this._blockMinHeight = 1
    this._blockMaxHeight = 3

    // Blocks to ignore, e.g. [ '2x2', '1x2', ... ]
    this._filteredBlocks = []
    // this._filteredBlocks = ['3x3']

    // Distance between blocks in pixels
    this._blockDistance = 150

    this._screwdriverSpeed = -0.2
    this._hairpinSpeed = 0.4

    this._blockHitZoneShrinkSize = 3.6
    this._pointHitZoneRadius = 20

    // ***
    // End of options
    // ***

    this._blocksToWin = 50

    this._angle = Math.PI / 2
    this._targetAngle = this._angle
    this._screwdriverOffset = -(this._angle * this._screwdriverSpeed)
    this._hairpinOffset = -(this._angle * this._hairpinSpeed)
    // Precision of colliding interpolation
    this._angleStep = 0.005
    this._rotationSpeed = 0.05
    this._radius = 100
    this._collided = false
    this._blockCount = 0
    this._speed = this._initialSpeed
    this._gridWidth = this._squareSize * this._gridWidthInSquares
    this._circleY = Math.floor(app.screen.height / 2 - this._radius)
    this._circleX = (this._gridWidth - this._radius * 2) / 2
    this._bottomY = this._circleY + this._radius * 2 + this._pointHitZoneRadius
    this._currentCountToWin = this._blocksToWin
    this._destroyedCount = 0
    this._state = 'process'
    this._wait = 0

    /**
     *
     * @type {Array.<LockPickColliderRect|LockPickColliderCircle>}
     * @private
     */
    this._colliders = []
    /**
     *
     * @type {Array.<LockPickColliderCircle>}
     * @private
     */
    this._collidersPoints = []
    /**
     *
     * @type {Array.<LockPickColliderRect>}
     * @private
     */
    this._collidersBlocks = []
    this.interactive = true

    this.makeSizes()
    this._index = 0

  }

  makeSizes () {
    this._sizes = []

    for (let w = this._blockMinWidth; w <= this._blockMaxWidth; w++) {
      for (let h = this._blockMinHeight; h <= this._blockMaxHeight; h++) {
        if (!this._filteredBlocks.includes(w + 'x' + h)) {
          this._sizes.push({ w: w * this._squareSize, h: h * this._squareSize })
        }
      }
    }

    this._sizes = _.shuffle(this._sizes)
  }

  updateDebugDisplay () {
    if (!this._debugContainer) {
      return
    }

    this._debugContainer._picklocksText.text = `Picklocks: ${ItemsManager.numItems('picklocks')}`
    this._debugContainer._hairpinsText.text = `Hairpins: ${ItemsManager.numItems('hairpin')}`
    this._debugContainer._createdText.text = `Created: ${this._blockCount}`
    this._debugContainer._speedText.text = `Speed: ${this._speed} (${(this._speed * 60).toFixed(2)}px/s)`
    this._debugContainer._blockSize.text = `Block: ${this._squareSize}x${this._squareSize}`
    this._debugContainer._widthText.text = `Width: ${this._blockMinWidth}-${this._blockMaxWidth}`
    this._debugContainer._heightText.text = `Height: ${this._blockMinHeight}-${this._blockMaxHeight}`
    this._debugContainer._betweenText.text = `Between: ${this._blockDistance}px`
    this._debugContainer._figureVariants.text = `Variants: ${this._sizes.length}`

    const lastBlock = this._collidersBlocks[this._collidersBlocks.length - 1]

    if (lastBlock) {
      this._debugContainer._lastGeometryText.text = `Last geometry: ${lastBlock._rw}/${lastBlock._rh}px`
    }
  }

  create () {
    this.createBg()
    this.createCount()
    this.createScrewdriver()
    this.createHairpin()
    this.createMain()
    this.createPoint()
    this.updateHairpin()
    this.updateScrewdriver()

    const bgs = loader.resources.bgs.sound
    bgs.volume = 0.5
    bgs.play({loop: true})

    const bgm = loader.resources.bgm.sound
    bgm.volume = 0.7
    bgm.play({loop: true})
  }

  createBg () {
    this._bg = new PIXI.Sprite(loader.resources.atlas.textures['background.png'])
    this.addChild(this._bg)
  }

  createCount () {
    const style = {
      wordWrap: true,
      wordWrapWidth: 272,
      fontFamily: 'game_font_en',
      fontSize: '70px',
      fontStyle: 'normal',
      align: 'left',
      strokeThickness: 3,
      fill: '#ffffff',
      lineHeight: 20,
      dropShadowDistance: 0
    }

    this._count = new PIXI.Text('', style)
    this._count.position.set(326, 346)
    this.addChild(this._count)
    this.updateCountText()
  }

  updateCountText () {
    this._count.text = `${this._currentCountToWin}`
    this._count.pivot.x = Math.floor(this._count.width / 2)
  }

  createHairpin () {
    this._hairpin = new PIXI.Sprite(loader.resources.atlas.textures['hairpin.png'])
    this._hairpin.pivot.set(19, 351)
    this._hairpin.position.set(683, 384)
    this.addChild(this._hairpin)
  }

  createScrewdriver () {
    this._screwdriver = new PIXI.Sprite(loader.resources.atlas.textures['screwdriver.png'])
    this._screwdriver.pivot.set(103, 102)
    this._screwdriver.position.set(683, 384)
    this.addChild(this._screwdriver)
  }

  createMain () {
    this._mainContainer = new PIXI.Container()
    this._mainContainer.x = 1366 / 2 - this._gridWidth / 2
    this._mainContainer.y = 0
    this.addChild(this._mainContainer)
  }

  createPoint () {
    this._point1 = new LockPickColliderCircle(this._pointHitZoneRadius)
    this._mainContainer.addChild(this._point1)

    this._point2 = new LockPickColliderCircle(this._pointHitZoneRadius)
    this._mainContainer.addChild(this._point2)

    this._colliders.push(this._point1, this._point2)
    this._collidersPoints.push(this._point1, this._point2)

    this.updatePoint()
  }

  createBlock () {
    const size = this._sizes[this._index]
    // const width = getRandom(this._blockMinWidth, this._blockMaxWidth)
    // const height = getRandom(this._blockMinHeight, this._blockMaxHeight)

    const block = new LockPickColliderRect(size.w, size.h, this._squareSize, this._blockHitZoneShrinkSize)
    // const block = new LockPickColliderRect(getRandom(35, 150), getRandom(80, 100))
    const chunk = Math.floor(this._squareSize / 2)
    block.x = this.getRandomNumber(chunk, this._gridWidth - size.w - chunk)
    block.x = block.x - (block.x % chunk) + this._blockHitZoneShrinkSize

    block._ry = -block.height
    this._mainContainer.addChild(block)
    this._colliders.push(block)
    this._collidersBlocks.push(block)

    this._blockCount++
    this._index++

    if (this._index > this._sizes.length - 1) {
      this._index = 0
      this._sizes = _.shuffle(this._sizes)
    }

    this.updateDebugDisplay()
  }

  angle (cx, cy, ex, ey) {
    var dy = ey - cy
    var dx = ex - cx
    return Math.atan2(-dy, dx)
  }

  updatePoint () {
    this._point1.x = Math.floor(this._radius + (this._radius * Math.sin(this._angle)) - (this._point1.width / 2))
    this._point1.y = Math.floor(this._radius + (this._radius * Math.cos(this._angle)) - (this._point1.height / 2) + this._circleY)
    this._point2.x = Math.floor((2 * this._radius - this._point1.x) - this._point2.width)
    this._point2.y = Math.floor((2 * this._radius - this._point1.y) - this._point2.height + (this._circleY * 2))

    this._point1.x += this._circleX
    this._point2.x += this._circleX
  }

  updateBlocksCreate () {
    if (this._blockCount >= this._blocksToWin) {
      return
    }

    const last = this._collidersBlocks[this._collidersBlocks.length - 1]

    if (!last) {
      this.createBlock()
    } else if (last.y > this._blockDistance) {
      this.createBlock()
    }
  }

  updateInput () {
    if (!this.isActive()) {
      return
    }

    if (Input.isPressed('left')) {
      this._targetAngle += this._rotationSpeed
    } else if (Input.isPressed('right')) {
      this._targetAngle -= this._rotationSpeed
    } else if (TouchInput.isPressed()) {
      this._targetAngle += this._rotationSpeed
    } else if (TouchInput.isRightPressed()) {
      this._targetAngle -= this._rotationSpeed
    }
  }

  updateFall () {
    this._collidersBlocks.forEach(block => {
      block._ry += this._speed
      block.y = Math.floor(block._ry)
    })
  }

  updateRealAngle () {
    if (Math.abs(this._angle - this._targetAngle) < this._angleStep) {
      this._angle = this._targetAngle
    } else if (this._angle > this._targetAngle) {
      this._angle -= this._angleStep
    } else if (this._angle < this._targetAngle) {
      this._angle += this._angleStep
    }
  }

  updateCollision () {
    for (let i = 0; i < this._collidersBlocks.length; i++) {
      const collider = this._collidersBlocks[i]

      if (collider.isCollidedWith(this._point1)) {
        collider.setCollided(true)
        this._point1.setCollided(true)
        this._collided = true
        return
      }

      if (collider.isCollidedWith(this._point2)) {
        collider.setCollided(true)
        this._point2.setCollided(true)
        this._collided = true
        return
      }
    }
  }

  reset () {
    this._collidersBlocks.forEach(block => block.destroy({ children: true }))
    this._collidersBlocks = []
    this._point1.setCollided(false)
    this._point2.setCollided(false)
    this._collided = false
    this._angle = Math.PI / 2
    this._targetAngle = this._angle
    this._speed = 1.5
    this._blockCount = 0
    this._currentCountToWin = this._blocksToWin
    this._destroyedCount = 0
    this.updatePoint()
    this.updateCountText()
  }

  updateBlocksDestroy () {
    const lowerBlock = this._collidersBlocks[0]
    if (lowerBlock && lowerBlock.y > app.screen.height) {
      const block = this._collidersBlocks.shift()
      block.destroy({ children: true })
      this._destroyedCount++
    }
  }

  updateHairpin () {
    this._hairpin.rotation = this._angle * this._hairpinSpeed + this._hairpinOffset
  }

  updateScrewdriver () {
    this._screwdriver.rotation = this._angle * this._screwdriverSpeed + this._screwdriverOffset
  }

  updateSpeed () {
    const oldSpeed = this._speed

    this._speed = this._initialSpeed + (Math.floor(this._blockCount / this._blocksToSpeedUp) * this._speedUp)

    if (oldSpeed !== this._speed) {
      this.updateDebugDisplay()
    }
  }

  updateCount () {
    const oldCount = this._currentCountToWin

    this._currentCountToWin = this._blocksToWin - this._destroyedCount

    for (let i = 0; i < this._collidersBlocks.length; i++) {
      const block = this._collidersBlocks[i]

      if (block.y > this._bottomY) {
        this._currentCountToWin--
        continue
      }

      break
    }

    if (oldCount !== this._currentCountToWin) {
      this.updateCountText()
      this.playRandomClick()
    }
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  playRandomClick () {
    const sound = loader.resources[`click${this.getRandomNumber(1,11)}`].sound;
    sound.volume = 0.7
    sound.play()
  }

  isActive () {
    return this._state === 'process'
  }

  updateState () {
    if (this._state === 'exiting') {
      return
    }

    if (this._state === 'cleanup') {
      this.reset()
      this._state = 'process'
      return
    }

    if (this._collided || this._currentCountToWin === 0) {
      const sound = this._collided ? loader.resources.fail.sound : loader.resources.success.sound

      sound.volume = 0.5
      sound.play()

      this._wait = 100
      this._state = 'cleanup'
    }
  }

  updateGameProcess () {
    this.updateInput()

    while (this._angle !== this._targetAngle) {
      this.updateRealAngle()
      this.updatePoint()
      this.updateCollision()

      if (this._collided) {
        // Collided, stop check
        this._targetAngle = this._angle
      }
    }

    this.updateCount()

    this.updateSpeed()
    this.updateBlocksCreate()
    this.updateFall()
    this.updateBlocksDestroy()

    this.updateHairpin()
    this.updateScrewdriver()

    this.updateCollision()
  }

  update () {
    if (this._wait) {
      this._wait--
      return
    }

    this.updateState()

    if (this._state === 'process') {
      this.updateGameProcess()
    }
  }
}
