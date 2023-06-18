import { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { ReactComponent as Logo } from "../cc_logo.svg";
import Slide from "./slide";
import { DocumentFullScreen } from "@chiragrupani/fullscreen-react";

function ViewSlide() {

    const [currentSlide, setCurrentSlide] = useState(0);
    //const [fullScreen, setFullScreen] = useState(false);

    const params = useParams();
    const presentationId = params["uuidPresentation"];

    const [slideData, setSlideData] = useState({});



    useEffect(() => {
        fetch("http://127.0.0.1:8000/presentation/" + presentationId, {
            method: "GET"
        }).then((res) => {
            return res.json()
        }).then((res) => {
            //console.log("Response", res["slides"]);
            //setPresentationData(res);
            setSlideData(res["slides"][currentSlide]);


        })
    }, [])


    return (
        <>

            {slideData.size === undefined ? null :

                <Slide size={slideData.size} shapes={slideData.shapes} > </Slide >

            }

        </>


    )
}


export default ViewSlide;
