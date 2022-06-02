const json = {
    status : false,
    msg : "Gagal"
}

const Interface =  function (data) { 

}

Interface.conv_m3u8_mp4 =  (req, res) => {
    let data;
    let {url, name} = req.body;

    var m3u8ToMp4 = require("m3u8-to-mp4");
    var converter = new m3u8ToMp4();

     converter
    .setInputFile(url)
    .setOutputFile("./assets/video/"+name+".mp4")
    .start()
    .then(() => {
        console.log("File converted");
    });

    data = {
        ...json,
        status : true,
        msg : "Sedang memproses convert m3u8 ke mp4",
        data : req.body
    }
    
    return res.status(200).send(data);
};


// Router
var router = require("express").Router();

// Membuat
router.post("/video/m3u8/mp4", Interface.conv_m3u8_mp4);

// // Menampilkan
// router.get("/assign", Interface.findAll);

// // Menampilkan by id
// router.get("/assign/:id", Interface.findOne);

// // Mengubah by id
// router.put("/assign/:id", Interface.update);

// // Menghapus  by id
// router.delete("/assign/:id", Interface.delete);
  
module.exports = router;

