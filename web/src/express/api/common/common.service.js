const path = window.require('path')

export const doGetDeviceId = () => {
  const promise = new Promise((resolve, reject) => {
    resolve({
      is_installed: true
    })
  })
  return promise
}

export const doGetUiSelectorStaticAssets = (req, res) => {
  res.sendFile(path.resolve() + '/public/base_integration/uiauto_uiselector/js/' + req.params.file_path)
}
