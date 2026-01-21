
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { User, UserRole, Property, RentalRequest, FurnishingStatus, PropertyType, UserPreferences } from './types';
import { ICONS, APP_NAME } from './constants';
import { getRecommendedProperties } from './services/geminiService';

// --- Components ---
const Navbar: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => (
  <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 shadow-sm flex justify-between items-center">
    <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
      <span className="p-1.5 bg-blue-100 rounded-lg">🏠</span>
      {APP_NAME}
    </Link>
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">{user.name}</span>
            <span className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all">
          Login
        </Link>
      )}
    </div>
  </nav>
);

const PropertyCard: React.FC<{ property: Property; isRecommended?: boolean }> = ({ property, isRecommended }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/property/${property.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.images[0] || `https://picsum.photos/seed/${property.id}/400/300`} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <button className="bg-white/80 backdrop-blur-md p-2 rounded-full text-slate-600 hover:text-red-500 transition-colors">
            <ICONS.Heart className="w-5 h-5" />
          </button>
        </div>
        {isRecommended && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            AI Top Match
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{property.title}</h3>
          <span className="text-lg font-bold text-blue-600">₹{property.price.toLocaleString()}</span>
        </div>
        <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
          <span className="opacity-70">📍</span> {property.area}, {property.location}
        </p>
        <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-slate-600">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <ICONS.Bed className="w-4 h-4 text-blue-500" /> {property.bedrooms} Beds
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <ICONS.Bath className="w-4 h-4 text-blue-500" /> {property.bathrooms} Baths
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <ICONS.Area className="w-4 h-4 text-blue-500" /> {property.sqft} sqft
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const LandingPage: React.FC = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-3xl">
      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
        Find your next <span className="text-blue-600">dream home</span> with ease.
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto">
        Join thousands of homeowners and renters in the most trusted real estate marketplace.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/login" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 hover:shadow-lg transition-all">
          Browse Rentals
        </Link>
        <Link to="/login" className="bg-white text-slate-800 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all">
          List Your Property
        </Link>
      </div>
    </div>
    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
      <div className="flex items-center gap-2 font-bold text-xl"><span className="text-blue-600">★</span> Trustpilot</div>
      <div className="flex items-center gap-2 font-bold text-xl"><span className="text-blue-600">★</span> G2 Crowd</div>
      <div className="flex items-center gap-2 font-bold text-xl"><span className="text-blue-600">★</span> Forbes</div>
      <div className="flex items-center gap-2 font-bold text-xl"><span className="text-blue-600">★</span> TechCrunch</div>
    </div>
  </div>
);

const LoginPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.RENTER);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      preferences: role === UserRole.RENTER ? { minBedrooms: 2, maxPrice: 100000 } : undefined
    });
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Welcome back</h2>
        
        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button 
            onClick={() => setRole(UserRole.RENTER)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === UserRole.RENTER ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            I'm a Renter
          </button>
          <button 
            onClick={() => setRole(UserRole.OWNER)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === UserRole.OWNER ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            I'm an Owner
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-black"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-black"
              placeholder="john@example.com"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 mt-4"
          >
            {role === UserRole.RENTER ? 'Find Homes' : 'List Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

const RenterDashboard: React.FC<{ properties: Property[]; user: User }> = ({ properties, user }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (user.preferences) {
      setLoadingAI(true);
      getRecommendedProperties(user.preferences, properties)
        .then(ids => setRecommendedIds(ids))
        .finally(() => setLoadingAI(false));
    }
  }, [user.preferences, properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.area.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'All' || p.propertyType === filterType;
      return matchesSearch && matchesType;
    });
  }, [properties, search, filterType]);

  const recommendedList = useMemo(() => {
    return properties.filter(p => recommendedIds.includes(p.id));
  }, [properties, recommendedIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Hello, {user.name}! 👋</h1>
        <p className="text-slate-500">Discover properties tailored to your taste.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by area or property name..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'House', 'Apartment', 'Villa', 'Studio'].map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`whitespace-nowrap px-6 py-4 rounded-2xl text-sm font-bold transition-all ${filterType === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {recommendedList.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-yellow-100 rounded-lg">✨</span> Recommended For You
            </h2>
            {loadingAI && <span className="text-xs text-blue-500 animate-pulse">Refining...</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedList.map(p => (
              <PropertyCard key={`rec-${p.id}`} property={p} isRecommended />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="p-1.5 bg-blue-100 rounded-lg">🏢</span> Available Properties
        </h2>
        {filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400">No properties found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProperties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const OwnerDashboard: React.FC<{ properties: Property[]; user: User; requests: RentalRequest[] }> = ({ properties, user, requests }) => {
  const navigate = useNavigate();
  const ownerProperties = properties.filter(p => p.ownerId === user.id);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Owner Portal</h1>
          <p className="text-slate-500">Manage your listings and incoming requests.</p>
        </div>
        <button 
          onClick={() => navigate('/add-property')}
          className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
        >
          <ICONS.Plus className="w-5 h-5" /> List New Property
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Your Listings</h2>
          {ownerProperties.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
              <div className="text-4xl mb-4">🏠</div>
              <p className="text-slate-500 font-medium">You haven't listed any properties yet.</p>
              <button 
                onClick={() => navigate('/add-property')}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Start Listing Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ownerProperties.map(p => (
                <div key={p.id} className="relative group">
                   <PropertyCard property={p} />
                   <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-white/90 p-2 rounded-lg text-slate-600 hover:text-blue-600">Edit</button>
                      <button className="bg-white/90 p-2 rounded-lg text-slate-600 hover:text-red-600">Delete</button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="p-1.5 bg-orange-100 rounded-lg">📨</span> Inquiries
          </h2>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No rental requests yet.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-800">{req.renterName}</span>
                    <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-bold uppercase tracking-tight">New</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">"{req.message}"</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg">Approve</button>
                    <button className="flex-1 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyDetail: React.FC<{ properties: Property[]; onSendRequest: (req: RentalRequest) => void; user: User | null }> = ({ properties, onSendRequest, user }) => {
  const { id } = React.useParams<{ id: string }>();
  const navigate = useNavigate();
  const property = properties.find(p => p.id === id);
  const [msg, setMsg] = useState('Hi! I am interested in this property. Is it available for viewing?');
  const [sent, setSent] = useState(false);

  if (!property) return <div className="p-20 text-center">Property not found</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    onSendRequest({
      id: Math.random().toString(),
      propertyId: property.id,
      renterId: user.id,
      renterName: user.name,
      status: 'PENDING',
      message: msg,
      createdAt: new Date().toISOString()
    });
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm font-bold text-slate-500 flex items-center gap-1 hover:text-blue-600 transition-colors">
        ← Back to Browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <div className="rounded-3xl overflow-hidden mb-8 shadow-lg aspect-video">
             <img src={property.images[0] || `https://picsum.photos/seed/${property.id}/800/600`} alt={property.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{property.title}</h1>
            <p className="text-lg text-slate-500 flex items-center gap-1">📍 {property.area}, {property.location}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
               <ICONS.Bed className="w-6 h-6 mx-auto mb-1 text-blue-600" />
               <span className="block text-xs text-slate-400">Bedrooms</span>
               <span className="font-bold">{property.bedrooms}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
               <ICONS.Bath className="w-6 h-6 mx-auto mb-1 text-blue-600" />
               <span className="block text-xs text-slate-400">Bathrooms</span>
               <span className="font-bold">{property.bathrooms}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
               <ICONS.Area className="w-6 h-6 mx-auto mb-1 text-blue-600" />
               <span className="block text-xs text-slate-400">Sqft</span>
               <span className="font-bold">{property.sqft}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
               <span className="block text-xs text-slate-400 mb-1 pt-1 font-bold text-blue-600">TYPE</span>
               <span className="block text-xs text-slate-400">Category</span>
               <span className="font-bold text-xs">{property.propertyType}</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 mb-8">
            <h3 className="text-xl font-bold mb-4">Description</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="mb-6">
              <span className="text-slate-400 text-sm font-medium">Monthly Rent</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-blue-600">₹{property.price.toLocaleString()}</span>
                <span className="text-slate-400 font-medium">/month</span>
              </div>
            </div>

            <div className="mb-8 p-4 bg-slate-50 rounded-2xl">
              <h4 className="font-bold text-slate-800 mb-1">Furnishing Status</h4>
              <p className="text-slate-500 text-sm">{property.furnishingStatus}</p>
            </div>

            {sent ? (
              <div className="bg-green-50 p-6 rounded-2xl text-center">
                <div className="text-3xl mb-2">✅</div>
                <h4 className="font-bold text-green-800">Request Sent!</h4>
                <p className="text-green-600 text-sm mt-1">The owner will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Message to Owner</label>
                  <textarea 
                    rows={4}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
                >
                  Send Inquiry
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1">🛡️ Verified Owner</span>
              <span className="flex items-center gap-1">⏱️ Responds in 2h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddProperty: React.FC<{ onAdd: (p: Property) => void; ownerId: string }> = ({ onAdd, ownerId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    price: 15000,
    area: '',
    location: '',
    sqft: 800,
    bedrooms: 2,
    bathrooms: 2,
    furnishingStatus: FurnishingStatus.FURNISHED,
    propertyType: PropertyType.APARTMENT,
    contactDetails: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProperty: Property = {
      ...(formData as Property),
      id: Math.random().toString(36).substr(2, 9),
      ownerId,
      images: [`https://picsum.photos/seed/${Math.random()}/800/600`],
      createdAt: new Date().toISOString(),
    };
    onAdd(newProperty);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-8">List Your Property</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1">Property Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" placeholder="e.g. Modern 2BHK in Downtown" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label>
            <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: +e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Sqft</label>
            <input required type="number" value={formData.sqft} onChange={e => setFormData({...formData, sqft: +e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Area Name</label>
            <input required type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" placeholder="e.g. Manhattan" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Location / Address</label>
            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" placeholder="e.g. 123 5th Ave" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Bedrooms</label>
            <select value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: +e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Property Type</label>
            <select value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value as PropertyType})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black">
              {Object.values(PropertyType).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" placeholder="Describe the highlights..." />
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
              Create Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main App Logic ---

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    ownerId: 'o1',
    title: 'Luxury Glass Penthouse',
    description: 'Breathtaking 360-degree city views with floor-to-ceiling windows. This modern penthouse features high-end appliances, smart home automation, and a private rooftop garden.',
    price: 85000,
    area: 'Bandra West',
    location: '12 Sky Avenue, Mumbai',
    sqft: 2200,
    bedrooms: 3,
    bathrooms: 2,
    furnishingStatus: FurnishingStatus.FURNISHED,
    propertyType: PropertyType.APARTMENT,
    images: ['https://picsum.photos/seed/p1/800/600'],
    contactDetails: 'owner@penthouse.com',
    createdAt: '2023-10-01'
  },
  {
    id: 'p2',
    ownerId: 'o1',
    title: 'Cozy Scandinavian Studio',
    description: 'Perfect for minimalists! A bright and airy studio apartment with clever space-saving solutions. Located in a quiet neighborhood close to public transit.',
    price: 22000,
    area: 'Indiranagar',
    location: '44 Pine Street, Bengaluru',
    sqft: 450,
    bedrooms: 1,
    bathrooms: 1,
    furnishingStatus: FurnishingStatus.SEMI_FURNISHED,
    propertyType: PropertyType.STUDIO,
    images: ['https://picsum.photos/seed/p2/800/600'],
    contactDetails: 'owner@studio.com',
    createdAt: '2023-10-05'
  },
  {
    id: 'p3',
    ownerId: 'o2',
    title: 'Family Friendly Villa',
    description: 'Spacious 4-bedroom villa with a large backyard and swimming pool. Ideal for families looking for comfort and privacy in an upscale gated community.',
    price: 120000,
    area: 'Jubilee Hills',
    location: '7 Green Valley, Hyderabad',
    sqft: 3500,
    bedrooms: 4,
    bathrooms: 3,
    furnishingStatus: FurnishingStatus.UNFURNISHED,
    propertyType: PropertyType.VILLA,
    images: ['https://picsum.photos/seed/p3/800/600'],
    contactDetails: 'owner@villa.com',
    createdAt: '2023-10-10'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('properties');
    return saved ? JSON.parse(saved) : MOCK_PROPERTIES;
  });

  const [requests, setRequests] = useState<RentalRequest[]>(() => {
    const saved = localStorage.getItem('requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('requests', JSON.stringify(requests));
  }, [requests]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const addProperty = (p: Property) => setProperties(prev => [p, ...prev]);
  const addRequest = (req: RentalRequest) => setRequests(prev => [req, ...prev]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 pb-12">
        <Navbar user={currentUser} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={
            !currentUser ? <LandingPage /> : 
            currentUser.role === UserRole.RENTER ? <RenterDashboard properties={properties} user={currentUser} /> : 
            <OwnerDashboard properties={properties} user={currentUser} requests={requests} />
          } />
          
          <Route path="/login" element={
            currentUser ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />
          } />

          <Route path="/property/:id" element={
            <PropertyDetail properties={properties} onSendRequest={addRequest} user={currentUser} />
          } />

          <Route path="/add-property" element={
            currentUser?.role === UserRole.OWNER ? <AddProperty onAdd={addProperty} ownerId={currentUser.id} /> : <Navigate to="/" />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
