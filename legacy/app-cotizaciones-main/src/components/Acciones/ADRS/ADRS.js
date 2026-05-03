import "../../bonos/bonos.css"
import { useContext,useState,useEffect } from "react";
import { ThemeContext } from '../../../context/ThemeContext';
import * as React from 'react';
import { CircularProgress } from "@mui/material";
import selector from "../../../selector/selector";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const ADRS = ()=>{
    const [Adr, setAdr]= useState()
    const { darkTheme } = useContext(ThemeContext)

    const fetchApi = async ()=>{
        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        const response = await fetch("https://server-cotizaciones.onrender.com/adrs", requestOptions)
        const resJSON = await response.json()
        const Respuesta = resJSON.titulos
        setAdr(Respuesta)
    };
    useEffect(()=>{
        setInterval(() => {
            fetchApi()
        }, 1000)
    },[])

    return(
        <div className={`contenido ${darkTheme ? 'dark-mode' : ''}`} style={{width:`90%`,margin:`auto`,marginTop:0}}>
            <div className={`${darkTheme ? 'dark-mode' : ''}`} >
                <h1 style={{fontFamily: "american typewriter, sans-serif",fontSize:25,margin:0,padding:0,marginRight:10,float:`left`}}>ADRs</h1>
                <img src={require('../../../Flags/Argentina.png')} alt="Argentina flag" style={{height: 25,borderRadius:20,float:`left`}}/>
                <img src={require('../../../Flags/USA.png')} alt="The United States Of America flag" style={{height: 25,margin:`auto`,borderRadius:20,float:`left`}}/>
            </div>
            <TableContainer className={`${darkTheme ? 'dark-mode' : ''}`} component={Paper} style={{minHeight:200}}>
                <Table sx={{ Width: `%33` }} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                        <TableCell className="titulos">Simbolo</TableCell>
                        <TableCell className="titulos" align="right">Ultimo Precio operado</TableCell>
                        <TableCell className="titulos" align="right">Variacion Porcentual</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    { !Adr ? <CircularProgress /> : Adr.map((Data) => (
                        <TableRow
                            key={ Data.simbolo}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell className="titulos" component="th" scope="row">
                            { Data.simbolo}
                            </TableCell>
                            <TableCell className="num" align="right">{Data.moneda} {Data.ultimoPrecio}</TableCell>
                            <TableCell className={`num ${selector(Data.variacionPorcentual)}`}  align="right">{Data.variacionPorcentual}%</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>     
        </div>
    )
}
export default ADRS