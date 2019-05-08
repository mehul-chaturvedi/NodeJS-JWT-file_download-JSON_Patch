var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config');
var fastjsonpatch = require('fast-json-patch');
var VerifyToken = require('./verifytoken');
var thumb = require('node-thumbnail').thumb;
var multer = require('multer');
var fs = require('fs');
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('./usermodel');


//login route creating new jwt for user
router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) { return res.status(500).send('Error in server') }
        if (!user) { return res.status(404).send('User not found') }
        if (req.body.pass !== user.password) { res.status(404).send({ auth: false, token: null }) }

        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400
        })


        res.status(200).send({ auth: true, token: token });

    })
})

//logout route responding with null token
router.get('/logout', (req, res) => {
    res.sendDate(200).send({ auth: false, token: null })
})

//registration route generating new jwt
router.post('/register', (req, res) => {
    User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.pass
    }, (err, user) => {
        if (err) {
            res.status(500).send('Prob')
        }

        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400
        })
        res.status(200).send({ auth: true, token: token })
    })



})

//file download and thumbnail creation route
router.post('/file', VerifyToken, (req, res, next) => {

    //verifying the jwt token
    User.findById(req.userId, { password: 0 }, (err, user) => {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");

        if (fs.existsSync('./image')) {
            uploa(req, res)
        } else {
            fs.mkdirSync('image');
            uploa(req, res)
        }


    });
})

function uploa(req, res) {
    //downloading the file using multer
    upload(req, res, (err) => {
        if (err) {
        } else {
            res.json(req.files[0].filename);

            //converting into thumbnail using node-thumbnail
            thumb({
                source: './image/' + req.files[0].filename,
                destination: './image',
                suffix: '_thumb',
                width: 50,
                concurrency: 4
            }, (files, err, stdout, stderr) => {
                console.log('DOne');
            });
        }

    });
}

// storage for multer
var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './image')
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname)

    }
})

//multer function
var upload = multer({ storage: storage }, { limits: { fieldNameSize: 10 } }).any();

//JSON patching route
router.post('/doc', VerifyToken, (req, res) => {
    //verifying the jwt token
    User.findById(req.userId, { password: 0 }, (err, user) => {

        if (err)
            return res.status(500).send("There was a problem finding the user.");
        if (!user)
            return res.status(404).send("No user found.");

        var doc = {
            name: req.body.name,
            age: req.body.age,
            sex: req.body.sex
        }
        // console.log(document, 'doc1')
        var patch = req.body.patch;
        patch = JSON.parse(patch);
        doc = fastjsonpatch.applyPatch(doc, patch).newDocument;
        console.log(doc, 'doc')
    })
})









module.exports = router;