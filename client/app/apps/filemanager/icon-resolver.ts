import { fileIcons } from "./mit-file-icons";
import { folderIcons } from "./mit-folder-icons";
import { FSDescriptor } from './filemanager.component';
import textExtensions from 'textextensions';

function isText(file: string) {
    const ext = file.split('.').pop();
    textExtensions.includes(ext)
}

// Build maps of extension/filename => icon id.
const exts = [];
const filenames = [];
const dirnames = [];
fileIcons.icons.forEach(i => {
    i.fileNames?.forEach(name => {
        filenames.push({
            val: name, 
            iconName: i.name
        });
    })
    i.fileExtensions?.forEach(ext => {
        exts.push({
            val: ext, 
            iconName: i.name
        });
    })
});
folderIcons.find(f => f.name == "specific").icons.forEach(dir => {
    dir.folderNames.forEach(fn => {
        dirnames.push({
            val: fn, 
            iconName: dir.name
        });
    })
});

const extMapIcons = [
    "7z",
    "apk",
    "arc",
    "bash",
    "bat",
    "bz",
    "cpp",
    "c",
    "dcr",
    "deb",
    "exe",
    "go",
    "gz",
    "h",
    "html",
    "jar",
    "java",
    "md",
    "pdf",
    "php",
    "py",
    "rar",
    "rb",
    "rpm",
    "rs",
    "r",
    "rust",
    "sh",
    "swf",
    "sys",
    "tar",
    "xar",
    "xz",
    "zip"
]

const getBestMatch = (data: {val: string, iconName: string}[], filename) => {
    return data
        .filter(d => filename.endsWith(d.val)) // filter to all match results
        .sort((a, b) => b.val.length - a.val.length) // sort longest string first
        [0]?.iconName; // Return the first result.
}

export const resolveIcon = (file: FSDescriptor): {path: string, needsBackdrop: boolean} => {

    // const mimeType = MimeTypeBase[ext];
    // MimeTypes[ext] ||
    // .includes(MimeTypeBase[ext])
    // ? MimeTypeBase[ext] 
    // || "application-x-generic";
    // if (mimeType)
    //     return `icons/mimetypes/${mimeType}.svg`;


    
    // VS Code Material Icon Theme pack
    if (file.kind == "directory") {
        const dirnameMatch = getBestMatch(dirnames, file.name);
        return {
            path: dirnameMatch ? `lib/mit/${dirnameMatch}.svg` : "lib/mit/folder-app.svg",
            needsBackdrop: false
        };
    }
    const baseExt = extMapIcons.find(ext => file.name.endsWith('.' + ext));
    if (baseExt)
        return {
            path: `assets/file-icons/exts/${baseExt}.svg`,
            needsBackdrop: false
        };
    
    const base2Ext = 
        (/\.(ogg|mp3|m4a|flac|wav|aiff|aac|wma|midi?)$/.test(file.name) && "music") ||
        (/\.(appimage)$/.test(file.name) && "compressed") ||
        (/\.(pot|potx|pps|ppsx|ppt|pptm|pptx)$/.test(file.name) && "presentation") ||
        (/\.(odt|rtf|doc|docm|docx|dot|dotm|dotx)$/.test(file.name) && "richtext") ||
        (/\.(ods|xls|xlsm|xlsx|xps|xlsx|csv)$/.test(file.name) && "spreadsheet") ||
        (/\.(stp|max|fbx|obj|x3d|vrml|3ds|3mf|stl|dae|dwg|blend)$/.test(file.name) && "model") ||
        (/\.(mp4|mkv|webm|mpg|avi|mov|flv|wmv|)$/.test(file.name) && "video");

    if (base2Ext)
        return {
            path: `assets/file-icons/${base2Ext}.svg`,
            needsBackdrop: false
        };

    const filename = filenames
        .filter(d => file.name.toLowerCase() == d.val.toLowerCase())
        .sort((a, b) => b.val.length - a.val.length)
    [0]?.iconName;

    if (filename) return {
        path: `lib/mit/${filename}.svg`,
        needsBackdrop: true
    }

    const fileext = exts
        .filter(d => file.name.toLowerCase().endsWith('.' + d.val.toLowerCase()))
        .sort((a, b) => b.val.length - a.val.length)
    [0]?.iconName;
    if (fileext) return {
        path: `lib/mit/${fileext}.svg`,
        needsBackdrop: true
    }

    return {
        path: textExtensions.includes(file.path.split('.').pop()) ? 'assets/file-icons/text.svg' : 'assets/file-icons/binary.svg',
        needsBackdrop: false
    };

    // if (isText(file.path))
        

    // const filenameMatch = getBestMatch(filenames, file.name);
    // const extMatch = getBestMatch(exts, file.name);

    // return {
    //     path: filenameMatch ? `lib/mit/${filenameMatch}.svg` :
    //                extMatch ? `lib/mit/${extMatch}.svg` :
    //                           "lib/mit/file.svg",
    //     needsBackdrop: true
    // }
}