const decimales = (x)=>{
    if (x<=1){
        return(Number(x).toFixed(4))
    } else if (x<10 && x > 1){
        return(Number(x).toFixed(3))
    } else if (x>=10 && x<50){
        return(Number(x).toFixed(2))
    } else if (x>50 && x<100){
        return(Number(x).toFixed(1))
    } else if (x>100){
        return(Number(x).toFixed(0))
    }
}
export default decimales