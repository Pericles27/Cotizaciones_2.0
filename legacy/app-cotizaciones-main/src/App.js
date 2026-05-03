import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Stocks from './paginas/stocks';
import Home from './paginas/Home';
import Bonos from './paginas/bonos';
import CriptoPage from './paginas/Criptomonedas';
import NotFound from './paginas/NotFound';
import ThemeProvider from './context/ThemeContext';
import NavBar1 from './components/NavBar/NavBar1';


function App() {
  setInterval(()=>{
    window.location.reload();
  },850000)
  return (
    <div className="App">
        <ThemeProvider>
          <BrowserRouter>
            <NavBar1/>
            <Routes>
              <Route path='/Criptos' element={<CriptoPage />}/>  
              <Route path='/Bonos' element={<Bonos />}/>  
              <Route path='/stock' element={<Stocks />}/>  
              <Route path='*' element={<NotFound />}/> 
              <Route path='/' element={<Home />}/>  
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
    </div>
  );
}

export default App;
