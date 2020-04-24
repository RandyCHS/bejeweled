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
function setupBoard () {
    for (let x = 0; x <= 9; x++) {
        for (let y = 0; y <= 5; y++) {
            imgIdx = Math.randomRange(0, itemImgs.length - 1)
            i = sprites.create(itemImgs[imgIdx], SpriteKind.Item)
            sprites.setDataNumber(i, "type", imgIdx)
            tiles.placeOnTile(i, tiles.getTileLocation(x, y + 1))
        }
    }
    scanBoard()
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
        dx = item1.x - item2.x
        dy = item1.y - item2.y
        item2.x += dx
        item2.y += dy
        item1.x += 0 - dx
        item1.y += 0 - dy
    }
}
function finishScan (scan: Sprite) {
    if (sprites.readDataNumber(scan, "numHit") >= 3) {
        clear = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . 2 2 . . . . . . . 
. . . . . . . 2 2 . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Clear)
        clear.setFlag(SpriteFlag.AutoDestroy, true)
        clear.x = scan.x - scan.vx
        clear.y = scan.y - scan.vy
        clear.vx = 0 - scan.vx
        clear.vy = 0 - scan.vy
        sprites.setDataNumber(clear, "type", sprites.readDataNumber(scan, "type"))
    }
}
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        cursor2.x = cursor.x - 16
    } else {
        cursor.x += -16
    }
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        cursor2.y = cursor.y + 16
    } else {
        cursor.y += 16
    }
})
function scanFrom (x: number, y: number) {
    scan = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . 3 3 . . . . . . . 
. . . . . . . 3 3 . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Scan)
    scan.left = x
    scan.top = y
    scan.setVelocity(1, 0)
    scan.setFlag(SpriteFlag.AutoDestroy, false)
}
sprites.onOverlap(SpriteKind.Scan, SpriteKind.Item, function (sprite, otherSprite) {
    if (!(sprites.readDataBoolean(sprite, "hasType"))) {
        sprites.setDataBoolean(sprite, "hasType", true)
        sprites.setDataNumber(sprite, "type", sprites.readDataNumber(otherSprite, "type"))
        sprites.setDataNumber(sprite, "numHit", 0)
    } else {
        if (sprites.readDataNumber(sprite, "type") == sprites.readDataNumber(otherSprite, "type")) {
            sprites.changeDataNumberBy(sprite, "numHit", 1)
            sprite.x += 16 * sprite.vx
            sprite.y += 16 * sprite.vy
        } else {
            sprite.destroy()
        }
    }
})
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
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        cursor2.x = cursor.x + 16
    } else {
        cursor.x += 16
    }
})
function scanBoard () {
    for (let x = 0; x <= 9; x++) {
        for (let y = 0; y <= 5; y++) {
            scanFrom(x * 16, (y + 1) * 16)
        }
    }
}
sprites.onDestroyed(SpriteKind.Scan, function (sprite) {
    finishScan(sprite)
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isSelected) {
        cursor2.y = cursor.y - 16
    } else {
        cursor.y += -16
    }
})
sprites.onOverlap(SpriteKind.Clear, SpriteKind.Item, function (sprite, otherSprite) {
    if (sprites.readDataNumber(sprite, "type") == sprites.readDataNumber(otherSprite, "type")) {
        otherSprite.destroy()
    } else {
        sprite.destroy()
    }
})
let scan: Sprite = null
let isSelected = false
let clear: Sprite = null
let dy = 0
let dx = 0
let cursor2: Sprite = null
let item2: Sprite = null
let item1: Sprite = null
let i: Sprite = null
let imgIdx = 0
let cursor: Sprite = null
let itemImgs: Image[] = []
tiles.setTilemap(tiles.createTilemap(
            hex`0a0008000101010101010101010102020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020201010101010101010101`,
            img`
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
. . . . . . . . . . 
`,
            [myTiles.tile0,sprites.dungeon.floorDark0,sprites.dungeon.darkGroundSouthEast1],
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
cursor.setPosition(24, 24)
