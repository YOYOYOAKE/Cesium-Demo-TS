export const readFileAsync = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (ev) => resolve(ev.target?.result as ArrayBuffer)
    fileReader.onerror = (error) => reject(error)
    fileReader.readAsArrayBuffer(file)
  })
}