import { useState } from 'react'

import './global.css'
import Temperature from './Temperature'
import Stats from './Stats'
import NextDays from './NextDays'
import LocationAndDate from './LocationAndDate'
import { useEffect } from 'react'


function getCityName(lat, lon) {
  // Use Nominatim reverse geocoding API
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown');
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState('');

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setError('Location access denied. Showing default location.');
          setCoords({ lat: 41.6941, lon: 44.8337 }); // Tbilisi fallback
        }
      );
    } else {
      setError('Geolocation not supported. Showing default location.');
      setCoords({ lat: 41.6941, lon: 44.8337 });
    }
  }, []);

  // Search handler for city/state
  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    // Use Nominatim to get lat/lon from city/state
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const results = await res.json();
      if (results && results.length > 0) {
        setCoords({ lat: results[0].lat, lon: results[0].lon });
      } else {
        setError('Location not found.');
        setLoading(false);
      }
    } catch (e) {
      setError('Error searching location.');
      setLoading(false);
    }
  };

  // Fetch weather and city name when coords change
  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,rain,is_day&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,windspeed_10m_max&current_weather=true&windspeed_unit=mph&timezone=GMT`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      });
    getCityName(coords.lat, coords.lon).then(setCity);
  }, [coords]);
  return (
    <>
      <main className="main-container">

        {loading ? (
          <h1>Loading...</h1>
        ) : error ? (
          <h1>{error}</h1>
        ) : (
          <>
            <LocationAndDate data={data.current_weather.time.slice(0, 10)} city={city} onSearch={handleSearch} />
            <Temperature data={data} />
            <Stats data={data} />
            <NextDays data={data.daily} />
          </>
        )}

        
      </main>
    </>
  );
}
