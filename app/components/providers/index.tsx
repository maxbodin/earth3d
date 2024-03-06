'use client'

import React from "react";
import {ToastProvider} from "@/app/context/toastsContext";

export function Providers({ children } : {children: React.ReactNode}) {
    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    )
}