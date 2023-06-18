import { useEffect, useState } from "react";
import { Button, Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { ReactComponent as Logo } from "../cc_logo.svg";
import { useNavigate } from "react-router-dom";
import Slide from "./slide";
function EditPresentationPage() {
    const params = useParams();
    const presentationId = params["uuidPresentation"];
    const [slideLength, setSlideLength] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(3);
    const [slideData, setSlideData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://127.0.0.1:8000/presentation/" + presentationId, {
            method: "GET"
        }).then((res) => {
            return res.json()
        }).then((res) => {
            console.log("Response", res["slides"]);

            setSlideData(res["slides"][currentSlide]);
            setSlideLength(res.slides.length);

        })
    }, [currentSlide])

    function handleClick(event) {
        navigate("/presentation/" + presentationId + "/" + currentSlide);
    }


    const numSlides = new Array(slideLength);
    for (let i = 0; i < 16; i++) {
        numSlides[i] = i;
    }
    console.log("slides num", numSlides);
    console.log("shapess" + slideData["shapes"]);

    return (
        <>
            <Grid container rows={12} spacing={2} sx={{ display: "flex", justifyContent: "center", alignItems: "center", direction: "row" }}>
                <Grid item xs={3}>
                    <Grid container direction="row" sx={{ display: "flex", justifyContent: "flexStart", marginTop: "25px" }}>
                        <Grid item xs={0.783} sx={{ marginLeft: "36px", height: "9.179%" }}>
                            <Logo></Logo>
                        </Grid>
                    </Grid>

                </Grid>

                <Grid item xs={6} ></Grid>
                <Grid item xs={2} sx={{ displau: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button sx={{ font: "Inter", background: "linear-gradient(104.93deg, #A448CF -8.4%, #237BFF 142.92%)" }} onClick={handleClick} variant="contained">Play</Button>
                </Grid>
            </Grid >

            <Grid container rows={12} sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", direction: "row" }}>
                <Grid item xs={3}>
                    <Grid container rows={slideLength} sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "70px" }}>
                        {numSlides.map((num) => (
                            slideData.size === undefined ? null :
                                (slideData.virtual === true) ?
                                    (null) :
                                    (< Grid item xs={slideLength} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }} >
                                        <Button onClick={(event) => setCurrentSlide(num)} variant="outlined">{num}</Button>
                                    </Grid>)
                        ))}
                    </Grid>
                </Grid>
                <Grid xs={8} marginTop="15px">
                    <Grid container rows={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Grid item xs={12}>
                            {(slideData.size === undefined) ? null :
                                (slideData.virtual === true) ?
                                    (setCurrentSlide(currentSlide + 1)) :
                                    (<Slide size={slideData.size} shapes={slideData.shapes}> </Slide>)

                            }
                        </Grid>
                    </Grid>

                </Grid>
            </Grid >




        </>
    );

}
export default EditPresentationPage;
