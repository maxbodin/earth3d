import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlanetContextValue {
    planet: any;
    setPlanet: React.Dispatch<React.SetStateAction<any>>;
}

// Create context.
const PlanetContext = createContext<PlanetContextValue | null>(null);

// Custom hook to access context.
export function usePlanet() {
    const context = useContext(PlanetContext);
    if (!context) {
        throw new Error('usePlanet must be used within a PlanetProvider');
    }
    return context;
}

// Provider component.
export function PlanetProvider({ children }: { children: ReactNode }) {
    const [planet, setPlanet] = useState<any>(null);

    const value: PlanetContextValue = {
        planet,
        setPlanet,
    };

    return (
        <PlanetContext.Provider value={value}>
            {children}
        </PlanetContext.Provider>
    );
}
