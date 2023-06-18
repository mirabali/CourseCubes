import { ReactComponent as Logo } from "../cc_logo.svg";
import { Box, Typography, TextField, Button, Grid, RadioGroup, FormControlLabel, Radio, Paper, FormControl, FormLabel, FormGroup, Checkbox } from "@mui/material";
import { useState, setState } from "react";
import isUrl from "is-url";
//import EditPresentationPage from "./edit-presentation-page";
import { useNavigate } from "react-router-dom";


function CreatePresentationPage() {

    var data = {}
    //const [toPresentation, setToPresentation] = useState(false);
    const [textBox, setTextBox] = useState("Paste Content");
    const [promptBox, setPromptBox] = useState("");
    const [featureBox, setFeatureBox] = useState({
        "examples": false,
        "quizzes": false,
        "robotTutor": false,
        "audience": false,
        "presenterNotes": false,
        "examDocument": false
    });
    const featureOptions = ["examples", "quizzes", "robotTutor", "audience", "presenterNotes", "examDocument"];
    //const [id, setId] = useState("");
    var id = "";
    const navigate = useNavigate();
    const { examples, quizzes, robotTutor, audience, presenterNotes, examDocument } = featureBox;


    function handleClick(event) {
        if (isUrl(textBox)) {
            data["url"] = textBox;
        } else {
            data["text"] = textBox;
        }
        data["prompt"] = promptBox;
        data["feature"] = featureBox;
        id = "06045cbc-6de5-4b4f-b316-c0e705-da4e65";
        navigate("/presentation/edit/" + id);
        /*
        res.uuid = "a0373b1f-3585-4810-b77c-ba94e9cf11b3"
        fetch("http://127.0.0.1:8000/presentation/", {
            method: "POST",
            body: JSON.stringify(data)
        }).then(res => res.json()).then(res => {
            console.log("res" + res["uuid"]);
            id = res.uuid;
            console.log("Check" + id + idChecker);
            navigate("/presentation/edit/" + id);
        }).catch((error) => {
            console.error(error);
        })
        */

    }

    function handleFeatures(event) {
        setFeatureBox({
            ...featureBox,
            [event.target.name]: event.target.checked,
        });
        console.log("yay", featureBox);
    }


    //1440: width
    //1024: height
    //1.475 --> write your prompt

    return (
        <>
            <Grid container rowSpacing={1} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Grid item xs={0.783} sx={{ marginTop: "25px", display: "flex", justifyContent: "flex-start" }}>
                    <Grid item xs={12} sx={{ marginLeft: "36px", height: "9.179%" }}>
                        <Logo></Logo>
                    </Grid>
                </Grid>
                <Grid item xs={11.217} sx={{ marginTop: "25px", display: "flex", justifyContent: "center", direction: "row" }}>
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                        <Typography sx={{ font: "Inter", fontStyle: "normal", fontWeight: 600, fontSize: "50px" }}>Let's Create Your Course</Typography>
                    </Grid>

                </Grid>

                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flexStart" }}>
                    <Typography sx={{ marginLeft: "198px", font: "Inter", fontStyle: "normal", fontWeight: 600, fontSize: "20px", height: "22.6%" }}>Write Your Prompt</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flexStart" }}>
                    <TextField sx={{ marginLeft: "198px", height: "57px", width: "74%" }} id="outlined-basic" onChange={(event) => { setPromptBox(event.target.value) }}></TextField>
                </Grid>
                <Grid item xs={12} sx={{ marginTop: 2, display: "flex", justifyContent: "flexStart" }}>
                    <Typography sx={{ marginLeft: "198px", font: "Inter", fontStyle: "normal", fontWeight: 600, fontSize: "20px", height: "22.6%" }}>Paste Content</Typography>
                </Grid>
                <Grid item xs={12} sx={{ top: "284px", display: "flex", justifyContent: "flexStart" }}>
                    <TextField sx={{ marginLeft: "198px", width: "74%" }} id="o" defaultValue={textBox} multiline rows={8} onChange={(event) => { setTextBox(event.target.value) }}></TextField>
                </Grid>
                <Grid item xs={12} sx={{ marginTop: 2, display: "flex", justifyContent: "flexStart" }}>
                    <Typography sx={{ marginLeft: "198px", font: "Inter", fontStyle: "normal", fontWeight: 600, fontSize: "20px", height: "22.6%" }}>Features</Typography>
                </Grid>
                <Grid item xs={12} sx={{ top: "706px", display: "flex", justifyContent: "flexStart", height: "30% " }}>

                    <Paper sx={{ marginLeft: "198px", width: "74%" }}>
                        <Grid container marginLeft={5}>
                            {["Include Examples", "Include Test Your Understanding Quizzes", "Create Robot Tutor Video", "Include Audience Questions", "Include Presenter Notes", "Creation Additional Exam Document"].map((label, index) => (
                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "flexStart" }}>
                                    <FormControlLabel
                                        sx={{ marginLeft: "0px" }}
                                        marginLeft={1}
                                        key={index}
                                        name={featureOptions[index]}
                                        checked={featureBox[featureOptions[index]]}
                                        control={<Checkbox />}
                                        onChange={(event) => handleFeatures(event)}
                                        label={label}
                                    />
                                </Grid>
                            ))}
                        </Grid>


                    </Paper>
                </Grid >
                <Grid item xs={1.77} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button sx={{ top: "700px", position: "absolute", width: "182.84px", height: "40px", font: "Inter", background: "linear-gradient(104.93deg, #A448CF -8.4%, #237BFF 142.92%)" }} onClick={handleClick} variant="contained">Generate Slides</Button>
                </Grid>
            </Grid >


        </>
    );
}

export default CreatePresentationPage;
