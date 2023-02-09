const express = require('express')
const url = require('url')
const axios = require('axios')

const ROUTE = express.Router()

const codes = new Map()
codes.set('ERR_BAD_REQUEST', 401)

function GetOriginTimestamp(input) {
    return input[0].timestamp
}

ROUTE.get('/', (req,res) => {
    res.json('Base Route')
})

ROUTE.get('/dhl/', (req,res) => {
    res.status(400).json(`Missing Tracking Information`)
})

ROUTE.get('/dhl/:tracking', (req,res) => {
    console.log('/dhl/:tracking')
    const options = {
        method: 'GET',
        url: 'https://api-eu.dhl.com/track/shipments',
        params: {trackingNumber: req.params.tracking},
        headers: {'DHL-API-Key': ''}
    }

    axios.request(options).then((r) =>{
        /** Data Object for lookup DHL
         *  Tracking_Number => r.data.shipments[0].id
         *  - Validates the searched package. Can be used in update task to correctly insert data
         *  - without preforming a lookup again
         * 
         *  Origin => r.data.shipments[0].origin.address.addressLocality
         *  - Receive the incoming location of the package.
         *  - Not a timestamp event, only location data
         * 
         *  Origin_Time => GetOriginTimestamp(r.data.shipments[0].events.slice(-1))
         *  - Have to find the last element of the events array and return the 
         *  - timestamp of the event.  This will relate to Origin event
         * 
         *  Status => r.data.shipments[0].status.status
         *  - Current status of the package.
         * 
         *  Status_Time => r.data.shipments[0].status.timestamp
         *  - Current timestamp of the most recent action 
         */
        let data = {
            Tracking_Number: r.data.shipments[0].id,
            Origin: r.data.shipments[0].origin.address.addressLocality,
            Origin_Time: GetOriginTimestamp(r.data.shipments[0].events.slice(-1)),
            Status: r.data.shipments[0].status.status,
            Status_Time: r.data.shipments[0].status.timestamp
        }
        res.json(data)
    }).catch((e) => {
        res.json({'CODE': e.code, 'STATUS': e.message})
    })
})
module.exports = ROUTE

/*
let records = []
        r.data.shipments.forEach(part => {
            let record = {
                tracking: part.id,
                originTime: new Date(part.events[0].timestamp),
                deliveryTime: null,
            }

            part.events.forEach(event => {
                event.description == 'Delivered' ? record.deliveryTime = event.timestamp : null
                record.originTime > new Date(event.timestamp) ? record.originTime = new Date(event.timestamp) : null
            })

            records.push(record)
        })
        res.json(records)
*/