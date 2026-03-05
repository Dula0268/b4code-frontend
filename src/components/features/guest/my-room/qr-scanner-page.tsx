"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Camera, ExternalLink, HelpCircle, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

// QR code external API URL
const QR_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=16&data=${encodeURIComponent("https://primestay.lk/guest/my-room/menu")}&color=000000&bgcolor=ffffff`

declare class BarcodeDetector {
    constructor(options: { formats: string[] })
    detect(src: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

type CameraPhase = "idle" | "requesting" | "scanning" | "detected" | "error"

export default function QrScannerPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const rafRef = useRef<number>(0)

    const [showCamera, setShowCamera] = useState(false)
    const [cameraPhase, setCameraPhase] = useState<CameraPhase>("idle")
    const [errorMsg, setErrorMsg] = useState("")

    // ── Stop camera ───────────────────────────────────────────────────────────
    const stopCamera = useCallback(() => {
        cancelAnimationFrame(rafRef.current)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        if (videoRef.current) videoRef.current.srcObject = null
    }, [])

    // ── BarcodeDetector scan loop ─────────────────────────────────────────────
    const startScanLoop = useCallback(() => {
        if (!("BarcodeDetector" in window)) return
        const detector = new BarcodeDetector({ formats: ["qr_code"] })
        const loop = async () => {
            const vid = videoRef.current
            if (!vid || vid.readyState < 2) { rafRef.current = requestAnimationFrame(loop); return }
            try {
                const codes = await detector.detect(vid)
                if (codes.length > 0) {
                    setCameraPhase("detected")
                    stopCamera()
                    setTimeout(() => {
                        setShowCamera(false)
                        setCameraPhase("idle")
                        alert("Scanned QR code: " + codes[0].rawValue)
                    }, 1000)
                    return
                }
            } catch { /* ignore */ }
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
    }, [stopCamera])

    // ── Start camera ──────────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
        setShowCamera(true)
        setCameraPhase("requesting")
        setErrorMsg("")
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
                setCameraPhase("scanning")
                startScanLoop()
            }
        } catch (err: unknown) {
            stopCamera()
            setCameraPhase("error")
            const name = (err as { name?: string })?.name
            setErrorMsg(
                name === "NotAllowedError"
                    ? "Camera access was denied. Please allow camera access in your browser settings."
                    : "Could not access camera on this device."
            )
        }
    }, [startScanLoop, stopCamera])

    const closeCamera = () => {
        stopCamera()
        setShowCamera(false)
        setCameraPhase("idle")
    }

    return (
        <>
            {/* ── Page ──────────────────────────────────────────────────────── */}
            <div className="min-h-screen bg-[#f7f5f2] pt-24 pb-16 flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-[420px] flex flex-col items-center text-center">

                    {/* Accent line */}
                    <div className="w-12 h-1 bg-[#a03b10] mb-6 rounded-full" />

                    {/* Title */}
                    <h1 className="text-[34px] font-bold text-[#1a1a1a] tracking-tight leading-tight mb-3">
                        Scan to Access Digital Menu
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[16px] text-[#c17a5c] leading-relaxed mb-10">
                        Point your phone camera at the code below to<br />
                        view our services and menu.
                    </p>

                    {/* QR Card */}
                    <div className="relative mb-10">
                        <div className="bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-8 flex items-center justify-center w-[280px] h-[280px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={QR_IMAGE_URL}
                                alt="Scan this QR code to access the digital menu"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    ; (e.target as HTMLImageElement).style.display = "none"
                                }}
                            />
                        </div>

                        {/* Camera button — top right corner of card */}
                        <button
                            onClick={startCamera}
                            aria-label="Open camera to scan QR code"
                            className="absolute -top-3 -right-3 w-[46px] h-[46px] bg-[#000000] hover:bg-[#a03b10] rounded-xl flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-colors cursor-pointer"
                        >
                            <Camera size={22} className="text-white" />
                        </button>
                    </div>

                    {/* Visit Menu Directly */}
                    <button
                        className="w-[280px] flex items-center justify-center gap-2 bg-[#a03b10] hover:bg-[#852f0b] text-white font-bold text-[15px] py-[15px] rounded-xl transition-colors cursor-pointer mb-6"
                    >
                        Visit Menu Directly <ExternalLink size={17} />
                    </button>

                    {/* Help text */}
                    <div className="w-[280px] border border-[#e5dfd5] rounded-full py-2.5 flex items-center justify-center gap-2">
                        <HelpCircle size={14} className="text-[#a03b10]" />
                        <span className="text-[12px] text-[#a03b10]/90">Need help? Ask our staff for assistance.</span>
                    </div>
                </div>
            </div>

            {/* ── Camera Modal Overlay ──────────────────────────────────────── */}
            {showCamera && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col">

                    {/* Camera topbar */}
                    <div className="flex items-center justify-between px-5 py-4 bg-black/60">
                        <button
                            onClick={closeCamera}
                            className="flex items-center gap-1.5 text-white/70 hover:text-white text-[14px] cursor-pointer transition-colors"
                        >
                            <X size={18} /> Close
                        </button>
                        <span className="text-white font-bold text-[14px]">Scan QR Code</span>
                        <div className="w-16" />
                    </div>

                    {/* Camera content */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">

                        {cameraPhase === "requesting" && (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="w-14 h-14 border-4 border-[#f0a500]/30 border-t-[#f0a500] rounded-full animate-spin" />
                                <p className="text-white/70 text-[14px]">Requesting camera…</p>
                            </div>
                        )}

                        {cameraPhase === "scanning" && (
                            <div className="w-full max-w-[350px] flex flex-col items-center gap-4">
                                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/10">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    {/* Corner brackets */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute top-6 left-6 w-10 h-10 border-t-[3px] border-l-[3px] border-[#f0a500] rounded-tl-md" />
                                        <div className="absolute top-6 right-6 w-10 h-10 border-t-[3px] border-r-[3px] border-[#f0a500] rounded-tr-md" />
                                        <div className="absolute bottom-6 left-6 w-10 h-10 border-b-[3px] border-l-[3px] border-[#f0a500] rounded-bl-md" />
                                        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-[3px] border-r-[3px] border-[#f0a500] rounded-br-md" />
                                        <div className="absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#f0a500] to-transparent scan-line" />
                                    </div>
                                </div>
                                <p className="text-white/60 text-[13px] text-center">Point at the QR code — scans automatically</p>
                                <button onClick={closeCamera} className="text-white/40 hover:text-white/70 text-[13px] transition-colors cursor-pointer flex items-center gap-1.5">
                                    <RefreshCw size={13} /> Cancel
                                </button>
                            </div>
                        )}

                        {cameraPhase === "detected" && (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-[#27AE60]" />
                                </div>
                                <p className="text-white font-bold text-[18px]">QR Code Detected!</p>
                            </div>
                        )}

                        {cameraPhase === "error" && (
                            <div className="w-full max-w-[340px] flex flex-col items-center gap-5 text-center">
                                <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center">
                                    <AlertCircle size={28} className="text-red-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-[16px] mb-1.5">Camera Unavailable</p>
                                    <p className="text-white/50 text-[13px] leading-relaxed">{errorMsg}</p>
                                </div>
                                <button
                                    onClick={() => { setCameraPhase("idle"); startCamera() }}
                                    className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                                >
                                    <RefreshCw size={14} /> Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Scan line animation */}
            <style jsx>{`
                .scan-line {
                    animation: scanLine 2s ease-in-out infinite;
                    top: 50%;
                }
                @keyframes scanLine {
                    0%   { transform: translateY(-130px); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateY(130px); opacity: 0; }
                }
            `}</style>
        </>
    )
}
