import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Download, 
  Printer, 
  Moon, 
  Sun, 
  Palette, 
  FileSpreadsheet, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Info,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { MOCK_CENTERS, MOCK_PRODUCTS, Product, Center, LabelData } from './types';

// --- Components ---

const ThemeToggle = ({ theme, setTheme }: { theme: string, setTheme: (t: string) => void }) => {
  const themes = [
    { id: 'default', name: 'Teal Profundo', color: '#007B83' },
    { id: 'petroleum', name: 'Petróleo Suave', color: '#4A6970' },
    { id: 'electric', name: 'Azul Eléctrico', color: '#0052FF' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/20">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`w-8 h-8 rounded-full transition-all duration-300 border-2 ${
            theme === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
          }`}
          style={{ backgroundColor: t.color }}
          title={t.name}
        />
      ))}
    </div>
  );
};

const LabelPreview = ({ data, id, customLogo }: { data: LabelData, id: string, customLogo: string | null }) => {
  return (
    <div id={id} className="label-container bg-white shadow-2xl mx-auto transform origin-top scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-100">
      {/* Top Row: Codigo and Centro */}
      <div className="flex h-[25%] border-b-4 border-black">
        <div className="w-1/2 border-r-4 border-black p-6 flex flex-col justify-center">
          <span className="label-title">Codigo</span>
          <span className="label-value !justify-start !text-left">{data.productCode || '---'}</span>
        </div>
        <div className="w-1/2 p-6 flex flex-col justify-center">
          <span className="label-title">Centro</span>
          <span className="label-value !justify-start !text-left">{data.center || '---'}</span>
        </div>
      </div>

      {/* Middle Row: QR and Description/Lote */}
      <div className="flex h-[55%] border-b-4 border-black">
        <div className="w-[45%] border-r-4 border-black p-8 flex items-center justify-center">
          {data.batch ? (
            <QRCodeSVG value={data.batch} size={280} level="H" />
          ) : (
            <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
              QR Lote
            </div>
          )}
        </div>
        <div className="w-[55%] flex flex-col">
          <div className="h-[65%] border-b-4 border-black p-6 flex flex-col overflow-hidden">
            <span className="label-title">Descripcion</span>
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div className="label-value text-2xl uppercase leading-tight max-h-full">
                {data.productDescription || '---'}
              </div>
            </div>
          </div>
          <div className="h-[35%] p-6 flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <span className="label-title !mb-0">Lote</span>
              <div className="label-value-large text-right font-black !text-4xl">
                {data.batch || '---'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Logo and FEFO */}
      <div className="flex h-[20%]">
        <div className="w-1/2 border-r-4 border-black p-2 flex items-center justify-center overflow-hidden">
          <div className="flex items-center justify-center w-full h-full">
             {customLogo ? (
               <img 
                 src={customLogo} 
                 alt="Logo Personalizado" 
                 className="w-full h-full object-contain"
                 referrerPolicy="no-referrer"
               />
             ) : (
               <img 
                 src="https://ais-pre-ssoh5qs2latce6vuk2cwgn-164398517286.us-west2.run.app/api/image-proxy?url=https%3A%2F%2Fstorage.googleapis.com%2Fstatic-content-prod%2F67c50355f3068e000f96894d%2F67c50355f3068e000f96894d_1740962899127.png" 
                 alt="Team Cordillera" 
                 className="w-full h-full object-contain"
                 referrerPolicy="no-referrer"
               />
             )}
          </div>
        </div>
        <div className="w-1/2 p-4">
          <span className="label-title">FEFO</span>
          <div className="label-value !justify-start !text-left text-3xl mt-2">{data.fefo || ''}</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState('default');
  const [centers, setCenters] = useState<Center[]>(MOCK_CENTERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCenter, setSelectedCenter] = useState('Davita');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [batch, setBatch] = useState('');
  const [fefo, setFefo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [showAlejoBox, setShowAlejoBox] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const product = products.find(p => p.name === e.target.value);
    setSelectedProduct(product || null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCustomLogo(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setCenters(MOCK_CENTERS);
    setProducts(MOCK_PRODUCTS);
    setSelectedCenter('Davita');
    setSelectedProduct(null);
    setBatch('');
    setFefo('');
    setCustomLogo(null);
    setTheme('default');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      
      // Extract unique centers
      const uniqueCenterNames = Array.from(new Set(data.map(item => String(item.Nombre || item.nombre || '')).filter(Boolean)));
      const newCenters = uniqueCenterNames.map((name, idx) => ({ id: `new-${idx}`, name }));
      
      // Extract products
      const newProducts = data.map(item => ({
        sku: String(item.Sku || item.sku || ''),
        name: String(item['Texto breve de material'] || item.descripcion || ''),
        description: String(item['Texto breve de material'] || item.descripcion || '')
      })).filter(p => p.sku && p.description);

      if (newCenters.length > 0) {
        setCenters(newCenters);
        if (!uniqueCenterNames.includes('Davita')) {
          setSelectedCenter(uniqueCenterNames[0]);
        }
      }
      if (newProducts.length > 0) setProducts(newProducts);
    };
    reader.readAsBinaryString(file);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    setShowEasterEgg(true);
    
    // Small delay for the easter egg to be seen
    await new Promise(resolve => setTimeout(resolve, 1500));

    const input = document.getElementById('label-preview-container');
    if (!input) return;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Oficio 2 is approx 216 x 330 mm
      const pdf = new jsPDF('p', 'mm', [216, 330]);
      
      // To fit two labels on one 330mm page, we scale them to 150mm each
      // Label 1
      pdf.addImage(imgData, 'PNG', 33, 10, 150, 150);
      
      // Label 2
      pdf.addImage(imgData, 'PNG', 33, 170, 150, 150);
      
      pdf.save(`Etiqueta_${batch || 'Davita'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setShowEasterEgg(false), 2000);
    }
  };

  const labelData: LabelData = {
    center: selectedCenter,
    productCode: selectedProduct?.sku || '',
    productDescription: selectedProduct?.description || '',
    batch: batch,
    fefo: fefo
  };

  return (
    <div className="min-h-screen flex flex-col" onMouseMove={() => showAlejoBox && setShowAlejoBox(false)}>
      {/* Header */}
      <header className="bg-primary text-white p-6 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <Printer className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Bodegas Davita</h1>
            <p className="text-xs opacity-80">v1.2.26 • Generador de Etiquetas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium border border-white/10"
            title="Reiniciar Aplicación"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
          
          <ThemeToggle theme={theme} setTheme={setTheme} />
          
          {/* Alejo Easter Egg Button */}
          <div className="absolute -bottom-4 -right-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowAlejoBox(true);
              }}
              className="w-3 h-3 bg-black rounded-full opacity-10 hover:opacity-100 transition-opacity cursor-pointer"
              title="?"
            />
            <AnimatePresence>
              {showAlejoBox && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-black text-white px-3 py-1.5 rounded-lg shadow-2xl text-[10px] font-bold whitespace-nowrap z-[100] border border-white/20"
                >
                  Realizado por Alejo 137
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Form */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-border-base"
          >
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
              <FileSpreadsheet className="w-5 h-5" />
              Configuración de Etiqueta
            </h2>

            <div className="space-y-5">
              {/* Center Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600">Centro de Destino</label>
                <select 
                  className="w-full p-3 rounded-xl border border-border-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-slate-50"
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                >
                  <option value="">Seleccionar Centro...</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600">Producto (Descripción)</label>
                <select 
                  className="w-full p-3 rounded-xl border border-border-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-slate-50"
                  onChange={handleProductChange}
                  value={selectedProduct?.name || ''}
                >
                  <option value="">Seleccionar Producto...</option>
                  {products.map((p, idx) => (
                    <option key={idx} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Code Display (Auto) */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600">SKU (Código)</label>
                <div className="w-full p-3 rounded-xl border border-border-base bg-slate-100 text-slate-500 font-mono">
                  {selectedProduct?.sku || '---'}
                </div>
              </div>

              {/* Batch Entry */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600">Lote (Manual)</label>
                <input 
                  type="text"
                  placeholder="Ej: PA257009"
                  className="w-full p-3 rounded-xl border border-border-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-slate-50 uppercase"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                />
              </div>

              {/* FEFO Entry */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600">FEFO (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Ej: 12/2026"
                  className="w-full p-3 rounded-xl border border-border-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-slate-50"
                  value={fefo}
                  onChange={(e) => setFefo(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border-base">
              <button 
                onClick={generatePDF}
                disabled={!selectedCenter || !selectedProduct || !batch || isGenerating}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
              >
                {isGenerating ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Download className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
                Generar PDF
              </button>
            </div>
          </motion.div>

          {/* Excel Upload */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/10 p-6 rounded-2xl border border-secondary/20"
          >
            <h3 className="text-sm font-bold text-secondary flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              Cargar Maestro Excel
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Sube un archivo Excel con columnas: <b>Nombre</b>, <b>Sku</b>, <b>Texto breve de material</b>.
            </p>
            <label className="block">
              <span className="sr-only">Elegir archivo</span>
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary/80 cursor-pointer"
              />
            </label>
          </motion.div>

          {/* Logo Upload */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 p-6 rounded-2xl border border-primary/20"
          >
            <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4" />
              Carga Logo Etiqueta
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Sube un archivo PNG para personalizar el logo de la etiqueta.
            </p>
            <label className="block">
              <span className="sr-only">Elegir logo</span>
              <input 
                type="file" 
                accept="image/png"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80 cursor-pointer"
              />
            </label>
            {customLogo && (
              <button 
                onClick={() => setCustomLogo(null)}
                className="mt-4 text-[10px] text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Eliminar logo personalizado
              </button>
            )}
          </motion.div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Vista Previa
                <span className="text-xs font-normal bg-slate-200 px-2 py-1 rounded-full">20cm x 20cm</span>
              </h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Info className="w-3 h-3" />
                  Escalado para visualización
                </div>
              </div>
            </div>

            <div className="bg-slate-200 rounded-3xl p-8 md:p-12 min-h-[600px] flex items-center justify-center overflow-hidden border-4 border-dashed border-slate-300 relative">
              <AnimatePresence>
                {showEasterEgg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-full text-sm font-mono"
                  >
                    Idea de Alejo 137
                  </motion.div>
                )}
              </AnimatePresence>

              <div id="label-preview-container" className="bg-white p-4 shadow-inner rounded-xl">
                 <LabelPreview data={labelData} id="main-label" customLogo={customLogo} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-border-base flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Formato FEFO</p>
                  <p className="text-[10px] text-slate-500">Salida inteligente</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-border-base flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">QR Dinámico</p>
                  <p className="text-[10px] text-slate-500">Autocompletado</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-border-base flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Multi-Tema</p>
                  <p className="text-[10px] text-slate-500">Personalizable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 p-8 mt-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">Sobre la Aplicación</h3>
            <p className="text-sm leading-relaxed max-w-md">
              Esta aplicación ayudará a generar etiquetado para empaques terciarios e identificar lotes, 
              cantidades de bultos y salida por FEFO. Diseñada para optimizar la logística en bodegas Davita.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-center">
            <p className="text-xs">© 2026 Bodegas Davita • Logística Avanzada</p>
            <p className="text-[10px] mt-1 opacity-50">Desarrollado con React & Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
