import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MuiTreeView from 'material-ui-treeview';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        maxWidth: 400,
    },
});

export default function Journeys(props) {
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    function getJourneysForSpacecraft(spacecraft_name) {
        var items = [];
        var journeys = props.spacecraft.filter(s => s.spacecraft_name === spacecraft_name);
        journeys.map((value, index) => {
            var date = new Date(value.start);
            items.push({ id: spacecraft_name + "|" + date.getTime(), value: date.toLocaleDateString(), data: value });
        })
        return items;
    }

    function getJourneyReadings(node) {
        props.fetchJourney(node.data.spacecraft_name, node.data.journey_id)
        props.onClose();
    }

    var names = [...new Set(props.spacecraft.map(item => item.spacecraft_name))];
    var tree = [];
    names.forEach(n => {
        var nodes = getJourneysForSpacecraft(n);
        tree.push({ value: n, nodes: nodes })
    })
    return (
        <List
            component="nav"
            className={classes.root}
            dense
        >
            <ListItem button onClick={handleClick}>
                <ListItemText primary={"Replay Journey"} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <MuiTreeView tree={tree}
                    onLeafClick={getJourneyReadings}
                    expansionPanelSummaryProps={{ style: { minHeight: 20, height: 25 } }}
                    expansionPanelDetailsProps={{ style: { marginLeft: 15 } }}
                />
            </Collapse>
        </List>

    );
}