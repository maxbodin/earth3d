'use client'

import React from "react";
import {ToastProvider} from "@/app/context/toastsContext";
import dynamic from "next/dynamic";

export function Providers({ children } : {children: React.ReactNode}) {
    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    )
}

export const DynamicProviders = dynamic(() => Promise.resolve(Providers), {
    ssr: false,
});