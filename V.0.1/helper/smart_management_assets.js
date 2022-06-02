const {sm,sm_data_collecting,sm_management_asset} = require("../config/db.pg");
const global = require('./global');

exports.getTiketPrevID =  async (req) => { 
    let obj = {};
    obj.tabel = 'tbl_tiket_prev x';

    obj.custom_select = `x.*,pd.polda, ps.polres,mr.nama as nama_region,mp.nama as placement, tmd.nama_device, tmd.device_id, mdc.nama as category,tsdc.nama as sub_category`;
   
    obj.filter = {
         'x.region_id' : req.query.region_id,
         'x.placement_id' : req.query.placement_id,
         'x.polda_id' : req.query.polda_id,
         'x.polres_id' : req.query.polres_id,
         'x.dev_category_id' : req.query.dev_category_id,
         'x.ctddate' : req.query.ctddate
     }
 
    obj.custom_join = [
         "INNER JOIN tbl_master_data as tmd ON x.item_device_id = tmd.rowid",
         "INNER JOIN mstr_placement as mp ON x.placement_id = mp.rowid",
         "INNER JOIN mstr_region as mr ON x.region_id = mr.rowid",
         // "INNER JOIN tbl_sub_region as tsr ON x.sub_region_id = tsr.rowid",
         "INNER JOIN tbl_polda as  pd ON pd.polda_id = x.polda_id",
         "INNER JOIN tbl_polres as ps ON ps.polres_id = x.polres_id",
         "INNER JOIN mstr_device_category as  mdc ON x.dev_categ_id = mdc.rowid",
         "LEFT JOIN tbl_sub_device_category as tsdc ON x.sub_dev_categ_id = tsdc.rowid",
    ];
   

    obj.custom_where = [
        `kode_tiket_prev = '${req.query.kode_tiket_prev}'` 
    ]
    
    obj.custom_option = [
        'ORDER BY x.rowid DESC'
    ];
    
    obj.key_not_null = '';
    obj.mode = "to_object";
    let d =  await global.getSelect(obj);
    return d;
}

exports.getTiketPrev =  async (req) => { 
    let obj = {};
    obj.tabel = 'tbl_tiket_prev x';
    obj.custom_select = `x.*, tmd.nama_device, tmd.device_id`;
    // obj.custom_select = `x.*,mp.nama as placement, tmd.nama_device, tmd.device_id, mdc.nama as category,tsdc.nama as sub_category`;
   
    obj.filter = {
         'region_id' : req.query.region_id,
         'placement_id' : req.query.placement_id,
         'polda_id' : req.query.polda_id,
         'polres_id' : req.query.polres_id,
         'dev_category_id' : req.query.dev_category_id,
         'ctddate' : req.query.ctddate
     }
 
    obj.custom_join = [
         "INNER JOIN tbl_master_data as tmd ON x.item_device_id = tmd.rowid",
        //  "INNER JOIN mstr_placement as mp ON x.placement_id = mp.rowid",
        //  "INNER JOIN mstr_region as mr ON x.region_id = mr.rowid",
        //  "INNER JOIN tbl_sub_region as tsr ON x.sub_region_id = tsr.rowid",
        //  "INNER JOIN mstr_device_category as mdc ON x.dev_categ_id = mr.rowid",
        //  "INNER JOIN tbl_sub_device_category as tsdc ON x.sub_dev_categ_id = tsdc.rowid",
    ];
    obj.custom_option = [
        'ORDER BY x.rowid DESC'
    ];
    
    obj.key_not_null = '';
    obj.mode = "to_object"
    let d =  await global.getSelect(obj);
    return d;
}

exports.getValueChecklist =  async (req) => { 
    let obj = {};
    obj.tabel = 'tbl_tiket_ceklis_value x';
    obj.custom_select = `x.rowid,inp.nama as nama_input, ceklist_id,kode_tiket_prev,nilai,x.ctddate, x.ctdtime, (SELECT nama FROM tbl_sub_select_option tss WHERE tss.rowid::varchar(25) = x.nilai  AND tss.inputan_id = x.ceklist_id) as nilai_str`;
   
    obj.custom_where = [
        `kode_tiket_prev = '${req.query.kode_tiket_prev}'` 
    ]

    obj.custom_join = [
        "INNER JOIN mstr_inputan as inp ON inp.rowid = x.ceklist_id",
   ];
    
    obj.custom_option = [
        'ORDER BY x.rowid DESC'
    ];
    
    obj.key_not_null = '';
    let d =  await global.getSelect(obj);
    return d;
}

exports.getImgEvidentTiketPrev =  async (req, param="") => { 
    let obj = {};
    let field_upload = "";
    
    if (param == "before") {
        field_upload = "upload_before as upload";
        obj.tabel = "tbl_tiket_prev_img_before as x";
    }else{
        field_upload = "upload_after as upload";
        obj.tabel = "tbl_tiket_prev_img_after as x"
    }

    obj.custom_select = `rowid,${field_upload},kode_tiket_prev,keterangan,path`;
   
    obj.custom_where = [
        `kode_tiket_prev = '${req.query.kode_tiket_prev}'` 
    ]
    
    obj.custom_option = [
        'ORDER BY x.rowid DESC'
    ];
    
    obj.key_not_null = '';
    let d =  await global.getSelect(obj);
    return d;
}