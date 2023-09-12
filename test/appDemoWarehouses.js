//Establish 5 servers in ports 6000-6004 with one route /offer/new in each server

const express = require('express');
const serviceAccount = require("../services/Account");
const axios = require("axios");

const startServer = (port) => {
    const app = express();
    let data = [];

    // Define the /offer/new route
    app.get('/offer/new', (req, res) => {
        try {
            // Add the request query parameter offer to the data array separate for each server
            data[port - 6000] = JSON.parse(req.query.offer);
            //Log in magenta color the port and offer
            console.log('\x1b[35m%s\x1b[0m', `Server on port ${port} received offer: ${JSON.stringify(req.query.offer)}`);
            setTimeout(async () => {
                //Make http request using axios to confirm or reject offer of the package
                //Random if
                try{
                    // let response = await axios.get("http://localhost:3000" + "/offer/accept", {
                    //     params: {
                    //         offer: data[data.length - 1]
                    //     }
                    // });
                    let response = await axios.get("http://localhost:3000" + "/offer/reject", {
                        params: {
                            offer: data[data.length - 1]
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            }, 1000);
            res.status(200).json("Offer received");
        } catch (e) {
            res.status(400).json(e);
        }
    });

    // Define the /offer/get route
    app.get('/offer/get', (req, res) => {
        // Send the data array of specific server
        res.send(data[port - 6000]);
    });

    // Start the server
    app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`);
    });
};

// Ports for the 5 servers
const ports = [6000, 6001, 6002, 6003, 6004];

ports.forEach(startServer);
