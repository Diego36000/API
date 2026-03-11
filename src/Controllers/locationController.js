import locationModel from '../Models/locationModel.js';

async function getCountries(_req, res) {
    try {
        const countries = await locationModel.getAllCountries();
        res.status(200).json({ data: countries });
    } catch {
        res.status(500).json({ error: 'Error fetching countries' });
    }
}

export default { getCountries };
