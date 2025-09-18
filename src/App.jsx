import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, Brain, BarChart3, Settings, AlertCircle, CheckCircle, Clock, ArrowRight, Calendar, ChevronDown, Zap } from 'lucide-react'
import './App.css'

// Import analysis images
import dataAnalysisImage from './assets/comprehensive_data_analysis.png'
import modelPredictionsImage from './assets/model_predictions.png'

export default function App() {
  const [modelStatus, setModelStatus] = useState('unknown')
  const [isLoading, setIsLoading] = useState(false)
  const [predictions, setPredictions] = useState(null)
  const [modelMetrics, setModelMetrics] = useState(null)
  const [startDate, setStartDate] = useState('2025-01-01')
  const [periods, setPeriods] = useState('12')
  const [error, setError] = useState(null)
  const [entered, setEntered] = useState(false)

  // API base URL - adjust this based on your backend
  const API_BASE = 'https://bridor-backend-32108269805.europe-west9.run.app/api'

  useEffect(() => {
    checkModelStatus()
  }, [])

  const checkModelStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`)
      const data = await response.json()
      setModelStatus(data.model_status)
    } catch (err) {
      setError('Failed to connect to the API')
    }
  }

  const trainModel = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/model/train`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        setModelMetrics(data.metrics)
        setModelStatus('trained')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to train model')
    } finally {
      setIsLoading(false)
    }
  }

  const makePrediction = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: startDate,
          periods: parseInt(periods)
        })
      })
      const data = await response.json()
      if (data.success) {
        setPredictions(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to make prediction')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPredictionData = () => {
    if (!predictions) return []
    return predictions.dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString(),
      value: Math.round(predictions.predictions[index]),
      color: '#2563eb'
    }))
  }

  const getStatusBadge = () => {
    switch (modelStatus) {
      case 'trained':
        return <Badge className="bg-emerald-100 text-emerald-800 animate-pulse-slow"><CheckCircle className="w-3 h-3 mr-1" />Trained</Badge>
      case 'not_trained':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" />Not Trained</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />Unknown</Badge>
    }
  }

  // Generate sample data for the dashboard overview chart
  const generateSampleData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map((month, index) => ({
      name: month,
      actual: Math.floor(15000 + Math.random() * 10000),
      forecast: Math.floor(14000 + Math.random() * 12000),
    }));
  }

  const sampleData = generateSampleData();

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

  const ChartCard = ({ title, description, chart }) => (
    <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {chart}
      </CardContent>
    </Card>
  );

  const MetricCard = ({ title, value, icon, trend, trendDirection }) => {
    const Icon = icon;
    return (
      <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && (
                <div className={`flex items-center text-xs ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trendDirection === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                  <span>{trend}</span>
                </div>
              )}
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8 max-w-7xl"
          >
            {/* Background blur blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <BlurBlob className="bg-blue-200 w-[50vw] h-[50vw] top-[-20%] left-[-20%]" />
              <BlurBlob className="bg-indigo-200 w-[60vw] h-[60vw] bottom-[-30%] right-[-20%]" delay={3} />
            </div>
            
            {/* Brand Bar */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="sticky top-3 z-20 mb-8"
            >
              <div className="mx-auto w-full rounded-xl border border-white/60 bg-white/70 backdrop-blur-md shadow-md px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src="/jaydai_logo.png" alt="Jaydai logo" className="h-9 sm:h-10 w-auto object-contain" />
                    <span className="text-gray-400">×</span>
                    <img src="/bridor_logo.png" alt="Bridor logo" className="h-8 sm:h-9 w-auto object-contain" />
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
                    <Badge className="bg-indigo-600 text-white">Enterprise</Badge>
                    <span className="hidden md:inline">AI‑powered sales forecasting dashboard</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Header */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                Sales Forecasting Platform
              </h1>
              <p className="text-lg text-gray-600">Accurate weekly projections to guide production and demand planning</p>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 p-1 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="predictions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  Predictions
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  Data Analysis
                </TabsTrigger>
                <TabsTrigger value="model" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  Model Info
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <MetricCard 
                    title="Model Status" 
                    value={modelStatus === 'trained' ? 'Ready' : 'Needs Training'} 
                    icon={Brain} 
                    trend={modelStatus === 'trained' ? 'Updated today' : 'Action required'} 
                    trendDirection={modelStatus === 'trained' ? 'up' : 'down'}
                  />
                  
                  <MetricCard 
                    title="Forecast Accuracy" 
                    value={modelMetrics ? `${(modelMetrics.r2 * 100).toFixed(1)}%` : 'N/A'} 
                    icon={BarChart3} 
                    trend={modelMetrics ? 'RMSE: ' + modelMetrics.rmse.toFixed(0) : undefined}
                    trendDirection="up"
                  />
                  
                  <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
                        <div className="space-y-3 flex-grow">
                          <Button 
                            onClick={trainModel} 
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            size="sm"
                          >
                            {isLoading ? 'Training...' : 'Train Model'}
                          </Button>
                          <Button 
                            onClick={checkModelStatus} 
                            variant="outline"
                            className="w-full border-blue-200 hover:bg-blue-50"
                            size="sm"
                          >
                            Refresh Status
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ChartCard 
                    title="Sales Performance Overview" 
                    description="Historical and forecasted sales trends"
                    chart={
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={sampleData}>
                          <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{fill: '#6b7280'}} />
                          <YAxis tick={{fill: '#6b7280'}} />
                          <Tooltip 
                            contentStyle={{backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                            formatter={(value) => [`${value.toLocaleString()}`, '']}
                            labelStyle={{fontWeight: 'bold'}}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="actual" stroke="#2563eb" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} name="Actual Sales" />
                          <Area type="monotone" dataKey="forecast" stroke="#10b981" fillOpacity={1} fill="url(#colorForecast)" strokeWidth={2} name="Forecasted Sales" />
                        </AreaChart>
                      </ResponsiveContainer>
                    }
                  />
                </motion.div>

                {/* Prediction Chart */}
                {predictions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <ChartCard
                      title="Latest Forecast Results"
                      description={`Predicted sales for the next ${periods} weeks starting ${startDate}`}
                      chart={
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={formatPredictionData()}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{fill: '#6b7280'}} />
                            <YAxis tick={{fill: '#6b7280'}} />
                            <Tooltip 
                              contentStyle={{backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                              formatter={(value) => [value.toLocaleString(), 'Sales']}
                              labelStyle={{fontWeight: 'bold'}}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#2563eb" 
                              fillOpacity={1}
                              fill="url(#colorValue)"
                              strokeWidth={2}
                              name="Predicted Sales"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      }
                    />
                  </motion.div>
                )}
              </TabsContent>

              {/* Predictions Tab */}
              <TabsContent value="predictions" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Generate Predictions
                      </CardTitle>
                      <CardDescription>
                        Configure and generate sales forecasts using the trained model
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="start-date" className="text-gray-700">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border-blue-200 focus-visible:border-blue-400 focus-visible:ring-blue-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="periods" className="text-gray-700">Number of Weeks</Label>
                          <Select value={periods} onValueChange={setPeriods}>
                            <SelectTrigger className="border-blue-200 focus-visible:border-blue-400 focus-visible:ring-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4">4 weeks</SelectItem>
                              <SelectItem value="8">8 weeks</SelectItem>
                              <SelectItem value="12">12 weeks</SelectItem>
                              <SelectItem value="24">24 weeks</SelectItem>
                              <SelectItem value="52">52 weeks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        onClick={makePrediction} 
                        disabled={isLoading || modelStatus !== 'trained'}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow hover:shadow-md"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Forecast...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Generate Forecast
                          </span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Prediction Results */}
                {predictions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                        <CardTitle>Prediction Results</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 text-gray-800">Forecast Chart</h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <AreaChart data={formatPredictionData()}>
                                <defs>
                                  <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{fill: '#6b7280'}} />
                                <YAxis tick={{fill: '#6b7280'}} />
                                <Tooltip 
                                  contentStyle={{backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                  formatter={(value) => [value.toLocaleString(), 'Sales']}
                                  labelStyle={{fontWeight: 'bold'}}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#2563eb" 
                                  fillOpacity={1}
                                  fill="url(#colorValue2)"
                                  strokeWidth={2}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3 text-gray-800">Detailed Values</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto rounded-lg bg-white/40 p-2">
                              {predictions.dates.map((date, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow">
                                  <span className="text-sm font-medium text-gray-700">{new Date(date).toLocaleDateString()}</span>
                                  <span className="font-medium text-blue-700">
                                    {Math.round(predictions.predictions[index]).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </TabsContent>

              {/* Data Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Data Analysis & Insights
                      </CardTitle>
                      <CardDescription>
                        Comprehensive analysis of the historical sales data and model performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          Historical Data Analysis
                        </h4>
                        <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                          <img 
                            src={dataAnalysisImage} 
                            alt="Comprehensive Data Analysis" 
                            className="w-full rounded-lg border hover:scale-[1.01] transition-transform duration-300" 
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          Model Predictions vs Actual Data
                        </h4>
                        <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                          <img 
                            src={modelPredictionsImage} 
                            alt="Model Predictions" 
                            className="w-full rounded-lg border hover:scale-[1.01] transition-transform duration-300" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Model Info Tab */}
              <TabsContent value="model" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        Model Information
                      </CardTitle>
                      <CardDescription>
                        Details about the forecasting model and its performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/50 rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold mb-3 text-gray-800 border-b pb-2">Model Details</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Algorithm:</span>
                              <Badge className="bg-blue-100 text-blue-800 font-medium">Random Forest</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Status:</span>
                              {getStatusBadge()}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Features:</span>
                              <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded-md">8 time-based variables</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Last Updated:</span>
                              <span className="text-sm font-medium">September 18, 2025</span>
                            </div>
                          </div>
                        </div>
                        
                        {modelMetrics && (
                          <div className="bg-white/50 rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold mb-3 text-gray-800 border-b pb-2">Performance Metrics</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">R² Score:</span>
                                <span className="text-sm font-medium text-emerald-600">{(modelMetrics.r2 * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">RMSE:</span>
                                <span className="text-sm font-medium">{modelMetrics.rmse.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">MAE:</span>
                                <span className="text-sm font-medium">{modelMetrics.mae.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Training Set:</span>
                                <span className="text-sm font-medium">12 months of data</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          How to Use This Model
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-2 ml-1">
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></span>
                            Ensure the model is trained before making predictions
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></span>
                            Select a future start date for your forecast
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></span>
                            Choose the number of weeks you want to predict
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></span>
                            The model uses historical patterns and seasonality
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></span>
                            Higher R² scores indicate better prediction accuracy
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex flex-col items-center justify-center gap-2 text-sm text-gray-500 p-4"
            >
              <div className="flex items-center gap-2">
                <img src="/jaydai_logo.png" alt="Jaydai" className="h-5" />
                <span className="text-gray-400">×</span>
                <img src="/bridor_logo.png" alt="Bridor" className="h-5" />
              </div>
              <p className="text-xs text-center">© {new Date().getFullYear()} Jaydai & Bridor — Enterprise Sales Forecasting Platform</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
