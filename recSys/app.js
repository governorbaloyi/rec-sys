const express = require('express');
const app = express();
const PORT = 8080;
const DONORSFILE = './data/donors.json';
const fs = require('fs');


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    })
})

const readDonorsJSON = (filename) => {
    let rawdata = fs.readFileSync(filename);
    let data = JSON.parse(rawdata);
    return data;
}

app.get('/api/v1/donors', (req, res) => {
    let data = readDonorsJSON(DONORSFILE);
    let donors = data.donors;

    res.json(donors);
})

const donorsList = () => {
    let data = readDonorsJSON(DONORSFILE);
    let donors = {};

    for (let i = 0; i < data.donors.length; i++) {
        let name = data.donors[i].name;

        donors[name] = data.donors[i];
    }

    return donors;
}

app.get('/api/donors', (req, res) => {
    let donors = donorsList();

    res.json(donors);
})

// Two people to compare their similarity score
const euclideanSimilarity = (name1, name2) => {
    let donors = donorsList();

    let ratings1 = donors[name1];
    let ratings2 = donors[name2];

    let titles = Object.keys(ratings1);
    let i = titles.indexOf('name');
    titles.splice(i, 1)

    let sumOfSquares = 0;
    for (let i = 0; i < titles.length; i++) {
        let title = titles[i];

        let rating1 = ratings1[title];
        let rating2 = ratings2[title];
        if (rating1 != null && rating2 != null) {
            let difference = rating1 - rating2;

            sumOfSquares += difference * difference;
        }
    }

    let distance = Math.sqrt(sumOfSquares);

    let similarity = 1 / (1 + distance);

    return similarity;
}

app.get('/api/similarity/donor1/:donor1/donor2/:donor2', (req, res) => {
    let name1 = req.params.donor1;
    let name2 = req.params.donor2;

    let similarity = euclideanSimilarity(name1, name2);

    res.json({
        similarity
    })
})

const findNearestNeigbors = (name, quantity) => {
    let data = readDonorsJSON(DONORSFILE);

    let similarityScores = {};

    for (let i = 0; i < data.donors.length; i++) {
        let other = data.donors[i].name;
        if (other != name) {
            let similarity = euclideanSimilarity(name, other);
            similarityScores[other] = similarity;
        } else {
            similarityScores[other] = -1;
        }
    }

    data.donors.sort(compareSimilarity);

    function compareSimilarity(a, b) {
        let score1 = similarityScores[a.name];
        let score2 = similarityScores[b.name];

        return score2 - score1;
    }

    let donorsScores = [];

    for (let i = 0; i < quantity; i++) {
        let name = data.donors[i].name;

        donorsScores[i] = { "donor": name, "Score": similarityScores[name] };
    }

    return donorsScores;
}

app.get('/api/v1/donors/:donor/similarities/quantity/:quantity', (req, res) => {
    let donor = req.params.donor;
    let quantity = parseInt(req.params.quantity);

    let donorsScores = findNearestNeigbors(donor, quantity);

    res.json({
        donorsScores
    })
})

app.listen(PORT, () => {
    console.log(`Server started, listening on port: ${PORT}`)
});