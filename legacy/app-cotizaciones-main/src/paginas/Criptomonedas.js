import Criptos from "../components/datacontainer/datacontainer"
import Btcd from "../components/Acciones/CriptoGlobals/criptoGlobals"
const CriptoPage = ()=>{
    return(
        <div style={{marginTop:75}}>
            <Criptos />
            <Btcd/>
        </div>
    )
}
export default CriptoPage