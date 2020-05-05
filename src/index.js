import { createWebCNN, loadImage, preProcessDrawing, createFromJSON } from './helpers.js'
import DEFAULT_MIND from './defaultMind.js'

// Export
export { WebCNN } from './webcnn.esm.js'

class Mind {
  constructor (mind = DEFAULT_MIND) {
    const network = createWebCNN(mind.network)
    this.cnn = network
    this.iterations = 0
    this.epoch = 0
    this.training = mind.training || []
    this.currentTrainingIndex = 0 // Current training index

    // Merge mind settings
    Object.assign(this, mind)

    // TODO JIT loading
    this.fetchAll()
  }

  async loadPretrained () {
    const pretrained = await fetch(this.pretrained).then(elem => elem.json())
    console.log(pretrained)

    this.cnn = createFromJSON(pretrained)
  }

  async fetchAll () {
    // Load all image data
    const resp = this.training.map(async elem => {
      // Load labels
      const labels = await fetch(elem.labels.url).then(elem => elem.json())

      // Load imagemap
      const imagemap = await loadImage(elem.path)

      return { labels, imagemap }
    })
    // const resp = await loadImages(this.training.map(elem => elem.path))
    this.cache = await Promise.all(resp)
  }

  /**
     * Run single train step
     *
     * @memberof Mind
     */
  async train () {
    const batch = this.getTrainingDataBatch()
    const { images, labels } = batch
    // console.log({ images, labels })
    this.cnn.trainCNNClassifier(images, labels)

    return batch
  }

  test ({ paths = [], dots = [], ctx }) {
    const inputImageData = preProcessDrawing(ctx, { paths, dots })

    const result = this.cnn.classifyImages([inputImageData])

    let guess = 0
    let max = 0
    for (var i = 0; i < 10; ++i) {
      if (result[0].getValue(0, 0, i) > max) {
        max = result[0].getValue(0, 0, i)
        guess = i
      }
    }

    const confidence = Math.min(100, Math.floor(1000 * (max + 0.1)) / 10.0)
    // // Update UI
    // this.$refs.guessNumberDiv.innerHTML = (max > 0.666667) ? String(guess) : '?'
    // this.$refs.confidence.innerHTML = String(Math.min(100, Math.floor(1000 * (max + 0.1)) / 10.0)) + "% it's a " + String(guess)
    return { guess, confidence }
  }

  getImageByIndex (cache = [], n, augmentation = 5) {
    // TODO MAKE dynamic
    const examplesPerImageFile = 10000

    const imageFileIndex = Math.floor(n / examplesPerImageFile)
    const imageIndex = n % examplesPerImageFile
    // console.log(imageFileIndex, n, examplesPerImageFile)

    // Add random to position for data augmentation
    const y = 28 * Math.floor(imageIndex / 100) + Math.floor(Math.random() * augmentation)
    const x = 28 * (imageIndex % 100) + Math.floor(Math.random() * augmentation)

    return cache[imageFileIndex].imagemap.getImageData(x, y, 24, 24)
  }

  /**
       * Get a batch from the training data based on current iteration
       *
       * @returns
       * @memberof Mind
       */
  getTrainingDataBatch (miniBatchSize = 20) {
    console.log('getTrainingDataBatch')

    const { iterations } = this

    // Splice training to minibatch
    // cut out the image data from the imagemap
    const currentTraining = this.training[this.currentTrainingIndex]
    const loadedData = this.cache[this.currentTrainingIndex]

    const start = iterations
    const end = start + miniBatchSize

    // Get corresponding image
    const images = new Array(miniBatchSize).fill(undefined).map((value, index) => {
      return this.getImageByIndex(this.cache, iterations + index)
    })

    // Get corresponding labels
    const labels = loadedData.labels.slice(start, end)

    // Update state
    this.iterations += miniBatchSize

    return {
      images,
      labels
    }
    // getImageByIndex()
    // for (var example = 0; (example < miniBatchSize && iterations < totalTrainingImages); ++example, ++iterations) {
    //   imageDataBatch[example] = getImageByIndex(trainingSetCTX, iterations)
    //   batchLabels[example] = digit_labels[iterations]
    // }
  }
}

export const createMind = (mind = {}) => {
  console.log(mind)
  return new Mind(mind)
}
