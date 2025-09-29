import ForecastingDashboard from './components/ForecastingDashboard'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import './App.css'



export default function App() {
  const [entered, setEntered] = useState(false)

  // Animated blur blob background
  const BlurBlob = ({ className, delay }) => (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        x: ['0%', '5%', '0%'],
        y: ['0%', '5%', '0%'],
      }}
      transition={{
        duration: 15,
        ease: "easeInOut",
        repeat: Infinity,
        delay: delay || 0
      }}
    />
  );



  const Landing = () => (
    <div className="min-h-screen relative overflow-hidden cursor-pointer" onClick={() => setEntered(true)}>
      {/* Background gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50 to-white"></div>
      
      {/* Animated blobs */}
      <BlurBlob className="bg-blue-300 w-[40vw] h-[40vw] top-[-10%] left-[-10%]" delay={0} />
      <BlurBlob className="bg-indigo-300 w-[45vw] h-[45vw] bottom-[-15%] right-[-10%]" delay={2} />
      <BlurBlob className="bg-violet-300 w-[30vw] h-[30vw] top-[40%] right-[20%]" delay={4} />
  
      {/* Hero section */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="animate-float-lg flex flex-col items-center text-center max-w-4xl">
          <div className="flex items-center justify-center gap-3 sm:gap-8 md:gap-10 mb-4">
            <img src="/jaydai_logo.png" alt="Jaydai" className="h-16 sm:h-24 md:h-32 w-auto object-contain drop-shadow-lg" />
            <span className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-indigo-200 font-light">×</span>
            <img src="/bridor_logo.png" alt="Bridor" className="h-14 sm:h-20 md:h-28 w-auto object-contain drop-shadow-lg" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-6 mt-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              AI-Powered Sales Forecasting
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock precise weekly projections to guide production planning and optimize inventory management
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8"
            >
              <Button 
                onClick={() => setEntered(true)}
                size="lg"
                className="group relative overflow-hidden text-lg h-14 px-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <span 
                  className="pointer-events-none absolute -left-12 top-0 h-full w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-0 group-hover:translate-x-[200%] transition-transform duration-700 ease-out"
                  aria-hidden="true"
                />
                <span className="mr-2">Enter</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AnimatePresence>
        {!entered ? (
          <Landing />
        ) :
        (
          <div className="app-shell">
            <ForecastingDashboard />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
