import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '..', 'public')
const svgBuffer = readFileSync(resolve(publicDir, 'icon.svg'))

async function generate() {
  // PWA icon 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(resolve(publicDir, 'icon-192x192.png'))
  console.log('Generated icon-192x192.png')

  // PWA icon 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(resolve(publicDir, 'icon-512x512.png'))
  console.log('Generated icon-512x512.png')

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(resolve(publicDir, 'apple-touch-icon.png'))
  console.log('Generated apple-touch-icon.png')

  // Favicon 32x32 as ICO (use PNG in .ico container — supported by all modern browsers)
  // sharp doesn't output .ico natively, so we'll generate a 32x32 PNG and copy as .ico
  // Most browsers accept PNG-in-ICO format
  const favicon32 = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer()

  // Write ICO file with PNG payload
  // ICO header: 6 bytes, 1 entry: 16 bytes, then PNG data
  const icoHeader = Buffer.alloc(6)
  icoHeader.writeUInt16LE(0, 0) // reserved
  icoHeader.writeUInt16LE(1, 2) // type: 1 = ICO
  icoHeader.writeUInt16LE(1, 4) // count: 1 image

  const icoEntry = Buffer.alloc(16)
  icoEntry.writeUInt8(32, 0)  // width
  icoEntry.writeUInt8(32, 1)  // height
  icoEntry.writeUInt8(0, 2)   // color palette
  icoEntry.writeUInt8(0, 3)   // reserved
  icoEntry.writeUInt16LE(1, 4)  // color planes
  icoEntry.writeUInt16LE(32, 6) // bits per pixel
  icoEntry.writeUInt32LE(favicon32.length, 8) // size of PNG data
  icoEntry.writeUInt32LE(22, 12) // offset (6 header + 16 entry = 22)

  const { writeFileSync } = await import('fs')
  writeFileSync(
    resolve(publicDir, 'favicon.ico'),
    Buffer.concat([icoHeader, icoEntry, favicon32])
  )
  console.log('Generated favicon.ico')
}

generate().catch(console.error)
