'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Coffee,
  X,
  Trash2,
  Plus,
  Minus,
  Search,
  MoveRight,
  History,
  LayoutGrid
} from 'lucide-react';

interface OrderItem {
  uniqueId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Stol {
  id: number;
  status: 'empty' | 'occupied';
  orders: OrderItem[];
  ofisiant: string;
}

interface SaleRecord {
  time: string;
  stolId: number;
  total: number;
  ofisiant: string;
}

const ofisiantlar = ['Abbas', 'Elvin', 'Vüsal', 'Rəşad'];

const menu = [
  { id: 1, name: 'Sadə Çay', price: 2 },
  { id: 2, name: 'Mürəbbəli Çay', price: 5 },
  { id: 3, name: 'Şokoladlı Çay', price: 5 },
  { id: 4, name: 'Tək Pivə', price: 2 },
  { id: 5, name: 'Noxud', price: 2 },
  { id: 6, name: 'Saçaq Pendir', price: 3 },
  { id: 7, name: 'Sadə Qalyan', price: 10 },
  { id: 8, name: 'Premium Qalyan', price: 15 },
  { id: 9, name: 'Kola', price: 3 },
  { id: 10, name: 'Fanta', price: 3 },
  { id: 11, name: 'Su', price: 2 },
];

export default function Home() {
  const [stollar, setStollar] = useState<Stol[]>([]);
  const [selectedStol, setSelectedStol] = useState<Stol | null>(null);
  const [nextId, setNextId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<SaleRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load Data
  useEffect(() => {
    const savedStollar = localStorage.getItem('cayxana-stollar');
    const savedHistory = localStorage.getItem('cayxana-history');

    if (savedStollar) {
      setStollar(JSON.parse(savedStollar));
    } else {
      const initialStollar = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        status: 'empty' as const,
        orders: [],
        ofisiant: ofisiantlar[0],
      }));
      setStollar(initialStollar);
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (stollar.length > 0) {
      localStorage.setItem('cayxana-stollar', JSON.stringify(stollar));
    }
    localStorage.setItem('cayxana-history', JSON.stringify(history));
  }, [stollar, history]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const openStol = (stol: Stol) => {
    setSelectedStol(stol);
    const maxId = stol.orders.length > 0 ? Math.max(...stol.orders.map((o) => o.uniqueId)) : 0;
    setNextId(maxId + 1);
  };

  const updateStol = (updatedStol: Stol) => {
    setStollar(prev => prev.map(s => s.id === updatedStol.id ? updatedStol : s));
    setSelectedStol(updatedStol);
  };

  const addToOrder = (product: any) => {
    if (!selectedStol) return;
    const existing = selectedStol.orders.find(o => o.name === product.name);
    let updatedOrders;

    if (existing) {
      updatedOrders = selectedStol.orders.map(item =>
        item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedOrders = [...selectedStol.orders, { uniqueId: nextId, name: product.name, price: product.price, quantity: 1 }];
      setNextId(nextId + 1);
    }

    updateStol({ ...selectedStol, status: 'occupied', orders: updatedOrders });
  };

  const changeQuantity = (uniqueId: number, delta: number) => {
    if (!selectedStol) return;
    const updatedOrders = selectedStol.orders.map(item =>
      item.uniqueId === uniqueId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0);

    updateStol({
      ...selectedStol,
      orders: updatedOrders,
      status: updatedOrders.length === 0 ? 'empty' : 'occupied'
    });
  };

  const calculateTotal = (stol: Stol) => {
    return stol.orders.reduce((sum, item) => {
      // Xüsusi məntiq: Sadə Çay - İlk çay 2 AZN, sonrakılar 1 AZN
      if (item.name === 'Sadə Çay') {
        return sum + 2 + (item.quantity - 1) * 1;
      }
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const closeOrder = () => {
    if (!selectedStol || selectedStol.orders.length === 0) return;

    const total = calculateTotal(selectedStol);
    const newRecord: SaleRecord = {
      time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
      stolId: selectedStol.id,
      total: total,
      ofisiant: selectedStol.ofisiant
    };

    setHistory([newRecord, ...history]);
    updateStol({ ...selectedStol, status: 'empty', orders: [] });
    setSelectedStol(null);
  };

  const transferStol = (targetId: number) => {
    if (!selectedStol || selectedStol.id === targetId) return;
    const targetStol = stollar.find(s => s.id === targetId);
    if (!targetStol || targetStol.orders.length > 0) {
      alert("Hədəf stol dolu ola bilməz!");
      return;
    }

    const updatedStollar = stollar.map(s => {
      if (s.id === selectedStol.id) return { ...s, status: 'empty', orders: [], ofisiant: ofisiantlar[0] };
      if (s.id === targetId) return { ...s, status: 'occupied', orders: selectedStol.orders, ofisiant: selectedStol.ofisiant };
      return s;
    });

    setStollar(updatedStollar as Stol[]);
    setSelectedStol(null);
  };

  const dailyTotal = history.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Coffee className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ABİDƏLƏR PARKI ÇAY EVİ</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
          >
            <History size={20} />
            <span className="hidden sm:inline">Hesabat</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showHistory ? (
          <section className="animate-in fade-in duration-300">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold">Gündəlik Satış</h2>
              <div className="text-right">
                <p className="text-zinc-400 text-sm">Ümumi Kassa</p>
                <p className="text-3xl font-black text-green-500">{dailyTotal.toFixed(2)} AZN</p>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
              <table className="w-full text-left">
                <thead className="bg-zinc-800 text-zinc-400 text-sm">
                  <tr>
                    <th className="p-4">Saat</th>
                    <th className="p-4">Stol</th>
                    <th className="p-4">Ofisiant</th>
                    <th className="p-4 text-right">Məbləğ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {history.map((sale, i) => (
                    <tr key={i} className="hover:bg-zinc-800/50">
                      <td className="p-4">{sale.time}</td>
                      <td className="p-4">Stol #{sale.stolId}</td>
                      <td className="p-4">{sale.ofisiant}</td>
                      <td className="p-4 text-right font-bold text-orange-400">{sale.total.toFixed(2)} AZN</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && <p className="p-10 text-center text-zinc-500">Bu gün hələ satış edilməyib.</p>}
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stollar.map((stol) => (
              <button
                key={stol.id}
                onClick={() => openStol(stol)}
                className={`relative group aspect-square rounded-2xl p-4 transition-all duration-200 border-2 flex flex-col justify-between items-start
                  ${stol.status === 'occupied' 
                    ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'}`}
              >
                <span className={`text-2xl font-black ${stol.status === 'occupied' ? 'text-orange-500' : 'text-zinc-600'}`}>
                  {stol.id.toString().padStart(2, '0')}
                </span>
                
                <div className="w-full">
                  {stol.status === 'occupied' ? (
                    <div className="text-left">
                      <p className="text-[10px] uppercase text-orange-400 font-bold">Məbləğ</p>
                      <p className="text-lg font-bold">{calculateTotal(stol).toFixed(1)} ₼</p>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 font-medium">BOŞ STOL</span>
                  )}
                </div>
              </button>
            ))}
          </section>
        )}
      </main>

      {/* Modal Sifariş */}
      {selectedStol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in zoom-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedStol(null)} />
          
          <div className="relative bg-zinc-900 w-full max-w-5xl h-full sm:h-[85vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Stol #{selectedStol.id}</h2>
                <select
                  value={selectedStol.ofisiant}
                  onChange={(e) => updateStol({ ...selectedStol, ofisiant: e.target.value })}
                  className="bg-zinc-800 text-sm rounded-lg px-3 py-1 border border-zinc-700 outline-none"
                >
                  {ofisiantlar.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button onClick={() => setSelectedStol(null)} className="p-2 hover:bg-zinc-800 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
              {/* Sol: Menyu */}
              <div className="flex-1 p-4 flex flex-col gap-4 border-r border-zinc-800 overflow-hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Məhsul axtar..."
                    className="w-full bg-zinc-800 rounded-xl py-3 pl-10 pr-4 outline-none border border-zinc-700 focus:border-orange-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredMenu.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToOrder(product)}
                      className="bg-zinc-800 hover:bg-orange-600 p-4 rounded-xl text-left transition-all active:scale-95 group"
                    >
                      <p className="font-semibold text-sm group-hover:text-white">{product.name}</p>
                      <p className="text-orange-400 text-xs mt-1 group-hover:text-orange-100">{product.price} AZN</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sağ: Sifariş siyahısı */}
              <div className="w-full lg:w-80 bg-zinc-950/50 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <LayoutGrid size={18} /> Sifarişlər
                  </h3>
                  <span className="bg-orange-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {selectedStol.orders.length} Məhsul
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {selectedStol.orders.map(item => (
                    <div key={item.uniqueId} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium">{item.name}</p>
                        <button onClick={() => changeQuantity(item.uniqueId, -item.quantity)} className="text-zinc-500 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-orange-500 font-bold text-sm">{(item.price * item.quantity).toFixed(1)} ₼</p>
                        <div className="flex items-center gap-3 bg-zinc-800 rounded-lg p-1">
                          <button onClick={() => changeQuantity(item.uniqueId, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-zinc-700 rounded">-</button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => changeQuantity(item.uniqueId, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-zinc-700 rounded">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Hesab */}
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                  <div className="flex justify-between text-xl font-black">
                    <span>CƏMİ:</span>
                    <span className="text-orange-500">{calculateTotal(selectedStol).toFixed(1)} AZN</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={closeOrder}
                      disabled={selectedStol.orders.length === 0}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 py-3 rounded-xl font-bold transition-colors"
                    >
                      HESABI BAĞLA
                    </button>
                    <div className="relative group">
                      <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <MoveRight size={18} /> KÖÇÜR
                      </button>
                      {/* Köçürmə Dropdown (Sadələşdirilmiş) */}
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl hidden group-hover:grid grid-cols-4 gap-1 p-2 max-h-40 overflow-y-auto">
                        {stollar.filter(s => s.status === 'empty').map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => transferStol(s.id)}
                            className="p-2 text-xs hover:bg-orange-500 rounded"
                          >
                            {s.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
