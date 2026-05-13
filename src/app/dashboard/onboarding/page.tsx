'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    services: '',
    prices: '',
    operatingHours: '',
    location: '',
    whatsappNumberId: '',
  });

  useEffect(() => {
    // Fetch existing business if any
    const fetchBusiness = async () => {
      try {
        const res = await fetch('/api/business');
        if (res.ok) {
          const businesses = await res.json();
          if (businesses.length > 0) {
            const b = businesses[0];
            setBusinessId(b.id);
            setFormData({
              name: b.name || '',
              description: b.description || '',
              services: b.services || '',
              prices: b.prices || '',
              operatingHours: b.operatingHours || '',
              location: b.location || '',
              whatsappNumberId: b.whatsappNumberId || '',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching business:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchBusiness();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = businessId ? `/api/business/${businessId}` : '/api/business';
      const method = businessId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Business profile updated!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to update business profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center p-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Business Profile</h2>
      <p className="text-gray-600 mb-8">
        Fill in your business details to train your AI assistant. These details are used to hydrate the AI's system prompt.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g. Joe's Coffee Shop"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp Phone Number ID</label>
            <input
              type="text"
              name="whatsappNumberId"
              required
              value={formData.whatsappNumberId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="From Meta Developer Portal"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="What does your business do?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Services</label>
          <textarea
            name="services"
            required
            value={formData.services}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="List your services..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prices</label>
          <textarea
            name="prices"
            required
            value={formData.prices}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Price ranges or specific costs..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
            <input
              type="text"
              name="operatingHours"
              required
              value={formData.operatingHours}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g. Mon-Fri 9am-5pm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g. 123 Main St, New York"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Business Profile'}
        </button>
      </form>
    </div>
  );
}
