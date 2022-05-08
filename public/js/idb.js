// create connection
let db;
// establish connect and name
const request = indexedDB.open('budget_tracking', 1);

request.onupgradeneeded = function(event) {
    // save db reference
    const db = event.target.result;
    
    db.createObjectStore('new_input', {autoIncrement: true });
};

// upon a success
request.onsuccess = function(event) {
    db = event.target.result;

    // check connection
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // log the error
    console.log(event.target.errorCode);
};

// save transactions added while offline
function saveRecord(record) {
    const transaction = db.transaction(['new_input'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_input');

    budgetObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_input'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_input');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0 ) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['new_input'], 'readwrite');

                const budgetObjectStore = transaction.objectStore('new_input');

                budgetObjectStore.clear();

                alert('All saved transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

// list for re-established connection
window.addEventListener('online', uploadTransaction);