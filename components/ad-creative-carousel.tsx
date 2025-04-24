"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

const images = [
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-10ea7ed2-0ae6-4ed4-a89f-8196d658b1c8.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-23932033-fb78-45f0-8da4-b55801060ff3.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-7e8eba1c-e775-40c3-aa39-cc276cecf7e5.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-29d57ac1-3f76-4bca-83e5-db9606cf8a80.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-29dc60e5-34d2-417c-9c97-cafb62dae1b0.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-2115249e-0267-4c6e-838f-07193ab96b5e.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-4de79494-e69e-49c9-8743-0a12a884b583.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-8d1b7f0f-1ea0-41bf-a186-91d857d828d9.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-e236746b-3e3b-47d0-88a2-0b20e4c9acc6.png",
  "https://amplifyaol.s3.us-east-2.amazonaws.com/adCreative-53c80bad-fdc3-4ad4-9898-a9b2ba07068d.png",
]

export function AdCreativeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [autoplay])

  const handlePrevious = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 flex space-x-2 z-20">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>

      <div className="relative w-full h-full overflow-hidden rounded-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`Ad Creative ${currentIndex + 1}`}
              width={600}
              height={400}
              className="w-full h-full object-contain rounded-lg"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={handlePrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-10 hover:bg-white transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-10 hover:bg-white transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6 text-gray-700" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setAutoplay(false)
              setCurrentIndex(index)
            }}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-blue-600" : "bg-gray-300"}`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
