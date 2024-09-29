const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const youtubeApiKey = 'AIzaSyAB9LgCmZo97f1ZWGydyODxgqlrWK3rn0o'; 
const coreApiKey = 'ndZsojxJDglMEkX6WYcray4QK8t7iApR'; 
const pubmedSearchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const pubmedFetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
const googleApiKey = ' AIzaSyBOG6dRMPpSWePX0LF29aSfGDBDRyM3Xak ';
const googleCx = '503fd7984264940e6';

app.get('/api/search', async (req, res) => {
    const { q } = req.query;

    try {
        const videos = await fetchYouTubeResults(q);
        const coreResults = await fetchCoreResults(q);
        const pubmedResults = await fetchPubMedResults(q);
        const googleResults = await fetchGoogleResults(q);
        
        // Send all results back
        res.json({ videos, coreResults,pubmedResults, googleResults });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

//Fetch YouTube results
const fetchYouTubeResults = async (query) => {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}&q=${encodeURIComponent(query)}&part=snippet&type=video`;

    try {
        const response = await axios.get(url);
        const items = response.data.items || [];
        return items.map(item => ({
            id: item.id,
            snippet: item.snippet,
        }));
    } catch (error) {
        console.error('Error fetching YouTube results:', error);
        return [];
    }
};

//fetch CORE results
const fetchCoreResults = async (query) => {
    const url = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&pageSize=10&apiKey=${coreApiKey}`;

    try {
        const response = await axios.get(url);
        // console.log('Full Response:', response);  

        if (response.data && response.data.results) {
            const items = response.data.results;  

            // Ensure items is an array
            if (Array.isArray(items)) {
                // console.log('Items:', items);
                return items.map(item => ({
                    id: item.doi,  
                    title: item.title || 'No Title Available', 
                    createdDate: item.createdDate,
                    abstract: item.abstract,
                    url: item.url,
                    downloadUrl: item.downloadUrl,
                }));
            } else {
                console.error('Expected items to be an array, but got:', items);
                return [];
            }
        } else {
            console.error('No results field found in response:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching CORE results:', error);
        return [];
    }
};

// Function to fetch PubMed results
const fetchPubMedResults = async (query) => {
    const url = `https://api.pubmed.ncbi.nlm.nih.gov/lit/prev/manuscript/?query=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(url);
        console.log(response.data)
        const items = response.data || [];
        // console.log(items)
        return items.map(item => ({
            id: item.id,
            title: item.title,
            abstract: item.abstract,
            source: item.source,
            url: item.url,
        }));
    } catch (error) {
        console.error('Error fetching PubMed results:', error);
        return [];
    }
};

// fetch Google search results
const fetchGoogleResults = async (query) => {
    const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(url);
        // console.log(response.data);
        const items = response.data.items || [];
        return items.map(item => ({
            name: item.title,
            snippet: item.snippet,
            url: item.link,
        }));
    } catch (error) {
        console.error('Error fetching Google results:', error);
        return [];
    }
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});