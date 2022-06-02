export function checkDataValidity(regRex, data, warningElLocation) {
  document.querySelector(warningElLocation).style.borderColor = (regRex && !regRex.test(data)) ? 'red' : ''
}
