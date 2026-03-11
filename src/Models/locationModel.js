import db from '../Config/dbConfig.js';

class Location {

    async getAllCountries() {
        const { rows } = await db.query('SELECT * FROM countries ORDER BY name');
        return rows;
    }
}

export default new Location();
