const Action = require("./model.library");
const rsp = require("../../config/resp.json");
const rsp_dt = require("../../config/resp.dt.json");
const global = require('../../helper/global');

var no = 1;

exports.dt = (req, res, obj) => {
  res.setHeader('Content-Type', 'application/json');
  Action.getDt(req,obj,(err, data) => {
    if (err){
      rsp_dt.msg =  err || err.message || "Some error occurred while creating.";
      res.status(500).send(rsp_dt);
    }else{
      if (data) {
          rsp_dt.draw = no++;
          rsp_dt.data = data.data;
          rsp_dt.recordsFiltered = data.data.length;
          rsp_dt.recordsTotal = data.data.length;
          res.status(200).send(rsp_dt);
      }else{
        rsp_dt.msg = "Tidak ada data";
        res.status(404).send(rsp_dt);
      }
    }
  });
};


exports.custom = (req, res, obj) => {

  obj.limit_ = obj.limit;
  if (req.query.limit) {
    obj.limit_ = req.query.limit;
  }

  Action.getCustom(obj,(err, data) => {
    if (err){
      rsp.gagal.msg =  err || err.message || "Some error occurred while creating.";
      res.status(500).send(rsp.gagal);
    }else{
      rsp.sukses.msg = "Berhasil mengambil data";
      rsp.sukses.data = data;
      rsp.sukses.limit = obj.limit_;

      if(data.length > 0){
        if (obj.key_not_null) {
          let validasi = global.filter_not_null(data,'jumlah');
          if (validasi.length > 0) {
              res.send(rsp.sukses);
          }else{
            rsp.gagal.msg = "Tidak ada data yg ditampilkan";
            res.status(400).send(rsp.gagal);
          }
        }else{
          res.send(rsp.sukses);
        }
      }else{
        rsp.gagal.msg = "Tidak ada data yg ditampilkan";
        res.status(400).send(rsp.gagal);
      }
    }
  });
};

// Mencari data berdasarkan id primary dari tabel
exports.findImgCustom = (req,res,obj) => {
  Action.findImgCustom(req,obj, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        rsp.gagal.msg = `Not found with id ${req.params.id}.`;
        res.status(404).send(rsp.gagal);
      } else {
        rsp.gagal.msg =  "Error retrieving data  with id " + req.params.id || err.message || "Some error occurred while creating.";
        res.status(500).send(rsp.gagal);
      }
    } else {
      rsp.sukses.msg = "Berhasil mengambil data";
      rsp.sukses.data = data;
      res.send(rsp.sukses);
    }
  });
};

// Create and Save a new Action
exports.createImgLog = (req, res, obj) => {
  // Validate request
  if (!req.body) {
    rsp.gagal.msg = "Content can not be empty!";
    return res.status(400).send(rsp.gagal);
  }

  // Save Action in the database
  Action.createImgLog(req,obj, (err, data) => {
    if (err){
      rsp.gagal.msg =  err || err.message || "Some error occurred while creating.";
      return res.status(500).send(rsp.gagal);
    }else{
      rsp.sukses.data = data;
      rsp.sukses.msg = "Berhasil menginput data";
      return res.send(rsp.sukses);
    }
  });
};

// Mengubah data
exports.updateImgLog = (req, res, obj) => {
  // Validasi jika request kosong
  if (!req.body) {
   rsp.gagal.msg =  "Content can not be empty!" || err.message || "Some error occurred while creating.";
   res.status(400).send(rsp.gagal);
 }

 Action.updateImgLog(req,obj,(err, data) => {
     if (err) {
       if (err.kind === "not_found") {
         rsp.gagal.msg = `Not found with id ${req.params.id}.`;
         res.status(404).send(rsp.gagal);
       } else {
         rsp.gagal.msg =  "Error updating data  with id " + req.params.id || err.message || "Some error occurred while creating.";
         res.status(500).send(rsp.gagal);
       }
     }else{
       rsp.sukses.msg = "Berhasil update data";
       rsp.sukses.data = data;
       res.send(rsp.sukses);
     }
 });
};

 exports.deleteImgLog = (req, res, obj) => {
  Action.removeImgLog(req,obj, (err, data) => {
    if (err) {
      if (err) {
        if (err.kind === "not_found") {
          rsp.gagal.msg = `Not found with id ${req.params.id}.`;
          res.status(404).send(rsp.gagal);
        } else {
          rsp.gagal.msg =  "Could not delete data with id " + req.params.id || err.message || "Some error occurred while creating.";
          res.status(500).send(rsp.gagal);
        }
      }
    }else{
      rsp.sukses.msg = "Berhasil menghapus data";
      res.send(rsp.sukses);
    };
  });
 };
