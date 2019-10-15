import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        top: 64,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'black',
        color: 'white'
    },
});

export default function TripContainer(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {JSON.stringify(props.data)}
        </div>
    );
}