export const formatResult = (err, data, res, options) => {
  if (err) {
    const status = err.status ? err.status : 500
    return res.status(status).json({
      isSuccess: false,
      code: err.code ? err.code : '0x0001',
      error: err.message ? err.message : err,
      data: data
    })
  } else {
    res.json({
      isSuccess: true,
      code: '0x0001',
      data: data
    })
  }
}
