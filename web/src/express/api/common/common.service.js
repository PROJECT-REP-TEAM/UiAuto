const path = window.nodeRequire('path')
import { updateLog } from '@/api/task'

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

export const sendLog = async(req, res) => {
  try {
    await updateLog(req.body)
    res.json('success')
  } catch (e) {
    console.log(e)
    res.json('error')
  }
}
