import "./datacontainer.css"
import { useEffect, useState,useContext} from "react"
import { ThemeContext } from '../../context/ThemeContext'
import symbols from "../../API/symbols"
import * as React from 'react';
import decimales from "../../selector/criptoDetalle";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
const Criptos = ()=>{
    const url= 'https://api.binance.com/api/v3/ticker/price'
    const [data, setData]= useState()
    const { darkTheme } = useContext(ThemeContext)
    const fetchApi = async ()=>{
      const response = await fetch(url)
      const responseJSON = await response.json()
      const valores = await filtro(responseJSON)
      setData(valores)
    }
    useEffect(()=>{
        setInterval(() => {
            return(fetchApi())
        }, 1000)
    },[])
    const filtro= async(responseJSON)=>{
        const ret = responseJSON.filter((x) => symbols.some((y) => y.value === x.symbol));
        return ret
    }
    return(
      <div className={`container ${darkTheme ? 'dark-mode' : ''}`} style={{width:`90%`,margin:`auto`,minHeight: 415}}>
          <h1 className="titulo" style={{marginBottom:10,float:`left`}}>Criptomonedas </h1>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Binance_logo.svg/2560px-Binance_logo.svg.png" alt="Binance Logo" style={{height: 25,margin:`auto`,float:`left`}}/>
          <div className="contenido">
              { !data ? 'cargando. . .': 
                <TableContainer className={`${darkTheme ? 'dark-mode' : ''}`} component={Paper}>
                  <Table sx={{ Width:`%33` }} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell className="titulos">Simbolo</TableCell>
                        <TableCell className="titulos" align="right">Precio</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((Data,index) => (
                        <TableRow
                          key={ index}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell className="titulos" component="th" scope="row">
                            { Data.symbol}
                          </TableCell>
                          <TableCell className="num" align="right">{decimales(Data.price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              }
          </div>
      </div>
    )
}
export default Criptos