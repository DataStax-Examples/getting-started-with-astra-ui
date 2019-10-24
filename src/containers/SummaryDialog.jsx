import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { DialogContentText } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 600,
        backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
}));

export default function SummaryDialog(props) {
    const classes = useStyles();

    return (
        <div>
            <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    <Typography variant="h6">Journey Summary</Typography>
                    {props.handleClose ? (
                        <IconButton aria-label="close" className={classes.closeButton} onClick={props.handleClose}>
                            <CloseIcon />
                        </IconButton>
                    ) : null}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <List dense
                            disablePadding
                            component="nav"
                            className={classes.root}
                        >
                            <ListItem>
                                <ListItemText primary={"Spacecraft Name: " + props.journeyInformation.spacecraft_name} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={"Journey ID: " + props.journeyInformation.journey_id} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={"Read Duration: " + (props.journeyInformation.read_time / 1000).toFixed(2) + " seconds"} />
                            </ListItem>
                            {props.journeyInformation.writeTime && props.journeyInformation.writeTime > 0 &&
                                <ListItem>
                                    <ListItemText primary={"Write Duration: " + (props.journeyInformation.write_time / 1000).toFixed(2) + " seconds"} />
                                </ListItem>
                            }
                            <ListItem>
                                <ListItemText primary="Database Tables Accessed" />
                            </ListItem>
                            <div className={classes.nested}>
                                <List component="div" disablePadding dense>
                                    <ListItem>
                                        <ListItemText primary="spacecraft_journey_catalog: 1 row effected" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="spacecraft_speed_over_time: 1000 row effected" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="spacecraft_location_over_time: 1000 rows effected" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="spacecraft_temperature_over_time: 1000 rows effected" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="spacecraft_pressure_over_time: 1000 rows effected" />
                                    </ListItem>
                                </List>
                            </div>
                        </List>
                        <div style={{ display: "flex" }}>
                            <Button variant="contained" onClick={props.handleClose} color="primary" style={{ marginLeft: "auto", marginRight: "auto" }}>
                                Close
                            </Button>
                        </div>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    )
};