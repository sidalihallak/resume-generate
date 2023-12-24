const path= require("path");
const fs= require("fs");
const PizZip= require("pizzip");
const Docxtemplater= require("docxtemplater");
const expressionParser= require("docxtemplater/expressions.js");
const HTMLModule= require("./libs/docxtemplaterhtml");
const ImageModule= require('@fanyinghao/docxtemplater-image-module');

const generateResume = (resume) => {
    const templateDirectory = path.join(process.cwd(), 'tmp');

    const template = fs.readFileSync(templateDirectory+ "/" + resume.theme + ".docx")
    const zip = new PizZip(template);
    expressionParser.filters.size = function (input, width, height) {
        return {
            data: input,
            size: [width, height],
        };
    };
    expressionParser.filters.maxSize = function (
        input,
        width,
        height
    ) {
        return {
            data: input,
            maxSize: [width, height],
        };
    };
    const imageOpts = {
        centered: true,
        getImage: function (tagValue) {
            if (tagValue.size && tagValue.data) {
                return base64Parser(tagValue.data);
            }
            if (tagValue.maxSize && tagValue.data) {
                return base64Parser(tagValue.data);
            }
            return base64Parser(tagValue);
        },
        getSize: function (img, tagValue) {
            if (tagValue.size && tagValue.data) {
                return tagValue.size;
            }
            if (!tagValue.maxSize) {
                return [150, 150];
            }

            const maxWidth = tagValue.maxSize[0];
            const maxHeight = tagValue.maxSize[1];
            const sizeOf = require("image-size");
            const sizeObj = sizeOf(img);

            const widthRatio = sizeObj.width / maxWidth;
            const heightRatio = sizeObj.height / maxHeight;
            if (widthRatio < 1 && heightRatio < 1) {
                /*
                 * Do not scale up images that are
                 * smaller than maxWidth,maxHeight
                 */
                return [sizeObj.width, sizeOf.height];
            }
            let finalWidth, finalHeight;
            if (widthRatio > heightRatio) {
                /*
                 * Width will be equal to maxWidth
                 * because width is the most "limiting"
                 */
                finalWidth = maxWidth;
                finalHeight = sizeObj.height / widthRatio;
            } else {
                /*
                 * Height will be equal to maxHeight
                 * because height is the most "limiting"
                 */
                finalHeight = maxHeight;
                finalWidth = sizeObj.width / heightRatio;
            }

            return [Math.round(finalWidth), Math.round(finalHeight)];
        },
    };
    const doc = new Docxtemplater(zip, {
        parser: expressionParser,
        modules: [new HTMLModule({}), new ImageModule(imageOpts)]
    });
    doc.render(resume);
    return doc.getZip().generate({
        type: 'base64',
        compression: "DEFLATE",
    });
}

function base64Parser(dataURL) {
    const base64Regex =
        /^data:image\/(png|jpg|jpeg|svg|svg\+xml);base64,/;
    if (
        typeof dataURL !== "string" ||
        !base64Regex.test(dataURL)
    ) {
        return false;
    }
    const stringBase64 = dataURL.replace(base64Regex, "");

    // For nodejs, return a Buffer
    if (typeof Buffer !== "undefined" && Buffer.from) {
        return Buffer.from(stringBase64, "base64");
    }
    // For browsers, return a string (of binary content) :
    const binaryString = window.atob(stringBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        const ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
}

const formats = {
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "rtf": "application/rtf",
    "pdf": "application/pdf",
    "xps": "application/vnd.ms-xpsdocument",
    "svg": "image/svg+xml",
    "ps": "application/postscript",
    "pcl": "application/vnd.hp-pcl",
    "epub": "application/epub+zip",
    "odt": "application/vnd.oasis.opendocument.text",
    "md": "text/markdown",
    "tiff": "image/tiff",
    "png": "image/png",
    "bmp": "image/bmp",
    "jpeg": "image/jpeg",
    "gif": "image/gif"
}
const defaultResume = {
    "theme": "actor",
    "language": "en",
    "basics": {
        "name": "John Doe",
        "label": "Programmer",
        "image": "",
        "email": "john@gmail.com",
        "phone": "(912) 555-4321",
        "url": "https://johndoe.com",
        "summary": "A summary of John Doe…",
        "location": {
            "address": "2712 Broadway St",
            "postalCode": "CA 94115",
            "city": "San Francisco",
            "countryCode": "US",
            "region": "California"
        },
        "profiles": [{
            "network": "Twitter",
            "username": "john",
            "url": "https://twitter.com/john"
        }]
    },
    "work": [{
        "name": "Company",
        "position": "President",
        "url": "https://company.com",
        "startDate": "2013-01-01",
        "endDate": "2014-01-01",
        "summary": "Description…",
        "highlights": [
            "Started the company"
        ]
    }],
    "volunteer": [{
        "organization": "Organization",
        "position": "Volunteer",
        "url": "https://organization.com/",
        "startDate": "2012-01-01",
        "endDate": "2013-01-01",
        "summary": "Description…",
        "highlights": [
            "Awarded 'Volunteer of the Month'"
        ]
    }],
    "education": [{
        "institution": "University",
        "url": "https://institution.com/",
        "area": "Software Development",
        "studyType": "Bachelor",
        "startDate": "2011-01-01",
        "endDate": "2013-01-01",
        "score": "4.0",
        "courses": [
            "DB1101 - Basic SQL"
        ]
    }],
    "awards": [{
        "title": "Award",
        "date": "2014-11-01",
        "awarder": "Company",
        "summary": "There is no spoon."
    }],
    "certificates": [{
        "name": "Certificate",
        "date": "2021-11-07",
        "issuer": "Company",
        "url": "https://certificate.com"
    }],
    "publications": [{
        "name": "Publication",
        "publisher": "Company",
        "releaseDate": "2014-10-01",
        "url": "https://publication.com",
        "summary": "Description…"
    }],
    "skills": [{
        "name": "Web Development",
        "level": "Master",
        "keywords": [
            "HTML",
            "CSS",
            "JavaScript"
        ]
    }],
    "languages": [{
        "language": "English",
        "fluency": "Native speaker"
    }],
    "interests": [{
        "name": "Wildlife",
        "keywords": [
            "Ferrets",
            "Unicorns"
        ]
    }],
    "references": [{
        "name": "Jane Doe",
        "reference": "Reference…"
    }],
    "projects": [{
        "name": "Project",
        "startDate": "2019-01-01",
        "endDate": "2021-01-01",
        "description": "Description...",
        "highlights": [
            "Won award at AIHacks 2016"
        ],
        "url": "https://project.com/"
    }]
};

module.exports = {
    generateResume,
    formats,
    defaultResume
}

