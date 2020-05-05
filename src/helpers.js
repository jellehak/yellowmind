import { WebCNN, TYPES } from './webcnn.esm.js'

/**
 * Load an image to a canvas
 *
 * @param {string} [path='']
 * @param {*} [ctx={}]
 * @returns ctx of the canvas
 */
export const loadImage = (path = '') => {
//   console.log('Load image from', path)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = (e) => {
      const canvas = document.createElement('canvas')
      canvas.width = 2800
      canvas.height = 2800
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      console.log('Image Loaded')
      resolve(ctx)
    }
    img.onerror = reject
    img.src = path // `${dataserver}${file.path}`
  })
}

export const loadImages = (files = []) => {
//   console.log('Load', files)

  const promises = files.map(file => {
    return loadImage(`${file}`)
  })

  return Promise.all(promises)
}

const defaultNetwork = [
  { name: 'image', type: 'inputImageLayer', width: 24, height: 24, depth: 1 },
  { name: 'conv1', type: 'convLayer', units: 10, kernelWidth: 5, kernelHeight: 5, strideX: 1, strideY: 1, padding: false },
  { name: 'pool1', type: 'maxPoolLayer', poolWidth: 2, poolHeight: 2, strideX: 2, strideY: 2 },
  { name: 'conv2', type: 'convLayer', units: 20, kernelWidth: 5, kernelHeight: 5, strideX: 1, strideY: 1, padding: false },
  { name: 'pool2', type: 'maxPoolLayer', poolWidth: 2, poolHeight: 2, strideX: 2, strideY: 2 },
  { name: 'out', type: 'FCLayer', units: 10, activation: 'softmax' }
]

export const createWebCNN = (layers = defaultNetwork, miniBatchSize = 20) => {
  const cnn = new WebCNN(miniBatchSize)
  layers.forEach(layer => {
    cnn.newLayer(layer)
  })
  cnn.initialize()

  cnn.setLearningRate(0.01)
  cnn.setMomentum(0.9)
  cnn.setLambda(0.0)

  return cnn
}

export const getTrainingDigitImage = (ctx, n, { examplesPerImageFile = 10000 } = {}) => {
  const imageFileIndex = Math.floor(n / examplesPerImageFile)
  const imageIndex = n % examplesPerImageFile

  // Add random 0-4 to position for data augmentation
  const y = 28 * Math.floor(imageIndex / 100) + Math.floor(Math.random() * 5)
  const x = 28 * (imageIndex % 100) + Math.floor(Math.random() * 5)

  return ctx[imageFileIndex].getImageData(x, y, 24, 24)
}

// ===============================
// Evaluates a random sample of 100 test images, for the
// purpose of plotting approximate test accuracy
export const getImageFromCtx = (ctx, n) => {
  // Add random 0-4 to position for data augmentation
  const y = 28 * Math.floor(n / 100) + Math.floor(Math.random() * 5)
  const x = 28 * (n % 100) + Math.floor(Math.random() * 5)
  return ctx.getImageData(x, y, 24, 24)
}

export function getWeightsAsJSON (_cnn = {}) {
  const networkObj = {}
  networkObj.layers = []

  // networkObj.miniBatchSize = _cnn.getMiniBatchSize();
  // networkObj.examplesSeen = examplesSeen
  // networkObj.miniBatchSize = miniBatchSize
  networkObj.momentum = _cnn.getMomentum()
  networkObj.learningRate = _cnn.getLearningRate()
  networkObj.lambda = _cnn.getLambda()

  for (var layerIndex = 0; layerIndex < _cnn.layers.length; ++layerIndex) {
    const layer = _cnn.layers[layerIndex]

    const layerObj = {}
    layerObj.name = layer.name
    layerObj.type = layer.type
    layerObj.index = layerIndex

    switch (layer.type) {
      case TYPES.LAYER_TYPE_INPUT_IMAGE:
      {
        layerObj.width = layer.outputDimensions.width
        layerObj.height = layer.outputDimensions.height
        layerObj.depth = layer.outputDimensions.depth
        break
      }

      case TYPES.LAYER_TYPE_FULLY_CONNECTED:
      {
        layerObj.units = layer.units
        layerObj.weights = []
        layerObj.activation = layer.activation
        for (var unit = 0; unit < layer.units; ++unit) {
          layerObj.weights[unit] = layer.weights[unit].getValuesAsArray()
          layerObj.biases = Array.from(layer.biases)
        }
        break
      }

      case TYPES.LAYER_TYPE_CONV:
      {
        layerObj.units = layer.units
        layerObj.weights = []
        layerObj.kernelWidth = layer.kernelWidth
        layerObj.kernelHeight = layer.kernelHeight
        layerObj.strideX = layer.strideX
        layerObj.strideY = layer.strideY
        layerObj.padX = layer.padX
        layerObj.padY = layer.padY

        for (let unit = 0; unit < layer.units; ++unit) {
          layerObj.weights[unit] = layer.kernels[unit].getValuesAsArray()
          layerObj.biases = Array.from(layer.biases)
        }

        break
      }

      case TYPES.LAYER_TYPE_MAX_POOL:
      {
        layerObj.poolWidth = layer.poolWidth
        layerObj.poolHeight = layer.poolHeight
        layerObj.strideX = layer.strideX
        layerObj.strideY = layer.strideY
        break
      }
    }

    networkObj.layers[layerIndex] = layerObj
  }

  return networkObj
}

/**
 * Example: saveWeightsAsJSON('cnn_' + Date.now() + '.json')
 * @param {*} filename
 */
export const saveWeightsAsJSON = (cnn, filename = 'file.json') => {
  const networkObj = getWeightsAsJSON(cnn)

  const json = JSON.stringify(networkObj, null, '\t')
  const a = document.createElement('a')
  a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(json))
  a.setAttribute('download', filename)
  a.click()
}

export const invertImage = (drawnImageData = {}) => {
  for (let i = 0; i < drawnImageData.data.length; i += 4) {
    drawnImageData.data[i] = 255 - drawnImageData.data[i]
    drawnImageData.data[i + 1] = 255 - drawnImageData.data[i + 1]
    drawnImageData.data[i + 2] = 255 - drawnImageData.data[i + 2]
  }
}
/**
 * Convert JSON object to new WebCNN object
 *
 * @param {*} [networkJSON={}]
 * @returns
 */
export const createFromJSON = (networkJSON = {}) => {
  const cnn = new WebCNN()

  if (networkJSON.momentum !== undefined) cnn.setMomentum(networkJSON.momentum)
  if (networkJSON.lambda !== undefined) cnn.setLambda(networkJSON.lambda)
  if (networkJSON.learningRate !== undefined) cnn.setLearningRate(networkJSON.learningRate)

  for (var layerIndex = 0; layerIndex < networkJSON.layers.length; ++layerIndex) {
    const layerDesc = networkJSON.layers[layerIndex]
    cnn.newLayer(layerDesc)
  }

  for (let layerIndex = 0; layerIndex < networkJSON.layers.length; ++layerIndex) {
    const layerDesc = networkJSON.layers[layerIndex]

    switch (networkJSON.layers[layerIndex].type) {
      case TYPES.LAYER_TYPE_CONV:
      case TYPES.LAYER_TYPE_FULLY_CONNECTED:
      {
        if (layerDesc.weights !== undefined && layerDesc.biases !== undefined) {
          cnn.layers[layerIndex].setWeightsAndBiases(layerDesc.weights, layerDesc.biases)
        }
        break
      }
    }
  }

  cnn.initialize()
  return cnn
}

export const preProcessDrawing = (ctxDraw, { paths, dots }) => {
  const TAU = Math.PI * 2
  const lineWidth = 28

  let drawnImageData = ctxDraw.getImageData(0, 0, ctxDraw.canvas.width, ctxDraw.canvas.height)

  var xmin = ctxDraw.canvas.width - 1
  var xmax = 0
  var ymin = ctxDraw.canvas.height - 1
  var ymax = 0
  var w = ctxDraw.canvas.width
  var h = ctxDraw.canvas.height

  // Find bounding rect of drawing
  for (let i = 0; i < drawnImageData.data.length; i += 4) {
    var x = Math.floor(i / 4) % w
    var y = Math.floor(i / (4 * w))

    if (drawnImageData.data[i] < 255 || drawnImageData.data[i + 1] < 255 || drawnImageData.data[i + 2] < 255) {
      xmin = Math.min(xmin, x)
      xmax = Math.max(xmax, x)
      ymin = Math.min(ymin, y)
      ymax = Math.max(ymax, y)
    }
  }

  const cropWidth = xmax - xmin
  const cropHeight = ymax - ymin

  if (cropWidth > 0 && cropHeight > 0 && (cropWidth < w || cropHeight < h)) {
    // Crop and scale drawing
    const scaleX = cropWidth / w
    const scaleY = cropHeight / h
    const scale = Math.max(scaleX, scaleY)
    const scaledLineWidth = Math.max(1, Math.floor(lineWidth * scale))
    const scaledDotWidth = Math.max(1, Math.floor(scaledLineWidth / 2))
    // console.log(scale);

    // Scaling down, redraw image with scale lineWidth
    const tempCanvas = document.createElement('canvas')

    // document.body.appendChild(tempCanvas);
    tempCanvas.width = w
    tempCanvas.height = h
    const ctx_temp = tempCanvas.getContext('2d')

    ctx_temp.strokeStyle = 'black'
    ctx_temp.fillStyle = 'black'
    ctx_temp.lineCap = 'round'
    ctx_temp.lineJoin = 'round'
    ctx_temp.lineWidth = scaledLineWidth

    // console.log(paths);

    // console.log(paths);
    for (var pathIndex = 0; pathIndex < paths.length; ++pathIndex) {
      var path = paths[pathIndex]
      if (path === undefined || path.length === 0) {
        continue
      }
      var p = path[0]
      ctx_temp.beginPath()
      ctx_temp.moveTo(p[0], p[1])

      for (var i = 1; i < path.length; ++i) {
        p = path[i]
        ctx_temp.lineTo(p[0], p[1])
      }
      ctx_temp.stroke()
    }

    for (var dotIndex = 0; dotIndex < dots.length; ++dotIndex) {
      var dotPos = dots[dotIndex]
      ctx_temp.beginPath()
      ctx_temp.arc(dotPos[0], dotPos[1], scaledDotWidth, 0, TAU)
      ctx_temp.fill()
    }

    drawnImageData = ctx_temp.getImageData(xmin, ymin, cropWidth, cropHeight)
  }

  // Invert black and white to match training data
  invertImage(drawnImageData)

  const canvas2 = document.createElement('canvas')
  canvas2.width = drawnImageData.width
  canvas2.height = drawnImageData.height
  // document.body.appendChild(canvas2);
  const ctx2 = canvas2.getContext('2d')
  ctx2.mozImageSmoothingEnabled = false
  ctx2.webkitImageSmoothingEnabled = false
  ctx2.msImageSmoothingEnabled = false
  ctx2.imageSmoothingEnabled = false
  ctx2.putImageData(drawnImageData, 0, 0)

  const canvas = document.createElement('canvas')
  canvas.width = 24
  canvas.height = 24
  // document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')
  ctx.mozImageSmoothingEnabled = false
  ctx.webkitImageSmoothingEnabled = false
  ctx.msImageSmoothingEnabled = false
  ctx.imageSmoothingEnabled = false

  // Preserve aspect ratio of cropped section, center it

  var xOffset = 0
  var yOffset = 0
  var xScale = 1
  var yScale = 1
  const padding = 1

  if (canvas2.width > canvas2.height) {
    yOffset = (canvas.width / (canvas2.width + 2 * padding)) * (canvas2.width - canvas2.height) / 2 + padding
    yScale = canvas2.height / canvas2.width

    xOffset = padding
  } else if (canvas2.height > canvas2.width) {
    xOffset = (canvas.height / canvas2.height) * (canvas2.height - canvas2.width) / 2 + padding
    xScale = canvas2.width / canvas2.height

    yOffset = padding
  }

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(canvas2, xOffset, yOffset, canvas.width * xScale - 2 * padding, canvas.height * yScale - 2 * padding)

  return ctx.getImageData(0, 0, 24, 24)
}
