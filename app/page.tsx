'use client';
import React, {useState, useEffect} from 'react';
import {DetailsCard} from "@/app/components/detailsCard";
import {SearchBar} from "@/app/components/searchBar";
import {ThreeScene} from "@/app/components/threeScene";
import {ToastDanger} from "@/app/components/toastDanger";
import {ToastSuccess} from "@/app/components/toastSuccess";
import {useToast} from "@/app/context/toastsContext";

export default function Home() {

    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api.opensky-network.org/api/states/all');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const jsonData = await response.json();
                setData(jsonData.states || []); // Handle null data
                setIsLoading(false);

                console.log("Data fetched is: ", data)
            } catch (error : any) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const [selectedPlaneData, setSelectedPlaneData] = useState({});

    const { dangerToastIsDisplayed, setDangerToastIsDisplayed, successToastIsDisplayed, setSuccessToastIsDisplayed } = useToast();

    // Callback function to handle search.
    const handleSearch = (searchTerm: string) => {
        // Filter data based on search term (assuming data is an array)
        const filtered = data.filter((state: any) => state[1].includes(searchTerm));

        setSelectedPlaneData(filtered.length > 0 ? filtered[0] : {});

        // Call addPlanes with filtered data.
        console.log("handleSearch called with filtered data: ", filtered);

        if (filtered.length > 0) {
            setSuccessToastIsDisplayed(true);
            setDangerToastIsDisplayed(false);
        } else {
            setSuccessToastIsDisplayed(false);
            setDangerToastIsDisplayed(true);
        }
    };

    return (
        <main className="flex min-h-screen h-full flex-col items-center justify-between p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <SearchBar onSearch={handleSearch}/>
                <ThreeScene data={data} onPlaneClick={(data: Record<string, any>) => {
                    setSelectedPlaneData(data);
                }}/>
                {selectedPlaneData && Object.keys(selectedPlaneData).length > 0  && (
                    <DetailsCard selectedPlaneData={selectedPlaneData}/>
                )}
            </div>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {successToastIsDisplayed && <ToastSuccess message={"Plane found."} />}
            {dangerToastIsDisplayed && <ToastDanger message={"Plane not found."} />}
        </main>
    );
}
