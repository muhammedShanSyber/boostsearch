import { useState } from 'react';
import axios from 'axios';
import './index.css';

const Searchtopic = () => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [coreResults, setCoreResults] = useState([]);
  const [pubmedResults, setPubmedResults] = useState([]);
  const [googleResults, setGoogleResults] = useState([]);
  const [filterOption, setFilterOption] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/search`, {
        params: { q: query },
      });

      console.log('Response Data:', response.data);

      const { videos, coreResults, pubmedResults, googleResults } = response.data;

      console.log('CORE Results:', coreResults);

      //
      setVideos(videos || []);
      setCoreResults(coreResults || []);
      setPubmedResults(pubmedResults || []);
      setGoogleResults(googleResults || []);
      setShowFilter(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = () => {
    let results = [];

    // filtering
    if (filterOption === 'youtube' || filterOption === 'all') {
      results = results.concat(videos);
    }
    if (filterOption === 'core' || filterOption === 'all') {
      results = results.concat(coreResults);
    }
    if (filterOption === 'pubmed' || filterOption === 'all') {
      results = results.concat(pubmedResults);
    }
    if (filterOption === 'google' || filterOption === 'all') {
      results = results.concat(googleResults);
    }
    console.log('Filtered Results:', results.id);
    return results;
  };

  return (
    <div className="max-w-1xl mx-auto py-10">
      <h1>Boost Search</h1>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search topics"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-9/12 p-2 border rounded-lg mb-4"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
        {showFilter && (
          <div className="relative ml-4">
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="bg-gray-300 text-black px-4 py-2 rounded-lg"
            >
              <option value="all">All</option>
              <option value="youtube">YouTube</option>
              <option value="core">CORE</option>
              <option value="pubmed">PubMed</option>
              <option value="google">Google Search</option>
            </select>
          </div>
        )}
      </div>
      {loading && <p className="text-center mt-4">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredResults().map((result, index) => {
          // Check if result is defined
          if (!result) return null;

          // checking youtube videos
          if (result.id?.videoId) {
            return (
              <div key={`youtube-${result.id.videoId}-${index}`} className="border rounded-lg overflow-hidden shadow-lg">
                <img src={result.snippet.thumbnails.medium.url} alt={result.snippet.title} className="w-full" />
                <div className="p-4">
                  <a href={`https://www.youtube.com/watch?v=${result.id.videoId}`} target="_blank" rel="noopener noreferrer">
                    <h3 className="font-bold text-lg">{result.snippet.title}</h3>
                    <p className="text-sm text-gray-600">{result.snippet.description}</p>
                  </a>
                  <div className='bg-blue-500'>YouTube</div>
                </div>
              </div>
            );
          }
          // Check for CORE results
          else if (result.id) {
            return (
              <div key={`core-${result.id}-${index}`} className="border rounded-lg overflow-hidden shadow-lg">
                <div className="p-4">
                  <h3 className="font-bold text-lg">{result.title}</h3>
                  <p>{result.createdDate}</p>
                  <p className="text-sm text-gray-600">{result.abstract || 'No description available'}</p>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">Read more</a><br />
                  <button className="bg-gray-400 mb-2" onClick={() => window.open(result.downloadUrl, '_blank')}> Download PDF</button>
                  <div className='bg-blue-500'>CORE</div>
                </div>
              </div>
            );
          }
          // Check for PubMed results
          else if (result.source) {
            return (
              <div key={`pubmed-${result.id}-${index}`} className="border rounded-lg overflow-hidden shadow-lg">
                <div className="p-4">
                  <h3 className="font-bold text-lg">{result.title}</h3>
                  <p>{result.source}</p>
                  <p className="text-sm text-gray-600">{result.abstract || 'No description available'}</p>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">Read more</a>
                  <div>PubMed</div>
                </div>
              </div>
            );
          }
          // checking for google results
          else if (result.url) {
            return (
              <div key={`google-${result.id}-${index}`} className="border rounded-lg overflow-hidden shadow-lg">
                <a href={result.url}>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{result.title}</h3>
                    <p className="text-sm text-gray-600">{result.snippet || 'No description available'}</p>
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">Read more</a>
                    <div className='bg-blue-500'>Google</div>
                  </div>
                </a>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Searchtopic;
