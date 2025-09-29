import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

const FileUpload = ({ onUploadSuccess, onTrainingComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [training, setTraining] = useState(false)
  const [uploadedFilename, setUploadedFilename] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
        setError('Please select an Excel file (.xlsx or .xls)')
        return
      }
      setSelectedFile(file)
      setError('')
      setMessage('')
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:5002/api/forecasting/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadedFilename(result.filename)
        setMessage('File uploaded successfully!')
        if (onUploadSuccess) {
          onUploadSuccess(result.filename)
        }
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const trainModel = async () => {
    if (!uploadedFilename) {
      setError('Please upload a file first')
      return
    }

    setTraining(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('http://localhost:5002/api/forecasting/train_from_upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: uploadedFilename
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`Model trained successfully! Metrics: R² = ${result.metrics.test_r2?.toFixed(4)}, RMSE = ${result.metrics.test_rmse?.toFixed(2)}`)
        if (onTrainingComplete) {
          onTrainingComplete(result.metrics)
        }
      } else {
        setError(result.error || 'Training failed')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setTraining(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Training Data
        </CardTitle>
        <CardDescription>
          Upload an Excel file with customer sales data (Date, Customer, Sales columns required)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file-upload" className="text-sm font-medium">
            Select Excel File
          </label>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={uploading || training}
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={uploadFile}
            disabled={!selectedFile || uploading || training}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>

          {uploadedFilename && (
            <Button
              onClick={trainModel}
              disabled={training || uploading}
              variant="outline"
              className="flex-1"
            >
              {training ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Train Model
                </>
              )}
            </Button>
          )}
        </div>

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

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Expected Excel format:</strong></p>
          <ul className="list-disc list-inside mt-1">
            <li>Date column (e.g., 2024-01-01)</li>
            <li>Customer column (customer names/IDs)</li>
            <li>Sales column (numerical sales values)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default FileUpload