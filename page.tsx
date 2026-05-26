'use client';

import { useEffect, useState } from 'react';
import {
  Coffee,
  X,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';

interface OrderItem {
  uniqueId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Stol {
  id: number;
  status: 'empty' | 'occupied' | 'waiting';
  orders: OrderItem[];
  ofisiant: string;
}

const ofisiantlar = ['Akif', 'Elvin', 'Vüsal', 'Rəşad'];

const menu = [
  { id: 1, name: 'Sadə Çay', price: 2 },
  { id: 2, name: 'Mürəbbəli Çay', price: 4 },
  { id: 3, name: 'Şokoladlı Çay', price: 3.5 },
  { id: 4, name: 'Tək Pivə', price: 6 },
  { id: 5, name: 'Noxud', price: 5 },
  { id: 6, name: 'Saçaq Pendir', price: 7 },
  { id: 7, name: 'Sadə Qalyan', price: 15 },
  { id: 8, name: 'Premium Qalyan', price: 25 },
  { id: 9, name: 'Kola', price: 3 },
];

export default function Home() {
  const [stollar, setStollar] = useState<Stol[]>([]);
  const [selectedStol, setSelectedStol] = useState<Stol | null>(null);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('cayxana-pos');

    if (saved) {
      setStollar(JSON.parse(saved));
    } else {
      const initialStollar = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        status: 'empty' as 'empty' | 'occupied' | 'waiting',
        orders: [],
        ofisiant: 'Akif',
      }));

      setStollar(initialStollar);
    }
  }, []);

  useEffect(() => {
    if (stollar.length > 0) {
      localStorage.setItem('cayxana-pos', JSON.stringify(stollar));
    }
  }, [stollar]);

  const openStol = (stol: Stol) => {
    setSelectedStol(stol);

    const maxId =
      stol.orders.length > 0
        ? Math.max(...stol.orders.map((o) => o.uniqueId))
        : 0;

    setNextId(maxId + 1);
  };

  const closeModal = () => {
    setSelectedStol(null);
  };

  const updateStol = (updatedStol: Stol) => {
    setStollar((prev) =>
      prev.map((s) => (s.id === updatedStol.id ? updatedStol : s))
    );

    setSelectedStol(updatedStol);
  };

  const addToOrder = (product: any) => {
    if (!selectedStol) return;

    const existing = selectedStol.orders.find(
      (o) => o.name === product.name
    );

    let updatedOrders: OrderItem[] = [];

    if (existing) {
      updatedOrders = selectedStol.orders.map((item) =>
        item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedOrders = [
        ...selectedStol.orders,
        {
          uniqueId: nextId,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];

      setNextId(nextId + 1);
    }

    updateStol({
      ...selectedStol,
      status: 'occupied',
      orders: updatedOrders,
    });
  };

  const increaseQuantity = (uniqueId: number) => {
    if (!selectedStol) return;

    const updatedOrders = selectedStol.orders.map((item) =>
      item.uniqueId === uniqueId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    updateStol({
      ...selectedStol,
      orders: updatedOrders,
    });
  };

  const decreaseQuantity = (uniqueId: number) => {
    if (!selectedStol) return;

    const updatedOrders = selectedStol.orders
      .map((item) =>
        item.uniqueId === uniqueId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateStol({
      ...selectedStol,
      orders: updatedOrders,
      status:
        updatedOrders.length === 0 ? 'empty' : selectedStol.status,
    });
  };

  const removeItem = (uniqueId: number) => {
    if (!selectedStol) return;

    const updatedOrders = selectedStol.orders.filter(
      (item) => item.uniqueId !== uniqueId
    );

    updateStol({
      ...selectedStol,
      orders: updatedOrders,
      status:
        updatedOrders.length === 0 ? 'empty' : selectedStol.status,
    });
  };

  const calculateTotal = () => {
    if (!selectedStol) return 0;

    return selectedStol.orders.reduce((sum, item) => {
      if (item.name === 'Sadə Çay') {
        if (item.quantity === 1) {
          return sum + 2;
        }

        return sum + 2 + (item.quantity - 1) * 1;
      }

      return sum + item.price * item.quantity;
    }, 0);
  };

  const closeOrder = () => {
    if (!selectedStol) return;

    if (selectedStol.orders.length === 0) {
      alert('Heç bir sifariş yoxdur!');
      return;
    }

    const total = calculateTotal();

    alert(`
✅ Hesab bağlandı

Stol: #${selectedStol.id}
Ofisiant: ${selectedStol.ofisiant}
Məbləğ: ${total.toFixed(1)} AZN
    `);

    updateStol({
      ...selectedStol,
      status: 'empty',
      orders: [],
    });

    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-50 bg-black border-b border-gray-800 py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
          <Coffee className="text-orange-500" size={48} />

          <div>
            <h1 className="text-4xl font-bold">
              Qardaş Çay Evi
            </h1>

            <p className="text-gray-400">
              Professional POS Sistemi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-semibold mb-8">
          📍 Stollar
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
          {stollar.map((stol) => (
            <div
              key={stol.id}
              onClick={() => openStol(stol)}
              className="aspect-square rounded-3xl p-5 cursor-pointer bg-zinc-900 hover:bg-zinc-800 border-2 border-gray-700 hover:border-orange-500 transition-all"
            >
              <div className="flex flex-col justify-between h-full">
                <div className="text-4xl font-bold">
                  #{stol.id}
                </div>

                <div className="text-center text-lg">
                  {stol.status === 'empty'
                    ? '🟢 Boş'
                    : stol.status === 'occupied'
                    ? '🔴 Dolu'
                    : '🟡 Gözləyir'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStol && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-6xl rounded-3xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-3xl font-bold">
                Stol #{selectedStol.id}
              </h2>

              <button onClick={closeModal}>
                <X size={36} />
              </button>
            </div>

            <div className="p-6 border-b border-gray-700">
              <label className="block mb-2 text-gray-400">
                Ofisiant
              </label>

              <select
                value={selectedStol.ofisiant}
                onChange={(e) =>
                  updateStol({
                    ...selectedStol,
                    ofisiant: e.target.value,
                  })
                }
                className="bg-zinc-800 w-full rounded-2xl px-4 py-3"
              >
                {ofisiantlar.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-2/3 p-6 border-r border-gray-700 overflow-auto">
                <h3 className="text-2xl font-semibold mb-5">
                  Menyu
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {menu.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToOrder(product)}
                      className="bg-zinc-800 hover:bg-zinc-700 p-5 rounded-2xl cursor-pointer active:scale-95 transition-all"
                    >
                      <p className="font-semibold text-lg">
                        {product.name}
                      </p>

                      <p className="text-orange-400 mt-2">
                        {product.id === 1
                          ? 'İlk 2 AZN | Sonrakı 1 AZN'
                          : `${product.price} AZN`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-1/3 p-6 flex flex-col">
                <h3 className="text-2xl font-semibold mb-5">
                  Cari Sifariş
                </h3>

                <div className="flex-1 overflow-auto space-y-3">
                  {selectedStol.orders.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">
                      Məhsul əlavə edin
                    </p>
                  ) : (
                    selectedStol.orders.map((item) => (
                      <div
                        key={item.uniqueId}
                        className="bg-zinc-800 p-4 rounded-2xl flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.name}
                          </p>

                          <p className="text-orange-400">
                            {item.price} AZN
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              decreaseQuantity(item.uniqueId)
                            }
                            className="bg-zinc-700 hover:bg-zinc-600 w-8 h-8 rounded-lg flex items-center justify-center"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="w-6 text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(item.uniqueId)
                            }
                            className="bg-zinc-700 hover:bg-zinc-600 w-8 h-8 rounded-lg flex items-center justify-center"
                          >
                            <Plus size={16} />
                          </button>

                          <button
                            onClick={() =>
                              removeItem(item.uniqueId)
                            }
                            className="text-red-500 ml-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-700 pt-6 mt-6">
                  <div className="flex justify-between text-3xl font-bold mb-6">
                    <span>Cəmi:</span>

                    <span className="text-orange-400">
                      {calculateTotal().toFixed(1)} AZN
                    </span>
                  </div>

                  <button
                    onClick={closeOrder}
                    className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl text-lg font-semibold transition-all"
                  >
                    Hesabı Bağla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}