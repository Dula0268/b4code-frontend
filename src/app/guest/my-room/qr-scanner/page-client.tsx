"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, ExternalLink, HelpCircle, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store"

const QR_CODE_CONFIG = {
  QR_IMAGE_URL: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=16&data=${encodeURIComponent("http://localhost:3000/guest/order/menu?propertyId=2&tableId=5")}&color=000000&bgcolor=ffffff`
} as const;

declare class BarcodeDetector {
  constructor(options: { formats: string[] })
  detect(src: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

type CameraPhase = "idle" | "requesting" | "scanning" | "detected" | "error"

function useQrScannerLogic() {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)

  const [showCamera,  setShowCamera]  = useState(false)
  const [phase,       setPhase]       = useState<CameraPhase>("idle")
  const [errorMsg,    setErrorMsg]    = useState("")

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const router = useRouter()
  const setQRContext = useOrderContextStore(s => s.setQRContext)

  const handleDetectedUrl = useCallback((url: string) => {
    try {
      const parsedUrl = new URL(url)
      const propertyId = parsedUrl.searchParams.get("propertyId")
      const tableId = parsedUrl.searchParams.get("tableId")
      const roomNumber = parsedUrl.searchParams.get("roomNumber")

      if (propertyId) {
        setQRContext({
          qrId: "scanned",
          propertyId: parseInt(propertyId, 10),
          propertyName: "Scanned Property",
          locationLabel: tableId ? `Table ${tableId}` : (roomNumber ? `Room ${roomNumber}` : "Unknown Location"),
          type: tableId ? "DINING_TABLE" : (roomNumber ? "ROOM" : "UNKNOWN"),
          name: "Scanned QR",
          status: "ACTIVE"
        })
        
        router.push(`/guest/order/menu?propertyId=${propertyId}${tableId ? `&tableId=${tableId}` : (roomNumber ? `&roomNumber=${roomNumber}` : "")}`)
      } else {
        alert("Scanned: " + url)
      }
    } catch (e) {
      alert("Scanned (Invalid URL): " + url)
    }
  }, [router, setQRContext])

  const startScanLoop = useCallback(() => {
    if (!("BarcodeDetector" in window)) return
    const detector = new BarcodeDetector({ formats: ["qr_code"] })

    const loop = async () => {
      const vid = videoRef.current
      if (!vid || vid.readyState < 2) { rafRef.current = requestAnimationFrame(loop); return }
      try {
        const codes = await detector.detect(vid)
        if (codes.length > 0) {
          setPhase("detected")
          stopCamera()
          setTimeout(() => {
            setShowCamera(false)
            setPhase("idle")
            handleDetectedUrl(codes[0].rawValue)
          }, 1000)
          return
        }
      } catch { }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [stopCamera, handleDetectedUrl])

  const startCamera = useCallback(async () => {
    setShowCamera(true)
    setPhase("requesting")
    setErrorMsg("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setPhase("scanning")
        startScanLoop()
      }
    } catch (err: unknown) {
      stopCamera()
      setPhase("error")
      const name = (err as { name?: string })?.name
      setErrorMsg(
        name === "NotAllowedError"
          ? "Camera access was denied. Please allow camera access in your browser settings."
          : "Could not access camera on this device.",
      )
    }
  }, [startScanLoop, stopCamera])

  const closeCamera = () => { stopCamera(); setShowCamera(false); setPhase("idle") }

  return { videoRef, showCamera, phase, errorMsg, startCamera, closeCamera, router }
}

export default function QrScannerPageClient() {
  const { videoRef, showCamera, phase, errorMsg, startCamera, closeCamera, router } = useQrScannerLogic();

  return (
    <>
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center px-4" style={{ background: "transparent" }}>
        <div className="w-full max-w-[420px] flex flex-col items-center text-center">
          <div className="w-12 h-1 rounded-full mb-6" style={{ background: "var(--brand-primary)" }} />

          <h1 className="text-[2.125rem] font-black tracking-tight leading-tight mb-3" style={{ color: "var(--fg)", fontSize: "clamp(1.5rem, 5vw, 2.125rem)" }}>
            Scan to Access Digital Menu
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: "var(--brand-primary)" }}>
            Point your phone camera at the code below to<br />view our services and menu.
          </p>

          <div className="relative mb-10">
            <div className="rounded-3xl p-8 flex items-center justify-center w-[280px] h-[280px]" style={{ background: "white", boxShadow: "0 12px 40px rgba(0,0,0,0.06)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QR_CODE_CONFIG.QR_IMAGE_URL}
                alt="Scan this QR code to access the digital menu"
                className="w-full h-full object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            </div>
            <button onClick={startCamera} aria-label="Open camera to scan QR code" className="absolute -top-3 -right-3 w-[46px] h-[46px] rounded-xl flex items-center justify-center shadow-lg transition-colors cursor-pointer text-white" style={{ background: "var(--brand-primary)" }}>
              <Camera size={22} />
            </button>
          </div>

          <button 
            onClick={() => router.push("/guest/order/menu")}
            className="w-[280px] flex items-center justify-center gap-2 text-white font-bold text-[0.9375rem] py-[15px] rounded-xl transition-colors cursor-pointer mb-6" 
            style={{ background: "var(--brand-primary)" }}
          >
            Visit Menu Directly <ExternalLink size={17} />
          </button>

          <div className="w-[280px] border rounded-full py-2.5 flex items-center justify-center gap-2" style={{ borderColor: "var(--gray-5)" }}>
            <HelpCircle size={14} style={{ color: "var(--brand-primary)" }} />
            <span className="text-xs" style={{ color: "var(--brand-primary)" }}>Need help? Ask our staff for assistance.</span>
          </div>
        </div>
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 bg-black/60">
            <button onClick={closeCamera} className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors cursor-pointer">
              <X size={18} /> Close
            </button>
            <span className="text-white font-bold text-sm">Scan QR Code</span>
            <div className="w-16" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            {phase === "requesting" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 border-4 border-t-amber-400 border-amber-400/30 rounded-full animate-spin" />
                <p className="text-white/70 text-sm">Requesting camera…</p>
              </div>
            )}

            {phase === "scanning" && (
              <div className="w-full max-w-[350px] flex flex-col items-center gap-4">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/10">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 pointer-events-none">
                    {["tl", "tr", "bl", "br"].map(pos => (
                      <div key={pos} className={`absolute w-10 h-10 border-[3px] border-amber-400 ${
                        pos === "tl" ? "top-6 left-6 rounded-tl-md border-r-0 border-b-0"
                        : pos === "tr" ? "top-6 right-6 rounded-tr-md border-l-0 border-b-0"
                        : pos === "bl" ? "bottom-6 left-6 rounded-bl-md border-r-0 border-t-0"
                        : "bottom-6 right-6 rounded-br-md border-l-0 border-t-0"}`} />
                    ))}
                    <div className="absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scan-line" />
                  </div>
                </div>
                <p className="text-white/60 text-sm text-center">Point at the QR code — scans automatically</p>
                <button onClick={closeCamera} className="text-white/40 hover:text-white/70 text-sm transition-colors cursor-pointer flex items-center gap-1.5">
                  <RefreshCw size={13} /> Cancel
                </button>
              </div>
            )}

            {phase === "detected" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--state-success) 15%, black)" }}>
                  <CheckCircle2 size={32} style={{ color: "var(--state-success)" }} />
                </div>
                <p className="text-white font-bold text-lg">QR Code Detected!</p>
              </div>
            )}

            {phase === "error" && (
              <div className="w-full max-w-[340px] flex flex-col items-center gap-5 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(220,38,38,0.2)" }}>
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1.5">Camera Unavailable</p>
                  <p className="text-white/50 text-sm leading-relaxed">{errorMsg}</p>
                </div>
                <button onClick={() => { closeCamera(); startCamera() }} className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors cursor-pointer">
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .scan-line {
          animation: scanMove 2s ease-in-out infinite;
          top: 50%;
        }
        @keyframes scanMove {
          0%   { transform: translateY(-130px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(130px); opacity: 0; }
        }
      `}</style>
    </>
  )
}
