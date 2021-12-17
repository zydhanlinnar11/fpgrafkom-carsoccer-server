const io = require('socket.io')(3000, {
  cors: {
    origin: ['http://localhost:8080'],
  },
})

const { v4: uuidv4 } = require('uuid')

let availableRoom = []

io.on('connection', (socket) => {
  console.log(socket.id)
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
    cb(true, 'ok')
  })
  socket.on('delete-room', (roomID, cb) => {
    availableRoom = availableRoom.filter((room) => room !== roomID)
    cb()
  })
})
