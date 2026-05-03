import "./Home.css"
import { useContext } from "react";
import { ThemeContext } from '../context/ThemeContext';
import Criptos from "../components/datacontainer/datacontainer"
import BonosARG from "../components/bonos/bonos"
import AccionesUSA from "../components/Acciones/AccionesUSA/AccionesUSA"
import AccionesARG from "../components/Acciones/AccionesARG/AccionesARG"
import ADRS from "../components/Acciones/ADRS/ADRS"
const Home = ()=>{
    const { darkTheme } = useContext(ThemeContext)
    return(
        <div className={`contenedor ${darkTheme ? 'dark-mode' : ''}`} style={{height:`fit-content`,paddingBottom:100,minHeight:1000,paddingTop:80}}>
            <div className={"flex-container"} style={{width:`100%`, height:"fit-content",display:`flex`,flexDirection:`row`,flexWrap:`wrap`}}>
                <div style={{flex:"70%",float:`left`,display:`flex`}}>
                    <BonosARG/>
                </div>
                <div style={{flex:"25%",float:`left`,marginBottom:50,display:`flex`}}>
                    <Criptos/>
                </div>
            </div>
            <div className={"flex-container"} style={{width:"100%",display:`flex`,flexDirection:`row`,flexWrap:`wrap`}}>
                <div style={{flex:`33%`,float:"left",margin:`auto`,display:`flex`,marginTop:0}}>
                    `<AccionesARG/>
                </div>
                <div style={{flex:`33%`,float:"left",margin:`auto`,display:`flex`,  flexDirection: `row`,marginTop:0}}>
                    <ADRS/> 
                </div>
                <div style={{flex:`33%`,float:"left",margin:`auto`,display:`flex`,marginTop:0}}>
                    <AccionesUSA/>
                </div>
            </div>
        </div>
    )
}

export default Home