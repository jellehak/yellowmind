/* eslint-disable camelcase */
import { WebCNN, TYPES } from './webcnn/webcnn.esm.js'
export { loadImages, loadImage } from './trainingLoadingHelpers.js'

// import { digit_labels } from './mnist_digit_labels'

// window.onload = () => {
//   Init()
// }

const totalTrainingImages = 50000
const examplesPerImageFile = 10000
const totalValidationImages = 10000
const offsetToValidationData = 50000
const totalTestImages = 10000
const offsetToTestData = 60000

const miniBatchSize = 20
const validationSampleSize = 100

let iterations = 0
let examplesSeen = 0
export const running = false
const paused = false
const testing = false

let ctx_error
let mostRecentTrainingError = 0
let prevError
let epoch = 0
let prevAccuracy
let plotX = 0
let lastAccPlotX

let forwardTime = 0
let backwardTime = 0

const defaultNetwork = [
  { name: 'image', type: 'inputImageLayer', width: 24, height: 24, depth: 1 },
  { name: 'conv1', type: 'convLayer', units: 10, kernelWidth: 5, kernelHeight: 5, strideX: 1, strideY: 1, padding: false },
  { name: 'pool1', type: 'maxPoolLayer', poolWidth: 2, poolHeight: 2, strideX: 2, strideY: 2 },
  { name: 'conv2', type: 'convLayer', units: 20, kernelWidth: 5, kernelHeight: 5, strideX: 1, strideY: 1, padding: false },
  { name: 'pool2', type: 'maxPoolLayer', poolWidth: 2, poolHeight: 2, strideX: 2, strideY: 2 },
  { name: 'out', type: 'FCLayer', units: 10, activation: 'softmax' }
]

export const datasets = {
  validationSetCtx: {},
  testSetCTX: {},
  trainingSetCTX: []
}

// =============
// Methods
// =============
// Convert Layers to Cnn Object
export const createNetwork = (layers = defaultNetwork) => {
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

export const cnn = createNetwork()

// =======
// Helpers
// =======

const getImageFromCtx = (ctx, n) => {
  // Add random 0-4 to position for data augmentation
  const y = 28 * Math.floor(n / 100) + Math.floor(Math.random() * 5)
  const x = 28 * (n % 100) + Math.floor(Math.random() * 5)
  return ctx.getImageData(x, y, 24, 24)
}

const getTrainingDigitImage = (ctx, n) => {
  const imageFileIndex = Math.floor(n / examplesPerImageFile)
  const imageIndex = n % examplesPerImageFile

  // Add random 0-4 to position for data augmentation
  const y = 28 * Math.floor(imageIndex / 100) + Math.floor(Math.random() * 5)
  const x = 28 * (imageIndex % 100) + Math.floor(Math.random() * 5)

  return ctx[imageFileIndex].getImageData(x, y, 24, 24)
}

function getValidationDigitImage (n) {
  return getImageFromCtx(datasets.validationSetCTX, n)
}

function getTestDigitImage (n) {
  return getImageFromCtx(datasets.testSetCTX, n)
}

// =======
// Epoch
// =======
export const runEpoch = (_cnn, trainingSetCTX) => {
  console.log('Running epoch', epoch)

  const imageDataBatch = []
  const batchLabels = []

  for (var example = 0; (example < miniBatchSize && iterations < totalTrainingImages); ++example, ++iterations) {
    imageDataBatch[example] = getTrainingDigitImage(trainingSetCTX, iterations)
    batchLabels[example] = digit_labels[iterations]
  }

  examplesSeen += miniBatchSize

  // Run epoch
  _cnn.trainCNNClassifier(imageDataBatch, batchLabels)

  // Stats
  mostRecentTrainingError = _cnn.trainingError
  forwardTime = String(Math.floor(10 * _cnn.forwardTime) / 10.0)
  backwardTime = String(Math.floor(10 * _cnn.backwardTime) / 10.0)

  if (forwardTime.indexOf('.') === -1) {
    forwardTime += '.0'
  }
  if (backwardTime.indexOf('.') === -1) {
    backwardTime += '.0'
  }

  // Handle UI
  // document.getElementById('examplesSeen').innerHTML = String(examplesSeen)

  // const prevPlotX = plotX
  const epochsPerPixel = 1
  plotX = Math.floor((epoch % Math.floor(totalTrainingImages / miniBatchSize)) / epochsPerPixel)
  // if (plotX > prevPlotX) {
  //   document.getElementById('forwardTime').innerHTML = forwardTime + ' ms'
  //   document.getElementById('backwardTime').innerHTML = backwardTime + ' ms'
  //   document.getElementById('minibatchLoss').innerHTML = (Math.floor(1000.0 * mostRecentTrainingError) / 1000.0)
  //   plotError(mostRecentTrainingError)
  //   if (plotX % 10 === 0) {
  //     const accuracy = getValidationAccuracy()
  //     plotAccuracy(accuracy)

  //     document.getElementById('trainingAccuracy').innerHTML = (Math.floor(1000.0 * accuracy) / 10.0) + '%'
  //   }
  // }

  if (plotX % 10 === 0) {
    const accuracy = getValidationAccuracy()
    // plotAccuracy(accuracy)
    // document.getElementById('trainingAccuracy').innerHTML = (Math.floor(1000.0 * accuracy) / 10.0) + '%'
  }

  // Update
  const obj = {
    examplesSeen,
    forwardTime,
    backwardTime,
    plotX,
    epoch,
    totalTrainingImages,
    epochsPerPixel,
    miniBatchSize,
    accuracy: () => getValidationAccuracy()
  }
  return obj
}

export const trainBatchJS = (trainingSetCTX = [], cb = () => {}, _cnn = defaultNetwork) => {
  const running = true
  const paused = false
  let timeoutID

  // Validate
  if (!_cnn) {
    throw new Error('cnn is required')
  }

  if (!trainingSetCTX) {
    throw new Error('trainingSetCTX is required')
  }

  // Convert to object
  _cnn = createNetwork(_cnn)

  // Start render
  // runEpoch()

  // if (!paused) {
  //   timeoutID = setTimeout(runEpoch, 0)
  // } else {
  //   console.log('Pausing after iteration ' + iterations)
  // }

  // Handle start / stop
  const step = (timestamp) => {
    if (!running) {
      console.log('not running')
      return
    }

    epoch++
    const resp = runEpoch(_cnn, trainingSetCTX)

    // Tell parent
    cb(resp)

    // Detect stop
    // if (iterations >= totalTrainingImages) {
    if (epoch < 100) {
      window.requestAnimationFrame(step)
    }
  }

  // return () => {
  //   clearTimeout(timeoutID)
  // }
  window.requestAnimationFrame(step)
}

// Evaluates a random sample of 100 test images, for the
// purpose of plotting approximate test accuracy
function getValidationAccuracy () {
  const randomTrialsPerImage = 4
  const batchSize = 10
  var correct = 0
  var imageDataArray = []
  var labels = []

  for (var i = 0; i < validationSampleSize; i += batchSize) {
    for (var example = 0; example < batchSize; ++example) {
      var validationImageIndex = Math.floor(Math.random() * totalValidationImages)
      var digitLabel = digit_labels[validationImageIndex + offsetToValidationData]
      for (var randomAugment = 0; randomAugment < randomTrialsPerImage; ++randomAugment) {
        imageDataArray[example * randomTrialsPerImage + randomAugment] = getValidationDigitImage(validationImageIndex)
        labels[example * randomTrialsPerImage + randomAugment] = digitLabel
      }
    }

    const results = cnn.classifyImages(imageDataArray)

    for (example = 0; example < batchSize; ++example) {
      var guess = 0
      var max = 0

      for (var classNum = 0; classNum < results[example].dimensions.depth; ++classNum) {
        var classSum = 0
        for (var randomAugment = 0; randomAugment < randomTrialsPerImage; ++randomAugment) {
          classSum += results[example * randomTrialsPerImage + randomAugment].getValue(0, 0, classNum)
        }

        if (classSum > max) {
          max = classSum
          guess = classNum
        }
      }

      if (guess === labels[example * randomTrialsPerImage]) {
        correct++
      }
    }
  }

  return (correct / validationSampleSize)
}
