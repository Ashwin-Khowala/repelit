"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToAzure = exports.fetchAzureFolder = void 0;
exports.copyAzureFolder = copyAzureFolder;
const storage_blob_1 = require("@azure/storage-blob");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString((_a = process.env.AZURE_STORAGE_CONNECTION_STRING) !== null && _a !== void 0 ? _a : "");
const containerClient = blobServiceClient.getContainerClient((_b = process.env.AZURE_CONTAINER_NAME) !== null && _b !== void 0 ? _b : "");
const fetchAzureFolder = (prefix, localPath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c, _d, e_2, _e, _f;
    try {
        try {
            for (var _g = true, _h = __asyncValues(containerClient.listBlobsFlat({ prefix })), _j; _j = yield _h.next(), _a = _j.done, !_a; _g = true) {
                _c = _j.value;
                _g = false;
                const blob = _c;
                const blobName = blob.name;
                const blobClient = containerClient.getBlobClient(blobName);
                const downloadResponse = yield blobClient.download();
                if (downloadResponse.readableStreamBody) {
                    const chunks = [];
                    try {
                        for (var _k = true, _l = (e_2 = void 0, __asyncValues(downloadResponse.readableStreamBody)), _m; _m = yield _l.next(), _d = _m.done, !_d; _k = true) {
                            _f = _m.value;
                            _k = false;
                            const chunk = _f;
                            chunks.push(Buffer.from(chunk));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (!_k && !_d && (_e = _l.return)) yield _e.call(_l);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    const fileData = Buffer.concat(chunks);
                    const filePath = `${localPath}/${blobName.replace(prefix, "")}`;
                    yield writeFile(filePath, fileData);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_g && !_a && (_b = _h.return)) yield _b.call(_h);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    catch (error) {
        console.error('Error fetching Azure folder:', error);
        throw error;
    }
});
exports.fetchAzureFolder = fetchAzureFolder;
function copyAzureFolder(sourcePrefix, destinationPrefix) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_3, _b, _c;
        try {
            try {
                // List all blobs with the source prefix
                for (var _d = true, _e = __asyncValues(containerClient.listBlobsFlat({ prefix: sourcePrefix })), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const blob = _c;
                    if (!blob.name)
                        continue;
                    const destinationBlobName = blob.name.replace(sourcePrefix, destinationPrefix);
                    const sourceBlobClient = containerClient.getBlobClient(blob.name);
                    const destinationBlobClient = containerClient.getBlobClient(destinationBlobName);
                    // Copy the blob
                    const copyOperation = yield destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
                    yield copyOperation.pollUntilDone();
                    console.log(`Copied ${blob.name} to ${destinationBlobName}`);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        catch (error) {
            console.error('Error copying folder:', error);
            throw error;
        }
    });
}
function writeFile(filePath, fileData) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield createFolder(path_1.default.dirname(filePath));
            fs_1.default.writeFile(filePath, fileData, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
        catch (error) {
            reject(error);
        }
    }));
}
function createFolder(dirName) {
    return new Promise((resolve, reject) => {
        fs_1.default.mkdir(dirName, { recursive: true }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
const saveToAzure = (prefix, filePath, content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blobName = `${prefix}/${filePath}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        yield blockBlobClient.upload(content, content.length);
        console.log(`Uploaded ${blobName} to Azure Blob Storage`);
    }
    catch (error) {
        console.error('Error saving to Azure:', error);
        throw error;
    }
});
exports.saveToAzure = saveToAzure;
