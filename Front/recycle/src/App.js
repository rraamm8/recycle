import { BrowserRouter,Routes,Route, Link, RouterProvider } from 'react-router-dom';

import root from "./Router/root";
import './App.css';

function App() {
  return (
    // <BrowserRouter>
    //   <Login/>
    // </BrowserRouter>
    <RouterProvider router={root}/>
  );
}

export default App;
