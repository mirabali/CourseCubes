import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  useParams,
  createBrowserRouter,
  RouterProvider,
  Route,
  Link
} from 'react-router-dom';
import CreatePresentationPage from './routes/create-presentation-page';
import EditPresentationPage from './routes/edit-presentation-page';
import { useEffect, useState } from 'react';

function HelloPage() {
  const [text, setText] = useState('');
  useEffect(
    () => {
      fetch('http://127.0.0.1:8000/hello')
        .then(res => res.text())
        .then((res) => {
          setText(res);
        })
    }, []);

  return (
    <p>{text}</p>
  );

}

const router = createBrowserRouter([
  {
    path: "/",
    element: <HelloPage />
  },

  {
    path: "/presentation/create",
    element: <CreatePresentationPage />
  },
  {
    path: "/presentation/edit/:uuidPresentation",
    element: <EditPresentationPage />
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
