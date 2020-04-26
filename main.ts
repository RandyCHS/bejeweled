namespace SpriteKind {
    export const Item = SpriteKind.create()
    export const Scan = SpriteKind.create()
    export const Clear = SpriteKind.create()
}
namespace myTiles {
    //% blockIdentity=images._tile
    export const tile0 = img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`
}
scene.onHitWall(SpriteKind.Item, function (sprite) {
    stop(sprite)
})
function setupBoard () {
    for (let x = 0; x <= 9; x++) {
        for (let y = 0; y <= 5; y++) {
            imgIdx = Math.randomRange(0, itemImgs.length - 1)
            j = sprites.create(itemImgs[imgIdx], SpriteKind.Item)
            sprites.setDataNumber(j, "type", imgIdx)
            grid.place(j, tiles.getTileLocation(x, y + 1))
        }
    }
    isSettingUp = true
    scanBoard()
    settle()
}
function doSwap () {
    item1 = cursor
    item2 = cursor2
    for (let i of sprites.allOfKind(SpriteKind.Item)) {
        if (cursor.overlapsWith(i)) {
            item1 = i
        }
        if (cursor2.overlapsWith(i)) {
            item2 = i
        }
    }
    if (item1.kind() == SpriteKind.Item && item2.kind() == SpriteKind.Item) {
        grid.swap(item1, item2)
    }
    oldScore = info.score()
    scanBoard()
    settle()
    if (oldScore == info.score()) {
        grid.swap(item1, item2)
    }
}
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        cursor2.x = cursor.x - 16
        cursor2.y = cursor.y
    } else {
        cursor.x += -16
    }
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        cursor2.y = cursor.y + 16
        cursor2.x = cursor.x
    } else {
        cursor.y += 16
    }
})
function stop (sprite: Sprite) {
    sprite.ay = 0
    sprite.vy = 0
    grid.snap(sprite)
    scanFromSprite(sprite)
    if (isSettingUp) {
        renew()
    }
    settle()
}
function scanFromSprite (item: Sprite) {
    scanRow(grid.spriteRow(item))
    scanColumn(grid.spriteCol(item))
}
sprites.onOverlap(SpriteKind.Item, SpriteKind.Item, function (sprite, otherSprite) {
    stop(sprite)
    stop(otherSprite)
    if (sprite.overlapsWith(otherSprite)) {
        sprite.destroy()
    }
})
function checkTriplet (a: Sprite, b: Sprite, c: Sprite) {
    a2 = a
    b2 = b
    c2 = c
    if (a2 && b2 && c2) {
        if (sprites.readDataNumber(a, "type") == sprites.readDataNumber(b, "type") && sprites.readDataNumber(b, "type") == sprites.readDataNumber(c, "type")) {
            a.setFlag(SpriteFlag.Ghost, true)
            b.setFlag(SpriteFlag.Ghost, true)
            c.setFlag(SpriteFlag.Ghost, true)
            a.destroy(effects.smiles, 500)
            b.destroy(effects.smiles, 500)
            c.destroy(effects.smiles, 500)
            info.changeScoreBy(1)
            needSettle = true
        }
    }
}
function renew () {
    for (let value of tiles.getTilesByType(sprites.dungeon.doorOpenNorth)) {
        below = grid.getSprite(grid.add(value, 0, 1))
        on = grid.getSprite(value)
        if (!(below) && !(on)) {
            imgIdx = Math.randomRange(0, itemImgs.length - 1)
            j = sprites.create(itemImgs[imgIdx], SpriteKind.Item)
            sprites.setDataNumber(j, "type", imgIdx)
            grid.place(j, value)
            needSettle = true
        }
    }
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        if (cursor.x != cursor2.x || cursor.y != cursor2.y) {
            doSwap()
        }
        isSelected = false
        cursor2.destroy()
    } else {
        isSelected = true
        cursor2 = sprites.create(img`
5 5 5 5 5 5 5 . . 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 . . 5 5 5 5 5 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 5 5 5 5 5 . . 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 . . 5 5 5 5 5 5 5 
`, SpriteKind.Player)
        cursor2.x = cursor.x
        cursor2.y = cursor.y
    }
})
function scanColumn (col: number) {
    prev = cursor
    prevprev = cursor
    for (let s of grid.colSprites(col)) {
        checkTriplet(s, prevprev, prev)
        prevprev = prev
        prev = s
    }
}
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        cursor2.x = cursor.x + 16
        cursor2.y = cursor.y
    } else {
        cursor.x += 16
    }
})
function scanBoard () {
    for (let row = 0; row <= grid.numRows(); row++) {
        scanRow(row)
    }
    for (let col = 0; col <= grid.numColumns(); col++) {
        scanColumn(col)
    }
}
function scanRow (row: number) {
    prev = cursor
    prevprev = cursor
    for (let col = 0; col <= grid.numColumns(); col++) {
        s = grid.getSprite(tiles.getTileLocation(col, row))
        checkTriplet(s, prevprev, prev)
        prevprev = prev
        prev = s
    }
}
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        cursor2.y = cursor.y - 16
        cursor2.x = cursor.x
    } else {
        cursor.y += -16
    }
})
function settle () {
    if (needSettle) {
        for (let value of sprites.allOfKind(SpriteKind.Item)) {
            value.ay = 200
        }
        needSettle = false
    }
}
let isSettling = false
let s: Sprite = null
let prevprev: Sprite = null
let prev: Sprite = null
let on: Sprite = null
let below: Sprite = null
let needSettle = false
let c2: Sprite = null
let b2: Sprite = null
let a2: Sprite = null
let isSelected = false
let oldScore = 0
let cursor2: Sprite = null
let item2: Sprite = null
let item1: Sprite = null
let isSettingUp = false
let j: Sprite = null
let imgIdx = 0
let cursor: Sprite = null
let itemImgs: Image[] = []
tiles.setTilemap(tiles.createTilemap(
            hex`0a0008000303030303030303030302020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020201010101010101010101`,
            img`
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
2 2 2 2 2 2 2 2 2 2 
`,
            [myTiles.tile0,sprites.dungeon.floorDark0,sprites.dungeon.darkGroundSouthEast1,sprites.dungeon.doorOpenNorth],
            TileScale.Sixteen
        ))
itemImgs = [img`
. . . . . . . e c 7 . . . . . . 
. . . . e e e c 7 7 e e . . . . 
. . c e e e e c 7 e 2 2 e e . . 
. c e e e e e c 6 e e 2 2 2 e . 
. c e e e 2 e c c 2 4 5 4 2 e . 
c e e e 2 2 2 2 2 2 4 5 5 2 2 e 
c e e 2 2 2 2 2 2 2 2 4 4 2 2 e 
c e e 2 2 2 2 2 2 2 2 2 2 2 2 e 
c e e 2 2 2 2 2 2 2 2 2 2 2 2 e 
c e e 2 2 2 2 2 2 2 2 2 2 2 2 e 
c e e 2 2 2 2 2 2 2 2 2 2 4 2 e 
. e e e 2 2 2 2 2 2 2 2 2 4 e . 
. 2 e e 2 2 2 2 2 2 2 2 4 2 e . 
. . 2 e e 2 2 2 2 2 4 4 2 e . . 
. . . 2 2 e e 4 4 4 2 e e . . . 
. . . . . 2 2 e e e e . . . . . 
`, img`
. . . . . c c b b b . . . . . . 
. . . . c b d d d d b . . . . . 
. . . . c d d d d d d b b . . . 
. . . . c d d d d d d d d b . . 
. . . c b b d d d d d d d b . . 
. . . c b b d d d d d d d b . . 
. c c c c b b b b d d d b b b . 
. c d d b c b b b b b b b b d b 
c b b d d d b b b b b d d b d b 
c c b b d d d d d d d b b b d c 
c b c c c b b b b b b b d d c c 
c c b b c c c c b d d d b c c b 
. c c c c c c c c c c c b b b b 
. . c c c c c b b b b b b b c . 
. . . . . . c c b b b b c c . . 
. . . . . . . . c c c c . . . . 
`, img`
. . . . . . . . . . . . . . . . 
. . . . 8 8 8 8 8 8 8 8 . . . . 
. . . 8 8 8 8 9 9 9 1 1 . . . . 
. . 8 8 8 8 9 9 9 9 1 1 1 1 . . 
. 8 8 8 8 8 8 9 9 1 1 1 1 1 1 . 
. 8 8 8 8 8 8 8 1 1 1 1 1 1 1 . 
. 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . 
. 9 9 9 9 9 9 9 1 1 1 1 1 1 1 . 
. 9 9 9 9 9 9 9 1 1 1 1 1 1 1 . 
. . 9 9 9 9 9 9 1 1 1 1 1 1 . . 
. . . 9 9 9 9 9 1 1 1 1 1 . . . 
. . . . 9 9 9 9 1 1 1 1 . . . . 
. . . . . 9 9 9 1 1 1 . . . . . 
. . . . . . 9 9 1 1 . . . . . . 
. . . . . . . 9 1 . . . . . . . 
. . . . . . . . . . . . . . . . 
`]
setupBoard()
cursor = sprites.create(img`
5 5 5 5 5 5 5 . . 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 . . 5 5 5 5 5 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 . . . . . . . . . . . . 5 5 
5 5 5 5 5 5 5 . . 5 5 5 5 5 5 5 
5 5 5 5 5 5 5 . . 5 5 5 5 5 5 5 
`, SpriteKind.Player)
tiles.placeOnTile(cursor, tiles.getTileLocation(2, 2))
game.onUpdateInterval(500, function () {
    isSettling = false
    for (let value of sprites.allOfKind(SpriteKind.Item)) {
        if (value.ay > 0) {
            isSettling = true
        }
    }
    if (isSettingUp && !(isSettling)) {
        info.setScore(0)
        isSettingUp = false
    }
})
