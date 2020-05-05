# YellowMind
> YellowMind is a machine learning library for running Convolutional Neural Network (CNN) in the browser or NodeJs.

# Goal
Make the training and running of Convolutional Neural Network (CNN) as easy as possible.

# Big thanks
- Most of the underlaying library is based on the great work of DenseInL2 https://github.com/DenseInL2/webcnn. This library has been extended to allow creating machine learning networks purely from JSON.

# Roadmap
- [x] Convert WebCNN ( from DenseInL2 ) to use JSON.
- [x] Documentation + example(s)
- [x] Browers support
- [ ] NodeJS support
- [ ] CLI
- [ ] WebGl Support
- [ ] Handle streaming data
- [ ] Combine and link networks

# Installation

## Embed as script
<a href="/examples/usage-script.html" target="_blank">open in new window</a>

```html
<div class="container">
    <p>embedded as script</p>
    <div style="height:80vh; border:1px solid black;">
        <div id="app">loading...</div>
    </div>
</div>

<script>
    window.$yellowmind = {
        el: 'app'
    }
</script>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
<script src="../dist/index.js"></script>
```

# How it works
## Input
The input data consist of `training` data and a `network` topology.

### Training data
Define your training data like:
```json
[
  {  
    "type":"imagemap",
    "labels": {
      "url":"/datasets/mnist/images/labels_0.json"
    },
    "width": 2800,
    "height": 2800,
    "single": {
      "width":28,
      "height":28
    },
    "path":"/datasets/mnist/images/mnist_training_0.png"
  },
  {  
    "type":"imagemap",
    "labels": {
      "url":"/datasets/mnist/images/labels_1.json"
    },
    "width": 2800,
    "height": 2800,
    "single": {
      "width":28,
      "height":28
    },
    "path":"/datasets/mnist/images/mnist_training_1.png"
  }
]
```
### Types
Current supported types:
- imagemap
- image

#### Image
```json
{  
  "type":"image",
  "width": 2800,
  "height": 2800,
  "path":"/datasets/mnist/images/mnist_training_1.png"
}
```

#### Imagemap
```json
{  
  "type":"imagemap",
  "width": 2800,
  "height": 2800,
  "single": {
    "width":28,
    "height":28
  },
  "path":"/datasets/mnist/images/mnist_training_1.png"
}
```

### Network
Define your network:
```js
[
  { name: 'image', type: 'inputImageLayer', width: 24, height: 24, depth: 1 },
  { name: 'conv1', type: 'convLayer', units: 10, kernelWidth: 5, kernelHeight: 5, strideX: 1, strideY: 1, padding: false },
  { name: 'pool1', type: 'maxPoolLayer', poolWidth: 2, poolHeight: 2, strideX: 2, strideY: 2 },
  { name: 'conv2', type: 'convLayer', units: 20, kernelWidth: 5, kernelHeight: 5, strideX: 1, strideY: 1, padding: false },
  { name: 'pool2', type: 'maxPoolLayer', poolWidth: 2, poolHeight: 2, strideX: 2, strideY: 2 },
  { name: 'out', type: 'FCLayer', units: 10, activation: 'softmax' }
]
```

The complete machine learning definition:
```js
{
  "version": "0.0.1",
  "author": "Your team",
  "training": [
    // ... your training data
  ],
  "network": [
    // ... your network
  ],
}
```
## Training

## Output

# Examples
Simple example of learning MNIST.
<a href="/examples/simple" target="_blank">open in new window</a>