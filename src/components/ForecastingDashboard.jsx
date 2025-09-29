import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Download,
  Layers,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  CalendarRange,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

const API_BASE = 'https://bridor-backend-32108269805.europe-west9.run.app/api/forecasting'

const ForecastingDashboard = () => {
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [modelInfo, setModelInfo] = useState(null)
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')

  const [startDate, setStartDate] = useState('')
  const [periods, setPeriods] = useState(52)

  const [predictions, setPredictions] = useState(null)
  const [allPredictions, setAllPredictions] = useState([])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const hasAutoPredicted = useRef(false)

  useEffect(() => {
    const today = new Date()
    const nextWeekMonday = new Date(today)
    const dayOfWeek = today.getDay()
    const daysUntilNextMonday = ((1 - dayOfWeek + 7) % 7) || 7
    nextWeekMonday.setDate(today.getDate() + daysUntilNextMonday)
    setStartDate(nextWeekMonday.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    if (!selectedModel) {
      setModelInfo(null)
      setCustomers([])
      setSelectedCustomer('')
      return
    }

    fetchModelInfo(selectedModel)
    fetchCustomers(selectedModel)
  }, [selectedModel])

  const normalizePredictionPayload = (payload) => {
    if (!payload) return null

    const predictionsArray = Array.isArray(payload.predictions)
      ? payload.predictions.map((value) => {
          const numeric = Number(value)
          return Number.isFinite(numeric) ? numeric : 0
        })
      : []

    return {
      ...payload,
      predictions: predictionsArray,
    }
  }

  const fetchModels = async () => {
    try {
      const response = await fetch(`${API_BASE}/models`)
      const result = await response.json()

      if (result.success) {
        setModels(result.models)

        const linearModel = result.models.find((model) => model.name === 'linear_regression')
        const fallbackModel = result.default_model || (result.models[0]?.name ?? '')
        const modelToUse = linearModel?.name ?? fallbackModel

        if (modelToUse) {
          setSelectedModel(modelToUse)
        }
      } else {
        setError(result.error || 'Unable to load models')
      }
    } catch (err) {
      setError('Network error while loading models: ' + err.message)
    }
  }

  const fetchModelInfo = async (modelName) => {
    try {
      const response = await fetch(`${API_BASE}/model/info?model_name=${modelName}`)
      const result = await response.json()
      if (result.success) {
        setModelInfo(result.data)
      } else {
        setError(result.error || 'Unable to load model info')
      }
    } catch (err) {
      setError('Network error while loading model info: ' + err.message)
    }
  }

  const fetchCustomers = async (modelName) => {
    try {
      const response = await fetch(`${API_BASE}/customers?model_name=${modelName}`)
      const result = await response.json()

      if (result.success) {
        setCustomers(result.customers)
        if (!result.customers.includes(selectedCustomer)) {
          setSelectedCustomer('')
        }
      } else {
        setCustomers([])
        setSelectedCustomer('')
      }
    } catch (err) {
      setCustomers([])
      setSelectedCustomer('')
    }
  }

  const handleModelChange = (value) => {
    setSelectedModel(value)
    setSelectedCustomer('')
    setPredictions(null)
    setAllPredictions([])
    setMessage('')
    setError('')
    hasAutoPredicted.current = false
  }

  const currentModelSupportsCustomers = Boolean(modelInfo?.supports_customers)

  const makePrediction = async ({ silent = false } = {}) => {
    if (!startDate) {
      setError('Please select a start date')
      return
    }

    if (!selectedModel) {
      setError('Please choose a forecasting model')
      return
    }

    setLoading(true)
    setError('')
    if (!silent) {
      setMessage('')
    }

    try {
      const body = {
        start_date: startDate,
        periods,
        model_name: selectedModel
      }

      if (currentModelSupportsCustomers && selectedCustomer) {
        body.customer = selectedCustomer
      }

      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        setPredictions(normalizePredictionPayload(result.data))
        if (!silent) {
          setMessage('Predictions generated successfully!')
        }
      } else {
        setError(result.error || 'Prediction failed')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedModel || !startDate || !periods || hasAutoPredicted.current) {
      return
    }

    hasAutoPredicted.current = true
    makePrediction({ silent: true })
  }, [selectedModel, startDate, periods])

  const predictAllCustomers = async () => {
    if (!currentModelSupportsCustomers) {
      setError('The selected model does not support customer forecasts')
      return
    }

    if (!startDate) {
      setError('Please select a start date')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_BASE}/predict/all_customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: startDate,
          periods,
          model_name: selectedModel
        })
      })

      const result = await response.json()

      if (result.success) {
        const normalized = result.data.map(normalizePredictionPayload)
        setAllPredictions(normalized)
        setMessage(`Predictions generated for ${result.data.length} customers!`)
      } else {
        setError(result.error || 'Prediction failed')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = async () => {
    if (!startDate) {
      setError('Please select a start date')
      return
    }

    if (!selectedModel) {
      setError('Please choose a forecasting model')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const body = {
        start_date: startDate,
        periods,
        model_name: selectedModel
      }

      if (currentModelSupportsCustomers && selectedCustomer) {
        body.customer = selectedCustomer
      }

      const response = await fetch(`${API_BASE}/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        window.open(result.download_url, '_blank')
        setMessage('Excel file exported successfully!')
      } else {
        setError(result.error || 'Export failed')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => new Intl.NumberFormat().format(Math.round(num))

  const predictionSummary = useMemo(() => {
    if (!predictions?.predictions?.length) {
      return null
    }

    const values = predictions.predictions
    const total = values.reduce((sum, value) => {
      const numeric = Number(value)
      return sum + (Number.isFinite(numeric) ? numeric : 0)
    }, 0)
    const average = total / values.length
    const peak = Math.max(...values)
    const lowest = Math.min(...values)

    return {
      total,
      average,
      peak,
      lowest,
      periods: values.length,
    }
  }, [predictions])

  const chartData = useMemo(() => {
    if (!predictions?.dates || !predictions?.predictions) {
      return []
    }

    return predictions.dates.map((date, index) => {
      const numericValue = Number(predictions.predictions[index])
      const roundedValue = Number.isFinite(numericValue) ? Math.round(numericValue) : 0

      return {
        date: new Date(date).toLocaleDateString(),
        value: roundedValue,
      }
    })
  }, [predictions])

  const chartDomain = useMemo(() => {
    if (!chartData.length) {
      return null
    }

    const values = chartData.map((point) => point.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    if (minValue === maxValue) {
      const padding = minValue === 0 ? 50 : Math.max(minValue * 0.05, 25)
      const lowerBound = Math.max(0, minValue - padding)
      return { min: lowerBound, max: minValue + padding }
    }

    const padding = Math.max((maxValue - minValue) * 0.1, 25)
    const lowerBound = Math.max(0, minValue - padding)

    return {
      min: lowerBound,
      max: maxValue + padding,
    }
  }, [chartData])

  const getModelProvider = (name) => {
    const normalized = (name || '').toLowerCase()

    if (!normalized) {
      return null
    }

    const withoutExtension = normalized.replace(/\.pkl$/i, '')

    if (withoutExtension === 'linear_regression') {
      return 'Manus'
    }

    if (withoutExtension === 'sarima') {
      return 'Claude'
    }

    return null
  }

  const formatModelDisplayName = (name, displayName, providerFromMetadata) => {
    const resolvedName = name || ''
    const provider = providerFromMetadata || getModelProvider(resolvedName)

    const cleanedName = resolvedName
      .replace(/\.pkl$/i, '')
      .replace(/_/g, ' ')
      .trim()

    const normalizedCleanedName = cleanedName
      ? cleanedName.replace(/\b\w/g, (letter) => letter.toUpperCase())
      : ''

    const fallbackLabel = (() => {
      if (!resolvedName) return ''

      if (provider === 'Manus') {
        return 'Linear Regression'
      }

      if (provider === 'Claude') {
        return 'SARIMA'
      }

      return normalizedCleanedName || resolvedName
    })()

    const baseLabel = displayName || fallbackLabel || 'Unknown model'

    if (provider) {
      return `${baseLabel} (${provider})`
    }

    return baseLabel
  }

  const activeModelName = modelInfo?.name || selectedModel
  const activeModelProvider = modelInfo?.provider || getModelProvider(activeModelName)
  const activeModelDisplayName = formatModelDisplayName(activeModelName, modelInfo?.display_name, activeModelProvider)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images/ai_tools/chatgpt_logo.png"
                alt="ChatGPT logo"
                className="h-9 w-9 rounded-full border border-gray-200 bg-white object-contain p-1 shadow-sm"
              />
              <img
                src="https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images/ai_tools/manus_logo.png"
                alt="Manus logo"
                className="h-9 w-9 rounded-full border border-gray-200 bg-white object-contain p-1 shadow-sm"
              />
              <img
                src="https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images/ai_tools/claude_logo.png"
                alt="Claude logo"
                className="h-9 w-9 rounded-full border border-gray-200 bg-white object-contain p-1 shadow-sm"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Sales Forecasting</h1>
              <p className="text-sm text-gray-500">Pick a model, choose the horizon, and preview the forecast instantly.</p>
            </div>
          </div>

          {modelInfo && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs text-emerald-700">
              <CheckCircle className="h-4 w-4" />
              <span>{activeModelDisplayName} ready</span>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card className="border-none shadow-none ring-1 ring-black/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Layers className="h-5 w-5 text-blue-500" />
                Choose Model
              </CardTitle>
              <CardDescription>Select the pre-trained forecaster you want to use.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-select">Model</Label>
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger id="model-select">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {formatModelDisplayName(model.name, model.display_name, model.provider)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {modelInfo ? (
                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-800">{activeModelDisplayName}</p>
                  <p className="mt-2 leading-relaxed">{modelInfo.description || 'No description provided.'}</p>
                  {activeModelProvider && (
                    <p className="mt-2 text-xs font-semibold uppercase text-blue-600">Powered by {activeModelProvider}</p>
                  )}
                  <p className="mt-3 text-xs text-gray-500">
                    Horizon: weekly • Customer forecasts {modelInfo.supports_customers ? 'enabled' : 'unavailable'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select a model to see details.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-none ring-1 ring-black/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Forecast Settings
              </CardTitle>
              <CardDescription>Define the forecast window for the selected model.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    hasAutoPredicted.current = false
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periods">Forecast Weeks</Label>
                <Input
                  id="periods"
                  type="number"
                  min="1"
                  max="52"
                  value={periods}
                  onChange={(e) => {
                    const value = Math.min(52, Math.max(1, parseInt(e.target.value, 10) || 1))
                    setPeriods(value)
                    hasAutoPredicted.current = false
                  }}
                />
              </div>

              {currentModelSupportsCustomers && (
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer (optional)</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select customer or leave empty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All customers</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer} value={customer}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => makePrediction()}
                  disabled={loading || !selectedModel}
                  className="flex-1"
                >
                  {loading ? 'Predicting…' : 'Generate Forecast'}
                </Button>

                {currentModelSupportsCustomers && (
                  <Button
                    onClick={predictAllCustomers}
                    disabled={loading || !selectedModel}
                    variant="outline"
                    className="flex-1"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    All Customers
                  </Button>
                )}
              </div>

              <Button
                onClick={exportToExcel}
                disabled={loading || !selectedModel}
                variant="secondary"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {predictions && (
        <Card className="border-none bg-white shadow-sm ring-1 ring-black/5">
          <CardHeader className="flex flex-col gap-2 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Forecast Overview {predictions.customer ? `· ${predictions.customer}` : ''}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <CalendarRange className="h-4 w-4" />
              {predictions.dates[0]} → {predictions.dates[predictions.dates.length - 1]}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {predictionSummary && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-center">
                  <p className="text-xs uppercase text-blue-600">Total Forecast</p>
                  <p className="mt-1 text-lg font-semibold text-blue-700">{formatNumber(predictionSummary.total)}</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-center">
                  <p className="text-xs uppercase text-emerald-600">Weekly Average</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">{formatNumber(predictionSummary.average)}</p>
                </div>
                <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-3 text-center">
                  <p className="text-xs uppercase text-purple-600">Peak Week</p>
                  <p className="mt-1 text-lg font-semibold text-purple-700">{formatNumber(predictionSummary.peak)}</p>
                </div>
                <div className="rounded-lg border border-orange-100 bg-orange-50/60 p-3 text-center">
                  <p className="text-xs uppercase text-orange-600">Periods</p>
                  <p className="mt-1 text-lg font-semibold text-orange-700">{predictionSummary.periods}</p>
                </div>
              </div>
            )}

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} angle={-30} dy={10} textAnchor="end" height={50} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    allowDecimals={false}
                    domain={[
                      chartDomain?.min ?? 'auto',
                      chartDomain?.max ?? 'auto',
                    ]}
                  />
                  <Tooltip
                    formatter={(value) => [new Intl.NumberFormat().format(value), 'Predicted sales']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    fill="url(#forecastArea)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-100">
              <div className="flex items-center justify-between rounded-t-xl bg-gray-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                <span>Date</span>
                <span>Predicted Sales</span>
              </div>
              <div className="divide-y divide-gray-100">
                {predictions.dates.map((date, index) => (
                  <div key={date} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="font-medium text-gray-700">{new Date(date).toLocaleDateString()}</span>
                    <span className="font-semibold text-gray-900">
                      {formatNumber(predictions.predictions[index])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {allPredictions.length > 0 && (
        <Card className="border-none bg-white shadow-sm ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">All Customer Predictions</CardTitle>
            <CardDescription>Quick summary of the total and average forecast per customer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allPredictions.map((prediction, index) => (
                <div key={prediction.customer || index} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <h3 className="text-sm font-semibold text-gray-800">{prediction.customer || `Customer ${index + 1}`}</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(prediction.predictions.reduce((a, b) => a + b, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg weekly</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(
                          prediction.predictions.reduce((a, b) => a + b, 0) / prediction.predictions.length,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default ForecastingDashboard
