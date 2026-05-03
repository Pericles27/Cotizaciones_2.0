const selector = (x)=>{
    if (x > 0) {
        return "sube"
    } else if (x === 0){
        return "gris"
    } else if (x < 0){
        return "baja"
    }
}
export default selector