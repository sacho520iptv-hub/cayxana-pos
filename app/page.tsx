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
  LayoutGrid,
  UserCheck
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
  ofisiant: string; // Boş ola bilər
}

interface SaleRecord {
  time: string;
  stolId: number;
  total: number;
  ofisiant: string;
  items: OrderItem[];
}

const ofisiantlar = ['Abbas', 'Akif', 'Elvin', 'Vüsal', 'Rəşad'];

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
  { id: 12, name: 'Dondurma', price: 2 },
];

export default function Home() {
  const [stollar, setStollar] = useState<Stol[]>([]);
  const [selectedStol, setSelectedStol] = useState<Stol | null>(null);
  const [nextId, setNextId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<SaleRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
        ofisiant: '', // İlkin olaraq boşdur
      }));
      setStollar(initialStollar);
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

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
      if (item.name === 'Sadə Çay') {
        return sum + 2 + (item.quantity - 1) * 1;
      }
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const closeOrder = () => {
    if (!selectedStol) return;

    // YENİ: Ofisiant seçilməyibsə xəbərdarlıq et
    if (!selectedStol.ofisiant) {
      alert("Zəhmət olmasa, əvvəlcə ofisiantı seçin!");
      return;
    }

    if (selectedStol.orders.length === 0) return;

    const total = calculateTotal(selectedStol);
    const newRecord: SaleRecord = {
      time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
      stolId: selectedStol.id,
      total: total,
      ofisiant: selectedStol.ofisiant,
      items: [...selectedStol.orders]
    };

    setHistory([newRecord, ...history]);
    updateStol({ ...selectedStol, status: 'empty', orders: [], ofisiant: '' });
    setSelectedStol(null);
  };

  const dailyTotal = history.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowHistory(false)}>
            <div className="bg-orange-500 p-2 rounded-xl">
              <Coffee className="text-white" size={28} />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Abidələr Parkı Çay Evi</h1>
          </div>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showHistory ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <History size={20} />
            <span className="font-bold">{showHistory ? "Geri" : "Hesabat"}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showHistory ? (
            /* Hesabat Cədvəli eynidir... */
            <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-3xl font-black">Günlük Satış</h2>
              <p className="text-3xl font-black text-green-500">{dailyTotal.toFixed(2)} AZN</p>
            </div>
            <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-800/50 text-zinc-400 text-xs">
                  <tr>
                    <th className="p-5">Saat</th>
                    <th className="p-5">Stol</th>
                    <th className="p-5">Ofisiant</th>
                    <th className="p-5">Məhsullar</th>
                    <th className="p-5 text-right">Məbləğ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {history.map((sale, i) => (
                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-5 text-zinc-500">{sale.time}</td>
                      <td className="p-5 font-bold">#{sale.stolId}</td>
                      <td className="p-5 text-zinc-400">{sale.ofisiant}</td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1">
                          {sale.items.map((item, idx) => (
                            <span key={idx} className="bg-zinc-800 text-[10px] px-2 py-1 rounded border border-zinc-700">
                              {item.name} (x{item.quantity})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5 text-right font-black text-orange-400">{sale.total.toFixed(2)} ₼</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Stol Şəbəkəsi */
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stollar.map((stol) => (
              <button
                key={stol.id}
                onClick={() => openStol(stol)}
                className={`relative aspect-square rounded-3xl p-5 transition-all duration-300 border-2 flex flex-col justify-between items-start
                  ${stol.status === 'occupied' 
                    ? 'bg-orange-500/10 border-orange-500 shadow-lg' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
              >
                <div className="w-full flex justify-between">
                    <span className={`text-3xl font-black ${stol.status === 'occupied' ? 'text-orange-500' : 'text-zinc-700'}`}>
                    {stol.id}
                    </span>
                    {stol.status === 'occupied' && stol.ofisiant && (
                        <span className="text-[10px] bg-orange-500 text-white px-2 py-1 rounded-md h-fit font-bold uppercase">
                            {stol.ofisiant}
                        </span>
                    )}
                </div>
                {stol.status === 'occupied' ? (
                  <p className="text-xl font-black">{calculateTotal(stol).toFixed(1)} ₼</p>
                ) : (
                  <span className="text-xs text-zinc-600 font-bold uppercase">Boş</span>
                )}
              </button>
            ))}
          </section>
        )}
      </main>

      {/* Sifariş Modalı */}
      {selectedStol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedStol(null)} />
          
          <div className="relative bg-zinc-900 w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-zinc-800">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-black">STOL #{selectedStol.id}</h2>
                
                {/* YENİLİK: Ofisiant seçimi burada mütləqdir */}
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 p-1 pl-3 rounded-xl border transition-all ${!selectedStol.ofisiant ? 'bg-red-500/10 border-red-500/50' : 'bg-zinc-800 border-zinc-700'}`}>
                        <UserCheck size={16} className={!selectedStol.ofisiant ? 'text-red-500' : 'text-orange-500'} />
                        <select
                        value={selectedStol.ofisiant}
                        onChange={(e) => updateStol({ ...selectedStol, ofisiant: e.target.value })}
                        className="bg-transparent text-sm font-bold py-2 pr-4 outline-none min-w-[150px]"
                        >
                        <option value="" className="bg-zinc-900">Ofisiant seçin...</option>
                        {ofisiantlar.map(o => <option key={o} value={o} className="bg-zinc-900">{o}</option>)}
                        </select>
                    </div>
                </div>
              </div>
              <button onClick={() => setSelectedStol(null)} className="w-12 h-12 flex items-center justify-center bg-zinc-800 rounded-2xl">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
              {/* Menyu və Sifariş siyahısı eynidir... */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Məhsul axtar..."
                    className="w-full bg-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 outline-none border border-zinc-800 focus:border-orange-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredMenu.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToOrder(product)}
                      className="bg-zinc-800/40 hover:bg-orange-500 border border-zinc-800 p-5 rounded-[24px] text-left transition-all active:scale-95"
                    >
                      <p className="font-bold text-base mb-1">{product.name}</p>
                      <p className="text-orange-500 font-black group-hover:text-white">{product.price} AZN</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-[400px] bg-black/20 p-6 flex flex-col border-l border-zinc-800">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <LayoutGrid size={20} className="text-orange-500" /> SİFARİŞ
                </h3>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {selectedStol.orders.map(item => (
                    <div key={item.uniqueId} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700/50">
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-bold text-sm">{item.name}</p>
                        <button onClick={() => changeQuantity(item.uniqueId, -item.quantity)} className="text-zinc-600 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-orange-500 font-black">{(item.price * item.quantity).toFixed(1)} ₼</p>
                        <div className="flex items-center gap-1 bg-black/30 rounded-xl p-1 border border-zinc-700">
                          <button onClick={() => changeQuantity(item.uniqueId, -1)} className="w-8 h-8 flex items-center justify-center font-bold">-</button>
                          <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                          <button onClick={() => changeQuantity(item.uniqueId, 1)} className="w-8 h-8 flex items-center justify-center font-bold">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-800">
                  {!selectedStol.ofisiant && selectedStol.orders.length > 0 && (
                      <p className="text-red-500 text-[10px] font-bold uppercase mb-2 animate-pulse text-center">Ofisiant seçilməyib!</p>
                  )}
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-zinc-500 font-bold uppercase text-xs">Cəmi</span>
                    <span className="text-4xl font-black text-orange-500">{calculateTotal(selectedStol).toFixed(1)} ₼</span>
                  </div>
                  
                  <button 
                    onClick={closeOrder}
                    disabled={selectedStol.orders.length === 0}
                    className={`w-full py-5 rounded-[20px] font-black text-lg transition-all ${!selectedStol.ofisiant ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'}`}
                  >
                    HESABI BAĞLA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
}
