<script>
/* eslint-disable camelcase */

let drawCanvas
let ctx_draw
let drawing = false
let lastPos
const lineWidth = 28
let drawingPathIndex = -1
let drawingDotsIndex = 0
let drawingPaths = []
let drawingDots = []
const TAU = Math.PI * 2
let freshCanvas = true

export function init (cb = () => {}) {
  drawCanvas = document.getElementById('drawCanvas')
  ctx_draw = drawCanvas.getContext('2d')
  ctx_draw.mozImageSmoothingEnabled = false
  ctx_draw.webkitImageSmoothingEnabled = false
  ctx_draw.msImageSmoothingEnabled = false
  ctx_draw.imageSmoothingEnabled = false

  resetDrawingCanvas()

  const onContextMenu = (e) => {
    e.preventDefault()
  }

  const onMouseDown = (e) => {
    if (freshCanvas) {
      freshCanvas = false
      ctx_draw.fillStyle = 'white'
      ctx_draw.fillRect(0, 0, drawCanvas.width, drawCanvas.height)
    }
    drawing = true
    drawingPathIndex++
    drawingPaths[drawingPathIndex] = []
    lastPos = [e.offsetX, e.offsetY]
    drawingDots[drawingDotsIndex] = lastPos
    drawingDotsIndex++
    ctx_draw.strokeStyle = 'black'
    ctx_draw.fillStyle = 'black'
    ctx_draw.lineCap = 'round'
    ctx_draw.lineJoin = 'round'
    ctx_draw.beginPath()
    ctx_draw.arc(e.offsetX, e.offsetY, lineWidth / 2, 0, TAU)
    ctx_draw.fill()
  }

  const onMouseUp = () => {
    if (drawing) {
    // guessNumber()

      // ===================
      // Emit to Parent
      // ===================
      const image = ctx_draw.getImageData(0, 0, ctx_draw.canvas.width, ctx_draw.canvas.height)
      const payload = { image, drawingPaths, ctx_draw, drawingDots }
      cb(payload)
      drawing = false
      lastPos = undefined
    }
  }

  const onMouseOut = () => {
    drawing = false
    lastPos = undefined
  }

  const onMouseOver = () => {

  }

  const onMouseMove = (e) => {
    if (!drawing) return
    if (e.target !== drawCanvas) {
      drawing = false
      lastPos = undefined
      return
    }

    var x = Math.max(0, Math.min(e.target.width, e.offsetX))
    var y = Math.max(0, Math.min(e.target.height, e.offsetY))

    if (e.offsetX > 0 && e.offsetX < e.target.width && e.offsetY > 0 && e.offsetY < e.target.height) {
      ctx_draw.lineWidth = lineWidth

      if (lastPos !== undefined) {
      // ctx_draw.beginPath();
      // ctx_draw.arc( x, y, 14, 0, TAU);
      // ctx_draw.fill();
        ctx_draw.beginPath()
        ctx_draw.moveTo(lastPos[0], lastPos[1])
        ctx_draw.lineTo(x, y)
        ctx_draw.stroke()
      } else {
        drawingPathIndex++
        ctx_draw.beginPath()
        ctx_draw.arc(x, y, lineWidth / 2, 0, TAU)
        ctx_draw.fill()
      }

      if (drawingPaths[drawingPathIndex] === undefined) {
        drawingPaths[drawingPathIndex] = []
      }

      drawingPaths[drawingPathIndex].push([x, y])
      lastPos = [x, y]
    } else {
      lastPos = undefined
    }
  }

  drawCanvas.addEventListener('mousedown', onMouseDown, false)
  window.addEventListener('mouseup', onMouseUp, false)
  drawCanvas.addEventListener('mousemove', onMouseMove, false)
  drawCanvas.addEventListener('contextmenu', onContextMenu, false)
  drawCanvas.addEventListener('mouseout', onMouseOut, false)
  drawCanvas.addEventListener('mouseover', onMouseOver, false)
}

function resetDrawingCanvas () {
  if (ctx_draw === undefined) { return }

  drawingDotsIndex = 0
  drawingDots = []
  freshCanvas = true
  ctx_draw.fillStyle = 'white'
  ctx_draw.fillRect(0, 0, drawCanvas.width, drawCanvas.height)
  ctx_draw.fillStyle = 'rgb(200,200,200)'
  ctx_draw.font = '22px Verdana'
  ctx_draw.fillText('Draw here your shape', 24, 150)
}

export const reset = () => {
  drawingPaths = []
  drawingPathIndex = -1
  lastPos = undefined

  // document.getElementById('guessNumberDiv').innerHTML = ''
  // document.getElementById('confidence').innerHTML = ''

  resetDrawingCanvas()
}

export default {
  mounted () {
    init((event) => {
      this.$emit('input', event)
    })
  },
  methods: {
    reset
  }
}
</script>

<template>
  <div class="inlineDiv">
    <div id="drawingCanvasDiv">
      <canvas
        id="drawCanvas"
        width="300"
        height="300"
      />
    </div>
    <v-btn
      text
      @click="reset"
    >
      Reset
    </v-btn>
  </div>
</template>

<style scoped>

#recognizer
{
    width: 100%;
    text-align: center;
}

#guessNumberDiv
{
    width: 300px;
    height: 300px;
    border: 1px solid;
    text-align: center;
    background-color: rgb( 255, 255, 255 );
    border-color: #cccccc;
    font-family: sans-serif;
    font-size: 256px;
    line-height: 300px;
}

#drawingCanvasDiv
{
    vertical-align: top;
}

.inlineDiv
{
    display: inline-block;
    vertical-align: top;
}

.buttonContainer
{
    padding: 10px 0px 10px 0px;
}

#controlsDiv
{
    font-family: sans-serif;
    font-size: 14px;
    color: black;
    text-align: left;
    padding: 0 0 0 0;
}

canvas
{
    cursor: default;
    border: 1px solid;
    border-color: #cccccc;
    outline: 0;
    vertical-align: bottom;
}

canvas.dragging
{
    cursor: crosshair;
}

.sliderGroup
{
    display: block;
    padding: 2px 2px 2px 2px;
}
</style>
