import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Armchair, CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SeatReservation = () => {
  const { user } = useAuth();
  const [seats, setSeats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [durationHours, setDurationHours] = useState(2);
  const [showReserveModal, setShowReserveModal] = useState(false);

  // Study room booking states
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // ML Predictions
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    fetchGridData();
  }, []);

  const fetchGridData = async () => {
    setLoading(true);
    try {
      const seatsRes = await api.seats.list();
      const roomsRes = await api.seats.rooms();
      if (seatsRes.success) setSeats(seatsRes.data);
      if (roomsRes.success) setRooms(roomsRes.data);

      const predRes = await api.ai.predictions();
      if (predRes.success) setPredictions(predRes.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'Available') {
      setSelectedSeat(seat);
      setDurationHours(2);
      setShowReserveModal(true);
    } else if (seat.occupiedBy?._id === user.id) {
      // User owns reservation, allow cancel
      if (window.confirm(`Do you want to cancel your reservation for seat ${seat.seatNumber}?`)) {
        handleCancelReservation(seat.seatNumber);
      }
    } else {
      alert(`Seat ${seat.seatNumber} is currently occupied by ${seat.occupiedBy?.name || 'another student'} until ${new Date(seat.reservedUntil).toLocaleTimeString()}`);
    }
  };

  const handleReserveSeat = async (e) => {
    e.preventDefault();
    try {
      const res = await api.seats.reserve(selectedSeat.seatNumber, durationHours);
      if (res.success) {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
        setShowReserveModal(false);
        // Refresh grid
        fetchGridData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelReservation = async (seatNumber) => {
    try {
      const res = await api.seats.cancel(seatNumber);
      if (res.success) {
        fetchGridData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReserveRoom = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime) return;
    try {
      const res = await api.seats.reserveRoom(selectedRoom._id, startTime, endTime);
      if (res.success) {
        alert(`Study room ${selectedRoom.name} successfully reserved!`);
        setSelectedRoom(null);
        setStartTime('');
        setEndTime('');
        fetchGridData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredSeats = seats.filter(s => s.floor === selectedFloor);

  return (
    <Layout title="Seat & Study Room Reservations">
      <div className="space-y-8 text-left">
        {/* Main Grid View */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Seating Grid Map */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Library Wing Reading Seats</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Click on an empty seat to reserve it, or click your seat to cancel reservation.</p>
              </div>

              {/* Floor Switcher */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950/40 p-1 border border-slate-200/50 dark:border-slate-800/40">
                <button
                  onClick={() => setSelectedFloor(1)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedFloor === 1
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Floor 1
                </button>
                <button
                  onClick={() => setSelectedFloor(2)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedFloor === 2
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Floor 2
                </button>
              </div>
            </div>

            {/* Seat Map Legend */}
            <div className="flex gap-4 text-[10px] text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 rounded bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-500/40"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 rounded bg-indigo-100 border border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-500/40"></div>
                <span>Your Seat</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 rounded bg-red-100 border border-red-300 dark:bg-red-950/40 dark:border-red-500/40"></div>
                <span>Occupied</span>
              </div>
            </div>

            {/* Grid Container */}
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 md:grid-cols-8 py-4 justify-items-center">
                {filteredSeats.map(seat => {
                  const isOwn = seat.occupiedBy?._id === user.id;
                  const isOccupied = seat.status !== 'Available' && !isOwn;
                  
                  let seatColor = 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-950/40';
                  if (isOwn) {
                    seatColor = 'bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500/50 dark:text-indigo-300 animate-pulse';
                  } else if (isOccupied) {
                    seatColor = 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-500/30 dark:text-red-400 opacity-60';
                  }

                  return (
                    <button
                      key={seat._id}
                      onClick={() => handleSeatClick(seat)}
                      className={`seat-hover flex h-11 w-11 flex-col items-center justify-center rounded-xl border text-[10px] font-bold ${seatColor}`}
                      title={seat.seatNumber}
                    >
                      <Armchair size={14} className="mb-0.5" />
                      <span>{seat.seatNumber.split('-')[1]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Study Rooms list */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Users size={16} className="text-brand-500" />
                <span>Group Study Rooms</span>
              </h3>

              <div className="space-y-4">
                {rooms.map(room => (
                  <div key={room._id} className="rounded-xl border border-slate-200/50 p-4 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{room.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>Capacity: {room.capacity} students</span>
                      </p>
                      <span className={`inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        room.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {room.status === 'Available' ? 'Available' : `Reserved by ${room.reservedBy?.name || 'Student'}`}
                      </span>
                    </div>
                    {room.status === 'Available' && (
                      <button
                        onClick={() => setSelectedRoom(room)}
                        className="rounded-xl bg-brand-600 text-white hover:bg-brand-500 px-3.5 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Book
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reserve Seat Modal */}
        {showReserveModal && selectedSeat && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
              <button
                onClick={() => setShowReserveModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
              
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-950/40 dark:text-brand-400 mx-auto mb-4">
                <Armchair size={24} />
              </div>
              <h3 className="text-base font-bold font-outfit text-slate-850 dark:text-slate-100">Reserve Reading Desk</h3>
              <p className="text-xs text-slate-400 mt-1">Reserve seat <strong>{selectedSeat.seatNumber}</strong> on floor {selectedSeat.floor}.</p>

              <form onSubmit={handleReserveSeat} className="space-y-4 mt-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block text-left">Reservation Duration</label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value={1}>1 Hour</option>
                    <option value={2}>2 Hours</option>
                    <option value={4}>4 Hours</option>
                    <option value={8}>8 Hours (Full Session)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-600 py-3 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md shadow-brand-500/10"
                >
                  Confirm Reservation
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Reserve Study Room Modal */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
              <button
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>

              <h3 className="text-base font-bold font-outfit text-slate-850 dark:text-slate-100">Book Study Room</h3>
              <p className="text-xs text-slate-400 mt-1">Book room: <strong>{selectedRoom.name}</strong> (Capacity: {selectedRoom.capacity})</p>

              <form onSubmit={handleReserveRoom} className="space-y-4 mt-5">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-600 py-3 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md"
                >
                  Book Study Room
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Seat Occupancy Predictor Chart Panel */}
        {predictions.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl text-left space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">AI Library Seat Occupancy Forecasts</h3>
              <p className="text-[10px] text-slate-455 mt-0.5 font-medium">Crowding prediction forecasts for today's time slots generated by our Python ML microservice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* The Bar Chart */}
              <div className="md:col-span-2 h-64">
                <Bar
                  data={{
                    labels: predictions.map(p => p.timeSlot),
                    datasets: [
                      {
                        label: 'Occupancy Rate (%)',
                        data: predictions.map(p => p.predictedOccupancy),
                        backgroundColor: predictions.map(p => 
                          p.predictedOccupancy > 80 
                            ? 'rgba(239, 68, 68, 0.75)' 
                            : p.predictedOccupancy > 60 
                              ? 'rgba(124, 58, 237, 0.75)' 
                              : 'rgba(16, 185, 129, 0.75)'
                        ),
                        borderRadius: 8,
                        borderWidth: 0
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { 
                        ticks: { callback: (val) => `${val}%` },
                        max: 100 
                      }
                    }
                  }}
                />
              </div>
              
              {/* Crowding Status & Recommendations */}
              <div className="space-y-4">
                <div className="rounded-2xl p-4.5 bg-brand-500/5 border border-brand-500/15 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold">
                    <Users size={16} />
                    <span>Peak Hours Alert</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                    <strong>Peak Crowding:</strong> 14:00 - 18:00 (up to 94% occupancy). 
                    High traffic expected during late afternoon study sessions.
                  </p>
                  <div className="border-t border-slate-200/50 dark:border-slate-800/60 pt-3">
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">Recommended visit times:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] mt-1 block">
                      08:00 - 11:00 or 18:00 - 20:00 (under 50% occupancy)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SeatReservation;
