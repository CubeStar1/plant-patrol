'use client'
import Image from "next/image";
import Yolo from "@/components/object-detection/Yolo";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// const DynamicYolo = dynamic(() => import('../components/models/Yolo'), {
//   loading: () => <p>Loading...</p>,
// })

export default function ObjectDetectionPage() {
  return (
    <div className="flex flex-col items-center justify-start py-2 bg-background text-foreground">
      <main className='container mx-auto px-4 py-8 w-full'>
        <header className="mb-8 text-center">
          <h1 className='text-3xl font-bold tracking-tight text-primary sm:text-3xl md:text-5xl'>
            Object Detection Interface
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
            Detect objects in real-time using your webcam.
          </p>
        </header>
        {/* <DynamicYolo /> */}
        <Yolo />
      </main>
    </div>
  );
}
