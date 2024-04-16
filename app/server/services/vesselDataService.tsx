'use server'

/**
 * Code inspired by https://github.com/geoglify/geoglify/blob/main/ais/main.js
 */

/**
 * Logging function for information messages.
 * @param message
 */
function logInfo(message: any): void {
   console.info(
      `[${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Paris' })}] ${message}`
   )
}

/**
 * Logging function for error messages.
 * @param message
 * @param error
 */
function logError(message: any, error: any) {
   console.error(
      `[${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}] ${message}`,
      error
   )
}

/**
 * Handle message for a position update.
 *
 * An PositionReport AIS message is used to report the vessel's current position, heading, speed, and other relevant information to other vessels and coastal authorities.
 * This message includes the vessel's unique MMSI (Maritime Mobile Service Identity) number, the latitude and longitude of its current position,
 * the vessel's course over ground (COG) and speed over ground (SOG), the type of navigation status the vessel is in (e.g. underway using engine, anchored, etc.),
 * and the vessel's dimensional information (length, width, and type).
 * This information is used to help identify and track vessels in order to improve safety, efficiency, and compliance in the maritime industry.
 *
 * @param aisMessage
 */
function handlePositionReportMessage(aisMessage: any) {
   return {
      mmsi: aisMessage?.MetaData?.MMSI, // Maritime Mobile Service Identity
      name: aisMessage.MetaData.ShipName,
      time_utc: new Date(aisMessage.MetaData.time_utc),
      cog: aisMessage.Message.PositionReport.Cog, // Course Over Ground
      sog: aisMessage.Message.PositionReport.Sog, // Speed Over Ground
      hdg: aisMessage.Message.PositionReport.TrueHeading,
      location: {
         coordinates: [
            aisMessage.MetaData.longitude,
            aisMessage.MetaData.latitude,
         ],
      },
   }
}

/**
 * Handle message for a static ship data.
 *
 * An ShipStaticData AIS message contains static data about the vessel, such as its name, call sign, length, width, and type of vessel.
 * It also includes information about the vessel's owner or operator, as well as its place of build and its gross tonnage.
 * This message is transmitted at regular intervals, usually every few minutes, and is used by other vessels and coastal authorities to identify and track the vessel.
 * It is an important safety feature that helps to prevent collisions and improve navigation in crowded waterways.
 *
 * @param aisMessage
 */
function handleShipStaticDataMessage(aisMessage: any) {
   const etaObj = aisMessage.Message.ShipStaticData.Eta
   const eta = etaObj
      ? new Date(
           etaObj.Year ?? new Date().getFullYear(),
           etaObj.Month,
           etaObj.Day,
           etaObj.Hour,
           etaObj.Minute
        )
      : null

   return {
      mmsi: aisMessage?.MetaData?.MMSI, // Maritime Mobile Service Identity
      name: aisMessage.MetaData.ShipName,
      time_utc: new Date(aisMessage.MetaData.time_utc),
      callsign: aisMessage.Message.ShipStaticData.CallSign,
      destination: aisMessage.Message.ShipStaticData.Destination,
      dimension: aisMessage.Message.ShipStaticData.Dimension,
      eta: eta,
      imo: aisMessage.Message.ShipStaticData.ImoNumber,
      cargo_type_code: aisMessage.Message.ShipStaticData.Type,
      location: {
         coordinates: [
            aisMessage.MetaData.longitude,
            aisMessage.MetaData.latitude,
         ],
      },
   }
}

/**
 * Handle other message.
 *
 * @param aisMessage
 */
function handleOtherMessages(aisMessage: any) {
   return {
      mmsi: aisMessage?.MetaData?.MMSI,
      name: aisMessage.MetaData.ShipName,
      time_utc: new Date(aisMessage.MetaData.time_utc),
      location: {
         coordinates: [
            aisMessage.MetaData.longitude,
            aisMessage.MetaData.latitude,
         ],
      },
   }
}

let socket: WebSocket | null = null
const POSITION_REPORT_STRING: string = 'PositionReport'
const SHIP_STATIC_DATA_STRING: string = 'ShipStaticData'
const messagesMap: Map<any, any> = new Map()
const messageBuffer: any[] = []

export const stopConnection = (): void => {
   socket?.close()
   socket = null
}

export const startConnection = (): void => {
   socket = new WebSocket('wss://stream.aisstream.io/v0/stream')

   setSocketListeners()
}

export const setSocketListeners = (): void => {
   if (!socket) return

   // WebSocket event handlers.
   socket.onopen = function (_: Event): void {
      logInfo('WebSocket aisstream Connected!')
      let subscriptionMessage = {
         Apikey: process.env.AISSTREAM_TOKEN,
         BoundingBoxes: [
            [
               [-180, -90],
               [180, 90],
            ],
         ],
      }
      socket?.send(JSON.stringify(subscriptionMessage))
   }

   socket.onmessage = async (event): Promise<void> => {
      const aisMessage = JSON.parse(event.data)
      const mmsi = aisMessage?.MetaData?.MMSI

      if (mmsi) {
         let message: any = null

         // TODO: Implement support for StandardSearchAndRescueAircraftReport,
         // TODO: Implement support forLongRangeAisBroadcastMessage
         if (aisMessage.MessageType == POSITION_REPORT_STRING) {
            message = handlePositionReportMessage(aisMessage)
         } else if (aisMessage.MessageType == SHIP_STATIC_DATA_STRING) {
            message = handleShipStaticDataMessage(aisMessage)
         } else {
            message = handleOtherMessages(aisMessage)
         }

         const existingMessage = messagesMap.get(mmsi)

         if (existingMessage) {
            for (let field in message) {
               if (
                  message.hasOwnProperty(field) &&
                  existingMessage[field] != message[field]
               ) {
                  existingMessage[field] = message[field]
               }
            }
            messagesMap.set(mmsi, existingMessage)
         } else {
            messagesMap.set(mmsi, message)
         }

         if (!messageBuffer.includes(mmsi)) {
            messageBuffer.push(mmsi)
         }
      }
   }
}

/**
 * Function to process and save messages in the database.
 */
export async function processAndSaveMessages() {
   if (messageBuffer.length > 0) {
      // Add a check to ensure there are messages in the buffer.
      logInfo('Processing...')

      const bulkOperations: any[] = []

      const bufferSize: number = Math.min(messageBuffer.length, 1000)

      for (let i: number = 0; i < bufferSize; i++) {
         const mmsi = messageBuffer[i]
         const message = messagesMap.get(mmsi)

         bulkOperations.push({
            message: message,
         })
      }
      // Remove only the number of processed messages.
      messageBuffer.splice(0, bufferSize)

      logInfo(`Remaining in messageBuffer: ${messageBuffer.length}`)

      return bulkOperations
   } else {
      // logInfo('No messages to process or already processing...')
   }
}
