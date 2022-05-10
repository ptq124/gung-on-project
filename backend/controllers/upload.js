const upload = require("../middlewares/uploadFile");
const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;
const baseUrl = "http://localhost:5000/images";
require('dotenv').config();
const connection_string = process.env.CONNECTION_STRING
const url = connection_string;
const mongoClient = new MongoClient(url);

const uploadFiles = async (req, res) => {
    try {
        await upload(req, res);
        console.log(req.file);
        if (req.file == undefined) {
            return res.send({
                message: "You must select a file.",
            });
        }
        return res.send({
            message: "File has been uploaded.",
        });
    } catch (error) {
        console.log(error);
        return res.send({
            message: "Error when trying upload image: ${error}",
        });
    }
};

const getListFiles = async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db("Gung-on_Account_Database");
        const images = database.collection("images" + ".files");
        const cursor = images.find({});
        if ((await cursor.count()) === 0) {
            return res.status(500).send({
                message: "No files found!",
            });
        }
        let fileInfos = [];
        await cursor.forEach((doc) => {
            fileInfos.push({
                name: doc.filename,
                url: baseUrl + doc.filename,
            });
        });
        return res.status(200).send(fileInfos);
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};

const download = async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db("Gung-on_Account_Database");
        const bucket = new GridFSBucket(database, {
            bucketName: "images",
        });
        let downloadStream = bucket.openDownloadStreamByName(req.params.name);
        downloadStream.on("data", function (data) {
            return res.status(200).write(data);
        });
        downloadStream.on("error", function (err) {
            return res.status(404).send({ message: "Cannot download the Image!" });
        });
        downloadStream.on("end", () => {
            return res.end();
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
module.exports = {
    uploadFiles,
    getListFiles,
    download,
};