import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Search, FileCheck2, Scale } from 'lucide-react';
import { validateAndDecodeFssaiLicense, FssaiLicenseInfo } from '../services/productService';

interface FssaiStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FssaiStandardsModal: React.FC<FssaiStandardsModalProps> = ({ isOpen, onClose }) => {
  const [testLicense, setTestLicense] = useState('10012022000244');
  const [licenseResult, setLicenseResult] = useState<FssaiLicenseInfo | null>(() =>
    validateAndDecodeFssaiLicense('10012022000244')
  );

  if (!isOpen) return null;

  const handleValidateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseResult(validateAndDecodeFssaiLicense(testLicense));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header with Dark Forest Green */}
        <div className="px-6 py-4 bg-[#12382c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-400 text-stone-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="text-base font-bold">FSSAI Standards &amp; Food Safety Framework</h2>
              <p className="text-xs text-emerald-200">
                Front-of-Pack Labelling (FoPL), HFSS Limits &amp; 14-Digit License Decoder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-stone-700">
          {/* Executive Overview */}
          <div className="bg-[#edf4f0] border border-[#cbe0d5] rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-[#12382c] uppercase tracking-wider block">
              FSSAI Food Safety &amp; Standards Authority of India Compliance
            </span>
            <p className="text-xs text-stone-800 leading-relaxed">
              FoodzWise is an open food intelligence scanner aligned with FSSAI (Packaging &amp; Labelling) Regulations, 2020 and draft FoPL guidelines. It evaluates packaged foods for industrial trans fats, added sugars, sodium ceilings, synthetic colors, and mandatory vegetarian/non-vegetarian declarations across India.
            </p>
          </div>

          {/* Interactive FSSAI 14-digit License Decoder Tool */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#12382c]" />
                <h3 className="text-sm font-bold text-stone-900">14-Digit FSSAI License Decoder</h3>
              </div>
              <span className="text-xs text-stone-500">Live Structure Verifier</span>
            </div>

            <form onSubmit={handleValidateLicense} className="flex gap-2">
              <input
                type="text"
                value={testLicense}
                onChange={e => setTestLicense(e.target.value)}
                placeholder="Enter 14-digit FSSAI license..."
                maxLength={14}
                className="flex-1 px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono focus:border-[#12382c] focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#12382c] hover:bg-[#1a4a3a] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Decode License
              </button>
            </form>

            {licenseResult && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                licenseResult.isValid ? 'bg-white border-[#cbe0d5]' : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                {licenseResult.isValid ? (
                  <>
                    <div className="flex items-center justify-between font-mono font-bold text-stone-900 border-b border-stone-100 pb-1.5">
                      <span>Lic No: {licenseResult.licenseNumber}</span>
                      <span className="text-[#12382c] font-sans font-semibold text-[11px] bg-[#edf4f0] px-2 py-0.5 rounded border border-[#cbe0d5]">
                        {licenseResult.licenseType.split('(')[0]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-stone-400 block font-sans">Jurisdiction:</span>
                        <span className="font-bold text-stone-800">{licenseResult.stateName}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block font-sans">Year Registered:</span>
                        <span className="font-bold text-stone-800">{licenseResult.registrationYear}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block font-sans">Registrar Code:</span>
                        <span className="font-bold text-stone-800">{licenseResult.registrarCode}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block font-sans">Entity Serial:</span>
                        <span className="font-bold text-stone-800">{licenseResult.serialNumber}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>{licenseResult.summary}</p>
                )}
              </div>
            )}
          </div>

          {/* FSSAI HFSS Guidelines Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#12382c]" />
              <span>FSSAI Draft HFSS (High in Fat, Sugar, Salt) Thresholds</span>
            </h3>

            <div className="rounded-xl border border-stone-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Nutrient Category</th>
                    <th className="py-2.5 px-3">Solid Foods (per 100g)</th>
                    <th className="py-2.5 px-3">Liquid Foods (per 100ml)</th>
                    <th className="py-2.5 px-3">Health Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Total / Added Sugars</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">&gt; 12.5g</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">&gt; 6.0g</td>
                    <td className="py-2.5 px-3 text-stone-600">Insulin resistance, obesity, Type 2 diabetes risk</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Saturated Fats</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">&gt; 5.0g</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">&gt; 2.5g</td>
                    <td className="py-2.5 px-3 text-stone-600">Elevated LDL cholesterol &amp; coronary plaque</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Sodium (Salt)</td>
                    <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">&gt; 500mg (1.25g salt)</td>
                    <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">&gt; 300mg</td>
                    <td className="py-2.5 px-3 text-stone-600">Hypertension, vascular stiffness, renal strain</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Industrial Trans Fats</td>
                    <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">&gt; 0.2g (Max 2% of oil)</td>
                    <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">&gt; 0.2g</td>
                    <td className="py-2.5 px-3 text-stone-600">Strict zero-tolerance limit under FSSAI 2022 rules</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Database Coverage */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#12382c]" />
              <span>Comprehensive Product Coverage</span>
            </h3>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2 text-stone-700 leading-relaxed">
              <p>
                FoodzWise combines an offline verified catalogue of major Indian staples (Amul, Britannia, Parle, Haldiram&apos;s, Dabur, MTR, Kurkure, Saffola, Cadbury, Tata) with live real-time query access to over <strong>2,500,000+ packaged products</strong> globally and across India via the Open Food Facts repository.
              </p>
              <p>
                Any packaged food with a barcode registered under FSSAI or international EAN/UPC standards can be scanned or searched in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>FSSAI Standards Aligned</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#12382c] hover:bg-[#1a4a3a] text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close Framework
          </button>
        </div>
      </div>
    </div>
  );
};
