const express = require('express');
const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
const NodeCache = require('node-cache');
const { timeStamp } = require('console');
const fs = require('fs').promises;


//----------------------------------------------------------------
// CREATE SEQUELIZE INSTANCE AND ESTABLISH THE DATABASE CONNECTION
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'bcoironfztr4gaaebrty-mysql.services.clever-cloud.com',
  port: '3306',
  username: 'u0ftkgz2rxsuouvq',
  password: 'Kit1eVEkGQOR3p2f59vE',
  database: 'bcoironfztr4gaaebrty',
});

// CHECK THE DATABASE CONNECTION
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });


const User = sequelize.define('countries', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  country_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  country_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Other fields...
}, { timestamps: false });

// SYNC THE MODEL WITH THE DATABASE
// (async () => {
//   try {
//     await sequelize.sync(); // This will create the table if it doesn't exist
//     console.log('Database synced!');
//   } catch (error) {
//     console.error('Error syncing database:', error);
//   }
// })();

// User.findAll();
//----------------------------------------------------------------

// Load country data from JSON file
let countryData;
fs.readFile('country_data.json', 'utf8')
  .then((data) => {
    countryData = JSON.parse(data);
  })
  .catch((err) => {
    console.error('Error reading countries.json:', err);
  });


const countryCache = new NodeCache({ stdTTL: 3600, checkperiod: 3700 });
const app = express();
const PORT = 3011;


app.get('/', (req, res) => {
  res.send('Hello from Express running on port ' + PORT);
});

// Example API endpoint to fetch country details by country code

// app.get('/countries/:countryCode', async (req, res) => {
//     const countryCode = req.params.countryCode;

//     // Check if country details exist in the cache
//     let countryDetails = countryCache.get(countryCode);

//     if (!countryDetails) {
//         // If not found in cache, fetch details from the database or external API
//         countryDetails = await fetchCountryDetailsFromExternalAPI(countryCode);

//         // Store fetched details in the cache
//         if (countryDetails) {
//             countryCache.set(countryCode, countryDetails);
//         }
//     }

//     // Send country details as the API response
//     if (countryDetails) {
//         res.json(countryDetails);
//     } else {
//         res.status(404).json({ error: 'Country details not found' });
//     }
// });

// EXAMPLE API ENDPOINT TO FETCH COUNTRY DETAILS BY COUNTRY CODE
app.get('/countries/:countryCode', async (req, res) => {
  const countryCode = req.params.countryCode;

  // Check if country details exist in the cache
  let countryDetails = countryCache.get(countryCode);

  if (!countryDetails) {
    // If not found in cache, fetch details from the JSON data
    countryDetails = countryData.find(country => country.code === countryCode);

    // Store fetched details in the cache
    if (countryDetails) {
      countryCache.set(countryCode, countryDetails);
    }
  }

  // Send country details as the API response
  if (countryDetails) {
    res.json(countryDetails);
  } else {
    res.status(404).json({ error: 'Country details not found' });
  }
});

// Example API endpoint to fetch all country data
app.get('/countries', async (req, res) => {
  let allCountries = countryCache.get('allCountries');
  let CountryData;

  if (!allCountries) {
    CountryData = await User.findAll();
    if (CountryData && CountryData.length > 0) {
      countryCache.set('allCountries', JSON.stringify(CountryData));
      res.json(CountryData);
    } else {
      res.status(404).json({ error: 'Country details not found' });
    }
  } else {
    allCountries = JSON.parse(allCountries);
    res.json(allCountries);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


