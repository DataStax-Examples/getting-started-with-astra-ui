import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import { blue } from '@material-ui/core/colors';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
});

export default function AddJourneyDialog(props) {
    const [spacecraftName, setSpacecraftName] = useState(null);

    function updateSpacecraftName(target) {
        setSpacecraftName(target.currentTarget.value);
    }

    function onLaunch() {
        props.launchJourney(spacecraftName);
        props.handleClose();
    };

    return (
        <div>
            <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Launch a Spacecraft</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the name of the Spacecraft you would like to send on a journey:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Spacecraft Name"
                        type="text"
                        fullWidth
                        required
                        onChange={updateSpacecraftName}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.handleClose} color="primary">
                        Cancel
          </Button>
                    <Button variant="contained" onClick={onLaunch} color="primary">
                        Launch
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
};