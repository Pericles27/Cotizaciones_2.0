import "./bonos.css";
import { useContext,useState,useEffect } from "react";
import { ThemeContext } from '../../context/ThemeContext'
import BonosArgentinos from "../../API/BonosArgentinos";
import * as React from 'react';
import selector from "../../selector/selector";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CircularProgress } from "@mui/material";


const BonosARG = ()=>{
    const { darkTheme } = useContext(ThemeContext)
    const [Datos, setDatos]= useState()
    // MEP
    const [Mep,setMep] = useState()
    const [Mep1,setMep1] = useState()
    const [Mep2,setMep2] = useState()
    // CCL
    const [CCL,setCCL] = useState()
    const [CCL1,setCCL1] = useState()
    const [CCL2,setCCL2] = useState()

    const mepAL = async(bono1,bono2)=>{
        let a = bono1.ultimoPrecio
        let b = bono2.ultimoPrecio
        let division = a/b
        return (division)
    }

    const filtro= async(response)=>{
        const ret = response.filter((x) => BonosArgentinos.some((y) => y.value === x.simbolo));
        return ret
    }

    const fetchApi = async ()=>{
        
        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        const response = await fetch("https://server-cotizaciones.onrender.com/bonos", requestOptions)
        const resJSON = await response.json()
        const valores = await filtro(resJSON.titulos)
        setDatos(valores)
        

        // Cotizaciones Mep     
        const al30 = valores[0]
        const al30d = valores[2]
        const DM = await mepAL(al30,al30d)
        let precio= DM.toFixed(2)
        setMep(precio)
        const gd30 = valores[3]
        const gd30d = valores[5]
        let DM1 = await mepAL(gd30,gd30d)
        setMep1(DM1.toFixed(2))
        const gd35 = valores[6]
        const gd35d = valores[8]
        let DM2 = await mepAL(gd35,gd35d)
        setMep2(DM2.toFixed(2))

        //Cotizaciones CCL
        const al30c = valores[1]
        const cc1 = await mepAL(al30,al30c)
        let C= cc1.toFixed(2)
        setCCL(C)
        const gd30c = valores[4]
        let C1 = await mepAL(gd30,gd30c)
        setCCL1(C1.toFixed(2))
        const gd35c = valores[8]
        let C2 = await mepAL(gd35,gd35c)
        setCCL2(C2.toFixed(2))
    };

    useEffect(()=>{
        setInterval(() => {
            fetchApi()
        }, 1000)
    },[])

    return(
        <div className="contenido" style={{display:`flex`,flexWrap:`wrap`,width:`100%`}}>
            <div style={{flex: "30%",float: "left",margin:"2.5%"}}>
                <Paper className={`${darkTheme ? 'dark-mode' : ''}`} style={{backgroundColor:`grey`,padding:10,color:`white`}}>
                    <div>
                        <h4 className="titulo">Mep</h4>
                        <p className="numeros">
                            AL30: AR$ <h1 className="num">{!Datos ? 'cargando. . .': Mep}</h1>
                            <br/>
                            GD30: AR$ <h1 className="num">{!Datos ? 'cargando. . .': Mep1}</h1>
                            <br/>
                            GD35: AR$ <h1 className="num">{!Datos ? 'cargando. . .': Mep2}</h1>
                        </p>
                    </div>
                    <div>
                        <h4 className="titulo">CCL</h4>
                        <p className="numeros">
                            AL30: AR$ <h1 className="num">{!Datos ? 'cargando. . .': CCL}</h1>
                            <br/>
                            GD30: AR$ <h1 className="num">{!Datos ? 'cargando. . .': CCL1}</h1>
                            <br/>
                            GD35: AR$ <h1 className="num">{!Datos ? 'cargando. . .': CCL2}</h1>
                        </p>
                    </div>
                </Paper>
            </div>
            <div className={`${darkTheme ? 'dark-mode' : ''}`} style={{flex:"60%",float:"right",margin:"2.5%"}}>
                <div style={{marginBottom:10}}>
                    <h1 className="titulo" style={{float:`left`}}>Bonos Argentinos</h1>
                    <img src={require('../../Flags/Argentina.png')} alt="Argentina flag" style={{height: 25,borderRadius:20,float:`left`}}/>
                </div>
                <TableContainer component={Paper} className={`${darkTheme ? 'dark-mode' : ''}`}>
                    <Table sx={{height:250 }} size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="titulos">Simbolo</TableCell>
                                <TableCell className="titulos" align="right">Ultimo Precio operado</TableCell>
                                <TableCell className="titulos" align="right">Variacion Porcentual</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { !Datos ? <CircularProgress /> : Datos.map((Data) => (
                                <TableRow      
                                    key={ Data.simbolo}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell className="titulos" component="th" scope="row">
                                        {Data.simbolo}
                                    </TableCell>
                                    <TableCell className="num" align="right">{Data.moneda}{Data.ultimoPrecio.toFixed(2)}</TableCell>
                                    <TableCell className={`num ${selector(Data.variacionPorcentual)}`}  align="right">{Data.variacionPorcentual}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}
export default BonosARG