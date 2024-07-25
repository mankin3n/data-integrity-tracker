import React from 'react';
import './App.css';
import FileTracker from './FileTracker';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Integrity Tracker</h1>
      </header>
      <main className="main-content">
        <FileTracker />
      </main>
    </div>
  );
}

export default App;
