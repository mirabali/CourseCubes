import { ReactComponent as Logo } from "../cc_logo.svg";
import { Box, Typography, TextField, Button, Grid, RadioGroup, FormControlLabel, Radio, Paper, FormControl, FormLabel } from "@mui/material";
import { useState } from "react";
import isUrl from "is-url";
//import EditPresentationPage from "./edit-presentation-page";
import { useNavigate } from "react-router-dom";


function CreatePresentationPage() {

    var data = {}
    //const [toPresentation, setToPresentation] = useState(false);
    const [textBox, setTextBox] = useState("Paste Content");
    const [promptBox, setPromptBox] = useState("");
    const [featureBox, setFeatureBox] = useState("");
    //const [id, setId] = useState("");
    var id = "";
    var idChecker = false;
    const navigate = useNavigate();

    function handleClick(event) {
        if (isUrl(textBox)) {
            data["url"] = textBox;
        } else {
            data["text"] = textBox;
        }
        data["prompt"] = promptBox;
        data["feature"] = featureBox;
        id = "aea7580d607b42369bc406902b88f40a";
        navigate("/presentation/edit/" + id);

    }


    return (
        <>
            <Grid item xs={8}>

                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "42px" }}>
                    <Logo width="105px" height="103.88px"></Logo>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography sx={{ font: "Inter", fontStyle: "normal", fontWeight: 600, fontSize: "50px", width: "41.6%", height: "16.2%", postiion: "relative" }}>Let's Create Your Course</Typography>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginLeft: "198px" }}>
                    <Typography sx={{ font: "Inter", fontStyle: "normal", fontWeight: 600, fontSize: "20px", lineHeight: "24px", position: "absolute", top: "232px", width: "177px" }}>Write Your Prompt</Typography>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TextField sx={{ left: "198px", top: "264px", position: "absolute", right: "198px", height: "57px" }} id="outlined-basic" onChange={(event) => { setPromptBox(event.target.value) }}></TextField>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginLeft: "198px" }}>
                    <Typography sx={{ font: "Inter", fontStyle: "normal", fontWeight: 600, fontSize: "20px", lineHeight: "24px", position: "absolute", top: "341px", width: "138px" }}>Paste Content</Typography>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TextField sx={{ left: "198px", top: "373px", position: "absolute", right: "198px", height: "284px" }} id="o" defaultValue={textBox} multiline rows={11} onChange={(event) => { setTextBox(event.target.value) }}></TextField>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginLeft: "198px" }}>
                    <Typography sx={{ font: "Inter", fontStyle: "normal", fontWeight: 600, fontSize: "20px", lineHeight: "24px", position: "absolute", top: "677px", width: "85px" }}>Features</Typography>
                </div>
                <div style={{ position: "absolute", top: "706px", left: "198px", right: "198px", height: "166px" }}>
                    <Paper sx={{ p: 2 }}>
                        <FormControl sx={{ display: "flex", justifyContent: "space-evenly", flexDirection: "column" }}>
                            <RadioGroup
                                name="spacing"
                                aria-label="spacing"
                                row={true}
                                sx={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row" }}

                            >
                                {["Include Examples", "Include Test Your Understanding Quizzes", "Create Robot Tutor Video"].map((value) => (
                                    <FormControlLabel
                                        key={value}
                                        value={value}
                                        control={<Radio />}
                                        label={value}
                                    />
                                ))}
                            </RadioGroup>
                            <RadioGroup
                                name="spacing"
                                aria-label="spacing"
                                row={true}
                                sx={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row" }}

                            >
                                {["Include Audience Questions", "Include Presenter Notes", "Creation Additional Exam Document"].map((value) => (
                                    <FormControlLabel
                                        key={value}
                                        value={value}
                                        control={<Radio />}
                                        label={value}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                </div >
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button sx={{ top: "885px", position: "absolute", width: "212.84px", height: "60px", font: "Inter", background: "linear-gradient(104.93deg, #A448CF -8.4%, #237BFF 142.92%)" }} onClick={handleClick} variant="contained">Generate Slides</Button>
                </div>
            </Grid>
        </>
    );
}

export default CreatePresentationPage;
