
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/home.js";
import ExtraInfo from './pages/extraInfo.js';
function App() {
  return (
    <Router>
    <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path='/extra' element={<ExtraInfo />}/>
    </Routes>
</Router>
  );
}

export default App;
