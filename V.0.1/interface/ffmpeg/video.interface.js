const assets = "./assets/video/"
const assets_ = "/video/"
const json = {
    status : false,
    msg : "Gagal"
}

const Interface =  function (data) { 

}

const conv_mp4_webm = (from, to) => {
    let ffmpeg = require("fluent-ffmpeg");
    return new Promise((resolve, reject) => {   
        ffmpeg(from).videoCodec('libvpx') //libvpx-vp9 could be used too
        .videoBitrate(1000, true) //Outputting a constrained 1Mbit VP8 video stream
        .outputOptions(
                '-minrate', '1000',
                '-maxrate', '1000',
                '-threads', '3', //Use number of real cores available on the computer - 1
                '-flags', '+global_header', //WebM won't love if you if you don't give it some headers
                '-psnr') //Show PSNR measurements in output. Anything above 40dB indicates excellent fidelity
        .on('progress', function(progress) {
            console.log('Processing: ' + progress.percent + '% done');
        })
        .on('error', function(err) {
            console.log('An error occurred: ' + err.message);
            reject(false)
        })
        .on('end', function(err, stdout, stderr) {
            console.log(stdout);
            console.log('Processing finished.');
            var regex = /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/
            var psnr = stdout.match(regex);
            console.log('This WebM transcode scored a PSNR of: ');
            console.log(psnr[4] + 'dB');
            resolve(true);
         })
        .save(assets+to+'.webm');
    });
}

Interface.conv_mp4_webm = async (req, res) => {

    let {url, name} = req.body;
    try {
        let s = await conv_mp4_webm(url,name);
        if (s) {
            data = {
                ...json,
                status : true,
                msg : "Berhasil menconvert file dari mp4 ke webm",
                data : {...req.body, result_file : assets_+name+'.webm'}
            }
            return res.status(200).send(data);
        }else{
            data = {...json, msg : "terjadi kegagalan dalam menconvert file mp4 ke webm"}
            return res.status(500).send(data);
        }
         
    } catch (error) {
        return res.status(500).send(data)
    }
};

Interface.conv_m3u8_mp4 = async  (req, res) => {
    let data;
    let {url, name} = req.body;

    var m3u8ToMp4 = require("m3u8-to-mp4");
    var converter = new m3u8ToMp4();
    let to_file = assets+name+".mp4";

     await converter
    .setInputFile(url)
    .setOutputFile(to_file)
    .start()
    .then(() => {
        console.log("File converted");
        Interface.conv_mp4_webm(req,res,to_file,name).then( x => console.log(x));
    });

    data = {
        ...json,
        status : true,
        msg : "Sedang memproses convert m3u8 ke mp4",
        data : {...req.body, result_file : assets_+name+'.mp4'}
    }
    
    return res.status(200).send(data);
};

Interface.conv_m3u8_webm = async (req, res) => {
    let data = {};
    let {url, name} = req.body;

    var m3u8ToMp4 = require("m3u8-to-mp4");
    var converter = new m3u8ToMp4();
    let to_file = assets+name+".mp4";

    try {
        await converter
        .setInputFile(url)
        .setOutputFile(to_file)
        .start()
        .then(async () => {
            console.log("Membuatkan file mp4 untuk dapat di export ke webm");
            try {
                let s = await conv_mp4_webm(to_file,name);
                if (s) {
                    data = {
                        ...json,
                        status : true,
                        msg : "Berhasil menconvert file dari m3u8 ke webm",
                        data : {url : url, name : name, result_file : assets_+name+'.webm'}
                    }
                    return res.status(201).send(data);
                }else{
                    data = {...json, msg : "terjadi kegagalan dalam menconvert file m3u8 ke webm"}
                    return res.status(500).send(data);
                }
            } catch (error) {
                return res.status(500).send(error)
            }
        });
        
    } catch (error) {
        return res.status(404).send({...json, msg : 'file yang akan di convert tidak ditemukan'});
    }
    
};


// Router
var router = require("express").Router();

// Membuat
router.post("/video/m3u8/mp4", Interface.conv_m3u8_mp4);
router.post("/video/m3u8/webm", Interface.conv_m3u8_webm);
router.post("/video/mp4/webm", Interface.conv_mp4_webm);

// // Menampilkan
// router.get("/assign", Interface.findAll);

// // Menampilkan by id
// router.get("/assign/:id", Interface.findOne);

// // Mengubah by id
// router.put("/assign/:id", Interface.update);

// // Menghapus  by id
// router.delete("/assign/:id", Interface.delete);
  
module.exports = router;

