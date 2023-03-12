import { fileIcons } from "material-icon-theme/src/icons/fileIcons";
import { folderIcons } from "material-icon-theme/src/icons/folderIcons";
import { FSDescriptor } from './filemanager.component';
import textExtensions from 'textextensions';

console.log("bootstrapping icons", fileIcons, folderIcons)

function isText(file: string) {
    const ext = file.split('.').pop();
    textExtensions.includes(ext)
}

// Build maps of extension/filename => icon id.
const fileIconExtensionList = [];
const fileIconNameList: {
    val: string,
    iconName: string,
    light: boolean // is there a _light variant?
}[] = [];

const folderIconNameList = [];
fileIcons.icons.forEach(i => {
    i.fileNames?.forEach(name => {
        fileIconNameList.push({
            val: name,
            iconName: i.name,
            light: i.light
        });
    })
    i.fileExtensions?.forEach(ext => {
        fileIconExtensionList.push({
            val: ext,
            iconName: i.name,
            light: i.light
        });
    })
});
folderIcons.find(f => f.name == "specific").icons.forEach(dir => {
    dir.folderNames.forEach(fn => {
        folderIconNameList.push({
            val: fn,
            iconName: dir.name,
            light: dir.light
        });
    })
});

const builtinIcons = [
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

// TODO: resolve dynamic thumbnails for media documents
export const resolveIcon = (file: FSDescriptor): {path: string, needsBackdrop: boolean} => {

    if (file.kind == "directory") {
        return resolveDirIcon(file);
    }

    return resolveFileIcon(file);
}

const resolveDirIcon = (file: FSDescriptor) => {
    const dirnameMatch = getBestMatch(folderIconNameList, file.name);
    // VS Code Material Icon Theme pack

    // TODO: default to a clear icon that doesn't have decoration
    return {
        path: dirnameMatch ? `lib/mit/${dirnameMatch}.svg` : "lib/mit/folder-app.svg",
        needsBackdrop: false
    };
}

const resolveFileIcon = (file: FSDescriptor) => {
    // Folders always use the material-icon-theme
    const baseExt = builtinIcons.find(ext => file.name.endsWith('.' + ext));
    if (baseExt) {
        return {
            path: `assets/file-icons/exts/${baseExt}.svg`,
            needsBackdrop: false
        };
    }

    // Resolve a base MIME type via path extension
    const base2Ext =
        (/\.(ogg|mp3|m4a|flac|wav|aiff|aac|wma|midi?)$/.test(file.name) && "music") ||
        (/\.(appimage)$/.test(file.name) && "compressed") ||
        (/\.(pot|potx|pps|ppsx|ppt|pptm|pptx)$/.test(file.name) && "presentation") ||
        (/\.(odt|rtf|doc|docm|docx|dot|dotm|dotx)$/.test(file.name) && "richtext") ||
        (/\.(ods|xls|xlsm|xlsx|xps|xlsx|csv)$/.test(file.name) && "spreadsheet") ||
        (/\.(stp|max|fbx|obj|x3d|vrml|3ds|3mf|stl|dae|dwg|blend)$/.test(file.name) && "model") ||
        (/\.(mp4|mkv|webm|mpg|avi|mov|flv|wmv|)$/.test(file.name) && "video");

    // If we get a path extension, we can easily map the icon
    if (base2Ext) {
        return {
            path: `assets/file-icons/${base2Ext}.svg`,
            needsBackdrop: false
        };
    }


    // Lookup a filename from material-icon-theme
    const filename = fileIconNameList
        .filter(d => file.name.toLowerCase() == d.val.toLowerCase())
        .sort((a, b) => b.val.length - a.val.length)
    [0]?.iconName;

    if (filename) {
        return {
            path: `lib/mit/${filename}.svg`,
            needsBackdrop: true
        };
    }

    // Check the file's extension -- we may
    const fileext = fileIconExtensionList
        .filter(d => file.name.toLowerCase().endsWith('.' + d.val.toLowerCase()))
        .sort((a, b) => b.val.length - a.val.length)
    [0]?.iconName;
    if (fileext) return {
        path: `lib/mit/${fileext}.svg`,
        needsBackdrop: true
    };

    // If the file doesn't have a text extension, we're going to assume it's binary data.
    const isFileBinary = !textExtensions.includes(file.path.split('.').pop());

    return {
        path: isFileBinary ? 'assets/file-icons/text.svg' : 'assets/file-icons/binary.svg',
        needsBackdrop: false
    };
}
