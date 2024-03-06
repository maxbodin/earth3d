import React from 'react';

const lookup = require('country-data').lookup;

export function DetailsCard({ selectedPlaneData }: { selectedPlaneData: Record<string, any> }) {
    console.log("Data received in the details card: ", selectedPlaneData);

    const callsign = selectedPlaneData?.data?.[1] || "N/A";
    const originCountry = selectedPlaneData?.data?.[2] || "N/A";
    const timePosition = selectedPlaneData?.data?.[3] || "N/A";
    const lastContact = selectedPlaneData?.data?.[4] || "N/A";
    const longitude = selectedPlaneData?.data?.[5] || "N/A";
    const latitude = selectedPlaneData?.data?.[6] || "N/A";
    const baroAltitude = selectedPlaneData?.data?.[7] || "N/A";
    const onGround = selectedPlaneData?.data?.[8] ? "Yes" : "No";
    const velocity = selectedPlaneData?.data?.[9] || "N/A";
    const trueTrack = selectedPlaneData?.data?.[10] || "N/A";
    const verticalRate = selectedPlaneData?.data?.[11] || "N/A";
    const sensors = selectedPlaneData?.[12]?.data?.join(", ") || "N/A";
    const geoAltitude = selectedPlaneData?.data?.[13] || "N/A";
    const squawk = selectedPlaneData?.data?.[14] || "N/A";
    const spi = selectedPlaneData?.data?.[15] ? "Yes" : "No";
    const positionSource = selectedPlaneData?.data?.[16] || "N/A";
    const category = selectedPlaneData?.data?.[17] || "N/A";

    const formattedTimePosition : string = timePosition ? new Date(timePosition * 1000).toLocaleString() : "N/A";
    const formattedLastContact : string = lastContact ? new Date(lastContact * 1000).toLocaleString() : "N/A";

    return (
            <div
                className="absolute top-1/2 right-10 transform -translate-y-1/2 z-50 isolate aspect-video w-96 h-[42rem] rounded-xl bg-white/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5">
                <div className="p-8">
                    <h2 className="text-white text-4xl font-bold mb-4">{callsign} </h2>
                    <div className="flex items-center mb-4">
                        <h3 className="text-white text-lg font-bold">Origin country: {originCountry} {
                            lookup?.countries({name: originCountry})[0]?.emoji}</h3>
                    </div>
                    <div className="mb-4">
                        <p className="text-gray-300 mb-2">Time Position: {formattedTimePosition}</p>
                        <p className="text-gray-400 text-xs mb-2">Last Contact: {formattedLastContact}</p>
                    </div>
                    <p className="text-gray-300 mb-2">Longitude: {longitude} Latitude: {latitude}</p>
                    <p className="text-gray-300 mb-2">Barometric Altitude: {baroAltitude}</p>
                    <p className="text-gray-300 mb-2">On Ground: {onGround}</p>
                    <p className="text-gray-300 mb-2">Velocity: {velocity}</p>
                    <p className="text-gray-300 mb-2">True Track: {trueTrack}</p>
                    <p className="text-gray-300 mb-2">Vertical Rate: {verticalRate}</p>
                    <p className="text-gray-300 mb-2">Sensors: {sensors}</p>
                    <p className="text-gray-300 mb-2">Geometric Altitude: {geoAltitude}</p>
                    <p className="text-gray-300 mb-2">Squawk: {squawk}</p>
                    <p className="text-gray-300 mb-2">SPI: {spi}</p>
                    <p className="text-gray-300 mb-2">Position Source: {positionSource}</p>
                    <p className="text-gray-300 mb-2">Category: {category}</p>
                </div>
        </div>
    );
}
