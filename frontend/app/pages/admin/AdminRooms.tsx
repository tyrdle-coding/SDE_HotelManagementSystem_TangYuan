import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Sparkles, Maximize, Users, ArrowRight, X, Upload } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Label } from '../../components/Label';
import { toast } from 'sonner';
import { hotelApi } from '../../api';
import { useAuth } from '../../components/AuthContext';
import { Effect } from '../../components/Effect';
import { Magnetic } from '../../components/Magnetic';
import { formatCurrency } from '../../components/utils';
import type { Room, RoomType } from '../../types';

export function AdminRooms() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard' as RoomType,
    price: '180',
    image: '',
    gallery: '',
    capacity: '2',
    size: '28',
    description: '',
    amenities: '',
    available: true,
  });

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadRooms = () => {
    hotelApi.getRooms()
      .then((data) => setRooms(data.rooms))
      .catch(() => setRooms([]));
  };

  useEffect(() => {
    if (isAdmin) {
      loadRooms();
    }
  }, [isAdmin]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await hotelApi.uploadImage(file);
      if (field === 'image') {
        setFormData({ ...formData, image: url });
      } else {
        const currentGallery = formData.gallery.trim();
        const newGallery = currentGallery ? `${currentGallery}, ${url}` : url;
        setFormData({ ...formData, gallery: newGallery });
      }
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setEditingRoomId(null);
    setShowForm(false);
    setFormData({
      name: '',
      type: 'Standard',
      price: '180',
      image: '',
      gallery: '',
      capacity: '2',
      size: '28',
      description: '',
      amenities: '',
      available: true,
    });
  };

  const handleEdit = (room: Room) => {
    setEditingRoomId(room.id);
    setShowForm(true);
    setFormData({
      name: room.name,
      type: room.type,
      price: String(room.price),
      image: room.image,
      gallery: room.images.join(', '),
      capacity: String(room.capacity),
      size: String(room.size),
      description: room.description,
      amenities: room.amenities.join(', '),
      available: room.available,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this room from the collection?')) return;
    try {
      await hotelApi.deleteRoom(id);
      toast.success('Room removed from collection');
      loadRooms();
      if (editingRoomId === id) {
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: formData.name,
      type: formData.type,
      price: Number(formData.price),
      image: formData.image,
      images: formData.gallery.split(',').map((item) => item.trim()).filter(Boolean),
      capacity: Number(formData.capacity),
      size: Number(formData.size),
      description: formData.description,
      amenities: formData.amenities.split(',').map((item) => item.trim()).filter(Boolean),
      available: formData.available,
    };

    try {
      if (editingRoomId) {
        await hotelApi.updateRoom(editingRoomId, payload);
        toast.success('Room details updated');
      } else {
        await hotelApi.createRoom(payload);
        toast.success('New room added to collection');
      }
      resetForm();
      loadRooms();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save room details');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-light text-slate-900 mb-8">Admin Access Restricted</h2>
          <Link to="/login">
            <Button className="rounded-full bg-[#c19e58] text-white px-8">Return to Signature Entry</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#c19e58]/30 pt-32 pb-32">
      <div className="px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <Effect slide="up">
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-full border border-black/5 bg-slate-50 px-4 py-2 text-[10px] font-bold tracking-[0.3em] uppercase">
                Asset Management
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="w-4 h-4 text-[#c19e58]" />
                Signature Collection
              </div>
            </div>
            <h1 className="text-[3.5rem] md:text-[5.5rem] leading-[0.85] tracking-[-0.06em] font-light text-slate-950">
              Room <br />
              <span className="text-[#c19e58] italic font-serif">Collection.</span>
            </h1>
          </Effect>
          <Effect delay={100} slide="up" className="flex w-full flex-col gap-4 sm:flex-row sm:items-center md:w-auto md:justify-end">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 bg-slate-50/50 border-slate-100 focus:border-[#c19e58] focus:bg-white h-14 rounded-2xl"
              />
            </div>
            <Button
              size="lg"
              className="h-14 shrink-0 rounded-2xl bg-[#c19e58] px-6 text-white hover:bg-[#a68748] shadow-lg shadow-[#c19e58]/20 transition-all duration-500 gap-2 whitespace-nowrap"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Close Editor' : 'Add Room'}
            </Button>
          </Effect>
        </div>

        {/* Form Editor */}
        {showForm && (
          <Effect slide="down" blur="15px" className="mb-20">
            <form onSubmit={handleSubmit} className="bg-slate-50/50 rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-light text-slate-950 mb-2">
                    {editingRoomId ? 'Edit Room Details' : 'Orchestrate New Room'}
                  </h2>
                  <p className="text-slate-500 font-light">Refine the sanctuary for our guests.</p>
                </div>
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c19e58]">
                  {editingRoomId ? `Ref: ${editingRoomId}` : 'New Entry'}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label htmlFor="room-name" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Room Name</Label>
                  <Input id="room-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white border-slate-100 focus:border-[#c19e58] h-16 rounded-2xl px-7" required />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="room-type" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Room Type</Label>
                  <div className="relative">
                    <select
                      id="room-type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as RoomType })}
                      className="w-full bg-white border border-slate-100 focus:border-[#c19e58] h-16 rounded-2xl px-7 text-slate-900 appearance-none outline-none transition-all duration-300"
                    >
                      <option>Standard</option>
                      <option>Deluxe</option>
                      <option>Suite</option>
                      <option>Penthouse</option>
                    </select>
                    <ArrowRight className="absolute right-7 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-[#c19e58] pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="room-price" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Price Per Night</Label>
                  <Input id="room-price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="bg-white border-slate-100 focus:border-[#c19e58] h-16 rounded-2xl px-7" required />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="room-image" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Cover Image</Label>
                  <div className="flex gap-3">
                    <Input id="room-image" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="bg-white border-slate-100 focus:border-[#c19e58] h-16 rounded-2xl px-7 flex-1" placeholder="URL or upload" required />
                    <div className="relative">
                      <input
                        type="file"
                        id="cover-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="cover-upload"
                        className={`h-16 w-16 flex items-center justify-center rounded-2xl border border-slate-100 bg-white cursor-pointer hover:bg-slate-50 transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        <Upload className="w-5 h-5 text-[#c19e58]" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="room-capacity" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Guest Capacity</Label>
                  <Input id="room-capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="bg-white border-slate-100 focus:border-[#c19e58] h-16 rounded-2xl px-7" required />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="room-size" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Surface (sqm)</Label>
                  <Input id="room-size" type="number" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="bg-white border-slate-100 focus:border-[#c19e58] h-16 rounded-2xl px-7" required />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <Label htmlFor="room-gallery" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Gallery</Label>
                  <div className="flex gap-3">
                    <Input id="room-gallery" value={formData.gallery} onChange={(e) => setFormData({ ...formData, gallery: e.target.value })} className="bg-white border-slate-100 focus:border-[#c19e58] h-16 rounded-2xl px-7 flex-1" placeholder="Comma-separated URLs or upload" />
                    <div className="relative">
                      <input
                        type="file"
                        id="gallery-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'gallery')}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="gallery-upload"
                        className={`h-16 w-16 flex items-center justify-center rounded-2xl border border-slate-100 bg-white cursor-pointer hover:bg-slate-50 transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        <Upload className="w-5 h-5 text-[#c19e58]" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <Label htmlFor="room-amenities" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Amenities</Label>
                  <Input id="room-amenities" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} className="bg-white border-slate-100 focus:border-[#c19e58] h-16 rounded-2xl px-7" placeholder="Pool access, Smart TV, Mini bar" required />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <Label htmlFor="room-description" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Detailed Description</Label>
                  <textarea
                    id="room-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-[2rem] border border-slate-100 bg-white px-8 py-7 focus:border-[#c19e58] focus:outline-none text-slate-900 resize-none transition-all duration-300 font-light"
                    rows={5}
                    required
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-4 bg-white/50 p-6 rounded-3xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="room-available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-5 h-5 rounded-md border-slate-200 text-[#c19e58] focus:ring-[#c19e58]"
                  />
                  <Label htmlFor="room-available" className="text-slate-600 font-light cursor-pointer select-none">Mark as currently available for reservations</Label>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <Magnetic strength={10}>
                  <Button type="submit" size="lg" className="h-16 rounded-2xl bg-[#c19e58] text-white hover:bg-[#a68748] px-12 shadow-lg shadow-[#c19e58]/20 transition-all duration-500">
                    {editingRoomId ? 'Save Signature Changes' : 'Add to Collection'}
                  </Button>
                </Magnetic>
                <Magnetic strength={10}>
                  <Button type="button" variant="outline" size="lg" onClick={resetForm} className="h-16 rounded-2xl border-slate-200 hover:bg-slate-50 px-10 transition-all duration-500">
                    Cancel
                  </Button>
                </Magnetic>
              </div>
            </form>
          </Effect>
        )}

        {/* Collection Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredRooms.map((room, index) => (
            <Effect
              key={room.id}
              delay={index * 50}
              slide="up"
              className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] transition-all duration-700"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute top-6 left-6">
                  <span
                    className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border ${
                      room.available
                        ? 'bg-white/80 text-emerald-600 border-emerald-100'
                        : 'bg-white/80 text-red-500 border-red-100'
                    }`}
                  >
                    {room.available ? 'Available' : 'Reserved'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              <div className="p-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#c19e58] mb-2">{room.type}</p>
                    <h3 className="text-2xl font-light text-slate-950 leading-none">{room.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light text-slate-950">{formatCurrency(room.price)}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">per night</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-10 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#c19e58]" />
                    <span className="text-xs font-medium uppercase tracking-widest">{room.capacity} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-[#c19e58]" />
                    <span className="text-xs font-medium uppercase tracking-widest">{room.size}m²</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-slate-100 hover:border-[#c19e58]/50 hover:bg-slate-50 transition-all duration-500 gap-2"
                    onClick={() => handleEdit(room)}
                  >
                    <Edit className="w-4 h-4 text-[#c19e58]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Edit Details</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 w-14 rounded-2xl border-slate-100 hover:bg-red-50 hover:border-red-100 transition-all duration-500 text-slate-400 hover:text-red-500"
                    onClick={() => handleDelete(room.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Effect>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-32 bg-slate-50 rounded-[4rem] border border-slate-100 border-dashed">
            <p className="text-xl text-slate-400 font-light">No rooms found in the collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
