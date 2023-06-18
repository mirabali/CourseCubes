import logo from './logo.svg';
import './App.css';

export const getBaseURL = () => {
  return process.env.REACT_APP_BASE_URL ? process.env.REACT_APP_BASE_URL : 'http://127.0.0.1:8000';
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
