const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./countries.db');

// Middleware
app.use(cors());
app.use(express.json());

// Fetch a country by ID
app.get('/country/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM Countries WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else if (row) {
            res.json(row);
        } else {
            res.status(404).send({ error: 'Country not found' });
        }
    });
});

// Search countries by name
app.get('/country/search/:name', (req, res) => {
    const name = `%${req.params.name}%`;
    db.all('SELECT * FROM Countries WHERE country_name LIKE ?', [name], (err, rows) => {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).send({ error: 'No countries found' });
        }
    });
});

// Fetch all countries with ID and name
app.get('/countries', (req, res) => {
    db.all('SELECT id, country_name FROM Countries', [], (err, rows) => {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});

// Add a new country
app.post('/country', (req, res) => {
    const { country_name, population, capital_city, capital_population, chief_religion } = req.body;
    db.run(
        `INSERT INTO Countries (country_name, population, capital_city, capital_population, chief_religion)
         VALUES (?, ?, ?, ?, ?)`,
        [country_name, population, capital_city, capital_population, chief_religion],
        function (err) {
            if (err) {
                res.status(500).send({ error: 'Database error' });
            } else {
                res.status(201).send({ id: this.lastID, message: 'Country added successfully' });
            }
        }
    );
});

// Update a country's information
app.put('/country/:id', (req, res) => {
    const id = req.params.id;
    const { country_name, population, capital_city, capital_population, chief_religion } = req.body;
    db.run(
        `UPDATE Countries
         SET country_name = ?, population = ?, capital_city = ?, capital_population = ?, chief_religion = ?
         WHERE id = ?`,
        [country_name, population, capital_city, capital_population, chief_religion, id],
        function (err) {
            if (err) {
                res.status(500).send({ error: 'Database error' });
            } else if (this.changes === 0) {
                res.status(404).send({ error: 'Country not found' });
            } else {
                res.send({ message: 'Country updated successfully' });
            }
        }
    );
});

// Delete a country by ID
app.delete('/country/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM Countries WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).send({ error: 'Country not found' });
        } else {
            res.send({ message: 'Country deleted successfully' });
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to the Country Information API</h1>
        <p>Available endpoints:</p>
        <ul>
            <li><code>GET /country/:id</code>: Fetch a country by ID</li>
            <li><code>GET /country/search/:name</code>: Search countries by name</li>
            <li><code>GET /countries</code>: Get all countries with ID and name</li>
            <li><code>POST /country</code>: Add a new country</li>
            <li><code>PUT /country/:id</code>: Update a country's information</li>
            <li><code>DELETE /country/:id</code>: Delete a country by ID</li>
        </ul>
    `);
});



// Notes Endpoints

// Add a Note
app.post('/notes', (req, res) => {
    const { country_id, note } = req.body;
    db.run(
        `INSERT INTO Notes (country_id, note) VALUES (?, ?)`,
        [country_id, note],
        function (err) {
            if (err) {
                res.status(500).send({ error: 'Database error' });
            } else {
                res.status(201).send({ id: this.lastID, message: 'Note added successfully' });
            }
        }
    );
});

// Fetch Notes for a Country
app.get('/notes/:country_id', (req, res) => {
    const country_id = req.params.country_id;
    db.all(
        `SELECT * FROM Notes WHERE country_id = ? ORDER BY created_at DESC`,
        [country_id],
        (err, rows) => {
            if (err) {
                res.status(500).send({ error: 'Database error' });
            } else {
                res.json(rows);
            }
        }
    );
});

// Search Notes
app.get('/notes/search/:query', (req, res) => {
    const query = `%${req.params.query}%`;
    db.all(
        `SELECT * FROM Notes WHERE note LIKE ? ORDER BY created_at DESC`,
        [query],
        (err, rows) => {
            if (err) {
                res.status(500).send({ error: 'Database error' });
            } else {
                res.json(rows);
            }
        }
    );
});

// Delete a Note
app.delete('/notes/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM Notes WHERE id = ?`, [id], function (err) {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).send({ error: 'Note not found' });
        } else {
            res.send({ message: 'Note deleted successfully' });
        }
    });
});

// Search Notes
app.get('/notes/search/:query', (req, res) => {
    const query = `%${req.params.query}%`;
    db.all(
        `SELECT * FROM Notes WHERE note LIKE ? ORDER BY created_at DESC`,
        [query],
        (err, rows) => {
            if (err) {
                res.status(500).send({ error: 'Database error' });
            } else {
                res.json(rows);
            }
        }
    );
});

// Endpoint to fetch all countries
app.get('/countries', (req, res) => {
    db.all('SELECT id, country_name FROM Countries', [], (err, rows) => {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});