
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    let fileExtension = 'jpg'; 
  
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      fileExtension = file.mimetype.split('/')[1]; // e.g. png, jpeg
    }
  
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
  }
  
});

export const upload = multer({ storage: storage });



