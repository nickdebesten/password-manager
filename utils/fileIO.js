const {app} = require("electron")
let path = app.getPath("home")
const path2 = require('path')
const fs = require('fs')
let filename;
let filename1 = `${path}/OneDrive/Onderwijsgroep Tilburg/ConnexT - General/password manager/.passMan.db`
let filename2 = `${path}/Onderwijsgroep Tilburg/ConnexT - General/password manager/.passMan.db`
fs.access(filename1, fs.F_OK, (err) => {
  if (err) {
    console.log('filename2')
    filename = filename2
  } else {
    console.log('filename1')
    filename = filename1
  }
})


const fsPromises = fs.promises
const {
  encryptData,
  decryptData
} = require('./encryption')

const writeFile = async function (data) {
  const key = global.enc_key
  fs.existsSync(filename) && fs.chmodSync(filename, '4777')
  const encryptedText = encryptData(key, JSON.stringify(data))
  await fsPromises.writeFile(filename, encryptedText, 'utf-8')
  fs.chmodSync(filename, '4400')
  return true
}

const readFile = async function () {
  const key = global.enc_key
  const fsdata = await fsPromises.readFile(filename, 'utf-8')
  const decryptedData = JSON.parse(decryptData(key, fsdata))
  return decryptedData
}
function test() {
  
}
const checkFileExists = async function () {
  return fs.existsSync(filename)

    
}

module.exports = {
  writeFile,
  readFile,
  checkFileExists
}
