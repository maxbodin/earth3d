import React from "react";
import {useToast} from "@/app/context/toastsContext";

export function ToastDanger({ message } : {message : string}) {
    const { setDangerToastIsDisplayed } = useToast();

    const handleCloseButtonClick = () => {
        setDangerToastIsDisplayed(false); // Close the danger toast.
    };

    return (
        <div id="toast-danger"
             className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-700/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5 rounded-lg shadow z-50"
             role="alert">
            <div
                className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-300 rounded-lg">
                <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                </svg>
                <span className="sr-only">Error icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">{message}</div>
            <button type="button"
                    className="ms-auto -mx-1.5 -my-1.5 bg-gray-600 hover:bg-gray-700 text-gray-800 hover:text-white rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8"
                    onClick={handleCloseButtonClick}
                    aria-label="Close">
                <span className="sr-only">Close</span>
                <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14">
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    );
}