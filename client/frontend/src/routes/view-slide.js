import { useEffect, useState } from "react";
import { TextField, Accordion, AccordionSummary, Grid, Typography, Button } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams } from "react-router-dom";
import Slide from "./slide"

function ViewSlide() {



    const params = useParams();
    const presentationId = params["uuidPresentation"];
    const slideNum = params["slideNum"];
    const [currentSlide, setCurrentSlide] = useState(slideNum);

    const [slideData, setSlideData] = useState({});



    useEffect(() => {
        fetch("http://127.0.0.1:8000/presentation/" + presentationId, {
            method: "GET"
        }).then((res) => {
            return res.json()
        }).then((res) => {
            setSlideData(res["slides"][currentSlide]);

        })
    }, [currentSlide])





    return (
        <>
            <Grid container row={12} maxHeight="100%" sx={{ position: "relative" }}>
                <Grid item xs={12} maxHeight="100%" sx={{}}>

                    {slideData.size === undefined ? null :

                        <Slide size={slideData.size} shapes={slideData.shapes} > </Slide >

                    }
                </Grid>

                <Grid item xs={12} sx={{ position: "absolute", margin: "2px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Accordion sx={{ height: "50px", width: "200px" }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Notes</Typography>
                        </AccordionSummary>

                        <TextField sx={{ width: "100%" }} multiline rows={10} defaultValue="Please feel free to take any notes on this topic!">

                        </TextField>

                    </Accordion>
                </Grid>

                <Grid item xs={12} sx={{ position: "absolute", right: "2px", margin: "2px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Accordion sx={{ height: "50px", width: "200px" }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Bot</Typography>
                        </AccordionSummary>

                        <TextField sx={{ width: "100%" }} multiline rows={10} defaultValue="Feel free to ask our chatbot any questions ;)">

                        </TextField>

                    </Accordion>


                </Grid>


            </Grid>

        </>


    )
}



export default ViewSlide;
