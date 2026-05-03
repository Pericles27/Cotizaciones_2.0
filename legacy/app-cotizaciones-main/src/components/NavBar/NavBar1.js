import "../NavBar/navbar.css"
import {AppBar,Toolbar} from "@mui/material";
import {useContext } from 'react'
import Button from '@mui/material/Button';
import  { Link }  from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext'
import ThemeSwitch from './themeSwitch';
const NavBar1=()=>{
    const { darkTheme } = useContext(ThemeContext)
    return(
        <AppBar position="fixed" className={`header-primary ${darkTheme ? 'dark-mode' : ''}`}>
            <Toolbar>
                <nav class="navbar navbar-dark navbar-expand-lg fixed-top " style={{position:"fixed",width:"100%"}}>
                    <div class="container-fluid">
                        <Button class="navbar-brand" style={{backgroundColor:"transparent",border:"none",marginRight:50}}>
                            <Link id="logo" to={'/'} style={{textDecoration:'none'}}>
                                Resumen de Mercados
                            </Link>
                        </Button>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class={`collapse navbar-collapse`} id="navbarSupportedContent">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <Button className='navbar__btn'>
                                        <Link to={'/Bonos'} style={{textDecoration:'none',display:`flex`,flex:`30%`,flexWrap:`wrap`}}className={'link-item'}>
                                            Argentina
                                        </Link>
                                    </Button>
                                </li>
                                <li class="nav-item">
                                    <Button className='navbar__btn'>
                                        <Link to={'/Criptos'} style={{textDecoration:'none',display:`flex`,flex:`30%`,flexWrap:`wrap`}} className={'link-item'}>
                                            Criptomonedas
                                        </Link>
                                    </Button>
                                </li>
                                <li className="nav-item" >
                                    <Button className='navbar__btn'>
                                        <Link to={'/stock'} style={{textDecoration:'none',display:`flex`,flex:`30%`,flexWrap:`wrap`}} className={'link-item'}>
                                            Estados Unidos
                                        </Link>
                                    </Button>
                                </li>
                                <li className="nav-item"style={{float:"right"}}>
                                    <ThemeSwitch />
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav> 
            </Toolbar>  
        </AppBar>
    )
}
export default NavBar1