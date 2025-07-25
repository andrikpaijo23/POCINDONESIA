document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('data-form');
    const tableBody = document.querySelector('#data-table tbody');
    const searchInput = document.getElementById('searchInput');
    const submitBtn = document.getElementById('submit-btn');
    const rowIndexInput = document.getElementById('row-index');

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxL0J3n0V2tA2fH4Xg6sYy5f8zQ7nC6rJ3bA1c3dE5fG4hI3jK2lO/exec';

    const fetchData = async () => {
        try {
            const response = await fetch(`${SCRIPT_URL}?action=read`);
            const data = await response.json();
            renderTable(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const renderTable = (data) => {
        tableBody.innerHTML = '';
        data.forEach((row, index) => {
            if (index === 0) return; // Skip header row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${row[2]}</td>
                <td>${row[3]}</td>
                <td>${row[4]}</td>
                <td>
                    <button class="edit-btn" data-index="${index + 1}">Edit</button>
                    <button class="delete-btn" data-index="${index + 1}">Hapus</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const action = data.rowIndex ? 'update' : 'create';

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ ...data, action }),
            });
            const result = await response.json();
            if (result.success) {
                fetchData();
                form.reset();
                submitBtn.textContent = 'Tambah';
            } else {
                console.error('Error:', result.error);
            }
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const rowIndex = e.target.dataset.index;
            const row = tableBody.querySelector(`tr:nth-child(${rowIndex - 1})`);
            const cells = row.querySelectorAll('td');
            document.getElementById('nama').value = cells[0].textContent;
            document.getElementById('nomer-hp').value = cells[1].textContent;
            document.getElementById('callsign').value = cells[2].textContent;
            document.getElementById('provinsi').value = cells[3].textContent;
            document.getElementById('chanel-lokal').value = cells[4].textContent;
            rowIndexInput.value = rowIndex;
            submitBtn.textContent = 'Perbarui';
        }

        if (e.target.classList.contains('delete-btn')) {
            const rowIndex = e.target.dataset.index;
            if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                deleteRow(rowIndex);
            }
        }
    });

    const deleteRow = async (rowIndex) => {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'delete', rowIndex }),
            });
            const result = await response.json();
            if (result.success) {
                fetchData();
            } else {
                console.error('Error:', result.error);
            }
        } catch (error) {
            console.error('Error deleting data:', error);
        }
    };

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    });

    fetchData();
});
