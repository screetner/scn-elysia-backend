import axios from 'axios'
import { RequestPythonDetection } from '@/models/videoSession'

export default async function trickProcess(request: RequestPythonDetection) {
  const url = process.env.PYTHON_DETECTION_PATH!
  await axios.post(url, request)
}
