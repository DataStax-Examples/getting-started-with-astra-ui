import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ReactSpeedometer from "react-d3-speedometer";
import Button from '@material-ui/core/Button';

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
}));

export default function TripContainer(props) {
    const classes = useStyles();
    const [temperatureGauge, setTemperatureGauge] = useState({ min: 0, max: 100, units: "fahrenheit" });
    const [pressureGauge, setPressureGauge] = useState({ min: 90, max: 105, units: "kPa" });
    const [speedGauge, setSpeedGauge] = useState({ min: 20000, max: 40000, units: "km/h" });
    const [currentValues, setCurrentValues] = useState({ temperature: null, pressure: null, speed: null, index: 0 });
    const [currentInterval, setCurrentInterval] = useState(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const [data, setData] = useState(props.data);

    function togglePlayback() {
        setCurrentValues({ temperature: null, pressure: null, speed: null, index: 0 });
        setIsPlaying(!isPlaying);
    }

    useInterval(() => {
        if (isPlaying && data.temperature
            && currentValues.index < data.temperature.length
            && currentValues.index < data.pressure.length
            && currentValues.index < data.speed.length) {
            var newIndex = currentValues.index + 1;
            setCurrentValues({
                temperature: data.temperature[currentValues.index].temperature,
                pressure: data.pressure[currentValues.index].pressure,
                speed: data.speed[currentValues.index].speed,
                index: newIndex
            });
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

    return (
        <div className={classes.root}>
            {isPlaying &&
                <div class="stars"></div>
            }
            <Grid container spacing={3} className={classes.grid}>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        <ReactSpeedometer
                            minValue={temperatureGauge.min}
                            maxValue={temperatureGauge.max}
                            value={currentValues.temperature}
                            currentValueText={"Temperature: ${value} " + temperatureGauge.units}
                            segmentColors={['green', 'limegreen', 'yellow', 'orange', 'red']}
                        />
                    </Paper>
                </Grid>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        <ReactSpeedometer
                            minValue={speedGauge.min}
                            maxValue={speedGauge.max}
                            value={currentValues.speed}
                            currentValueText={"Speed: ${value} " + speedGauge.units}
                            segmentColors={['green', 'limegreen', 'yellow', 'orange', 'red']}
                        />
                    </Paper>
                </Grid>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        <ReactSpeedometer
                            minValue={pressureGauge.min}
                            maxValue={pressureGauge.max}
                            value={currentValues.pressure}
                            currentValueText={"Pressure: ${value} " + pressureGauge.units}
                            segmentColors={['green', 'limegreen', 'yellow', 'orange', 'red']}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Button variant="contained" className={classes.button} onClick={togglePlayback} disabled={!props.data.temperature}>
                            {isPlaying ? "Stop" : "Start"}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}