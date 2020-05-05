export default {
  version: '0.0.1',
  author: 'Jelle',
  training: [
    {
      type: 'imagemap',
      labels: {
        url: '/datasets/mnist/images/labels_0.json'
      },
      width: 2800,
      height: 2800,
      single: {
        width: 28,
        height: 28
      },
      path: '/datasets/mnist/images/mnist_training_0.png'
    },
    {
      type: 'imagemap',
      labels: {
        url: '/datasets/mnist/images/labels_1.json'
      },
      width: 2800,
      height: 2800,
      single: {
        width: 28,
        height: 28
      },
      path: '/datasets/mnist/images/mnist_training_1.png'
    }
  ],
  network: [
    { name: 'image', type: 'inputImageLayer', width: 24, height: 24, depth: 1 },
    { name: 'conv1', type: 'convLayer', units: 10, kernelWidth: 5, kernelHeight: 5, strideX: 1, strideY: 1, padding: false },
    { name: 'pool1', type: 'maxPoolLayer', poolWidth: 2, poolHeight: 2, strideX: 2, strideY: 2 },
    { name: 'conv2', type: 'convLayer', units: 20, kernelWidth: 5, kernelHeight: 5, strideX: 1, strideY: 1, padding: false },
    { name: 'pool2', type: 'maxPoolLayer', poolWidth: 2, poolHeight: 2, strideX: 2, strideY: 2 },
    { name: 'out', type: 'FCLayer', units: 10, activation: 'softmax' }
  ],
  pretrained: '/datasets/mnist/pretrained/cnn_mnist_10_20_98accuracy.json'
}
