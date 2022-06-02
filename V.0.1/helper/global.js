const {sm,sm_data_collecting,sm_management_asset} = require("../config/db.pg");

exports.filter_view = function(model,filter) {
    const asArray = Object.entries(model);
    const filtered = asArray.filter(([key, value]) => {
        filter.forEach(v => {
            if (v == value) {
                return value
            }
        });
    });

    const justStrings = Object.fromEntries(filtered);
    return justStrings;
}

exports.filter_obj = function(model) {
    const asArray = Object.entries(model);
    const filtered = asArray.filter(([key, value]) => value != undefined && value != "null");
    const justStrings = Object.fromEntries(filtered);
    return justStrings;
}

exports.filter_not_null = function(model,key) {

      const tampung = [];
      const asArray = Object.entries(model);
      const result = asArray.filter(([k,v]) => {
            return v[key] != '' && v[key] != null
      });
      
      const resultx = result.map((v) => tampung.push(v[1]));
     
      return resultx;
  
}

exports.each_arr_num = function(num=0,opt='') {
    let r = [];
    for (let i = 1; i <= num; i++) {
        let ok = `${opt}${i}`;
        r.push(ok);
    }
    return r;
}

exports.exec = function(select, tabel, query, value) {
    const {sm} = require("../config/db.pg");
    return new Promise((resolve, reject) => {
        sm.query(`SELECT ${select} FROM ${tabel} ${query} `,value, (err, res) => {
            if(err){
                reject(err);
            }
            if (res != undefined ) {
                res.rowCount > 0 ? resolve(res) : reject({
                    message : "Data Kosong",
                    status : false
                });
            }else{
                reject({
                    message : "Data Kosong",
                    status : false
                });
            }
        });
    });
};

exports.check_value = function(tabel, key, value) {
    const {sm} = require("../config/db.pg");
    return new Promise((resolve, reject) => {
        sm.query(`SELECT * FROM ${tabel} WHERE ${key}`,value, (err, res) => {
            if(err){
                reject(err);
            }
                resolve(res);
        });
    });
};

exports.pilih_db = function(db_name) {
    if (db_name == "sm_management_assets") {
        return sm_management_asset;
    }else if(db_name == "sm_data_collecting") {
       return sm_data_collecting;
    }else{
        return sm;
    }
}

exports.generateKodeTiket = function(str) {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return `${str+year+month+date+hours+minutes+seconds}`
}

exports.randomStr = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.getSelect = async (obj) => {
    let db_client = this.pilih_db();
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
        let m =  this.filter_obj(obj.filter);
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
   
   
   try {
    let {rowCount, rows} = await db_client.query(query,v);
    return {
        'rowCount' : rowCount,
        'rows' : obj.mode == "to_object" ? this.oneRowToObj(rows) : rows,
        'status' : rowCount > 0 ? true : false
    }
   } catch (error) {
    console.log(error);   
   }
   return 
  
}

exports.oneRowToObj = (data) =>{
    return data.length == 1 ? data[0] : data; 
}

exports.secondsToHms = function(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " jam, " : " jam, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " menit, " : " menit, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " detik" : " detik") : "";
    return hDisplay + mDisplay + sDisplay; 
}