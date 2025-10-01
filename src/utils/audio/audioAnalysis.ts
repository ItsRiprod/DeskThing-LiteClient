
let lowerBound = Infinity
let upperBound = -Infinity 

export const stripWavMetadata = (data: ArrayBuffer): ArrayBuffer => {
  // WAV header is typically 44 bytes
  // Check for 'RIFF' and 'WAVE' markers
  const header = new Uint8Array(data, 0, 44);
  if (
    header[0] === 0x52 && // 'R'
    header[1] === 0x49 && // 'I'
    header[2] === 0x46 && // 'F'
    header[3] === 0x46 && // 'F'
    header[8] === 0x57 && // 'W'
    header[9] === 0x41 && // 'A'
    header[10] === 0x56 && // 'V'
    header[11] === 0x45 // 'E'
  ) {
    // Return PCM data after 44-byte header
    return data.slice(44);
  }

  // If not a standard WAV, return as-is
  return data;
}

export const analyzeAudioLevel = (data: ArrayBuffer): number => {
  const samples = new Int16Array(data);
  if (samples.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += Math.abs(samples[i]);
  }
  const avg = sum / samples.length / 32768;

  // Defensive: If avg is NaN, return 0
  if (isNaN(avg)) return 0;

  // Update bounds
  if (avg < lowerBound) lowerBound = avg;
  if (avg > upperBound) upperBound = avg;

  lowerBound += (avg - lowerBound) * 0.01;
  upperBound += (avg - upperBound) * 0.01;

  if (upperBound - lowerBound < 0.001) {
    upperBound = lowerBound + 0.001;
  }

  // Defensive: If upperBound === lowerBound, return 0
  if (upperBound === lowerBound) return 0;

  let normalized = (avg - lowerBound) / (upperBound - lowerBound);
  if (isNaN(normalized)) return 0;
  normalized = Math.max(0, Math.min(1, normalized));
  return normalized;
}