const db = require("../../config/db.query");
const global = require('../../helper/global');
const dt = require('../../datatable/views');

// constructor
const Model = function (data) {

};


Model.getDt = (req, obj, result) => {
    let db_client = global.pilih_db();
    let v = [];
    let k = [];
    let join = [];
    let query = '';
    let rsp = {
        data: []
    };

    if (obj.dt_join) {
        obj.dt_join.forEach(value => {
            if (typeof value != undefined) {
                join.push(value);
            }
        });

        if (join.length != 0) {
            query += `${join.join(' ')}`
        }
    }

    if (obj.dt_search) {
        let no = 1;
        obj.dt_search.forEach(value => {
            if (typeof value != undefined) {
                k.push(`${value} LIKE $${no} `);
                v.push('%' + req.body.search + '%')
            }
            no++;
        });

        v.push(parseInt(req.body.start));
        v.push(parseInt(req.body.length));

        if (v.length != 0) {
            query += ` WHERE ${k.join(' OR ')}`
            query += `OFFSET $${k.length + 1} LIMIT $${k.length + 2}`
            if (req.body.order_column) {
                query += `ORDER BY ${obj.dt_order[req.body.order_column].filter(x => x !== null)} ${req.body.order_dir}`
            }
        }
    }

    db.exec(obj.dt_select.join(','), obj.tabel, query, v).then(x => {
        rsp.data = dt[obj.dt_view_func](x);
        result(null, rsp);
    }).catch(error => {
        result(error, null);
    });

};


Model.getCustom = (obj, result) => {

    let db_client = global.pilih_db();
    let w = [];
    let o = [];
    let v = [];
    let k = [];
    let join = [];

    let query = `SELECT ${obj.custom_select} FROM ${obj.tabel}`;

    if (obj.custom_where) {
        w = obj.custom_where.filter(e => {
            return e != ''
        });
    }

    if (obj.custom_option) {
        o = obj.custom_option.filter(e => {
            return e != ''
        });
    }

    if (obj.custom_join) {
        join = obj.custom_join.filter(e => {
            return e != ''
        });

        if (join.length != 0) {
            query += ` ${join.join(' ')}`;
        }
    }


    if (obj.filter) {
        let m = global.filter_obj(obj.filter);
        let no = 1;
        for (const key in m) {
            if (Object.hasOwnProperty.call(m, key)) {
                const element = m[key];
                console.log(element)
                k.push(key + ' = $' + no);
                v.push(element)
            }

            no++;
        }

        if (v.length != 0) {
            query += ` WHERE ${k.join(' AND ')}`;
        }
    }

    if (w.length != 0) {
        if (v.length != 0) {
            query += ` AND ${w.join(' AND ')}`;
        } else {
            query += ` WHERE ${w.join(' AND ')}`;
        }
        console.log(query)
    }

    if (o.length != 0) {
        query += ` ${o.join(' ')}`;
    }

    if (obj.limit_) {
        query += ` LIMIT ${obj.limit_}`;
    }


    db_client.query(query, v, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, res.rows);
    });
};

Model.getAll = (obj, result) => {

    let db_client = global.pilih_db();
    let k = [];
    let v = [];
    let o = [];
    let where = "WHERE";
    let param = "";

    let query = `SELECT ${obj.select} FROM ${obj.tabel}`;

    o = obj.custom_option.filter(e => {
        return e != ''
    });

    if (obj.filter) {
        let m = global.filter_obj(obj.filter);
        let no = 1;
        for (const key in m) {
            if (Object.hasOwnProperty.call(m, key)) {
                const element = m[key];
                console.log(element)
                k.push(key + ' = $' + no);
                v.push(element)
            }

            no++;
        }

        if (v.length != 0) {
            query += ` WHERE ${k.join(' AND ')}`;
        }
    }

    if (obj.limit_) {
        query += ` LIMIT ${obj.limit_}`;
    }

    if (o.length != 0) {
        query += ` ${o.join(' ')}`;
    }

    db_client.query(query, v, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        result(null, res.rows);
    });
};

Model.findByIdCustom = (req, obj, result) => {

    let db_client = global.pilih_db();
    let w = [];
    let o = [];
    let v = [];
    let join = [];

    let query = `SELECT ${obj.custom_select} FROM ${obj.tabel}`;

    w = obj.custom_where.filter(e => {
        return e != ''
    });

    v = obj.custom_value.filter(e => {
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

    if (w.length != 0) {
        query += ` WHERE ${w.join(' AND ')}`;
    }

    if (o.length != 0) {
        query += ` ${o.join(' ')}`;
    }

    console.log(query);

    db_client.query(query, v, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.rowCount > 0) {
            console.log("found: ", res.rows[0]);
            result(null, res.rows[0]);
            return;
        } else {
            result({ kind: "not_found" }, null);
        }
    });
};

Model.findById = (req, obj, result) => {
    let db_client = global.pilih_db();
    db_client.query(`SELECT ${obj.select} FROM ${obj.tabel} WHERE rowid = $1`, [req.params.id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.rowCount > 0) {
            console.log("found: ", res.rows[0]);
            result(null, res.rows[0]);
            return;
        }

        // not found Jenis_jalan with the id
        result({ kind: "not_found" }, null);
    });
};

Model.create = (req, obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    // obj.tabel = obj.tabel.split(' ')[0];
    let status_ins = true;
    if (!obj.post_required.length) {
        for (const key in obj.post_required) {
            if (Object.hasOwnProperty.call(obj.post_required, key)) {
                const e = obj.post_required[key];
                if (!e[0]) {
                    result(e[1], null);
                    return;
                }
            }
        }
    }

    let k = [];
    let v = [];

    if (obj.post_validate.length > 0) {
        let no = 1;
        for (const key in obj.post_validate) {
            if (Object.hasOwnProperty.call(obj.post_validate, key)) {
                const e = obj.post_validate[key];
                if (e) {
                    k.push(key + ' = $' + no);
                    v.push(e)
                }
            }
            no++;
        }
    }

    if (v.length > 0) {
        global.check_value(obj.tabel, k.join(' AND '), v).then(x => {
            if (x.rowCount > 0) {
                result(obj.post_validate_msg, null);
                status_ins = false;
            } else {
                db_client.query(`INSERT INTO ${obj.tabel}(${Object.keys(obj.data).join(',')}) VALUES(${global.each_arr_num(Object.entries(obj.data).length, '$').join(',')})`, Object.values(obj.data), (err, res) => {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                        return;
                    }

                    result(null, { id: res.insertId, ...obj.data });
                });
            }
        }).catch(e => {
            result(e, null);
        });
    } else {
        db_client.query(`INSERT INTO ${obj.tabel}(${Object.keys(obj.data).join(',')}) VALUES(${global.each_arr_num(Object.entries(obj.data).length, '$').join(',')})`, Object.values(obj.data), (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            result(null, { id: res.insertId, ...obj.data });
        });
    }


};

Model.createLog = (req, obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    // obj.tabel = obj.tabel.split(' ')[0];
    // obj.tabel_log = obj.tabel_log.split(' ')[0];
    let status_ins = true;
    if (!obj.post_required.length) {
        for (const key in obj.post_required) {
            if (Object.hasOwnProperty.call(obj.post_required, key)) {
                const e = obj.post_required[key];
                if (!e[0]) {
                    result(e[1], null);
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
                    k.push(key + ' = $' + no);
                    v.push(e)
                }
            }
            no++;
        }

        if (v.length > 0) {
            global.check_value(obj.tabel, k.join(' AND '), v).then(x => {
                if (x.rowCount > 0) {
                    result(obj.post_validate_msg, null);
                    status_ins = false;
                } else {
                    db_client.query(`INSERT INTO ${obj.tabel}(${Object.keys(obj.data).join(',')}) VALUES(${global.each_arr_num(Object.entries(obj.data).length, '$').join(',')}) RETURNING rowid`, Object.values(obj.data), (err, res) => {
                        let did = `${obj.data_id_log}`;
                        const log = { [did]: res.rows[0].rowid, action_log: 'INSERT', ...obj.data_log }
                        db_client.query(`INSERT INTO ${obj.tabel_log}(${Object.keys(log).join(',')}) VALUES(${global.each_arr_num(Object.entries(log).length, '$').join(',')})`, Object.values(log), (err, res) => {
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
        } else {
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


Model.updateById = (req, obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    // obj.tabel = obj.tabel.split(' ')[0];
    let m = global.filter_obj(obj.data);
    let k = [];
    let v = [];
    let no = 1;
    for (const key in m) {
        if (Object.hasOwnProperty.call(m, key)) {
            const element = m[key];
            console.log(element)
            k.push(key + ' = $' + no);
            v.push(element)
        }

        no++;
    }

    v.push(req.params.id);

    db_client.query(
        `UPDATE ${obj.tabel} SET ${k} WHERE ${obj.id} = $${k.length + 1}`,
        v,
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.rowCount == 0) {
                // not found Model with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: req.params.id, ...obj.data });
        }
    );
};

Model.updateLogById = (req, obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    // obj.tabel = obj.tabel.split(' ')[0];
    // obj.tabel_log = obj.tabel_log.split(' ')[0];
    let m = global.filter_obj(obj.data);
    let k = [];
    let v = [];
    let no = 1;
    for (const key in m) {
        if (Object.hasOwnProperty.call(m, key)) {
            const element = m[key];
            console.log(element)
            k.push(key + ' = $' + no);
            v.push(element)
        }

        no++;
    }

    v.push(req.params.id);

    db_client.query(
        `UPDATE ${obj.tabel} SET ${k} WHERE ${obj.id} = $${k.length + 1} RETURNING rowid`,
        v,
        (err, res) => {
            if (res.rowCount == 0) {
                // not found Model with the id
                result({ kind: "not_found" }, null);
                return;
            }
            // console.log(res.rows);
            const log = { action_log: 'UPDATE', ...obj.data_log }
            db_client.query(`INSERT INTO ${obj.tabel_log}(${Object.keys(log).join(',')}) VALUES(${global.each_arr_num(Object.entries(log).length, '$').join(',')})`, Object.values(log), (err, res) => {

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

Model.removeLog = (req, obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    db_client.query(`DELETE FROM ${obj.tabel} WHERE ${obj.id} = $1`, [req.params.id], (err, res) => {
        if (res.rowCount == 0) {
            // not found Model with the id
            result({ kind: "not_found" }, null);
            return;
        }
        const log = { action_log: 'DELETE', ...obj.data_log }
        db_client.query(`INSERT INTO ${obj.tabel_log}(${Object.keys(log).join(',')}) VALUES(${global.each_arr_num(Object.entries(log).length, '$').join(',')})`, Object.values(log), (err, res) => {

            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }


            result(null, res);
        })
    });
};

Model.remove = (req, obj, result) => {
    let db_client = global.pilih_db(obj.db_name);
    db_client.query(`DELETE FROM ${obj.tabel} WHERE ${obj.id} = $1`, [req.params.id], (err, res) => {
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

        result(null, res);
    });
};

module.exports = Model;
