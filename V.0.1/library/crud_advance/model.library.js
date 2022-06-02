const db = require("../../config/db.query");
const global = require('../../helper/global');
const dt = require('../../datatable/views');
const fs = require('fs')

// constructor
const Model = function(data) {
   
};


Model.getCustom = (obj,result ) => {
    
    let db_client = global.pilih_db();
    let w = [];
    let o = [];
    let v = [];
    let k = [];
    let join = [];
    
    let query = `SELECT ${obj.custom_select} FROM ${obj.tabel}`;

    w = obj.custom_where.filter(e => {
        return e != ''
    });

    o = obj.custom_option.filter(e => {
        return e != ''
    });

    join = obj.custom_join.filter(e => {
        return e != ''
    });

    if (join.length != 0) {
        query += ` ${join.join(' ')}`;
    }

    if (obj.filter) {
        let m =  global.filter_obj(obj.filter);
        let no = 1;
        for (const key in m) {
            if (Object.hasOwnProperty.call(m, key)) {
                const element = m[key];
                console.log(element)
                k.push(key+' = $'+no);
                v.push(element)
            }

            no++;
        }
        
        if (v.length != 0) {
            query += ` WHERE ${k.join(' AND ')}`;
        }
    }

    if (w.length != 0) {
        query += ` WHERE ${w.join(' AND ')}`;
    }

    if (o.length != 0) {
        query += ` ${o.join(' ')}`;
    }

    db_client.query(query,v,(err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        
        result(null, res.rows);
    });
};

Model.findImgCustom = (req,obj, result) => {
    
    let db_client = global.pilih_db();
    let w = [];
    let w2 = [];
    let o = [];
    let o2 = [];
    let v = [];
    let v2 = [];
    let join = [];
    
    let query = `SELECT ${obj.custom_select} FROM ${obj.tabel}`;
    let query2 = `SELECT ${obj.custom_select2} FROM ${obj.tabel_img}`;

    w = obj.custom_where.filter(e => {
        return e != ''
    });

    v = obj.custom_value.filter(e => {
        return e != ''
    });

    v2 = obj.custom_value2.filter(e => {
        return e != ''
    });

    o = obj.custom_option.filter(e => {
        return e != ''
    });

    w2 = obj.custom_where2.filter(e => {
        return e != ''
    });

    o2 = obj.custom_option2.filter(e => {
        return e != ''
    });

    join = obj.custom_join.filter(e => {
        return e != ''
    });

    if (join.length != 0) {
        query += ` ${join.join(' ')}`;
    }

    if (w.length != 0) {
        query += ` WHERE ${w.join(' AND ')}`;
    }

    if (w2.length != 0) {
        query2 += ` WHERE ${w2.join(' AND ')}`;
    }

    if (o.length != 0) {
        query += ` ${o.join(' ')}`;
    }

    if (o2.length != 0) {
        query2 += ` ${o2.join(' ')}`;
    }

    db_client.query(query,v, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.rowCount > 0) {
            db_client.query(query2,[res.rows[0][v2]], (erri, resi) =>{ 
                var rslt = { files : resi.rows, ...res.rows[0]}
                console.log("found: ", rslt);
                result(null, rslt);
                return;
            })
        }else {
            result({ kind: "not_found" }, null);
        }
    });
};

Model.createImgLog = (req,obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    // obj.tabel = obj.tabel.split(' ')[0];
    // obj.tabel_log = obj.tabel_log.split(' ')[0];
    // obj.tabel_img = obj.tabel_img.split(' ')[0];
    let status_ins = true;
    if (!obj.post_required.length) {
        for (const key in obj.post_required) {
            if (Object.hasOwnProperty.call(obj.post_required, key)) {
                const e = obj.post_required[key];
                if (!e[0]) {
                    result(e[1],null);
                    return;
                }
            }
        }
    }

    if (!obj.post_validate.length) {

        let k = [];
        let v = [];

        let no = 1;
        for (const key in obj.post_validate) {
            if (Object.hasOwnProperty.call(obj.post_validate, key)) {
                const e = obj.post_validate[key];
                if (e) {
                    k.push(key+' = $'+no);
                    v.push(e)
                }
            }
            no++;
        }

        if (v.length > 0) {
             global.check_value(obj.tabel,k.join(' AND '),v).then(x => {
                if (x.rowCount > 0) {
                    result(obj.post_validate_msg,null);
                    status_ins = false;
                }else{
                    db_client.query(`INSERT INTO ${obj.tabel}(${Object.keys(obj.data).join(',')}) VALUES(${global.each_arr_num(Object.entries(obj.data).length,'$').join(',')}) RETURNING rowid`, Object.values(obj.data), (err, res) => {
                        let did = `${obj.data_id_log}`;
                        if (req.files.length > 0) {
                            for(var i=0;i<req.files.length;i++){
                                var img = { upload_file : req.files[i].filename,keterangan : req.body.keterangan_image[i],  ...obj.data_img }
                                db_client.query(`INSERT INTO ${obj.tabel_img}(${Object.keys(img).join(',')})  VALUES(${global.each_arr_num(Object.entries(img).length,'$').join(',')})`, Object.values(img));
                            }
                        }
                        const log = { action_log: 'INSERT', ...obj.data_log }
                        db_client.query(`INSERT INTO ${obj.tabel_log}(${Object.keys(log).join(',')}) VALUES(${global.each_arr_num(Object.entries(log).length,'$').join(',')})`, Object.values(log), (err, res) => {
                            if (err) {
                              console.log("error: ", err);
                              result(err, null);
                              return;
                            }
                        
                            result(null, { id: res.insertId, ...obj.data });
                        })
                      });
                }
            }).catch(e => {
                result(e, null);
            });
        }else{
            db_client.query(`INSERT INTO ${obj.tabel} SET ?`, obj.data, (err, res) => {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                  return;
                }
            
                result(null, { id: res.insertId, ...obj.data });
              });
        }
    }
    
};

Model.updateImgLog = (req,obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    // obj.tabel = obj.tabel.split(' ')[0];
    // obj.tabel_log = obj.tabel_log.split(' ')[0];
    let m =  global.filter_obj(obj.data);
    let k = [];
    let v = [];
    let no = 1;
    for (const key in m) {
        if (Object.hasOwnProperty.call(m, key)) {
            const element = m[key];
            k.push(key+' = $'+no);
            v.push(element)
        }

        no++;
    }
    
    v.push(req.params.id);
    
    if (req.files.length != '') {
        db_client.query(`SELECT * FROM ${obj.tabel_img} WHERE ${Object.keys(obj.data_img)[0]} = $1`, [`${Object.values(obj.data_img)[0]}`], (err, res) => {
            if (res.rowCount > 0) {
                const path = [];

                for (let i = 0; i < res.rows.length; i++) {
                    path.push(obj.file_path+res.rows[i].upload_file)
                }

                try {
                    // for (let a = 0; a < path.length; a++) {
                    //     fs.unlinkSync(path[a])
                    // }
                    // //file removed
                    // db_client.query(`DELETE FROM ${obj.tabel_img} WHERE ${Object.keys(obj.data_img)[0]} = $1`, [`${Object.values(obj.data_img)[0]}`])
                    for(var i=0;i<req.files.length;i++){
                        var img = { upload_file : req.files[i].filename,keterangan : req.body.keterangan_image[i],  ...obj.data_img }
                        db_client.query(`INSERT INTO ${obj.tabel_img}(${Object.keys(img).join(',')})  VALUES(${global.each_arr_num(Object.entries(img).length,'$').join(',')})`, Object.values(img));
                    }
                    console.log('sukses mengubah file');
                } catch(err) {
                    console.error(err)
                    // result(null, err);
                }
            }else {
                for(var i=0;i<req.files.length;i++){
                    var img = { upload_file : req.files[i].filename,keterangan : req.body.keterangan_image[i],  ...obj.data_img }
                    db_client.query(`INSERT INTO ${obj.tabel_img}(${Object.keys(img).join(',')})  VALUES(${global.each_arr_num(Object.entries(img).length,'$').join(',')})`, Object.values(img));
                }
            }
        })
    }

    if (req.body.id_file.length != '') {
        for(var i=0;i<req.body.id_file.length;i++){
            db_client.query(`UPDATE ${obj.tabel_img} SET keterangan = '${req.body.keterangan_image[i]}' WHERE rowid = ${req.body.id_file[i]}`);
        }
    }
    
    db_client.query(
        `UPDATE ${obj.tabel} SET ${k} WHERE ${obj.id} = $${k.length+1} RETURNING rowid`,
        v,
        (err, res) => {
            if (res.rowCount == 0) {
                // not found Model with the id
                result({ kind: "not_found" }, null);
                return;
            }
            // console.log(res.rows);
            const log = { action_log: 'UPDATE', ...obj.data_log }
            db_client.query(`INSERT INTO ${obj.tabel_log}(${Object.keys(log).join(',')}) VALUES(${global.each_arr_num(Object.entries(log).length,'$').join(',')})`, Object.values(log), (err, res) => {

                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }
                
                result(null, { id: req.params.id, ...obj.data });
            })
        }
        );
};

Model.removeImgLog = (req,obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    db_client.query(`SELECT * FROM ${obj.tabel} WHERE ${obj.id} = $1`, [req.params.id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.rowCount == 0) {
            // not found Model with the id
            result({ kind: "not_found" }, null);
            return;
        }
        const log = { data: res.rows[0],action_log: 'DELETE', ...obj.data_log }
        db_client.query(`INSERT INTO ${obj.tabel_log}(${Object.keys(log).join(',')}) VALUES(${global.each_arr_num(Object.entries(log).length,'$').join(',')})`, Object.values(log))
        db_client.query(`SELECT * FROM ${obj.tabel_img} WHERE ${Object.keys(obj.data_img).join(',')} = ${global.each_arr_num(Object.entries(obj.data_img).length,'$').join(',')}`, [`${Object.values(obj.data_img)}`], (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }
            if (res.rowCount > 0) {
                const path = [];
                for (let i = 0; i < res.rows.length; i++) {
                    path.push(obj.file_path+res.rows[i].upload_file)
                }
                // console.log(path);
                try {
                    for (let a = 0; a < path.length; a++) {
                        fs.unlinkSync(path[a])
                    }
                    //file removed
                    db_client.query(`DELETE FROM ${obj.tabel_img} WHERE ${Object.keys(obj.data_img)} = ${global.each_arr_num(Object.entries(obj.data_img).length,'$').join(',')}`, [`${Object.values(obj.data_img)}`], (err, res) => {
                        db_client.query(`DELETE FROM ${obj.tabel} WHERE ${obj.id} = $1`, [req.params.id])
                        if (err) {
                            console.log("error: ", err);
                            result(null, err);
                            return;
                        }
                        result(null, res);

                    })
                } catch(err) {
                    console.error(err)
                    // result(null, err);
                }
                
            }else {
                db_client.query(`DELETE FROM ${obj.tabel} WHERE ${obj.id} = $1`, [req.params.id], (err,res) => {
                    result(null, res);
                })
            }
        })
    })
};

module.exports = Model;
    