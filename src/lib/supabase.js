import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hkgjvzkqihmwyxddnkdd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZ2p2emtxaWhtd3l4ZGRua2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODQ3OTQsImV4cCI6MjA2NDQ2MDc5NH0.uO2TaYgEAzsppd8Fq3YjSsGXr24DtyTqch9-vfnPD2Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const uploadFile = async (file, filename) => {
  try {
    const { data, error } = await supabase.storage
      .from('forecasting-files')
      .upload(filename, file)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const downloadFile = async (filename) => {
  try {
    const { data, error } = await supabase.storage
      .from('forecasting-files')
      .download(filename)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

export const getPublicUrl = (filename) => {
  const { data } = supabase.storage
    .from('forecasting-files')
    .getPublicUrl(filename)

  return data.publicUrl
}

export const listFiles = async () => {
  try {
    const { data, error } = await supabase.storage
      .from('forecasting-files')
      .list()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error listing files:', error)
    throw error
  }
}