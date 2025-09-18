import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Brain, BarChart3, Settings, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import './App.css'

// Import analysis images
import dataAnalysisImage from './assets/comprehensive_data_analysis.png'
import modelPredictionsImage from './assets/model_predictions.png'

function App() {
  const [modelStatus, setModelStatus] = useState('unknown')
  const [isLoading, setIsLoading] = useState(false)
  const [predictions, setPredictions] = useState(null)
  const [modelMetrics, setModelMetrics] = useState(null)
  const [startDate, setStartDate] = useState('2025-01-01')
  const [periods, setPeriods] = useState('12')
  const [error, setError] = useState(null)

  // API base URL - adjust this based on your backend
  const API_BASE = 'http://localhost:5001/api'

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
      value: Math.round(predictions.predictions[index])
    }))
  }

  const getStatusBadge = () => {
    switch (modelStatus) {
      case 'trained':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Trained</Badge>
      case 'not_trained':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Not Trained</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Sales Forecasting Dashboard
          </h1>
          <p className="text-lg text-gray-600">Advanced machine learning model for weekly sales predictions</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
            <TabsTrigger value="model">Model Info</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Model Status Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Model Status</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {modelStatus === 'trained' ? 'Ready for predictions' : 'Train the model to start forecasting'}
                  </p>
                </CardContent>
              </Card>

              {/* Model Performance Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Model Performance</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {modelMetrics ? (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600">
                        {(modelMetrics.r2 * 100).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">R² Score</p>
                      <p className="text-xs text-muted-foreground">
                        RMSE: {modelMetrics.rmse.toFixed(0)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Train model to see metrics
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={trainModel} 
                    disabled={isLoading}
                    className="w-full"
                    size="sm"
                  >
                    {isLoading ? 'Training...' : 'Train Model'}
                  </Button>
                  <Button 
                    onClick={checkModelStatus} 
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Refresh Status
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Prediction Chart */}
            {predictions && (
              <Card>
                <CardHeader>
                  <CardTitle>Forecast Results</CardTitle>
                  <CardDescription>
                    Predicted sales for the next {periods} weeks starting {startDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatPredictionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Sales']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={{ fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Predictions</CardTitle>
                <CardDescription>
                  Configure and generate sales forecasts using the trained model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periods">Number of Weeks</Label>
                    <Select value={periods} onValueChange={setPeriods}>
                      <SelectTrigger>
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
                  className="w-full"
                >
                  {isLoading ? 'Generating...' : 'Generate Forecast'}
                </Button>
              </CardContent>
            </Card>

            {/* Prediction Results */}
            {predictions && (
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Forecast Chart</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={formatPredictionData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [value.toLocaleString(), 'Sales']} />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#2563eb" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Detailed Values</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {predictions.dates.map((date, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                            <span className="font-medium">
                              {Math.round(predictions.predictions[index]).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Data Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Analysis & Insights</CardTitle>
                <CardDescription>
                  Comprehensive analysis of the historical sales data and model performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Historical Data Analysis</h4>
                  <img 
                    src={dataAnalysisImage} 
                    alt="Comprehensive Data Analysis" 
                    className="w-full rounded-lg border shadow-sm"
                  />
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Model Predictions vs Actual Data</h4>
                  <img 
                    src={modelPredictionsImage} 
                    alt="Model Predictions" 
                    className="w-full rounded-lg border shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Model Info Tab */}
          <TabsContent value="model" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Information</CardTitle>
                <CardDescription>
                  Details about the forecasting model and its performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Model Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Algorithm:</span>
                        <span className="text-sm font-medium">Random Forest</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        {getStatusBadge()}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Features:</span>
                        <span className="text-sm font-medium">8 time-based</span>
                      </div>
                    </div>
                  </div>
                  {modelMetrics && (
                    <div>
                      <h4 className="font-semibold mb-3">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">R² Score:</span>
                          <span className="text-sm font-medium">{(modelMetrics.r2 * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">RMSE:</span>
                          <span className="text-sm font-medium">{modelMetrics.rmse.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">MAE:</span>
                          <span className="text-sm font-medium">{modelMetrics.mae.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">How to Use This Model</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure the model is trained before making predictions</li>
                    <li>• Select a future start date for your forecast</li>
                    <li>• Choose the number of weeks you want to predict</li>
                    <li>• The model uses historical patterns and seasonality</li>
                    <li>• Higher R² scores indicate better prediction accuracy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
