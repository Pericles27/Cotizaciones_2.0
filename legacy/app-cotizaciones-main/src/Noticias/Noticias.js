import { useState,useEffect } from "react";
const Noticias =  ()=>{
    const [News, setNews]= useState()
    const fetchApi = async ()=>{
		let requestOptions = {
			method: 'GET',
            redirect: 'follow'
		};
        const response = await fetch("https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=1450866097294061968dc37e0aea40a4", requestOptions)
        const resJSON = await response.json()
        const N = await resJSON.articles
        setNews(N)
        console.log(N)
    };
	useEffect(()=>{
        fetchApi()
    },[])
    return(
        <div style={{width:`100%`,display:`flex`,flexDirection:`row`,justifyContent:`center`,alignContent:`space-between`,flexWrap:`wrap`}}>
            { !News ? "cargando ": News.map((Data) => (
                <div style={{display:`flex`,margin:`1%`,flex:`40%`,border:`black solid 1px`,padding:`2%`}}>
                    <div style={{flex:`100%`}}>
                        <h4 style={{flex:`100%`,fontSize:20}}>
                            <a style={{flex:`100%`,fontSize:20,textDecoration:`none`,color:`inherit`}} href={`${Data.url}`}>{Data.title} </a>
                        </h4>
                        <div style={{flex:`45%`}}>
                            <img src={`${Data.urlToImage}`} style={{height:150}}></img>
                            <p style={{width:`50%`,float:`right`}}>{Data.description}</p>
                        </div>
                        <p style={{fontWeight:`bold`}}>{Data.source.name}</p>
                    </div>
                </div>

            ))}
        </div>
    )
}
export default Noticias