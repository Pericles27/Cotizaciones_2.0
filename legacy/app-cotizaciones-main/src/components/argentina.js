// import { useContext,useState,useEffect,useRef } from "react";
// import { ThemeContext } from '../context/ThemeContext'
// import * as React from 'react';
// import selector from "../selector/selector";
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';
// const Argentina = ()=>{
//     const { darkTheme } = useContext(ThemeContext)
//     const [Datos, setDatos]= useState([])
//     const clave = ()=>{
//         let myHeaders = new Headers();
//         myHeaders.append("Authorization", `Bearer ${Key}`);
//         myHeaders.append("Cookie", "incap_ses_1450_2793377=png5IQ9Igk9DOv0hrG8fFGgvBmMAAAAAQmzdujtfji4Y5JYpiveuWg==; nlbi_2793377=/63wBUoxCHrMv8xie4qPkwAAAAAQwuwrA61Gx/Kp5/g2Y7RP; visid_incap_2793377=7brB9jqCQjWnW3p/AMTGsv6cA2MAAAAAQUIPAAAAAADXGbOcjiuJJX/k60Q7PQeR; ASP.NET_SessionId=4jj3njl3rr4pv2hebpm1fk30");
//         return myHeaders
//     }
//     const fetchApi = async (Instrumento, Panel)=>{
//         let requestOptions = {
//             method: 'GET',
//             headers: clave(),
//             redirect: 'follow'
//         };
//         const response = await fetch(`https://api.invertironline.com/api/Cotizaciones/${Instrumento}/${Panel}/argentina?panelCotizacion.instrumento=${Instrumento}&panelCotizacion.panel=${Panel}&panelCotizacion.pais=argentina`, requestOptions);
//         const resJSON = await response.json()
//         const dataArray = resJSON.titulos
//         setDatos(dataArray)
//     };
//     const intervalRef = useRef(null);

//     useEffect(() => {
//       // Llama a fetchApi inicialmente
//       fetchApi('bonos', 'todos');
  
//     }, []);
    
//     return(
//         <div style={{paddingTop:100, width:"100%",margin:"auto"}}>
//             <div>
//                 <button onClick={() => fetchApi('opciones', 'de acciones')} type="button" className="btn btn-outline-secondary">Opciones</button>
//                 <button onClick={() => fetchApi('acciones', 'merval')} type="button" className="btn btn-outline-secondary">Acciones</button>
//                 <button onClick={() => fetchApi('bonos', 'todos')} type="button" className="btn btn-outline-secondary">Bonos</button>
//             </div>
//             <div style={{paddingTop:200,width:"66%",margin:"auto"}} >
//             <TableContainer className={`${darkTheme ? 'dark-mode' : ''}`} component={Paper} style={{minHeight:200}}>
//                     <Table sx={{ Width: "33%" }} size="small" aria-label="a dense table">
//                         <TableHead>
//                             <TableRow>
//                             <TableCell className="titulos">Simbolo</TableCell>
//                             <TableCell className="titulos" align="right">Ultimo Precio operado</TableCell>
//                             <TableCell className="titulos" align="right">Variacion Porcentual</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {!Datos ? "Cargando . . .  ": Datos.map((Data) => (
//                                 <TableRow
//                                     key={Data.simbolo}
//                                     sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
//                                 >
//                                     <TableCell className="titulos" component="th" scope="row">{Data.simbolo}</TableCell>
//                                     <TableCell className="num" align="right">{Data.moneda} {Data.ultimoPrecio}</TableCell>
//                                     <TableCell className={`num ${selector(Data.variacionPorcentual)}`}  align="right">{Data.variacionPorcentual}%</TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>    
//             </div>
//         </div>
//     )
// }
// export default Argentina