const io = require('socket.io')(3000, {
  cors: {
    origin: [
      'http://localhost:8080',
      'http://10.11.11.11:8080',
      'https://fp-grafkom.zydhan.xyz',
    ],
  },
})

const { v4: uuidv4 } = require('uuid')

let availableRoom = []

io.on('connection', (socket) => {
  socket.on('create-room', (cb) => {
    const roomID = uuidv4()
    availableRoom.push(roomID)
    socket.join(roomID)
    cb(roomID)
  })

  socket.on('join-room', (roomID, cb) => {
    let isExist = false
    for (let i = 0; i < availableRoom.length; i++) {
      if (roomID == availableRoom[i]) {
        isExist = true
        break
      }
    }
    const clientNumber = io.sockets.adapter.rooms.get(roomID)?.size
    if (!isExist || !clientNumber) {
      cb(false, "Room doesn't exist")
      return
    }
    if (clientNumber != 1) {
      cb(false, 'Room host has left.')
      return
    }
    socket.join(roomID)
    socket.to(roomID).emit('somebody-joined', roomID)
    cb(true, 'ok')
  })

  socket.on('delete-room', (roomID, cb) => {
    availableRoom = availableRoom.filter((room) => room !== roomID)
    cb()
  })

  socket.on('update-input', (roomID, keyMap) => {
    //   socket.
    // console.log(keyMap)
    const clientNumber = io.sockets.adapter.rooms.get(roomID)?.size
    // console.log(roomID)
    socket.to(roomID).emit('receive-input', keyMap)
  })

  socket.on('update-pos', (roomID, posInfo) => {
    //   socket.
    // console.log(posInfo)
    const clientNumber = io.sockets.adapter.rooms.get(roomID)?.size
    // console.log(roomID)
    socket.to(roomID).emit('receive-pos', posInfo)
  })
})
