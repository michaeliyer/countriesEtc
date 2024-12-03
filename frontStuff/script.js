document.getElementById('toggleMenu').addEventListener('click', () => {
    const menu = document.getElementById('countryIdMenu');
    menu.classList.toggle('hidden');

    // Fetch and display the country ID map if not already populated
    const countryList = document.getElementById('countryList');
    if (!countryList.childElementCount) {
        fetch('http://localhost:3000/countries') // Endpoint to fetch all countries
            .then(response => response.json())
            .then(data => {
                data.forEach(country => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `ID: ${country.id} - Name: ${country.country_name}`;
                    countryList.appendChild(listItem);
                });
            })
            .catch(err => {
                console.error('Error fetching country list:', err);
            });
    }
});

document.getElementById('fetchById').addEventListener('click', () => {
    const countryId = document.getElementById('countryId').value;
    if (!countryId) {
        alert('Please enter a valid Country ID.');
        return;
    }

    fetch(`http://localhost:3000/country/${countryId}`)
        .then(response => response.json())
        .then(data => {
            displayCountryDetails(data);
        })
        .catch(err => {
            console.error('Error fetching country by ID:', err);
            document.getElementById('countryDetails').textContent = 'Country not found.';
        });
});

document.getElementById('fetchByName').addEventListener('click', () => {
    const countryName = document.getElementById('countryName').value;
    if (!countryName) {
        alert('Please enter a valid Country Name.');
        return;
    }

    fetch(`http://localhost:3000/country/search/${countryName}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                displayCountryDetails(data[0]); // Display the first matching result
            } else {
                document.getElementById('countryDetails').textContent = 'Country not found.';
            }
        })
        .catch(err => {
            console.error('Error searching by country name:', err);
        });
});

function displayCountryDetails(data) {
    const detailsDiv = document.getElementById('countryDetails');
    detailsDiv.innerHTML = `
        <p><strong>Country Name:</strong> ${data.country_name}</p>
        <p><strong>Population:</strong> ${data.population}</p>
        <p><strong>Capital City:</strong> ${data.capital_city}</p>
        <p><strong>Capital Population:</strong> ${data.capital_population}</p>
        <p><strong>Chief Religion:</strong> ${data.chief_religion}</p>
    `;
}




// Add a Note
document.getElementById('addNote').addEventListener('click', () => {
    const countryId = document.getElementById('countryIdForNote').value;
    const note = document.getElementById('noteInput').value;

    if (!countryId || !note) {
        alert('Please provide both a country ID and a note.');
        return;
    }

    fetch('http://localhost:3000/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country_id: countryId, note }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            document.getElementById('noteInput').value = '';
        })
        .catch(err => {
            console.error('Error adding note:', err);
        });
});



document.getElementById('countryIdForNote').addEventListener('change', () => {
    const countryId = document.getElementById('countryIdForNote').value;

    fetch(`http://localhost:3000/notes/${countryId}`)
        .then(response => response.json())
        .then(data => {
            const notesList = document.getElementById('notesList');
            notesList.innerHTML = '';
            data.forEach(note => {
                const listItem = document.createElement('li');

                // Note content
                const noteText = document.createElement('span');
                noteText.textContent = `${note.note} (Added on: ${note.created_at})`;

                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.style.marginLeft = '10px';
                deleteButton.addEventListener('click', () => deleteNote(note.id));

                listItem.appendChild(noteText);
                listItem.appendChild(deleteButton);
                notesList.appendChild(listItem);
            });

            document.getElementById('notesSection').classList.remove('hidden');
        })
        .catch(err => {
            console.error('Error fetching notes:', err);
        });
});

// Delete a Note
function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        fetch(`http://localhost:3000/notes/${noteId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                document.getElementById('countryIdForNote').dispatchEvent(new Event('change')); // Refresh notes
            })
            .catch(err => {
                console.error('Error deleting note:', err);
            });
    }


}// Search Notes
document.getElementById('searchNotes').addEventListener('click', () => {
    const query = document.getElementById('noteSearchInput').value.trim();

    if (!query) {
        alert('Please enter a keyword to search notes.');
        return;
    }

    fetch(`http://localhost:3000/notes/search/${query}`)
        .then(response => response.json())
        .then(data => {
            const searchResultsDiv = document.getElementById('searchResults');
            const searchNotesList = document.getElementById('searchNotesList');

            searchNotesList.innerHTML = '';

            if (data.length === 0) {
                searchNotesList.innerHTML = '<li>No matching notes found.</li>';
            } else {
                data.forEach(note => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Note: ${note.note} (Country ID: ${note.country_id}, Added on: ${note.created_at})`;
                    searchNotesList.appendChild(listItem);
                });
            }

            searchResultsDiv.classList.remove('hidden');
        })
        .catch(err => {
            console.error('Error searching notes:', err);
        });
});

// Populate the dropdown with countries
fetch('http://localhost:3000/countries')
    .then(response => response.json())
    .then(countries => {
        const dropdown = document.getElementById('countryDropdown');
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.id; // Use the country ID as the value
            option.textContent = country.country_name; // Display country name
            dropdown.appendChild(option);
        });
    })
    .catch(err => console.error('Error fetching countries:', err));

// Fetch notes for the selected country
document.getElementById('fetchNotesByCountry').addEventListener('click', () => {
    const countryId = document.getElementById('countryDropdown').value;

    if (!countryId) {
        alert('Please select a country.');
        return;
    }

    fetch(`http://localhost:3000/notes/${countryId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No notes found for this country.');
            }
            return response.json();
        })
        .then(notes => {
            const notesList = document.getElementById('notesList');
            notesList.innerHTML = ''; // Clear existing notes

            if (notes.length === 0) {
                notesList.innerHTML = '<li>No notes available for this country.</li>';
                return;
            }

            notes.forEach(note => {
                const listItem = document.createElement('li');
                listItem.textContent = note.note; // Display the note content
                notesList.appendChild(listItem);
            });
        })
        .catch(err => {
            const notesList = document.getElementById('notesList');
            notesList.innerHTML = `<li style="color: red;">${err.message}</li>`;
        });
});









