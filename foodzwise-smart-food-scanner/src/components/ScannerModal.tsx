import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Keyboard, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { LOCAL_CATALOGUE } from '../data/catalogue';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'manual' | 'demo'>('demo');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and tear down camera scanner
  useEffect(() => {
    if (!isOpen || activeMode !== 'camera') {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode]);

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      };

      await codeReader.decodeFromConstraints(
        constraints,
        videoElement,
        (result, err) => {
          if (result) {
            const text = result.getText();
            stopCamera();
            onBarcodeDetected(text);
          }
          if (err && !(err.name === 'NotFoundException')) {
            // loop
          }
        }
      );
    } catch (err: unknown) {
      console.error('Camera init error:', err);
      const message = err instanceof Error ? err.message : 'Camera could not be accessed';
      setCameraError(
        `${message}. You can switch to Image Upload or click any Popular Food below!`
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      try {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      } catch (e) {
        console.warn('Error stopping video stream:', e);
      }
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Scanning uploaded image for barcode...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const codeReader = new BrowserMultiFormatReader();
        try {
          const result = await codeReader.decodeFromImageUrl(dataUrl);
          if (result) {
            setUploadStatus('Barcode found!');
            onBarcodeDetected(result.getText());
          } else {
            setUploadStatus('No readable barcode detected in this image. Try another or pick a demo barcode.');
          }
        } catch {
          setUploadStatus('Could not read a barcode from image. Check lighting and framing, or use manual entry.');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadStatus('Failed reading image file.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onBarcodeDetected(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-stone-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-900">Scan Food Barcode</h2>
            <span className="text-xs text-stone-500">· FSSAI Food Database</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1.5 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('demo')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeMode === 'demo' ? 'bg-white text-[#12382c] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1b4d3e]" />
            <span>Popular Foods</span>
          </button>

          <button
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeMode === 'camera' ? 'bg-white text-[#12382c] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => setActiveMode('upload')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeMode === 'upload' ? 'bg-white text-[#12382c] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeMode === 'manual' ? 'bg-white text-[#12382c] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Enter Barcode</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Mode 1: 1-Tap Demo Products */}
          {activeMode === 'demo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-600">
                  Select any Indian packaged food from the verified FSSAI catalogue to inspect immediately:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {LOCAL_CATALOGUE.map(product => (
                  <button
                    key={product.barcode}
                    onClick={() => onBarcodeDetected(product.barcode)}
                    className="flex flex-col text-left p-3 rounded-xl border border-stone-200 hover:border-[#1b4d3e] hover:bg-[#edf5f1] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-sm text-stone-900 group-hover:text-[#12382c] line-clamp-1">
                        {product.name}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        product.vegType === 'non-veg' ? 'bg-amber-800' : 'bg-emerald-600'
                      }`} title={product.vegType === 'non-veg' ? 'Non-Vegetarian' : 'Vegetarian'} />
                    </div>

                    <div className="text-xs text-stone-500 flex items-center gap-1.5 mb-1.5">
                      <span>{product.category}</span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">{product.barcode}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-600 border-t border-stone-100 pt-1.5">
                      <span>Sugar: {product.nutrition.totalSugarsPer100g}g</span>
                      <span>Sodium: {product.nutrition.sodiumPer100g}mg</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 2: Live Camera Viewport */}
          {activeMode === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-4/3 bg-[#081e17] rounded-xl overflow-hidden flex items-center justify-center border border-[#1b4b3b]">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Barcode Targeting Guide Frame */}
                <div className="absolute inset-0 border-2 border-emerald-500/30 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 h-1/2 border-2 border-dashed border-emerald-400 rounded-lg flex items-center justify-center">
                    <span className="bg-[#081e17]/90 text-emerald-300 text-xs px-2.5 py-1 rounded">
                      Align barcode inside frame
                    </span>
                  </div>
                </div>

                {isScanning && !cameraError && (
                  <div className="absolute top-3 left-3 bg-[#081e17]/90 text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#1b4b3b]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Camera scanning active</span>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Camera Notice</p>
                    <p>{cameraError}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-center text-stone-500">
                Hold product steady under good lighting. ZXing will auto-detect UPC-A, EAN-13, and Code-128.
              </p>
            </div>
          )}

          {/* Mode 3: Upload Image */}
          {activeMode === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-[#1b4d3e] rounded-xl p-8 text-center cursor-pointer transition-colors bg-stone-50 hover:bg-[#edf5f1]"
              >
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800 mb-1">
                  Click or drag photo of barcode here
                </p>
                <p className="text-xs text-stone-500">
                  Supports JPG, PNG, WEBP from your phone gallery or desktop
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadStatus && (
                <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* Mode 4: Manual Barcode Input */}
          {activeMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="barcode-input" className="block text-xs font-semibold text-stone-700 mb-1">
                  Enter 8, 12, or 13-Digit EAN / UPC Barcode
                </label>
                <div className="flex gap-2">
                  <input
                    id="barcode-input"
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="e.g. 8901719101014"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm font-mono focus:border-[#12382c] focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#12382c] hover:bg-[#1a4a3a] text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    Lookup
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <span className="text-xs font-medium text-stone-500 block mb-2">Quick test presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Parle-G', code: '8901719101014' },
                    { label: 'Amul Butter', code: '8901262010054' },
                    { label: 'Kurkure', code: '8901491101831' },
                    { label: "Haldiram's", code: '8904004400282' },
                    { label: 'Instant Noodles', code: '8900000000073' },
                    { label: 'Rolled Oats', code: '8900000000035' },
                  ].map(item => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => onBarcodeDetected(item.code)}
                      className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-[#edf5f1] text-stone-700 hover:text-[#12382c] rounded-md transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
