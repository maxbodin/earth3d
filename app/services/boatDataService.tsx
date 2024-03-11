//const WebSocket = require('ws')
const socket = new WebSocket('wss://stream.aisstream.io/v0/stream')

export const startConnection = () => {
   socket.onopen = function (_: any) {
      let subscriptionMessage = {
         Apikey: '5e248a88ff39e2a1924dca5f8e3403aeae1390e6',
         BoundingBoxes: [
            [
               [-90, -100],
               [90, 100],
            ],
         ],
      }
      socket.send(JSON.stringify(subscriptionMessage))
   }

   socket.onmessage = function (event: any) {
      let aisMessage = JSON.parse(event.data)
      console.log(aisMessage)
   }
}
