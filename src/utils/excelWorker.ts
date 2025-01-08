import * as xlsx from 'xlsx'

self.onmessage = (event) => {
  const { data } = event

  const workbook = xlsx.read(data, { type: 'array' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  
  const [header] = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
  const content = xlsx.utils.sheet_to_json(worksheet)

  self.postMessage({
    header,
    content
  })
}