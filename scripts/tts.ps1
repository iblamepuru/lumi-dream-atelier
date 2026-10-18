# Turns a list of narration lines into WAV files with the voices built into Windows (no internet, no API key).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/tts.ps1 -Manifest jobs.json [-Voice "Microsoft Zira Desktop"] [-Rate 0]
# jobs.json: [{ "text": "Hello", "out": "C:\\path\\line-01.wav" }, ...]
param(
  [Parameter(Mandatory = $true)][string]$Manifest,
  [string]$Voice = "Microsoft Zira Desktop",
  [int]$Rate = 0
)

Add-Type -AssemblyName System.Speech
$jobs = Get-Content -Raw -Encoding UTF8 $Manifest | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $synth.SelectVoice($Voice) } catch { Write-Host "Voice '$Voice' not found, using the default voice." }
$synth.Rate = $Rate
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)

foreach ($job in $jobs) {
  $synth.SetOutputToWaveFile($job.out, $format)
  $synth.Speak($job.text)
  $synth.SetOutputToNull()
}
$synth.Dispose()
Write-Host "Spoke $($jobs.Count) lines."
