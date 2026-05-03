import { useContext,useState,useEffect } from "react";
import { ThemeContext } from '../../../context/ThemeContext'
const Btcd = ()=>{
    const { darkTheme } = useContext(ThemeContext)
    const [Acc, setAcc]= useState()
    
    const fetchApi = async ()=>{
        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        const response = await fetch("https://server-cotizaciones.onrender.com/CriptoData", requestOptions)
        const resJSON = await response.json()
        const valores = resJSON.data
        setAcc(valores)
    };
    useEffect(()=>{
        setInterval(() => {
            fetchApi()
        }, 20000)
    },[])
    const bitcoinD = Acc.btc_dominance
    const bitcoinD24 = Acc.btc_dominance_24h_percentage_change

    return(
        <div>
            <h1>Dominancia de bitcoin: {bitcoinD}%</h1>
            <p>Ultimas 24 hs: {bitcoinD24}</p>
        </div>
    )
}
export default Btcd