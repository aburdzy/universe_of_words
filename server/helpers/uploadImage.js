const multer = require('multer');
const uuid = require('uuid').v4;

const imageUploadPath = 'public_html/images';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, imageUploadPath);
    },
    filename: function(req, file, cb) {
        cb(null, `${file.fieldname}_${uuid()}_${file.originalname}`);
    }
});

const imageUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {             
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } 
        else {
            cb(null, false);
            return cb(new Error('WRONG_FROMAT'));
        }
    }
});

const upload = imageUpload.single('image');

function uploadAsync(req, res) {
    return new Promise((resolve, reject) => {
        upload(req, res, function (error) {
            if(!error) {
                resolve();
            }
            else {
                reject(error);
            }
        })
    });
}

module.exports = uploadAsync;