import { useState } from 'react';

export default function LocationAndDate({ data, city, onSearch }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setInput('');
    }
  };

  return (
    <div className="location-and-date">
      <h1 className="location-and-date__location">{city || '...'}</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1em' }}>
        <input
          type="text"
          placeholder="Search city or state..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ padding: '0.5em', borderRadius: '4px', border: '1px solid #ccc', marginRight: '0.5em' }}
        />
        <button type="submit" style={{ padding: '0.5em 1em', borderRadius: '4px', border: 'none', background: '#2b32b2', color: 'white', cursor: 'pointer' }}>Search</button>
      </form>
      <div>{data}</div>
    </div>
  );
}