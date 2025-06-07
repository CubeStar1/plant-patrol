import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const features = [
  {
    title: "Live Video Stream Processing",
    description: "Connect your cameras or video feeds directly to our platform. Our system processes live streams in real-time, applying YOLO detection to identify and track objects as they appear.",
    // TODO: Replace with actual image path
    image: "/landing/yolo-placeholder-1.png", 
    // TODO: Replace with actual image path (or use same as above if no dark mode variant)
    darkImage: "/landing/yolo-placeholder-1-dark.png", 
    alt: "Live video stream processing with object detection overlays",
  },
  {
    title: "Flexible YOLO Model Management",
    description: "Easily switch between various pre-trained YOLO models (v5, v7, v8, etc.) or upload and deploy your own custom-trained models tailored to specific detection tasks.",
    // TODO: Replace with actual image path
    image: "/landing/yolo-placeholder-2.png", 
    // TODO: Replace with actual image path
    darkImage: "/landing/yolo-placeholder-2-dark.png", 
    alt: "Interface showing YOLO model selection and customization options",
  },
  {
    title: "Insightful Detection Analytics",
    description: "Visualize detection performance through an interactive dashboard. Track key metrics like objects detected per class, detection confidence levels, FPS, and model inference times.",
    // TODO: Replace with actual image path
    image: "/landing/yolo-placeholder-3.png", 
    // TODO: Replace with actual image path
    darkImage: "/landing/yolo-placeholder-3-dark.png", 
    alt: "Dashboard displaying object detection analytics and performance metrics",
  },
  {
    title: "Advanced Object Tracking & Logging",
    description: "Our system can track individual objects across frames, assigning unique IDs. All detection events, including object class, coordinates, and timestamps, are logged for review and export.",
    // TODO: Replace with actual image path
    image: "/landing/yolo-placeholder-4.png", 
    // TODO: Replace with actual image path
    darkImage: "/landing/yolo-placeholder-4-dark.png", 
    alt: "Visualization of object tracking with logged detection data",
  },
  {
    title: "Customizable Alerts & Notifications",
    description: "Set up custom alerts based on specific detection events or patterns. Receive real-time notifications via email, SMS, or webhook integrations when critical objects are detected.",
    // TODO: Replace with actual image path
    image: "/landing/yolo-placeholder-5.png", 
    // TODO: Replace with actual image path
    darkImage: "/landing/yolo-placeholder-5-dark.png", 
    alt: "Alert configuration and notification system interface",
  }
]

export function FeatureDetails() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Core Platform{" "}
          <span className="bg-gradient-to-r from-[#38bdf8] via-[#2dd4bf] to-[#0070F3] bg-clip-text text-transparent">
            Capabilities
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Explore the key functionalities that power our YOLO object detection platform, from real-time video processing to actionable analytics.
        </p>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 gap-16 sm:gap-24">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col gap-8 lg:items-center ${
              index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
            }`}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-6">
                  <button className="group inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Image */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-2 ring-1 ring-foreground/10 backdrop-blur-3xl dark:from-muted/30 dark:to-background/80"
              >
                <div className="block dark:hidden">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    width={600}
                    height={400}
                    quality={100}
                    className="rounded-xl shadow-2xl ring-1 ring-foreground/10 transition-all duration-300"
                  />
                </div>
                <div className="hidden dark:block">
                  <Image
                    src={feature.darkImage}
                    alt={feature.alt}
                    width={600}
                    height={400}
                    quality={100}
                    className="rounded-xl shadow-2xl ring-1 ring-foreground/10 transition-all duration-300"
                  />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
} 