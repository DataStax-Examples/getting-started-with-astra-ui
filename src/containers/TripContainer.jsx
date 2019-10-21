import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ReactSpeedometer from "react-d3-speedometer";
import Button from '@material-ui/core/Button';
import { Scatter } from 'react-chartjs-2';

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        top: 64,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'black',
        color: 'white'
    },
    grid: {
        position: 'absolute',
        zIndex: 100,
        bottom: 0
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    gauge: {
        padding: theme.spacing(2),
        height: 200,
        border: "solid 1px #585858",
        backgroundColor: "black",
        '& canvas': {
            height: 200,
            width: "100%"
        }
    }
}));

export default function TripContainer(props) {
    const classes = useStyles();
    const [temperatureGauge, setTemperatureGauge] = useState({ min: 0, max: 100, units: "fahrenheit" });
    const [pressureGauge, setPressureGauge] = useState({ min: 90, max: 105, units: "kPa" });
    const [speedGauge, setSpeedGauge] = useState({ min: 20000, max: 40000, units: "km/h" });
    const [currentValues, setCurrentValues] = useState({
        temperature: null,
        pressure: null,
        speed: null,
        location: { x_coordinate: 0, y_coordinate: 0, z_coordinate: 0 },
        index: 0
    });
    const [currentInterval, setCurrentInterval] = useState(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const [data, setData] = useState(props.data);

    function togglePlayback() {
        setCurrentValues({ temperature: null, pressure: null, speed: null, index: 0 });
        setIsPlaying(!isPlaying);
    }

    useEffect(() => {
        setIsPlaying(props.autoPlay);
    }, [props.autoPlay])

    useInterval(() => {
        if (isPlaying && data.temperature
            && currentValues.index < data.temperature.length
            && currentValues.index < data.pressure.length
            && currentValues.index < data.speed.length) {
            var newIndex = currentValues.index + 1;
            setCurrentValues({
                temperature: data.temperature[currentValues.index].temperature.toPrecision(4),
                pressure: data.pressure[currentValues.index].pressure.toPrecision(4),
                speed: data.speed[currentValues.index].speed.toPrecision(7),
                location: data.location[currentValues.index].location,
                index: newIndex
            });
            if (newIndex === data.temperature.length - 1) {
                props.sendMessage("Your Journey is Complete")
            }
        } else {
            setIsPlaying(false);
        }
    }, currentInterval);

    //Set the gauges to a value on playback
    useEffect(() => {
        setData(props.data)
    }, [props.data])


    function useInterval(callback, delay) {
        const savedCallback = useRef();

        // Remember the latest function.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        // Set up the interval.
        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }

    const locationData = {
        labels: ['Scatter'],
        datasets: [
            {
                fill: false,
                backgroundColor: 'green',
                color: 'green',
                pointBorderColor: 'green',
                pointBackgroundColor: 'green',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 7,
                pointHitRadius: 10,
                data: [
                    {
                        x: currentValues.location ? currentValues.location.x_coordinate : 0,
                        y: currentValues.location ? currentValues.location.y_coordinate : 0,
                    }
                ]
            }
        ]
    };

    const optionsCustom = {
        responsive: false,
        maintainAspectRation: false,
        tooltips: {
            mode: 'label'
        },
        elements: {
            line: {
                fill: false
            }
        },
        scales: {
            xAxes: [{
                type: 'linear',
                ticks: {
                    min: 10000,
                    max: 15000,
                    display: false
                },
                display: true,
                gridLines: {
                    color: "green",
                }
            }],
            yAxes: [{
                type: 'linear',
                ticks: {
                    min: 10000,
                    max: 15000,
                    display: false
                },
                display: true,
                gridLines: {
                    color: "green",
                }
            }],
        }
    };

    return (
        <div className={classes.root}>
            {isPlaying &&
                <div className="stars"></div>
            }
            <Grid container spacing={3} className={classes.grid}>
                <Grid item xs>
                    <div className={classes.gauge}>
                        <ReactSpeedometer
                            minValue={temperatureGauge.min}
                            maxValue={temperatureGauge.max}
                            value={currentValues.temperature}
                            currentValueText={"Temperature: ${value} " + temperatureGauge.units}
                            segmentColors={['green', 'limegreen', 'yellow', 'orange', 'red']}
                        />
                    </div>
                </Grid>
                <Grid item xs>
                    <div className={classes.gauge}>
                        <ReactSpeedometer
                            minValue={speedGauge.min}
                            maxValue={speedGauge.max}
                            value={currentValues.speed}
                            currentValueText={"Speed: ${value} " + speedGauge.units}
                            segmentColors={['green', 'limegreen', 'yellow', 'orange', 'red']}
                            style={{
                                border: "solid 1px red"
                            }}
                        />
                    </div>
                </Grid>
                <Grid item xs>
                    <div className={classes.gauge}>
                        <ReactSpeedometer
                            minValue={pressureGauge.min}
                            maxValue={pressureGauge.max}
                            value={currentValues.pressure}
                            currentValueText={"Pressure: ${value} " + pressureGauge.units}
                            segmentColors={['green', 'limegreen', 'yellow', 'orange', 'red']}
                        />
                    </div>
                </Grid>

                <Grid item xs>
                    <div className={classes.gauge} style={{ border: "none", marginTop: -15 }}>
                        <Scatter data={locationData} options={optionsCustom} legend={{ display: false }} height={200} />
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" className={classes.button} onClick={togglePlayback} disabled={!props.data.temperature}>
                        {isPlaying ? "Stop Playback" : "Start Playback"}
                    </Button>
                </Grid>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        {props.currentWriteMessage}
                    </Paper>
                </Grid>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        {props.currentReadMessage}
                    </Paper>
                </Grid>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        Currently Displaying Index: {currentValues.index}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}