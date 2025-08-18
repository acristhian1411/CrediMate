import { BrowserWindow, dialog } from 'electron'
import Handlebars from 'handlebars'

async function renderToPDF (html, app) {
  const win = new BrowserWindow({ show: false })
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  const pdfBuffer = await win.webContents.printToPDF({})
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: 'documento.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })
  if (filePath) {
    const fs = await import('node:fs')
    fs.writeFileSync(filePath, pdfBuffer)
    return filePath
  }
  return null
}

export async function printContract ({ template, data, app }) {
  const compile = Handlebars.compile(template)
  const html = compile(data) // data = { client, credit }
  return renderToPDF(html, app)
}

export async function printReceipt ({ template, data, app }) {
  const compile = Handlebars.compile(template)
  const html = compile(data) // data = { client, credit, payment }
  return renderToPDF(html, app)
}
