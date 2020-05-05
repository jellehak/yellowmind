export default {
  methods: {
    drawFilters () {
      const newDiv = document.createElement('div')
      document.body.appendChild(newDiv)
      for (var layerNumber = 1; layerNumber < cnn.layers.length - 1; ++layerNumber) {
        const layer = cnn.layers[layerNumber]
        if (layer.type !== TYPES.LAYER_TYPE_CONV) {
          continue
        }
        console.log('layer ' + layer)

        for (var unit = 0; unit < layer.units; ++unit) {
          for (var kd = 0; kd < layer.kernelDepth; ++kd) {
            const canvas = document.createElement('canvas')
            canvas.width = layer.kernelWidth
            canvas.height = layer.kernelHeight
            const ctx = canvas.getContext('2d')
            ctx.mozImageSmoothingEnabled = false
            ctx.webkitImageSmoothingEnabled = false
            ctx.msImageSmoothingEnabled = false
            ctx.imageSmoothingEnabled = false

            const imageData = ctx.getImageData(0, 0, layer.kernelWidth, layer.kernelHeight)
            for (var ky = 0; ky < layer.kernelHeight; ++ky) {
              for (var kx = 0; kx < layer.kernelWidth; ++kx) {
                const i = 4 * (layer.kernelWidth * ky + kx)
                let value = 127 + 127 * layer.kernels[unit].getValue(kx, ky, kd)
                value = Math.max(0, Math.min(255, value))
                imageData.data[i] = value
                imageData.data[i + 1] = value
                imageData.data[i + 2] = value
                imageData.data[i + 3] = 255
              }
            }

            ctx.putImageData(imageData, 0, 0)

            const canvas2 = document.createElement('canvas')
            canvas2.width = layer.kernelWidth * 5
            canvas2.height = layer.kernelHeight * 5
            newDiv.appendChild(canvas2)
            const ctx2 = canvas2.getContext('2d')
            ctx2.mozImageSmoothingEnabled = false
            ctx2.webkitImageSmoothingEnabled = false
            ctx2.msImageSmoothingEnabled = false
            ctx2.imageSmoothingEnabled = false
            ctx2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height)
          }
        }
      }
    }
  }
}
